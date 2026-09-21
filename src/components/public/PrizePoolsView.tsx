import React, { useState } from 'react';
import { Trophy, Coins, Flame, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PrizePoolsView: React.FC<{ onOpenStripe: () => void }> = ({ onOpenStripe }) => {
  const { currentDraw } = useApp();
  const [simulatedPool, setSimulatedPool] = useState<number>(currentDraw.totalPool || 78500);

  const tier5Share = simulatedPool * 0.40;
  const tier4Share = simulatedPool * 0.35;
  const tier3Share = simulatedPool * 0.25;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-cobalt-700 text-xs font-semibold mb-1">
          <Coins className="w-3.5 h-3.5" /> Pool Allocation Protocol
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Prize Pools & Mechanics
        </h1>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
          Guaranteed prize pool distribution: 40% to 5-Match Jackpots (with unlimited rollovers), 35% to 4-Match pools, and 25% to 3-Match pools.
        </p>
      </div>

      {/* Interactive Pool Calculator Section (Header on grid, clean card for slider) */}
      <div className="space-y-6">
        <div className="card-base p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-cobalt-700 uppercase font-semibold tracking-wider">
                Interactive Prize Distribution Calculator
              </span>
              <h2 className="text-lg font-semibold text-slate-900 mt-0.5">
                Simulate Any Prize Pool Amount
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-500 block">Simulated Pool:</span>
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                ${simulatedPool.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Pool Slider */}
          <div className="space-y-2 pt-2">
            <input
              type="range"
              min="25000"
              max="250000"
              step="5000"
              value={simulatedPool}
              onChange={e => setSimulatedPool(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 font-medium tabular-nums">
              <span>$25,000 (Base)</span>
              <span>$100,000</span>
              <span>$250,000 (Grand)</span>
            </div>
          </div>
        </div>

        {/* 3 Tier Cards Placed Directly on Page Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card-base p-6 rounded-xl border border-cobalt-600 shadow-sm relative space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-cobalt-700 font-bold px-2 py-0.5 rounded bg-blue-50 uppercase text-[10px]">
                Tier 1 (5 Match)
              </span>
              <span className="text-slate-900 font-semibold">40% SHARE</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-cobalt-700 tabular-nums">
              ${tier5Share.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
              Awarded to players matching all 5 rolling Stableford numbers. If no winner, 100% of this amount rolls over to next month's jackpot.
            </p>
          </div>

          <div className="card-base p-6 rounded-xl border border-slate-200 shadow-sm relative space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-700 font-bold px-2 py-0.5 rounded bg-slate-100 uppercase text-[10px]">
                Tier 2 (4 Match)
              </span>
              <span className="text-slate-900 font-semibold">35% SHARE</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
              ${tier4Share.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
              Awarded to players matching any 4 of their 5 rolling scores. Distributed equally among all qualifying winners.
            </p>
          </div>

          <div className="card-base p-6 rounded-xl border border-slate-200 shadow-sm relative space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-700 font-bold px-2 py-0.5 rounded bg-slate-100 uppercase text-[10px]">
                Tier 3 (3 Match)
              </span>
              <span className="text-slate-900 font-semibold">25% SHARE</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
              ${tier3Share.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
              Awarded to players matching any 3 of their 5 rolling scores. High frequency baseline win rate.
            </p>
          </div>
        </div>
      </div>

      {/* Rollover Mechanics Explainer */}
      <div className="grid md:grid-cols-2 gap-8 items-center pt-4">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5" /> Compounding Jackpots
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            Jackpot Rollover Mechanics
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            In standard lottery systems, unclaimed pool amounts are retained by the house. At BirdieFund, 100% of unclaimed 5-match jackpot funds roll forward into subsequent monthly draws until claimed.
          </p>
          <ul className="space-y-2 text-xs text-slate-700 pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Current Draw rollover accumulator: $25,700 added from August</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Draw numbers weighted towards active score frequencies in Algorithmic mode</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>All payouts audited and protected via Stripe Direct Banking</span>
            </li>
          </ul>
        </div>

        <div className="card-base p-6 rounded-xl border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-cobalt-600 mx-auto flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Join This Month's Draw</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
              Log your latest 5 rounds now and become eligible for the upcoming end-of-month draw!
            </p>
          </div>
          <button
            onClick={onOpenStripe}
            className="px-6 py-2.5 rounded-lg btn-cobalt text-xs font-semibold shadow-sm"
          >
            Activate Subscription & Enter
          </button>
        </div>
      </div>
    </div>
  );
};
