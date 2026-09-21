# BirdieFund — Golf Performance, Monthly Prize Draws & Real-World Impact Platform

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

**BirdieFund** transforms everyday amateur golf rounds into guaranteed monthly cash prize draws and audited, direct charitable impact.

---

## 💎 Design Rationale & Aesthetic System
- **STRICT ANTI-CLICHÉ RULE**: BirdieFund explicitly avoids traditional golf clichés (no fairway green grass, no plaid patterns, no golf ball/club icons as the primary motif).
- **Aesthetic**: High-contrast, dark-first fintech and impact platform design.
- **Palette**:
  - **Deep Charcoal**: `#0D0F12` (Background Primary)
  - **Dark Slate**: `#161920` (Surface Panels)
  - **Elevated Card**: `#1C202B`
  - **Electric Neon Accents**:
    - **Neon Cyan**: `#00F0FF` (Navigation highlights, tech badges, buttons)
    - **Electric Lime**: `#CCFF00` (Prize pools, success states, secondary buttons)
    - **Neon Coral/Pink**: `#FF0055` (Charity hearts, warning indicators, critical alerts)
- **Glassmorphism**: Translucent backdrop-blur cards (`backdrop-blur-xl`, `rgba(255, 255, 255, 0.08)` borders), smooth micro-interactions, and high-energy CTAs.

---

## 🔐 Functional Modules & Architecture

### 1. Authentication & Role-Based Access Control (RBAC)
- **Public Visitors**: Access landing page, How It Works protocol explainer, searchable charity directory, interactive prize pool simulator, and pricing engine.
- **Subscribers**: Personal dashboard, Stableford rolling 5-score manager, charity fee allocation slider (10% to 100%), draw entry numbers, and winner claim scorecard upload.
- **Administrators**: Executive control panel with live KPI cards, User Management table (with active/lapsed subscription toggling), Draw Engine & Simulator (Random vs. Algorithmic mode), Charity CRUD, and Winner Verification Queue with scorecard proof audit.
- **Instant Persona Switcher**: Embedded in the top navbar and footer to allow seamless switching between `Public Visitor`, `Subscriber (Alex Rivers)`, and `Admin (Sarah Chen)`.

### 2. Subscription & Payment Engine (Stripe Integration)
- **Plans**:
  - **Monthly**: $24.00 / month
  - **Yearly (Discounted)**: $220.00 / year (Save 24% + 2 months free)
- **Interactive Stripe Simulator**: 256-bit SSL encrypted checkout modal with card inputs, plan summary, fee split calculation, and instant tier activation.
- **Access Guard Middleware**: Manages active, canceled, and lapsed subscription states.

### 3. Score Management System (Stableford 1–45)
- **Validation**: Accepts Stableford points in the strict range of **1 to 45**.
- **Rolling 5 Storage Engine**: Retains strictly the latest 5 scores per user. Adding a 6th score automatically removes the oldest entry.
- **Duplicate Date Prevention**: Enforces a strict one-score-per-calendar-date limit with explicit validation error alerts and edit/delete controls.
- **Reverse Chronological Ordering**: Automatically sorted newest to oldest.

### 4. Monthly Draw & Prize Pool Engine
- **Match Categories**:
  - **5-Number Match**: **40%** pool share + **Jackpot Rollover** guarantee into subsequent months if unclaimed.
  - **4-Number Match**: **35%** pool share divided equally among qualifiers.
  - **3-Number Match**: **25%** pool share divided equally among qualifiers.
- **Draw Modes**:
  - **Standard Uniform Random**: Samples 5 distinct numbers between 1 and 45 uniformly.
  - **Algorithmic (Score Frequency Weighted)**: Uses a Gaussian curve centered around 32–38 Stableford points weighted with live user score frequency.
- **Admin Simulation & Publishing**: Administrators can run simulations, preview winner and rollover distributions, and officially publish results to the network.

### 5. Charity Contribution System
- **Minimum 10% Floor**: Every subscriber directs at least 10% (up to 100%) of their subscription fee to their selected charity.
- **Directory**: Searchable and filterable by category (Environment, Health, Youth Sports, Education, Community).
- **Detail Modal**: Rich banner, 501(c)(3) audited efficiency score, and upcoming charity golf events and tournaments.
- **Independent Donations**: Supports extra one-time charitable donations with preset and custom amounts.

### 6. Dashboards & Winner Verification
- **Subscriber Dashboard**: Displays active tier badge, renewal date, lifetime charity impact, rolling 5-score queue indicator, auto-generated draw entry numbers, and a live draw countdown timer.
- **Winner Verification Flow**: Prize claimants upload scorecard screenshot proofs. Admins inspect the high-resolution proof and cryptographic stamp in an audit modal before approving payout (`Pending` → `Paid`).

---

## 🔑 Test Credentials & Personas

| Persona | Name | Email | Role | Features Accessible |
|---|---|---|---|---|
| **Subscriber** | Alex Rivers | `subscriber@birdiefund.com` | `subscriber` | 5 Rolling scores, Charity slider, Draw claim upload |
| **Administrator** | Sarah Chen | `admin@birdiefund.com` | `admin` | Draw simulator, Winner audit queue, User table, Charity CRUD |
| **Public Visitor** | Guest Visitor | `guest@birdiefund.com` | `visitor` | Landing page, How it Works, Charity directory, Pricing |

*Tip: Use the "Persona" button in the top right navbar to toggle between any role in 1 click.*

---

## 🗄️ Supabase Database Schema

The complete PostgreSQL schema with triggers and RLS policies is available in `supabase/schema.sql`:

- `profiles`: User account, tier, subscription status, lifetime charity total, winnings balance.
- `scores`: Individual Stableford scores with `CHECK (score_value >= 1 AND score_value <= 45)` and `UNIQUE(user_id, played_at)`.
- `maintain_five_rolling_scores()`: PostgreSQL trigger function executing on `AFTER INSERT ON scores` that automatically deletes scores outside the newest 5 for that user.
- `charities`: Organization title, category, description, goal, efficiency score, and spotlight status.
- `user_charities`: User allocation percentage with `CHECK (contribution_percentage >= 10 AND contribution_percentage <= 100)`.
- `draws`: Monthly draw records, winning numbers, total pool, match counts, and jackpot rollover amount.
- `winners`: Winner claim records, match tier (3, 4, 5), matched numbers, prize amount, proof URL, and status (`pending`, `approved`, `paid`, `rejected`).
- `charity_events`: Upcoming charity golf tournaments and registration links.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev

# 3. Build for production
npm run build
```

---

## ☁️ Deployment (Vercel)

1. Push this repository to GitHub.
2. Import the repository into your [Vercel Dashboard](https://vercel.com).
3. The included `vercel.json` automatically configures the Vite single-page application build and routing rewrites.
4. Set any optional environment variables from `.env.example` in Vercel Project Settings.
