# BirdieFund — End-to-End QA Testing Checklist

> Complete manual verification plan covering every critical path.
> Execute test cases in order — each section builds on the previous.
> Use the **Persona Switcher** button in the top-right navbar to toggle between roles.

---

## Pre-Test Setup

| Step | Action | Verification |
|------|--------|-------------|
| 1 | Open the application URL in a modern browser (Chrome/Edge/Firefox) | Landing page renders with full styling, no console errors |
| 2 | Open browser DevTools → Console tab | No `SUPABASE` or `STRIPE` configuration warnings (or expected placeholder messages if using demo mode) |
| 3 | Click **"Reset Demo Data"** in footer (if available) | Toast confirms: `Demo data reset to pristine state.` |

---

## Module 1: Authentication & Role-Based Access Control (RBAC)

### TC-1.1 — Public Visitor (Unauthenticated)

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Switch persona to **"Public Visitor"** via the navbar Persona button | Toast: `Switched active view to: VISITOR` | ☐ |
| 2 | Click **Landing Page** (Home tab) | Landing page loads with hero section, pricing cards, and CTA buttons | ☐ |
| 3 | Click **"How It Works"** in navbar | How It Works protocol explainer page renders | ☐ |
| 4 | Click **"Charities"** in navbar | Charity directory loads with 4+ organizations, search bar, category filters | ☐ |
| 5 | Click **"Prize Pools"** in navbar | Prize pools view with interactive simulator renders | ☐ |
| 6 | Attempt to click **"Dashboard"** in navbar | Auth modal opens. Toast: `Active subscriber membership required to access the dashboard.` | ☐ |

### TC-1.2 — User Signup

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Open the Auth modal → switch to **"Sign Up"** tab | Registration form with Email, Password, and Full Name fields | ☐ |
| 2 | Submit with empty fields | Validation prevents submission; error message displayed | ☐ |
| 3 | Submit with password < 6 characters | Error: `Password must be at least 6 characters.` | ☐ |
| 4 | Submit valid credentials (e.g., `testuser@example.com` / `Test1234`) | Toast: `Welcome to BirdieFund, [Name]! Account created.` — confetti fires | ☐ |
| 5 | Verify role switches automatically to **Subscriber** | Navbar shows subscriber navigation (Dashboard visible) | ☐ |

### TC-1.3 — User Login

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Sign out (if signed in), open Auth modal → **"Sign In"** tab | Login form with Email and Password fields | ☐ |
| 2 | Enter `alex.rivers@birdiefund.com` and any password | Toast: `Welcome back, Alex Rivers! Signed in as SUBSCRIBER.` | ☐ |
| 3 | Sign out and enter `sarah.chen@birdiefund.com` | Toast: `Welcome back, Sarah Chen! Signed in as ADMIN.` — redirects to Admin panel | ☐ |

### TC-1.4 — Route Protection Guards

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | As **Visitor**: click Dashboard | Auth modal opens, toast: `Active subscriber membership required...` | ☐ |
| 2 | As **Subscriber**: click Admin tab | Toast: `⛔ 403 Forbidden: Administrator role required. Redirecting to your dashboard.` — stays on dashboard | ☐ |
| 3 | As **Admin**: click Admin tab | Admin Control Panel renders normally with full access | ☐ |
| 4 | As **Subscriber** with lapsed status: click Dashboard | Toast: `Your subscription is currently inactive...` — redirects to pricing, Stripe modal opens | ☐ |

### TC-1.5 — Lapsed Subscription Banner

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Switch to **Admin** → go to User Management table | User table visible with Alex Rivers as subscriber | ☐ |
| 2 | Toggle Alex Rivers' subscription status to **"Lapsed"** | Toast: `User subscription status toggled for testing.` | ☐ |
| 3 | Switch persona to **Subscriber (Alex Rivers)** → Dashboard | **Amber banner** at top: `Payment Lapsed — Your subscription payment has lapsed...` with "Renew Subscription" button | ☐ |
| 4 | Click the **"Renew Subscription"** button on the banner | Stripe checkout modal opens | ☐ |
| 5 | Click the **X** dismiss button on the banner | Banner disappears from the dashboard | ☐ |
| 6 | Re-toggle status back to **active** (via Admin) | Banner no longer appears on dashboard | ☐ |

---

## Module 2: Stripe Subscription & Payment Flow

### TC-2.1 — Stripe Checkout Modal

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | As **Visitor** or new user, click **"Subscribe Now"** CTA | Stripe checkout modal opens with plan selection | ☐ |
| 2 | Default selection is **Yearly ($220/yr)** | Yearly button highlighted in cobalt blue, "Save 24%" badge visible | ☐ |
| 3 | Click **"Monthly ($24/mo)"** toggle | Price updates to $24.00, charity contribution recalculates | ☐ |
| 4 | Click **"Yearly ($220/yr)"** toggle back | Price updates to $220.00, "Save 24%" badge visible | ☐ |
| 5 | Verify **charity split summary** is visible | Shows selected charity name, percentage, and dollar amount `(price × charity%)` | ☐ |

### TC-2.2 — Checkout Simulation (Demo Mode)

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | With default demo card pre-filled (`4242 •••• •••• 4242`), click **"Authorize $220.00 / Year"** | Loading spinner: `Authorizing with Stripe...` | ☐ |
| 2 | Wait ~1.2 seconds | Green checkmark appears: `Payment Successful!` — confetti fires | ☐ |
| 3 | After ~1.5 seconds | Modal auto-closes, toast: `Welcome to BirdieFund! YEARLY Pro subscription active.` | ☐ |
| 4 | Verify subscription is now **active** | Dashboard accessible, tier badge shows `YEARLY` | ☐ |

### TC-2.3 — Monthly Plan Activation

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Reset demo data → open Stripe checkout → select **Monthly** | Price shows $24/mo | ☐ |
| 2 | Complete checkout | Toast: `Welcome to BirdieFund! MONTHLY Pro subscription active.` | ☐ |
| 3 | Dashboard shows **Monthly** tier badge | Renewal date displays approximately 1 month from now | ☐ |

---

## Module 3: Score Engine (Stableford 1–45 Format)

> **Precondition**: Switch to Subscriber (Alex Rivers) with active subscription.

### TC-3.1 — Valid Score Entry

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Navigate to Dashboard → Score entry section | Score form visible with input field and date picker | ☐ |
| 2 | Enter score: `36`, date: a new unused date | Toast: `Score of 36 pts logged successfully! (X/5 rolling scores active)` — confetti fires | ☐ |
| 3 | Verify score appears in the rolling scores list | New entry visible, sorted by date (newest first) | ☐ |
| 4 | Enter score: `1` (minimum valid) | Score accepted, toast confirms | ☐ |
| 5 | Enter score: `45` (maximum valid) | Score accepted, toast confirms | ☐ |

### TC-3.2 — Score Validation (Boundary Cases)

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Enter score: `0` (below minimum) | Error toast: `Stableford score must be an integer between 1 and 45 points.` | ☐ |
| 2 | Enter score: `46` (above maximum) | Same error toast as above | ☐ |
| 3 | Enter score: `-5` (negative) | Same error toast | ☐ |
| 4 | Enter score: `36.5` (decimal) | Rejected — integer check fails | ☐ |

### TC-3.3 — Duplicate Date Restriction

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Note a date that already has a score logged | Date visible in the existing scores list | ☐ |
| 2 | Submit a new score with the **same date** | Error toast: `You have already logged a score for this date.` | ☐ |
| 3 | Score list remains unchanged | No duplicate entry, original score preserved | ☐ |

### TC-3.4 — Rolling 5-Score Replacement Logic

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Ensure subscriber has exactly **5 scores** in the list | Count shows `5/5 rolling scores active` | ☐ |
| 2 | Note the **oldest** score (bottom of the list) — remember its value and date | Record: value = ___, date = ___ | ☐ |
| 3 | Submit a **6th score** with a new date | Toast includes: `Rolling limit reached: oldest score (X pts on YYYY-MM-DD) was replaced.` | ☐ |
| 4 | Verify list still shows exactly **5 scores** | 6th score replaced the oldest; count remains 5/5 | ☐ |
| 5 | Verify the oldest score from step 2 is **no longer in the list** | Dropped score is gone, new score is present | ☐ |

### TC-3.5 — Score Deletion

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Click the delete icon on any score entry | Score removed from list | ☐ |
| 2 | Toast: `Score entry removed from rolling pool.` | Count decreases to `X/5 rolling scores active` | ☐ |

---

## Module 4: Charity System

### TC-4.1 — Charity Directory & Search

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Navigate to **Charities** page | 4+ charities displayed in card grid | ☐ |
| 2 | Type `"Seas"` in the search bar | Only "Clean Seas Marine Initiative" appears | ☐ |
| 3 | Clear search → filter by **"Environment"** category | Only environment charities shown (Clean Seas, Urban Canopy) | ☐ |
| 4 | Filter by **"Health"** category | Only "Precision Oncology Research" shown | ☐ |
| 5 | Filter by **"Youth Sports"** category | Only "NextGen Youth Sports Foundation" shown | ☐ |
| 6 | Click on a charity card | Detail modal opens with full description, banner image, efficiency score | ☐ |

### TC-4.2 — Contribution Percentage Slider

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | As **Subscriber**, navigate to Dashboard → Charity allocation section | Slider visible with current percentage (default 25%) | ☐ |
| 2 | Move slider to **10%** (minimum floor) | Percentage updates to 10%; charity amount recalculates | ☐ |
| 3 | Attempt to set slider **below 10%** | Clamped to 10% — enforced minimum floor | ☐ |
| 4 | Move slider to **100%** (maximum) | Percentage updates to 100% — full subscription goes to charity | ☐ |
| 5 | Select a **different charity** from the picker | Toast: `Active charity updated to: [charity name]` | ☐ |

### TC-4.3 — Extra Donation (One-Time)

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Click **"Make Extra Donation"** button on Dashboard | Donation modal opens with preset amounts and custom field | ☐ |
| 2 | Select a preset amount (e.g., $25) | Amount field populated | ☐ |
| 3 | Click **"Donate"** | Toast: `Direct donation of $25 to [charity] confirmed!` — confetti fires | ☐ |
| 4 | Verify lifetime charity contribution total increases | Dashboard counter updates with new total | ☐ |

---

## Module 5: Monthly Draw Engine (Admin)

> **Precondition**: Switch to Admin (Sarah Chen) persona.

### TC-5.1 — Draw Simulation (Random Mode)

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Navigate to Admin Panel → Draw Engine section | Draw simulator with mode selector visible | ☐ |
| 2 | Select **"Random"** mode → click **"Run Simulation"** | 5 winning numbers generated (each between 1 and 45, no duplicates) | ☐ |
| 3 | Verify winning numbers are sorted ascending | Numbers displayed in order: e.g., `[12, 23, 34, 38, 41]` | ☐ |
| 4 | Run simulation **multiple times** | Different winning numbers each time (stochastic) | ☐ |

### TC-5.2 — Draw Simulation (Algorithmic Mode)

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Select **"Algorithmic"** mode → click **"Run Simulation"** | 5 winning numbers generated, biased toward 32–38 Stableford range | ☐ |
| 2 | Verify all numbers are between 1 and 45, no duplicates | Valid range, distinct values | ☐ |
| 3 | Observe numbers trend toward mid-30s range | Algorithmic mode uses Gaussian weighting centered around 36 | ☐ |

### TC-5.3 — Prize Pool Distribution (40% / 35% / 25%)

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | After simulation, verify the prize pool breakdown panel | Three tiers displayed with pool amounts | ☐ |
| 2 | **Tier 5 (5-Match)**: pool = `totalPool × 40%` | E.g., $78,500 × 0.40 = **$31,400.00** | ☐ |
| 3 | **Tier 4 (4-Match)**: pool = `totalPool × 35%` | E.g., $78,500 × 0.35 = **$27,475.00** | ☐ |
| 4 | **Tier 3 (3-Match)**: pool = `totalPool × 25%` | E.g., $78,500 × 0.25 = **$19,625.00** | ☐ |
| 5 | Verify per-winner payouts | Each tier's pool ÷ number of winners in that tier | ☐ |

### TC-5.4 — Jackpot Rollover Logic (5-Match Unclaimed)

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Run simulations until a draw has **0 Tier-5 winners** | Tier-5 winner count = 0 | ☐ |
| 2 | Verify **jackpotRollover** = Tier-5 pool amount (40% of totalPool) | Jackpot rollover field shows the full Tier-5 pool amount | ☐ |
| 3 | **Publish** the draw result | Toast: `Official Draw Published! Winning numbers: [...].` | ☐ |
| 4 | Verify next month's draw has an **increased total pool** | Next draw's pool = 65,000 + jackpotRollover from previous draw | ☐ |
| 5 | Verify next draw's **jackpot amount** includes rollover | `jackpotRollover + 15,000` | ☐ |

### TC-5.5 — Draw Publishing

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | After simulation, click **"Publish Official Results"** | Confetti fires, toast with winning numbers and winner count | ☐ |
| 2 | Draw status changes from `simulated` → `published` | Published draw appears in "Past Draws" list with timestamp | ☐ |
| 3 | Winner claims are created in the **Winner Verification Queue** | Claims with `status: 'pending'` visible in Admin panel | ☐ |
| 4 | New upcoming draw is created for next month | Upcoming draw card shows new draw date and adjusted pool | ☐ |

---

## Module 6: Winner Verification Flow

### TC-6.1 — Subscriber Proof Upload

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Switch to **Subscriber** → navigate to Dashboard → Claims section | Pending claims visible (if any exist from a published draw) | ☐ |
| 2 | Click **"Upload Proof"** on a pending claim | Claim proof modal opens with draw details, matched numbers, and prize amount | ☐ |
| 3 | Upload a valid **PNG file** under 5MB | File preview appears with filename; status: `READY TO SUBMIT` | ☐ |
| 4 | Upload a valid **JPG file** under 5MB | Same result — preview displays | ☐ |
| 5 | Upload a valid **PDF file** under 5MB | Same result — preview displays | ☐ |

### TC-6.2 — File Upload Validation

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Upload a **.txt file** | Error toast: `Invalid file type: "text/plain". Only PNG, JPG, and PDF files are accepted.` — inline error below upload area | ☐ |
| 2 | Upload a **.gif file** | Same error — rejected | ☐ |
| 3 | Upload a **PNG file > 5MB** | Error toast: `File too large (X.XMB). Maximum allowed size is 5MB.` | ☐ |
| 4 | Verify file input resets after rejection | Browse button ready for new selection, no stale file | ☐ |

### TC-6.3 — Proof Submission

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Upload valid file + add attester notes | Notes field populated | ☐ |
| 2 | Click **"Submit for Verification"** | Loading: `Uploading Proof...` → modal closes | ☐ |
| 3 | Toast: `Scorecard proof uploaded successfully!` | Claim status updates in the list | ☐ |

### TC-6.4 — Admin Verification Panel

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Switch to **Admin** → Admin Panel → **Winner Verification Queue** | List of pending claims with user name, match tier, prize amount, and proof thumbnail | ☐ |
| 2 | Click to review a claim's proof details | Proof image/details expand or modal opens | ☐ |
| 3 | Click **"Approve"** (or "Mark as Paid") | Toast: `Claim approved! $X.XX marked as PAID to [User Name].` — confetti fires | ☐ |
| 4 | Verify claim status changes: `Pending → Paid` | Status badge updates in the claims list | ☐ |
| 5 | Verify subscriber's **balance winnings** increases | User's winnings counter in user table reflects payout amount | ☐ |

### TC-6.5 — Claim Rejection

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Click **"Reject"** on a pending claim | Rejection reason prompt or action fires | ☐ |
| 2 | Provide rejection reason | Reason recorded on claim | ☐ |
| 3 | Toast: `Claim marked as Rejected.` | Status changes to `Rejected` | ☐ |
| 4 | Verify subscriber's balance does **NOT** increase | No payout credited for rejected claims | ☐ |

### TC-6.6 — Payout State Transitions

| # | Status Flow | Valid? | ✅ |
|---|-------------|--------|------|
| 1 | `Pending` → `Approved/Paid` | ✅ Yes — admin approves | ☐ |
| 2 | `Pending` → `Rejected` | ✅ Yes — admin rejects with reason | ☐ |
| 3 | Verify no `Rejected` → `Paid` transition exists | ❌ Once rejected, cannot be re-approved without re-submission | ☐ |

---

## Module 7: Error Handling & Edge Cases

### TC-7.1 — Toast Notification System

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Trigger any toast (e.g., score submission) | Toast appears at bottom of screen with message | ☐ |
| 2 | Wait ~4.5 seconds | Toast auto-dismisses | ☐ |
| 3 | Trigger multiple actions rapidly | Each new toast replaces the previous one | ☐ |

### TC-7.2 — Demo Data Reset

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Click **"Reset Demo Data"** in footer | Toast: `Demo data reset to pristine state.` | ☐ |
| 2 | All scores, charities, draws return to initial mock state | Data restored to factory defaults | ☐ |
| 3 | Role resets to **Subscriber (Alex Rivers)** | Dashboard loads with pre-seeded data | ☐ |

### TC-7.3 — Responsive Design

| # | Test Step | Expected Result | ✅ |
|---|-----------|----------------|------|
| 1 | Resize browser to mobile width (~375px) | Layout adapts, navigation collapses to hamburger/menu | ☐ |
| 2 | Resize to tablet (~768px) | Grid layouts adjust appropriately | ☐ |
| 3 | Test on full desktop (1440px+) | Full-width layout with proper spacing | ☐ |

---

## Test Summary Matrix

| Module | Total Cases | Pass | Fail | Notes |
|--------|------------|------|------|-------|
| 1. Auth & RBAC | 20 | ☐ | ☐ | |
| 2. Stripe Subscriptions | 10 | ☐ | ☐ | |
| 3. Score Engine | 14 | ☐ | ☐ | |
| 4. Charity System | 13 | ☐ | ☐ | |
| 5. Draw Engine (Admin) | 18 | ☐ | ☐ | |
| 6. Winner Verification | 16 | ☐ | ☐ | |
| 7. Error Handling | 9 | ☐ | ☐ | |
| **TOTAL** | **100** | ☐ | ☐ | |

---

*QA Checklist Version 1.0 — BirdieFund Platform*
*Generated: September 2026*
