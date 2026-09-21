import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShieldCheck, Calendar, MapPin, ExternalLink } from 'lucide-react';
import type { Charity } from '../../types';
import { useApp } from '../../context/AppContext';

interface CharityDetailModalProps {
  charity: Charity | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenStripe: () => void;
}

export const CharityDetailModal: React.FC<CharityDetailModalProps> = ({
  charity,
  isOpen,
  onClose
}) => {
  const { setSelectedCharityId, selectedCharity, showToast } = useApp();

  if (!isOpen || !charity) return null;

  const isCurrentActive = selectedCharity?.id === charity.id;
  const pct = Math.min(100, Math.round((charity.totalRaised / charity.goalAmount) * 100));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8"
        >
          {/* Top Banner Image */}
          <div className="h-56 relative">
            <img
              src={charity.bannerUrl || charity.imageUrl}
              alt={charity.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/90 text-slate-700 hover:text-slate-950 flex items-center justify-center backdrop-blur-md shadow-sm text-xs"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-4 left-6 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-white/95 text-slate-900 text-xs font-semibold shadow-sm">
                {charity.category}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified 501(c)(3)
              </span>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-7 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{charity.title}</h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
                {charity.longDescription || charity.description}
              </p>
            </div>

            {/* Impact Metric Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Total Raised</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5 tabular-nums">
                  ${charity.totalRaised.toLocaleString()}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-center">
                <div className="text-[10px] text-emerald-700 font-semibold uppercase">Program Efficiency</div>
                <div className="text-lg font-bold text-emerald-800 mt-0.5 tabular-nums">
                  {charity.efficiencyScore}%
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Funding Target</div>
                <div className="text-lg font-bold text-slate-700 mt-0.5 tabular-nums">
                  ${charity.goalAmount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Funding Progress Meter */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Campaign Progress:</span>
                <span className="text-cobalt-700 font-bold">{pct}% Funded</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-cobalt-600 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Upcoming Charity Golf Events */}
            {charity.events && charity.events.length > 0 && (
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                  Upcoming Tournaments & Benefit Events
                </span>
                {charity.events.map(ev => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{ev.title}</div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 tabular-nums">
                          <Calendar className="w-3.5 h-3.5 text-cobalt-600" /> {ev.eventDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" /> {ev.location}
                        </span>
                      </div>
                    </div>
                    {ev.registrationUrl && (
                      <a
                        href={ev.registrationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-cobalt-600 hover:text-cobalt-700 flex items-center gap-1 text-[11px] font-semibold self-start sm:self-auto shadow-sm"
                      >
                        Register <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg btn-secondary text-xs font-semibold"
              >
                Close
              </button>
              {isCurrentActive ? (
                <div className="px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Currently Selected Charity
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCharityId(charity.id);
                    showToast(`Selected "${charity.title}" as your primary charity!`);
                    onClose();
                  }}
                  className="px-5 py-2 rounded-lg btn-cobalt text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Heart className="w-3.5 h-3.5" />
                  Select as My Charity
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
