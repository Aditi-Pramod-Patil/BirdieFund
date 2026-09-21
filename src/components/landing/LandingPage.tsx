import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Heart,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Target,
  Coins,
  ChevronRight,
  Flame
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LandingPageProps {
  onOpenAuth: () => void;
  onOpenStripe: () => void;
  onExploreCharities: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenStripe,
  onExploreCharities
}) => {
  const { charities, currentDraw, setSelectedCharityId, setCurrentRole, showToast } = useApp();
  const [pricingCycle, setPricingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const featuredCharities = charities.filter(c => c.isFeatured);

  return (
    <div className="space-y-24 pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 shadow-subtle"
              >
                <span className="w-2 h-2 rounded-full bg-cobalt-600 animate-pulse" />
                <span className="text-xs font-semibold text-cobalt-800">
                  Live Monthly Prize Pool: <span className="font-bold">${currentDraw.totalPool.toLocaleString()}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-600 font-medium">100% Verified Impact</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight text-slate-900 leading-[1.08]"
              >
                Turn your golf game into{' '}
                <span className="text-cobalt-600">
                  real-world impact.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
              >
                Track your rolling 5 Stableford scores, enter transparent monthly cash draws, and direct a minimum 10% (up to 100%) of your membership directly to vetted 501(c)(3) charities.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2"
              >
                <button
                  onClick={onOpenStripe}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl btn-cobalt text-sm font-semibold flex items-center justify-center gap-2 group"
                >
                  Join BirdieFund
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={onExploreCharities}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl btn-outline text-slate-700 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  Explore Charities
                </button>
              </motion.div>

              {/* Verified Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.32 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-3 text-xs text-slate-500"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cobalt-600" />
                  <span>USGA / R&A Stableford Rules</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>501(c)(3) Audited Non-Profits</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-600" />
                  <span>Stripe PCI-DSS Protected</span>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Live Metrics Card */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="card-base p-6 rounded-xl border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-cobalt-600">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Platform Performance</h4>
                      <p className="text-xs text-slate-500">Live verified pool data</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">
                    SEPTEMBER 2026
                  </span>
                </div>

                {/* Live Prize Pool Section (Clean typography & dividers instead of nested box) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Active Prize Pool</span>
                    <span className="text-cobalt-600 font-semibold flex items-center gap-1 text-[11px]">
                      <Flame className="w-3.5 h-3.5 text-amber-500" /> Rollover Active
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                    ${currentDraw.totalPool.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-slate-500">USD</span>
                  </div>
                  <div className="pt-2 text-xs text-slate-600 flex items-center justify-between">
                    <span>5-Match Jackpot Share:</span>
                    <span className="font-bold text-cobalt-700 tabular-nums">
                      ${(currentDraw.totalPool * 0.4).toLocaleString()} (40%)
                    </span>
                  </div>
                </div>

                {/* Total Charity Raised Section */}
                <div className="border-t border-slate-100 pt-5 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Total Grants Distributed</span>
                    <span className="text-rose-600 font-semibold flex items-center gap-1 text-[11px]">
                      <Heart className="w-3 h-3 fill-rose-500" /> Direct Giving
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                    $182,400{' '}
                    <span className="text-xs font-normal text-slate-500">USD</span>
                  </div>
                  <div className="pt-2 text-xs text-slate-600 flex items-center justify-between">
                    <span>Vetted Partners:</span>
                    <span className="font-bold text-slate-900">5 Organizations</span>
                  </div>
                </div>

                {/* Explore Charities Trigger */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={onExploreCharities}
                    className="w-full py-2.5 rounded-lg btn-secondary text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cobalt-600" />
                    Explore Vetted Non-Profit Directory
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (3 Clean Step Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-cobalt-700 text-xs font-semibold mb-1">
            <Zap className="w-3.5 h-3.5" /> How It Works
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
            Simple, Transparent, and Impactful
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl">
            Three simple steps linking your everyday golf rounds to verified cash draws and charitable causes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="card-base p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-cobalt-600 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div className="text-[11px] font-bold text-cobalt-600 uppercase tracking-wider">
              Step 01
            </div>
            <h3 className="text-base font-semibold text-slate-900">Play & Log Stableford Scores</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit your Stableford score (1–45 pts) after each round. Our engine keeps strictly your latest 5 rolling scores—automatically replacing the oldest entry.
            </p>
          </div>

          {/* Step 2 */}
          <div className="card-base p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-cobalt-600 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="text-[11px] font-bold text-cobalt-600 uppercase tracking-wider">
              Step 02
            </div>
            <h3 className="text-base font-semibold text-slate-900">Win Monthly Prize Draws</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every month, 5 winning numbers are drawn. Match 3, 4, or 5 of your active scores to win cash prizes. Unclaimed 5-match jackpots roll over into the next month!
            </p>
          </div>

          {/* Step 3 */}
          <div className="card-base p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5" />
            </div>
            <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
              Step 03
            </div>
            <h3 className="text-base font-semibold text-slate-900">Support Causes You Love</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A minimum 10% (up to 100%) of every membership fee goes directly to your selected 501(c)(3) charity. Make extra one-time donations anytime and view receipts.
            </p>
          </div>
        </div>
      </section>

      {/* 3. PRIZE POOL & MECHANICS (Placed directly on page grid, no giant wrapper card) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-cobalt-700 text-xs font-semibold mb-1">
            <Coins className="w-3.5 h-3.5" /> Prize Pool Math & Mechanics
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
            Guaranteed Match Tier Allocations
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl">
            Each monthly draw redistributes 100% of pool funds directly back to active subscribers across 3 distinct match tiers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* 5-Number Match Card */}
          <div className="card-base p-6 rounded-xl border border-slate-200 shadow-sm relative space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[10px] font-bold text-cobalt-700 uppercase">
                Tier 1 • Jackpot
              </span>
              <span className="text-xs font-semibold text-cobalt-600">40% POOL</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">5-Number Match</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Match all 5 of your active rolling Stableford scores with the monthly draw numbers.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <div className="text-[11px] text-slate-500">Current Jackpot Share</div>
              <div className="text-2xl font-bold text-cobalt-700 tabular-nums mt-0.5">
                ${(currentDraw.totalPool * 0.4).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 100% Rollover guarantee if unclaimed
            </div>
          </div>

          {/* 4-Number Match Card */}
          <div className="card-base p-6 rounded-xl border border-slate-200 shadow-sm relative space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 uppercase">
                Tier 2 • Runner-Up
              </span>
              <span className="text-xs font-semibold text-slate-700">35% POOL</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">4-Number Match</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Match any 4 of your 5 active Stableford scores with the official draw numbers.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <div className="text-[11px] text-slate-500">Current Tier Pool</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums mt-0.5">
                ${(currentDraw.totalPool * 0.35).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Split equally among all qualifiers
            </div>
          </div>

          {/* 3-Number Match Card */}
          <div className="card-base p-6 rounded-xl border border-slate-200 shadow-sm relative space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 uppercase">
                Tier 3 • Base Prize
              </span>
              <span className="text-xs font-semibold text-slate-700">25% POOL</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">3-Number Match</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Match any 3 of your active Stableford scores with the official draw numbers.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <div className="text-[11px] text-slate-500">Current Tier Pool</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums mt-0.5">
                ${(currentDraw.totalPool * 0.25).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> High-frequency payout tier
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED CHARITY SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold mb-1">
              <Heart className="w-3.5 h-3.5 fill-rose-500" /> Direct Giving
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
              Featured Impact Partners
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl">
              Select any vetted non-profit during signup or adjust your allocation anytime.
            </p>
          </div>
          <button
            onClick={onExploreCharities}
            className="self-start sm:self-auto px-4 py-2 rounded-lg btn-secondary text-xs font-semibold flex items-center gap-1.5"
          >
            View Full Directory
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {featuredCharities.map(charity => {
            const pct = Math.min(100, Math.round((charity.totalRaised / charity.goalAmount) * 100));

            return (
              <div
                key={charity.id}
                className="card-base rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 relative overflow-hidden">
                    <img
                      src={charity.imageUrl}
                      alt={charity.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[11px] font-semibold text-slate-800 shadow-sm">
                      {charity.category}
                    </span>
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                      {charity.efficiencyScore}% DIRECT IMPACT
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="text-base font-semibold text-slate-900 mb-2">{charity.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-6 line-clamp-3">{charity.description}</p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 mb-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Total Raised:</span>
                        <span className="text-slate-900 font-bold tabular-nums">${charity.totalRaised.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-cobalt-600 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-right text-slate-400 tabular-nums">
                        {pct}% of ${charity.goalAmount.toLocaleString()} target
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedCharityId(charity.id);
                      onOpenStripe();
                    }}
                    className="w-full py-2.5 rounded-lg btn-outline text-xs font-semibold flex items-center justify-center gap-1.5 mt-4"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    Select & Support
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. PRICING SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
            Simple, Transparent Membership
          </h2>
          <p className="text-sm sm:text-base text-slate-500">
            Automatic draw participation, rolling Stableford scoring engine, and customizable charity allocation.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 mt-2">
            <button
              onClick={() => setPricingCycle('monthly')}
              className={`py-1.5 px-4 rounded-lg text-xs font-semibold transition-all ${
                pricingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setPricingCycle('yearly')}
              className={`py-1.5 px-4 rounded-lg text-xs font-semibold transition-all ${
                pricingCycle === 'yearly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly (Discounted)
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 font-bold">
                Save 24%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* Monthly Plan */}
          <div className="card-base p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Monthly Membership
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600">
                  Flexible
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-3xl font-extrabold text-slate-900 tabular-nums">$24</span>
                <span className="text-slate-500 text-xs">/ month</span>
              </div>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                Great for trying out monthly prize draws with zero long-term commitment.
              </p>

              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cobalt-600 flex-shrink-0" />
                  <span>Latest 5 Rolling Stableford scores tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cobalt-600 flex-shrink-0" />
                  <span>Entry into monthly 3, 4, 5-number prize draws</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cobalt-600 flex-shrink-0" />
                  <span>Customizable charity allocation (10% to 100%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cobalt-600 flex-shrink-0" />
                  <span>Cancel anytime in subscriber settings</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenStripe}
              className="w-full py-2.5 rounded-lg btn-outline text-xs font-semibold"
            >
              Start Monthly Membership
            </button>
          </div>

          {/* Yearly Pro Plan */}
          <div className="card-base p-6 rounded-xl border border-cobalt-600 relative shadow-sm flex flex-col justify-between space-y-6">
            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-cobalt-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
              Most Popular
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-cobalt-700 uppercase tracking-wider">
                  Pro Yearly Membership
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[10px] font-bold text-cobalt-800">
                  2 Months Free
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-3xl font-extrabold text-slate-900 tabular-nums">$220</span>
                <span className="text-slate-500 text-xs">/ year ($18.33/mo)</span>
              </div>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                Annual commitment with max impact: guarantees entry into all 12 monthly draws & rollover jackpots.
              </p>

              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cobalt-600 flex-shrink-0" />
                  <span>All 12 Monthly Prize Pool draws guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cobalt-600 flex-shrink-0" />
                  <span>Priority Winner verification queue review</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cobalt-600 flex-shrink-0" />
                  <span>Minimum $22.00 guaranteed direct charity grant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cobalt-600 flex-shrink-0" />
                  <span>Official Stableford verification badge</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenStripe}
              className="w-full py-2.5 rounded-lg btn-cobalt text-xs font-bold shadow-sm"
            >
              Get Pro Yearly Access
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
