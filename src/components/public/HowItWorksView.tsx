import React from 'react';
import { Zap } from 'lucide-react';

interface HowItWorksViewProps {
  onOpenStripe: () => void;
  onExploreCharities: () => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({ onOpenStripe }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-cobalt-700 text-xs font-semibold mb-1">
          <Zap className="w-3.5 h-3.5" /> Full Protocol Transparency
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          How BirdieFund Works
        </h1>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
          From your local club scorecard to audited charity grants and automated monthly prize draws.
        </p>
      </div>

      {/* Deep Dive Pillars */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Pillar 1 */}
        <div className="card-base p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-cobalt-600 flex items-center justify-center font-bold text-sm">
            01
          </div>
          <h3 className="text-base font-semibold text-slate-900">Stableford Score Tracking (1–45)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Stableford points reward net score relative to par (1 pt for Net Bogey, 2 pts for Net Par, 3 pts for Net Birdie, etc.). Points typically total between 20 and 45.
          </p>
          <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-900 text-[11px] uppercase tracking-wider">Rolling 5-Score Buffer</div>
            <div>Your account holds strictly your latest 5 rounds. Adding a 6th round automatically ejects your oldest round.</div>
            <div className="text-slate-400 text-[11px]">• Strict 1 score per calendar date limit.</div>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="card-base p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-cobalt-600 flex items-center justify-center font-bold text-sm">
            02
          </div>
          <h3 className="text-base font-semibold text-slate-900">Automated Monthly Draws</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            On the final calendar day of each month, 5 winning numbers are drawn. Our engine checks your active 5 rolling scores against the winning numbers.
          </p>
          <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-900 text-[11px] uppercase tracking-wider">3 Match Tiers</div>
            <div>• 5 Numbers (40% Pool + Rollover Jackpot)</div>
            <div>• 4 Numbers (35% Pool Share)</div>
            <div>• 3 Numbers (25% Pool Share)</div>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="card-base p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
            03
          </div>
          <h3 className="text-base font-semibold text-slate-900">Direct Non-Profit Giving</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every subscriber chooses a verified 501(c)(3) charity during registration. A minimum 10% (up to 100%) of every membership fee is automatically directed to your cause.
          </p>
          <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-900 text-[11px] uppercase tracking-wider">Audited Impact</div>
            <div>Independent one-time donations supported anytime. Full tax receipts and financial efficiency audits provided.</div>
          </div>
        </div>
      </div>

      {/* Verification Lifecycle (Placed directly on grid, no giant box-in-box card) */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            The Winner Verification Lifecycle
          </h2>
          <p className="text-sm font-normal text-slate-500 mt-0.5">
            How claims transition from automated match detection to audited disbursement.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 text-xs">
          <div className="card-base p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-cobalt-700 font-bold text-[10px] uppercase tracking-wider inline-block">Phase 01</span>
            <h4 className="font-semibold text-slate-900">Automated Match</h4>
            <p className="text-slate-600 leading-relaxed">System detects 3, 4, or 5 numbers matching your active rolling scores.</p>
          </div>
          <div className="card-base p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-cobalt-700 font-bold text-[10px] uppercase tracking-wider inline-block">Phase 02</span>
            <h4 className="font-semibold text-slate-900">Scorecard Upload</h4>
            <p className="text-slate-600 leading-relaxed">Winner submits screenshot of their club scorecard or digital round.</p>
          </div>
          <div className="card-base p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-cobalt-700 font-bold text-[10px] uppercase tracking-wider inline-block">Phase 03</span>
            <h4 className="font-semibold text-slate-900">Admin Audit</h4>
            <p className="text-slate-600 leading-relaxed">Platform administrator verifies marker attestation, course date, and points.</p>
          </div>
          <div className="card-base p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase tracking-wider inline-block">Phase 04</span>
            <h4 className="font-semibold text-slate-900">Instant Payout</h4>
            <p className="text-slate-600 leading-relaxed">Status transitions to Paid; cash prize is credited to your member balance.</p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-center">
          <button
            onClick={onOpenStripe}
            className="px-6 py-2.5 rounded-lg btn-cobalt text-xs font-semibold shadow-sm"
          >
            Join & Start Logging Scores
          </button>
        </div>
      </div>
    </div>
  );
};
