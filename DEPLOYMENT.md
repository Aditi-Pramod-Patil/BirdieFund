# BirdieFund — Production Deployment Guide

Complete step-by-step deployment instructions for Vercel + Supabase + Stripe.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Phase 1: Supabase Project Setup](#2-phase-1-supabase-project-setup)
3. [Phase 2: Stripe Configuration](#3-phase-2-stripe-configuration)
4. [Phase 3: Vercel Deployment](#4-phase-3-vercel-deployment)
5. [Phase 4: Post-Deployment Wiring](#5-phase-4-post-deployment-wiring)
6. [Phase 5: Verification Checklist](#6-phase-5-verification-checklist)
7. [Environment Variables Reference](#7-environment-variables-reference)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Prerequisites

| Tool | Minimum Version | Purpose |
|------|----------------|---------|
| **Node.js** | 18+ | Build toolchain |
| **npm** | 9+ | Dependency management |
| **Git** | 2.x | Version control |
| **GitHub Account** | — | Repository hosting (Vercel imports from GitHub) |
| **Supabase Account** | Free tier works | PostgreSQL database, auth, and file storage |
| **Stripe Account** | Test mode works | Subscription payment processing |
| **Vercel Account** | Hobby tier works | Frontend hosting + serverless functions |

---

## 2. Phase 1: Supabase Project Setup

### 2.1 Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and sign in
2. Click **"New Project"**
3. Configure:
   - **Organization**: Select or create one
   - **Project Name**: `birdiefund`
   - **Database Password**: Generate and save a strong password
   - **Region**: Choose closest to your users
4. Click **"Create new project"** — wait ~2 minutes for provisioning

### 2.2 Collect API Credentials

Once the project is ready, navigate to **Settings → API**:

| Credential | Location | Maps to Env Var |
|-----------|----------|-----------------|
| **Project URL** | `Settings → API → Project URL` | `VITE_SUPABASE_URL` and `SUPABASE_URL` |
| **anon / public** key | `Settings → API → Project API keys → anon public` | `VITE_SUPABASE_ANON_KEY` |
| **service_role** key | `Settings → API → Project API keys → service_role secret` | `SUPABASE_SERVICE_ROLE_KEY` |

> ⚠️ **The `service_role` key bypasses RLS**. Never expose it in client-side code (no `VITE_` prefix).

### 2.3 Execute Database Schema

1. Go to **SQL Editor** in the Supabase Dashboard sidebar
2. Click **"New query"**
3. Copy the entire contents of [`supabase/schema.sql`](supabase/schema.sql) into the editor
4. Click **"Run"** (or Ctrl+Enter)
5. Verify in the output: all `CREATE TABLE`, `CREATE FUNCTION`, `CREATE POLICY`, and `INSERT` statements succeed

**What schema.sql creates:**
- 6 tables: `profiles`, `charities`, `user_charities`, `scores`, `draws`, `winners`
- 6 enum types: `user_role`, `subscription_tier`, `subscription_status`, `draw_mode`, `draw_status`, `payout_status`
- 3 trigger functions: rolling-5-score enforcement, new-user profile creation, updated_at sync
- 20+ RLS policies across all tables
- 1 storage bucket: `birdiefund-score-proofs` (private, with upload/view policies)
- 4 seed charities and 2 seed draw records

### 2.4 Create Test User Accounts

1. In Supabase Dashboard, go to **Authentication → Users**
2. Click **"Add user" → "Create new user"**
3. Create the **Subscriber** account:
   - Email: `subscriber@birdiefund.com`
   - Password: `Password123!`
   - Toggle: **"Auto Confirm User"** = ON
4. Create the **Admin** account:
   - Email: `admin@birdiefund.com`
   - Password: `Password123!`
   - Toggle: **"Auto Confirm User"** = ON
5. **Copy both UUIDs** from the Users table — you'll need them for the seed script

### 2.5 Run Database Seed Script

1. Go back to **SQL Editor → New query**
2. Open [`supabase/seed.sql`](supabase/seed.sql) and copy the contents
3. **⚠️ CRITICAL**: Replace the placeholder UUIDs with the real ones from Step 2.4:
   - Replace every `a0000000-0000-0000-0000-000000000001` with the **Subscriber's UUID**
   - Replace every `b0000000-0000-0000-0000-000000000001` with the **Admin's UUID**
4. Click **"Run"**
5. Verify with these queries:

```sql
-- Should return 2 rows (subscriber + admin)
SELECT id, email, role, subscription_status FROM public.profiles;

-- Should return 4 rows (all featured charities)
SELECT name, category, is_featured FROM public.charities;

-- Should return 5 rows (Stableford scores 38, 34, 41, 29, 36)
SELECT score_value, played_at FROM public.scores ORDER BY played_at DESC;

-- Should return 2 rows (1 published, 1 simulated)
SELECT draw_date, status, winning_numbers FROM public.draws;

-- Should return 1 row (25% to Clean Seas)
SELECT * FROM public.user_charities;
```

### 2.6 Configure Auth Settings

1. Go to **Authentication → URL Configuration**
2. Set **Site URL**: `https://your-app.vercel.app` (update after Vercel deployment)
3. Add **Redirect URLs**:
   - `https://your-app.vercel.app/**`
   - `http://localhost:5173/**` (for local dev)

### 2.7 Verify Storage Bucket

1. Go to **Storage** in the sidebar
2. Confirm `birdiefund-score-proofs` bucket exists (created by schema.sql)
3. If missing, click **"New bucket"** → Name: `birdiefund-score-proofs` → Public: **OFF**

---

## 3. Phase 2: Stripe Configuration

### 3.1 Get API Keys

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Ensure you're in **Test mode** (toggle in top-right)
3. Navigate to **Developers → API Keys**
4. Copy:
   - **Publishable key**: `pk_test_51...` → `VITE_STRIPE_PUBLISHABLE_KEY`
   - **Secret key**: `sk_test_51...` → `STRIPE_SECRET_KEY`

### 3.2 Create Subscription Products

1. Go to **Products → Add product**
2. **Monthly Plan**:
   - Name: `BirdieFund Pro Monthly`
   - Price: `$24.00` / `month` / `Recurring`
   - Click **Save product**
   - Copy the **Price ID** (starts with `price_`) → `STRIPE_PRICE_MONTHLY`
3. **Yearly Plan**:
   - Name: `BirdieFund Pro Yearly`
   - Price: `$220.00` / `year` / `Recurring`
   - Click **Save product**
   - Copy the **Price ID** (starts with `price_`) → `STRIPE_PRICE_YEARLY`

### 3.3 Configure Customer Portal

1. Go to **Settings → Billing → Customer portal**
2. Enable:
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to cancel subscriptions
   - ✅ Allow customers to switch plans
3. Under **Cancellation**, select: **Cancel immediately** or **At end of period**
4. Click **Save**

### 3.4 Register Webhook Endpoint (after Vercel deployment)

> ⏳ Complete this step AFTER Phase 3 (Vercel deployment) when you have a production URL.

1. Go to **Developers → Webhooks → Add endpoint**
2. **Endpoint URL**: `https://your-app.vercel.app/api/webhooks/stripe`
3. **Events to listen for** — click "Select events" and add:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Click **Add endpoint**
5. Click the newly created endpoint → **Reveal** signing secret
6. Copy the `whsec_...` value → `STRIPE_WEBHOOK_SECRET`

---

## 4. Phase 3: Vercel Deployment

### 4.1 Push to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "BirdieFund — production ready"

# Create GitHub repo and push
gh repo create birdiefund-app --public --source=. --remote=origin --push
# Or manually create on github.com and:
git remote add origin https://github.com/YOUR_USERNAME/birdiefund-app.git
git push -u origin main
```

### 4.2 Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `birdiefund-app` repository
4. Vercel auto-detects:
   - **Framework**: Vite
   - **Build Command**: `npm run build` (from `vercel.json`)
   - **Output Directory**: `dist`
5. **Do NOT click "Deploy" yet** — configure environment variables first

### 4.3 Set Environment Variables

In the Vercel project setup (or after import, go to **Settings → Environment Variables**):

| Variable | Value | Environments |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://xyz.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (anon key) | Production, Preview, Development |
| `SUPABASE_URL` | `https://xyz.supabase.co` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service role) | Production only ⚠️ |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_51...` | Production, Preview, Development |
| `STRIPE_SECRET_KEY` | `sk_test_51...` | Production only ⚠️ |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Production only ⚠️ |
| `STRIPE_PRICE_MONTHLY` | `price_1...` | Production, Preview, Development |
| `STRIPE_PRICE_YEARLY` | `price_1...` | Production, Preview, Development |
| `VITE_APP_URL` | `https://your-app.vercel.app` | Production, Preview, Development |

> 🔒 Mark `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` as **Production only** for security best practice.

### 4.4 Deploy

1. Click **"Deploy"** in Vercel
2. Wait for the build to complete (~30-60 seconds)
3. Note your production URL: `https://digital-heroes-xxx.vercel.app`
4. **Update `VITE_APP_URL`** to this URL in Vercel environment variables
5. **Redeploy** to pick up the updated URL (Settings → Deployments → Redeploy)

### 4.5 Update External Configs with Production URL

After deployment, update these services with your production URL:

| Service | Setting | Value |
|---------|---------|-------|
| **Supabase** | Authentication → URL Configuration → Site URL | `https://your-app.vercel.app` |
| **Supabase** | Authentication → URL Configuration → Redirect URLs | `https://your-app.vercel.app/**` |
| **Stripe** | Developers → Webhooks → Endpoint URL | `https://your-app.vercel.app/api/webhooks/stripe` |

---

## 5. Phase 4: Post-Deployment Wiring

### 5.1 Complete Stripe Webhook Setup

Now that you have a production URL:

1. Go to Stripe Dashboard → **Developers → Webhooks**
2. Click **"Add endpoint"**
3. URL: `https://your-app.vercel.app/api/webhooks/stripe`
4. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (`whsec_...`)
7. Add it to Vercel: **Settings → Environment Variables → `STRIPE_WEBHOOK_SECRET`**
8. **Redeploy** the Vercel project

### 5.2 Send Test Webhook

```bash
# Install Stripe CLI (if not installed)
# macOS: brew install stripe/stripe-cli/stripe
# Windows: scoop install stripe
# Or download from: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Send a test event to your production webhook
stripe trigger checkout.session.completed \
  --override checkout_session:metadata.user_id=<SUBSCRIBER_UUID>

# Or forward events to local dev server for debugging
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

---

## 6. Phase 5: Verification Checklist

### ✅ 6.1 Application Loading

- [ ] Visit `https://your-app.vercel.app` — landing page loads with full styling
- [ ] No console errors related to missing environment variables
- [ ] Role switcher in navbar works (Visitor → Subscriber → Admin)

### ✅ 6.2 Authentication (Supabase)

- [ ] Sign in with `subscriber@birdiefund.com` / `Password123!` → redirects to dashboard
- [ ] Sign in with `admin@birdiefund.com` / `Password123!` → redirects to admin panel
- [ ] Sign up with a new email → user appears in Supabase Auth dashboard
- [ ] Sign out clears session and returns to landing page

### ✅ 6.3 Route Protection (RBAC)

- [ ] As **visitor**: clicking "Dashboard" opens auth modal (blocked)
- [ ] As **subscriber**: clicking "Admin" shows "403 Forbidden" toast and redirects to dashboard
- [ ] As **admin**: full access to admin panel with no restrictions
- [ ] Toggle subscriber to **lapsed** in admin panel → lapsed banner appears on dashboard

### ✅ 6.4 Score Management

- [ ] Submit a score with value `36` → appears in rolling 5-score list
- [ ] Submit a score outside 1–45 range → validation error toast
- [ ] Submit a score on a duplicate date → "already logged" error
- [ ] Submit a 6th score → oldest score is automatically replaced

### ✅ 6.5 Stripe Subscription

- [ ] Open checkout modal → plan switcher works (Monthly ↔ Yearly)
- [ ] **Demo mode** (no real keys): simulation flow activates subscription locally
- [ ] **Live mode** (real keys): redirect to Stripe Hosted Checkout
- [ ] After successful payment → subscription status updates to "active" in Supabase

### ✅ 6.6 Stripe Webhooks

- [ ] Check Vercel function logs: **Settings → Functions → `api/webhooks/stripe`**
- [ ] After test checkout, `profiles.subscription_status` = `'active'` in Supabase
- [ ] After subscription cancellation, `profiles.subscription_status` = `'canceled'`
- [ ] Stripe Dashboard → Webhooks → verify events show `200` responses

### ✅ 6.7 RLS Policies

Test from the Supabase SQL Editor with RLS enabled:

```sql
-- Verify subscribers can only see their own scores
-- (Run as the subscriber's JWT context)
SELECT * FROM public.scores;  -- Should only return their scores

-- Verify charities are publicly readable
SELECT * FROM public.charities;  -- Should return all 4

-- Verify published draws are publicly readable
SELECT * FROM public.draws WHERE status = 'published';  -- Should return 1
```

### ✅ 6.8 File Uploads (Score Proof Screenshots)

- [ ] As subscriber, open claim proof modal
- [ ] Upload a valid PNG/JPG file under 5MB → "Proof uploaded" success
- [ ] Attempt to upload a `.txt` file → "Invalid file type" error
- [ ] Attempt to upload a file > 5MB → "File too large" error
- [ ] Verify file appears in Supabase **Storage → birdiefund-score-proofs** bucket

### ✅ 6.9 Charity & Draw Features

- [ ] Charity directory loads with 4 featured organizations
- [ ] Charity detail modal opens with full description
- [ ] Admin can run draw simulation (Random or Algorithmic)
- [ ] Admin can publish draw results → winner claims created

---

## 7. Environment Variables Reference

### Complete Variable Map

```
┌─────────────────────────────────────┬───────────────┬────────────────────────────┐
│ Variable                            │ Runtime       │ Used By                    │
├─────────────────────────────────────┼───────────────┼────────────────────────────┤
│ VITE_SUPABASE_URL                   │ Browser       │ src/lib/supabase.ts        │
│ VITE_SUPABASE_ANON_KEY              │ Browser       │ src/lib/supabase.ts        │
│ SUPABASE_URL                        │ Server (API)  │ api/webhooks/stripe.ts     │
│ SUPABASE_SERVICE_ROLE_KEY           │ Server (API)  │ api/webhooks/stripe.ts     │
│ VITE_STRIPE_PUBLISHABLE_KEY         │ Browser       │ src/services/stripeService │
│ STRIPE_SECRET_KEY                   │ Server (API)  │ api/checkout.ts, portal.ts │
│ STRIPE_WEBHOOK_SECRET               │ Server (API)  │ api/webhooks/stripe.ts     │
│ STRIPE_PRICE_MONTHLY                │ Server (API)  │ api/checkout.ts            │
│ STRIPE_PRICE_YEARLY                 │ Server (API)  │ api/checkout.ts            │
│ VITE_APP_URL                        │ Both          │ api/checkout.ts (redirects) │
└─────────────────────────────────────┴───────────────┴────────────────────────────┘
```

### Naming Convention

- **`VITE_*`** prefix → Bundled into the browser JavaScript by Vite. Safe for public-facing values only (project URLs, publishable keys).
- **No prefix** → Available only in Vercel serverless functions (`/api/*`). Used for secrets (service role keys, Stripe secret key, webhook signing secret).

---

## 8. Troubleshooting

### Webhook returns 400 "Signature verification failed"

**Cause**: Mismatched `STRIPE_WEBHOOK_SECRET` or body parsing interfering with raw body.

**Fix**:
1. Verify `STRIPE_WEBHOOK_SECRET` in Vercel matches the signing secret shown in Stripe Dashboard → Webhooks → your endpoint → Reveal signing secret
2. The webhook handler at `api/webhooks/stripe.ts` exports `config.api.bodyParser = false` which disables Vercel's auto-parsing. If this is missing, the raw body will be pre-parsed and signature verification fails.
3. Redeploy after updating the env var.

### "Supabase not configured" — demo mode active in production

**Cause**: `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` contains placeholder values.

**Fix**: Ensure both variables are set with real Supabase credentials in Vercel → Environment Variables. The `isSupabaseConfigured()` check in `src/lib/supabase.ts` validates the URL doesn't contain `your-project-id` and the key is longer than 20 characters. Redeploy after fixing.

### Checkout redirects to localhost in production

**Cause**: `VITE_APP_URL` is still set to `http://localhost:5173`.

**Fix**: Update `VITE_APP_URL` to `https://your-app.vercel.app` in Vercel environment variables. The checkout API at `api/checkout.ts` uses this for `success_url` and `cancel_url`. Redeploy.

### RLS blocks webhook profile updates

**Cause**: Webhook handler can't update `profiles` table.

**Fix**: The webhook uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS entirely. Verify:
1. `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel (server-only, not `VITE_` prefixed)
2. The key matches the `service_role` secret in Supabase Dashboard → Settings → API
3. `SUPABASE_URL` is also set (the webhook falls back to `VITE_SUPABASE_URL` if not)

### Score proof upload fails in production

**Cause**: Missing storage bucket or RLS policy.

**Fix**:
1. Confirm `birdiefund-score-proofs` bucket exists in Supabase → Storage
2. Confirm storage policies were created by schema.sql (check SQL Editor):
   ```sql
   SELECT * FROM storage.policies WHERE bucket_id = 'birdiefund-score-proofs';
   ```
3. If missing, re-run the storage section (lines 345-379) of `schema.sql`

### Build fails on Vercel

**Cause**: TypeScript type errors or missing dependencies.

**Fix**:
```bash
# Test locally first
npm install
npm run build

# If successful locally but fails on Vercel, check:
# 1. Node.js version in Vercel Settings → General → Node.js Version (set to 18.x or 20.x)
# 2. All dependencies are in package.json (not just devDependencies)
```

---

## Quick Start Checklist

```
□ 1. Create Supabase project → collect URL + anon key + service role key
□ 2. Run schema.sql in SQL Editor
□ 3. Create 2 test users in Authentication → Users
□ 4. Run seed.sql (with real UUIDs) in SQL Editor
□ 5. Create Stripe products → collect price IDs + API keys
□ 6. Push code to GitHub
□ 7. Import to Vercel → set all 10 environment variables
□ 8. Deploy → note production URL
□ 9. Update VITE_APP_URL + Supabase Site URL + Stripe webhook URL
□ 10. Redeploy → run verification checklist
```
