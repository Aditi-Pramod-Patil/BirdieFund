-- ==============================================================================
-- BIRDIEFUND: DATABASE SEED SCRIPT
-- ==============================================================================
-- Purpose: Populates a fresh Supabase project with test data for immediate
--          verification. Run AFTER schema.sql in the Supabase SQL Editor.
--
-- Contents:
--   1. Test User Accounts (created via Supabase auth.users + profiles)
--   2. 4 Featured Charities
--   3. 5 Valid Stableford Scores for the Test Subscriber
--   4. 2 Monthly Draw Records (1 published, 1 upcoming)
--   5. Charity Allocation for the Test Subscriber
--
-- Test Credentials:
--   Subscriber: subscriber@birdiefund.com / Password123!
--   Admin:      admin@birdiefund.com      / Password123!
-- ==============================================================================


-- ==============================================================================
-- 1. TEST USER ACCOUNTS
-- ==============================================================================
-- Supabase auth.users must be seeded via the Auth Admin API or the Dashboard
-- UI (Authentication → Users → Add User). The SQL below creates the
-- public.profiles rows that the on_auth_user_created trigger would normally
-- generate. For the passwords to work, you MUST create the auth.users records
-- first via one of these methods:
--
-- OPTION A: Supabase Dashboard (Recommended for manual setup)
--   1. Go to Authentication → Users → "Add user" → "Create new user"
--   2. Create: subscriber@birdiefund.com / Password123!
--   3. Create: admin@birdiefund.com / Password123!
--   4. Copy each user's UUID from the table and replace the UUIDs below
--
-- OPTION B: Supabase Auth Admin API (via service_role key)
--   curl -X POST 'https://<project-ref>.supabase.co/auth/v1/admin/users' \
--     -H 'Authorization: Bearer <service_role_key>' \
--     -H 'apikey: <service_role_key>' \
--     -H 'Content-Type: application/json' \
--     -d '{"email":"subscriber@birdiefund.com","password":"Password123!","email_confirm":true,"user_metadata":{"full_name":"Alex Rivers"}}'
--
-- ⚠️ IMPORTANT: Replace the UUIDs below with the actual UUIDs generated
-- by Supabase auth when you create the users. The placeholder UUIDs
-- (a0000000-..., b0000000-...) are used for reference only.
-- ==============================================================================

-- Placeholder UUIDs (REPLACE with real auth.users UUIDs after creating accounts)
-- Subscriber UUID: a0000000-0000-0000-0000-000000000001
-- Admin UUID:      b0000000-0000-0000-0000-000000000001

-- 1.1 Test Subscriber Profile
INSERT INTO public.profiles (id, email, full_name, role, subscription_status, subscription_tier, stripe_customer_id)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'subscriber@birdiefund.com',
  'Alex Rivers',
  'subscriber',
  'active',
  'yearly',
  NULL  -- No Stripe customer in test mode; set after first real checkout
)
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  subscription_status = EXCLUDED.subscription_status,
  subscription_tier = EXCLUDED.subscription_tier,
  full_name = EXCLUDED.full_name;

-- 1.2 Test Admin Profile
INSERT INTO public.profiles (id, email, full_name, role, subscription_status, subscription_tier)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'admin@birdiefund.com',
  'Sarah Chen',
  'admin',
  'active',
  'yearly'
)
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  subscription_status = EXCLUDED.subscription_status,
  subscription_tier = EXCLUDED.subscription_tier,
  full_name = EXCLUDED.full_name;


-- ==============================================================================
-- 2. FEATURED CHARITIES (4 Organizations)
-- ==============================================================================
INSERT INTO public.charities (id, name, slug, description, logo_url, banner_url, category, is_featured)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'Clean Seas Marine Initiative',
    'clean-seas',
    'Autonomous marine cleanup drones intercepting plastic waste in critical ocean river mouths. Partnered with 14 coastal nations for deployment of 200+ autonomous surface vessels by 2028.',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1484291470158-b8f8d608850d?auto=format&fit=crop&w=1200&q=80',
    'Environment',
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'NextGen Youth Sports Foundation',
    'nextgen-sports',
    'Providing elite coaching, athletic gear, and college scholarships to underprivileged youth athletes. 3,400+ student-athletes supported across 28 states with 94% college acceptance rate.',
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80',
    'Youth Sports',
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'Precision Oncology Research',
    'precision-oncology',
    'Funding breakthrough mRNA genomic sequencing for rare pediatric oncology clinical trials. Phase III results showing 67% improved remission rates in DIPG and neuroblastoma cohorts.',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80',
    'Health',
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000004',
    'Urban Canopy Forest Project',
    'urban-canopy',
    'Cooling low-income urban heat corridors by planting 50,000 bio-diverse native trees in metro areas. Reduces ambient temperature by 3-5°F in target neighborhoods within 4 growing seasons.',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    'Environment',
    true
  )
ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- 3. STABLEFORD SCORES — 5 Valid Scores for Test Subscriber
-- ==============================================================================
-- All scores are within the valid 1–45 Stableford range.
-- Each score is on a unique date (enforced by UNIQUE(user_id, played_at)).
-- These 5 scores constitute the subscriber's complete rolling window.
INSERT INTO public.scores (user_id, score_value, played_at)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 38, '2026-09-01'),
  ('a0000000-0000-0000-0000-000000000001', 34, '2026-09-05'),
  ('a0000000-0000-0000-0000-000000000001', 41, '2026-09-10'),
  ('a0000000-0000-0000-0000-000000000001', 29, '2026-09-14'),
  ('a0000000-0000-0000-0000-000000000001', 36, '2026-09-18')
ON CONFLICT (user_id, played_at) DO NOTHING;


-- ==============================================================================
-- 4. MONTHLY DRAW RECORDS
-- ==============================================================================
-- 4.1 Published Draw (August 2026) — with winning numbers and jackpot rollover
INSERT INTO public.draws (id, draw_date, mode, status, winning_numbers, total_prize_pool, jackpot_rollover_amount, published_at)
VALUES (
  'd0000000-0000-0000-0000-000000000001',
  '2026-08-31',
  'algorithmic',
  'published',
  '{34, 38, 41, 29, 36}',
  64250.00,
  25700.00,
  NOW() - INTERVAL '20 days'
)
ON CONFLICT (id) DO NOTHING;

-- 4.2 Upcoming Draw (September 2026) — pending simulation and publishing
INSERT INTO public.draws (id, draw_date, mode, status, winning_numbers, total_prize_pool, jackpot_rollover_amount, published_at)
VALUES (
  'd0000000-0000-0000-0000-000000000002',
  '2026-09-30',
  'algorithmic',
  'simulated',
  '{}',
  78500.00,
  25700.00,
  NULL
)
ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- 5. CHARITY ALLOCATION — Test Subscriber → Clean Seas (25% allocation)
-- ==============================================================================
INSERT INTO public.user_charities (user_id, charity_id, contribution_percentage)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  25.00
)
ON CONFLICT ON CONSTRAINT unique_user_charity DO UPDATE SET
  charity_id = EXCLUDED.charity_id,
  contribution_percentage = EXCLUDED.contribution_percentage;


-- ==============================================================================
-- ✅ SEED COMPLETE
-- ==============================================================================
-- Verification Checklist:
--   [1] SELECT * FROM public.profiles;          → 2 rows (subscriber + admin)
--   [2] SELECT * FROM public.charities;         → 4 rows (all is_featured = true)
--   [3] SELECT * FROM public.scores
--       WHERE user_id = 'a0000000-0000-0000-0000-000000000001'
--       ORDER BY played_at DESC;                → 5 rows (38, 34, 41, 29, 36)
--   [4] SELECT * FROM public.draws;             → 2 rows (1 published, 1 simulated)
--   [5] SELECT * FROM public.user_charities;    → 1 row (25% to Clean Seas)
-- ==============================================================================
