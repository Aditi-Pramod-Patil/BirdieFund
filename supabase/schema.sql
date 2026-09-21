-- ==============================================================================
-- BIRDIEFUND: SUPABASE POSTGRESQL PRODUCTION DATABASE SCHEMA
-- Platform: Golf Stableford Tracking + Prize Pools + Charity Allocation Engine
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS & CUSTOM ENUM TYPES
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User Role: public visitors are unauthenticated; subscribers & admins are authenticated
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('subscriber', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Subscription Tier
DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('monthly', 'yearly');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Subscription Lifecycle Status
DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'canceled', 'lapsed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Draw Execution Mode
DO $$ BEGIN
  CREATE TYPE draw_mode AS ENUM ('random', 'algorithmic');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Draw Lifecycle Status
DO $$ BEGIN
  CREATE TYPE draw_status AS ENUM ('simulated', 'published');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Winner Payout Verification Status
DO $$ BEGIN
  CREATE TYPE payout_status AS ENUM ('pending', 'approved', 'paid', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 2. TABLES & RELATIONSHIPS
-- ------------------------------------------------------------------------------

-- 2.1 PROFILES TABLE
-- Extends Supabase auth.users with platform subscription and RBAC metadata
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'subscriber',
  subscription_status subscription_status NOT NULL DEFAULT 'inactive',
  subscription_tier subscription_tier,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 CHARITIES TABLE
-- Vetted non-profit organizations eligible for platform subscription allocations
CREATE TABLE IF NOT EXISTS public.charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  category TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.3 USER CHARITIES TABLE
-- Maps each subscriber to their selected charity with a minimum 10% fee allocation
CREATE TABLE IF NOT EXISTS public.user_charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
  contribution_percentage NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_charity UNIQUE (user_id),
  CONSTRAINT check_contribution_percentage_range CHECK (
    contribution_percentage >= 10.00 AND contribution_percentage <= 100.00
  )
);

-- 2.4 SCORES TABLE (STABLEFORD 1–45 FORMAT & UNIQUE DATE CONSTRAINT)
-- Stores verified golf scores with a strict 1-score per date limit per user
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score_value INTEGER NOT NULL,
  played_at DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_stableford_score_range CHECK (score_value >= 1 AND score_value <= 45),
  CONSTRAINT unique_user_score_date UNIQUE (user_id, played_at)
);

-- 2.5 DRAWS TABLE
-- Stores monthly prize draws, draw modes, winning numbers, and jackpot rollovers
CREATE TABLE IF NOT EXISTS public.draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_date DATE NOT NULL,
  mode draw_mode NOT NULL DEFAULT 'random',
  status draw_status NOT NULL DEFAULT 'simulated',
  winning_numbers INTEGER[] DEFAULT '{}',
  total_prize_pool NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  jackpot_rollover_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.6 WINNERS TABLE
-- Records winning claims per draw with match tier (3, 4, 5), proof URL, and payout status
CREATE TABLE IF NOT EXISTS public.winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_tier INTEGER NOT NULL,
  prize_amount NUMERIC(12, 2) NOT NULL,
  proof_screenshot_url TEXT,
  payout_status payout_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_match_tier CHECK (match_tier IN (3, 4, 5))
);

-- ------------------------------------------------------------------------------
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_scores_user_played ON public.scores(user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_winners_user ON public.winners(user_id);
CREATE INDEX IF NOT EXISTS idx_winners_draw ON public.winners(draw_id);
CREATE INDEX IF NOT EXISTS idx_draws_status ON public.draws(status);
CREATE INDEX IF NOT EXISTS idx_charities_featured ON public.charities(is_featured);

-- ------------------------------------------------------------------------------
-- 4. AUTOMATED DATABASE TRIGGERS & FUNCTIONS
-- ------------------------------------------------------------------------------

-- Helper to check if the executing user is an administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.1 TRIGGER FUNCTION: ENFORCE ROLLING FIVE SCORES
-- Before inserting a new score for a user, if their count >= 5, automatically delete the oldest score.
CREATE OR REPLACE FUNCTION public.enforce_rolling_five_scores()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  oldest_score_id UUID;
BEGIN
  -- Count active scores for this user
  SELECT COUNT(*) INTO current_count
  FROM public.scores
  WHERE user_id = NEW.user_id;

  -- If 5 or more scores exist, locate and remove the oldest entry
  IF current_count >= 5 THEN
    SELECT id INTO oldest_score_id
    FROM public.scores
    WHERE user_id = NEW.user_id
    ORDER BY played_at ASC, created_at ASC
    LIMIT 1;

    IF oldest_score_id IS NOT NULL THEN
      DELETE FROM public.scores WHERE id = oldest_score_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_rolling_five_scores ON public.scores;
CREATE TRIGGER trg_enforce_rolling_five_scores
BEFORE INSERT ON public.scores
FOR EACH ROW
EXECUTE FUNCTION public.enforce_rolling_five_scores();

-- 4.2 TRIGGER FUNCTION: HANDLE NEW USER REGISTRATION
-- Automatically creates a public.profiles row when a new user registers in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    subscription_status
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'subscriber',
    'inactive'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_signup();

-- 4.3 TRIGGER: UPDATED_AT TIMESTAMP SYNCHRONIZATION
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_winners_updated_at ON public.winners;
CREATE TRIGGER trg_winners_updated_at
BEFORE UPDATE ON public.winners
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all application tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- 5.1 PROFILES POLICIES
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins have full access to all profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- 5.2 SCORES POLICIES
CREATE POLICY "Users can read own scores"
  ON public.scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores"
  ON public.scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores"
  ON public.scores FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scores"
  ON public.scores FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access to scores"
  ON public.scores FOR ALL
  USING (public.is_admin());

-- 5.3 CHARITIES POLICIES
CREATE POLICY "Public read access for charities"
  ON public.charities FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage charities"
  ON public.charities FOR ALL
  USING (public.is_admin());

-- 5.4 USER CHARITIES POLICIES
CREATE POLICY "Users can view own charity allocation"
  ON public.user_charities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can set or update own charity allocation"
  ON public.user_charities FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all charity allocations"
  ON public.user_charities FOR SELECT
  USING (public.is_admin());

-- 5.5 DRAWS POLICIES
CREATE POLICY "Public read access for published draws"
  ON public.draws FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can view and manage all draws"
  ON public.draws FOR ALL
  USING (public.is_admin());

-- 5.6 WINNERS POLICIES
CREATE POLICY "Users can read own winner claims"
  ON public.winners FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit proof screenshot for own claim"
  ON public.winners FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins have full access to winner verification"
  ON public.winners FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. SUPABASE STORAGE BUCKET: BIRDIEFUND-SCORE-PROOFS
-- ------------------------------------------------------------------------------
-- Insert bucket record into Supabase storage.buckets if not present
INSERT INTO storage.buckets (id, name, public)
VALUES ('birdiefund-score-proofs', 'birdiefund-score-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Users can upload their own scorecard screenshots
CREATE POLICY "Users can upload scorecard proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'birdiefund-score-proofs' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage Policy: Users can view their own uploaded proofs
CREATE POLICY "Users can view own scorecard proofs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'birdiefund-score-proofs' AND
    (
      (storage.foldername(name))[1] = auth.uid()::text OR
      public.is_admin()
    )
  );

-- Storage Policy: Admins can view and manage all proofs
CREATE POLICY "Admins have full access to score-proofs bucket"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'birdiefund-score-proofs' AND
    public.is_admin()
  );

-- ------------------------------------------------------------------------------
-- 7. SEED DATA (SAMPLE DATA FOR IMMEDIATE SUPABASE VERIFICATION)
-- ------------------------------------------------------------------------------
INSERT INTO public.charities (id, name, slug, description, logo_url, banner_url, category, is_featured)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Clean Seas Marine Initiative', 'clean-seas', 'Autonomous marine cleanup drones intercepting plastic waste in critical ocean river mouths.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1484291470158-b8f8d608850d?auto=format&fit=crop&w=1200&q=80', 'Environment', true),
  ('c0000000-0000-0000-0000-000000000002', 'NextGen Youth Sports Foundation', 'nextgen-sports', 'Providing elite coaching, athletic gear, and college scholarships to underprivileged youth.', 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80', 'Youth Sports', true),
  ('c0000000-0000-0000-0000-000000000003', 'Precision Oncology Research', 'precision-oncology', 'Funding breakthrough mRNA genomic sequencing for rare pediatric oncology clinical trials.', 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80', 'Health', true),
  ('c0000000-0000-0000-0000-000000000004', 'Urban Canopy Forest Project', 'urban-canopy', 'Cooling low-income heat corridors by planting 50,000 bio-diverse native trees in metro areas.', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80', 'Environment', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.draws (id, draw_date, mode, status, winning_numbers, total_prize_pool, jackpot_rollover_amount, published_at)
VALUES
  ('d0000000-0000-0000-0000-000000000001', '2026-08-31', 'algorithmic', 'published', '{34, 38, 41, 29, 36}', 64250.00, 25700.00, NOW() - INTERVAL '20 days'),
  ('d0000000-0000-0000-0000-000000000002', '2026-09-30', 'algorithmic', 'simulated', '{}', 78500.00, 25700.00, NULL)
ON CONFLICT (id) DO NOTHING;
