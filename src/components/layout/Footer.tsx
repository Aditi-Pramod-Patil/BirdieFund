import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC<{ setCurrentTab: (tab: string) => void }> = ({ setCurrentTab }) => {
  const { currentRole, setCurrentRole } = useApp();

  return (
    <footer className="w-full border-t border-slate-200 bg-white text-slate-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-cobalt-600 p-1 flex items-center justify-center">
                <img src="/logo.svg" alt="BirdieFund" className="w-full h-full object-contain brightness-0 invert" />
              </div>
              <span className="font-bold text-base text-slate-900 tracking-tight">BirdieFund</span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Combining amateur Stableford golf performance tracking, transparent monthly prize draws, and direct non-profit funding.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>USGA & R&A Amateur Status Compliant</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 text-xs">
            <span className="font-semibold text-slate-900 uppercase tracking-wider block mb-2.5 text-[11px]">
              Platform Links
            </span>
            <div>
              <button
                onClick={() => setCurrentTab('how-it-works')}
                className="hover:text-cobalt-600 transition-colors"
              >
                How Draw Pools Work
              </button>
            </div>
            <div>
              <button
                onClick={() => setCurrentTab('charities')}
                className="hover:text-cobalt-600 transition-colors"
              >
                Charity Directory & Impact
              </button>
            </div>
            <div>
              <button
                onClick={() => setCurrentTab('prize-pools')}
                className="hover:text-cobalt-600 transition-colors"
              >
                Prize Pool Calculations
              </button>
            </div>
            <div>
              <button
                onClick={() => setCurrentTab('pricing')}
                className="hover:text-cobalt-600 transition-colors"
              >
                Membership Plans
              </button>
            </div>
          </div>

          {/* Compliance & Trust */}
          <div className="space-y-2 text-xs">
            <span className="font-semibold text-slate-900 uppercase tracking-wider block mb-2.5 text-[11px]">
              Compliance & Security
            </span>
            <div className="text-slate-500">USGA & R&A Amateur Rule Compliant</div>
            <div className="text-slate-500">501(c)(3) Direct Non-Profit Grants</div>
            <div className="text-slate-500">Stripe PCI-DSS Level 1 Encryption</div>
            <div className="text-slate-500">Audited Monthly Draw Protocol</div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>© {new Date().getFullYear()} BirdieFund Impact Platform. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>Stripe PCI-DSS Level 1</span>
            <span>•</span>
            <span>501(c)(3) Direct Non-Profit Grants</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
