import React, { useState } from 'react';
import { Search, Heart, ChevronRight, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Charity } from '../../types';
import { CharityDetailModal } from './CharityDetailModal';

interface CharityDirectoryProps {
  onOpenStripe: () => void;
}

export const CharityDirectory: React.FC<CharityDirectoryProps> = ({ onOpenStripe }) => {
  const { charities, selectedCharity, setSelectedCharityId, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalCharity, setActiveModalCharity] = useState<Charity | null>(null);

  const categories = ['All', 'Environment', 'Health', 'Youth Sports', 'Education'];

  const filteredCharities = charities.filter(c => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalRaisedAcrossPlatform = charities.reduce((acc, c) => acc + c.totalRaised, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Section Header directly on grid */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold mb-1">
            <Heart className="w-3.5 h-3.5 fill-rose-500" /> Audited 501(c)(3) Partner Network
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Charity Discovery Directory
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 max-w-2xl">
            Browse vetted non-profits. Select one organization to receive your guaranteed monthly subscription allocation (10% to 100%), or make direct donations.
          </p>
        </div>

        {/* Aggregate Impact Stat */}
        <div className="flex items-center gap-6 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider">Total Impact</span>
            <span className="text-lg font-bold text-cobalt-700 tabular-nums">
              ${totalRaisedAcrossPlatform.toLocaleString()}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider">Active Partners</span>
            <span className="text-lg font-bold text-slate-900">
              {charities.length} Non-Profits
            </span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name or mission..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cobalt-600 focus:ring-1 focus:ring-cobalt-600 transition-colors shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cobalt-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Charity Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCharities.map(charity => {
          const isSelected = selectedCharity?.id === charity.id;
          const pct = Math.min(100, Math.round((charity.totalRaised / charity.goalAmount) * 100));

          return (
            <div
              key={charity.id}
              className={`card-base rounded-xl border shadow-sm overflow-hidden flex flex-col justify-between ${
                isSelected ? 'border-cobalt-600 ring-1 ring-cobalt-600' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="h-44 relative overflow-hidden">
                  <img
                    src={charity.imageUrl}
                    alt={charity.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/95 text-xs font-semibold text-slate-900 shadow-sm">
                    {charity.category}
                  </span>
                  {isSelected && (
                    <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-lg bg-cobalt-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                      <Check className="w-3 h-3" /> SELECTED
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-base font-semibold text-slate-900 mb-2">{charity.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6 line-clamp-3">
                    {charity.description}
                  </p>

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
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{charity.efficiencyScore}% direct program delivery</span>
                      <span>{pct}% funded</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-2 border-t border-slate-100">
                <button
                  onClick={() => setActiveModalCharity(charity)}
                  className="w-full py-2.5 rounded-lg btn-secondary text-xs font-semibold flex items-center justify-center gap-1.5 mt-4"
                >
                  View Story & Events <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {!isSelected && (
                  <button
                    onClick={() => {
                      setSelectedCharityId(charity.id);
                      showToast(`Selected "${charity.title}" as your primary charity!`);
                    }}
                    className="w-full py-2.5 rounded-lg btn-cobalt text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Heart className="w-3.5 h-3.5" /> Set as My Charity
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charity Detail Modal */}
      <CharityDetailModal
        charity={activeModalCharity}
        isOpen={!!activeModalCharity}
        onClose={() => setActiveModalCharity(null)}
        onOpenStripe={onOpenStripe}
      />
    </div>
  );
};
