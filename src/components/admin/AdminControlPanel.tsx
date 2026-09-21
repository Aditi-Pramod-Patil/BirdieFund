import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Trophy,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Play,
  Sparkles,
  Plus,
  Trash2,
  Edit,
  FileCheck,
  ZoomIn,
  Search,
  Send
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { DrawType, Charity, WinnerClaim } from '../../types';

export const AdminControlPanel: React.FC = () => {
  const {
    allUsers,
    allScores,
    charities,
    currentDraw,
    pastDraws,
    activeSimulation,
    runDrawSimulation,
    publishOfficialDraw,
    winnerClaims,
    approveWinnerClaim,
    rejectWinnerClaim,
    addCharity,
    updateCharity,
    deleteCharity,
    toggleLapsedState
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'draws' | 'charities' | 'verification'>('draws');

  // Draw Simulator state
  const [selectedDrawMode, setSelectedDrawMode] = useState<DrawType>('algorithmic');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);

  // Winner Verification Modal state
  const [inspectingClaim, setInspectingClaim] = useState<WinnerClaim | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [claimToReject, setClaimToReject] = useState<string | null>(null);

  // Charity CRUD Modal state
  const [isCharityModalOpen, setIsCharityModalOpen] = useState(false);
  const [editingCharity, setEditingCharity] = useState<Charity | null>(null);
  const [charityTitle, setCharityTitle] = useState('');
  const [charityCategory, setCharityCategory] = useState<'Environment' | 'Health' | 'Youth Sports' | 'Education' | 'Community'>('Environment');
  const [charityDesc, setCharityDesc] = useState('');
  const [charityGoal, setCharityGoal] = useState<number>(50000);
  const [charityEfficiency, setCharityEfficiency] = useState<number>(92);
  const [charityImg, setCharityImg] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // User search
  const [userSearch, setUserSearch] = useState('');

  // KPI Stats
  const totalSubscribers = allUsers.filter(u => u.subscriptionStatus === 'active').length;
  const totalPrizePool = currentDraw.totalPool || 78500;
  const totalCharityRaised = charities.reduce((sum, c) => sum + c.totalRaised, 0);
  const pendingClaimsCount = winnerClaims.filter(c => c.status === 'pending').length;

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      runDrawSimulation(selectedDrawMode);
      setIsSimulating(false);
    }, 700);
  };

  const handleOpenAddCharity = () => {
    setEditingCharity(null);
    setCharityTitle('');
    setCharityCategory('Environment');
    setCharityDesc('');
    setCharityGoal(50000);
    setCharityEfficiency(92);
    setCharityImg('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80');
    setIsFeatured(false);
    setIsCharityModalOpen(true);
  };

  const handleEditCharity = (charity: Charity) => {
    setEditingCharity(charity);
    setCharityTitle(charity.title);
    setCharityCategory(charity.category);
    setCharityDesc(charity.description);
    setCharityGoal(charity.goalAmount);
    setCharityEfficiency(charity.efficiencyScore);
    setCharityImg(charity.imageUrl);
    setIsFeatured(charity.isFeatured);
    setIsCharityModalOpen(true);
  };

  const handleSaveCharity = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCharity) {
      updateCharity({
        ...editingCharity,
        title: charityTitle,
        category: charityCategory,
        description: charityDesc,
        goalAmount: charityGoal,
        efficiencyScore: charityEfficiency,
        imageUrl: charityImg,
        isFeatured
      });
    } else {
      addCharity({
        title: charityTitle,
        category: charityCategory,
        description: charityDesc,
        longDescription: charityDesc,
        goalAmount: charityGoal,
        efficiencyScore: charityEfficiency,
        imageUrl: charityImg,
        bannerUrl: charityImg,
        isFeatured,
        isVerified: true,
        events: []
      });
    }
    setIsCharityModalOpen(false);
  };

  const filteredUsers = allUsers.filter(u =>
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner (Header directly on grid) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-cobalt-700 text-xs font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Administrative Executive Portal
          </div>
          <h1 className="text-xl font-semibold text-slate-900">System Operations Console</h1>
          <p className="text-sm font-normal text-slate-500 mt-0.5">
            Simulate monthly draws, audit winner scorecard proofs, and manage community allocations.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveAdminTab('draws')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeAdminTab === 'draws'
                ? 'bg-white text-cobalt-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> Draw Simulator
          </button>
          <button
            onClick={() => setActiveAdminTab('verification')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 relative ${
              activeAdminTab === 'verification'
                ? 'bg-white text-cobalt-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" /> Winner Verification
            {pendingClaimsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 ml-1" />
            )}
          </button>
          <button
            onClick={() => setActiveAdminTab('users')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeAdminTab === 'users'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> User Management
          </button>
          <button
            onClick={() => setActiveAdminTab('charities')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeAdminTab === 'charities'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> Charity CRUD
          </button>
        </div>
      </div>

      {/* KPI Cards Row (Clean integrated cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
            <span>ACTIVE SUBSCRIBERS</span>
            <Users className="w-4 h-4 text-cobalt-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {totalSubscribers} <span className="text-xs text-emerald-600 font-normal">(100% active)</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block truncate">
            {allUsers.filter(u => u.subscriptionStatus === 'active').map(u => u.fullName).join(', ') || 'No active members yet'}
          </span>
        </div>

        <div className="card-base p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
            <span>ACTIVE PRIZE POOL</span>
            <Trophy className="w-4 h-4 text-cobalt-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-cobalt-700 tabular-nums">
            ${totalPrizePool.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block tabular-nums">
            40% 5-Match • 35% 4-Match • 25% 3-Match
          </span>
        </div>

        <div className="card-base p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
            <span>CHARITY GRANTS RAISED</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-600 tabular-nums">
            ${totalCharityRaised.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across {charities.length} partner organizations
          </span>
        </div>

        <div className="card-base p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
            <span>PENDING CLAIMS</span>
            <FileCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {pendingClaimsCount} <span className="text-xs text-amber-700 font-normal">Awaiting Audit</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Scorecard verification queue
          </span>
        </div>
      </div>

      {/* SECTION 1: DRAW ENGINE & SIMULATOR */}
      {activeAdminTab === 'draws' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Monthly Draw Engine & Simulation</h2>
              <p className="text-sm font-normal text-slate-500 mt-0.5">
                Target Draw Date: <span className="text-cobalt-700 font-semibold tabular-nums">{currentDraw.drawDate}</span> • Current Pool: <span className="text-slate-900 font-semibold tabular-nums">${currentDraw.totalPool.toLocaleString()}</span>
              </p>
            </div>
          </div>

          <div className="card-base p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Draw Generation Mode</span>
              {/* Mode Switcher */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedDrawMode('algorithmic')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                    selectedDrawMode === 'algorithmic'
                      ? 'bg-white text-cobalt-700 font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Algorithmic (Score Frequency Weighted)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDrawMode('random')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                    selectedDrawMode === 'random'
                      ? 'bg-white text-slate-900 font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Standard Uniform Random
                </button>
              </div>
            </div>

            {/* Explanatory Math Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <span className="font-semibold text-slate-900 block">
                {selectedDrawMode === 'algorithmic'
                  ? '⚡ Algorithmic Draw Mechanics Active:'
                  : '🎲 Standard Random Draw Mechanics Active:'}
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {selectedDrawMode === 'algorithmic'
                  ? 'Applies a Gaussian density curve centered around typical Stableford scores (32–38 pts) weighted with live subscriber score submissions to realistically cluster numbers.'
                  : 'Samples 5 distinct integers uniformly between 1 and 45 with equal 1/45 probability per ball.'}
              </p>
            </div>

            {/* Run Simulation Trigger */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg btn-cobalt text-xs font-semibold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-white" />
                {isSimulating ? 'Computing Simulation...' : 'Run Draw Simulation'}
              </button>

              {activeSimulation && (
                <button
                  onClick={() => setIsPublishConfirmOpen(true)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  Publish Official Results
                </button>
              )}
            </div>

            {/* Simulation Results Display Panel */}
            {activeSimulation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <div>
                    <span className="text-[10px] text-cobalt-700 font-bold uppercase tracking-wider">
                      Simulation Complete • Mode: {activeSimulation.type.toUpperCase()}
                    </span>
                    <h4 className="text-base font-semibold text-slate-900">Predicted Winner & Rollover Distribution</h4>
                  </div>
                  <span className="text-xs text-slate-500 tabular-nums">
                    Timestamp: {new Date(activeSimulation.simulatedAt).toLocaleTimeString()}
                  </span>
                </div>

                {/* Generated 5 Numbers */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-700">
                    Simulated Winning Numbers (1–45):
                  </span>
                  <div className="flex items-center gap-2.5">
                    {activeSimulation.winningNumbers.map((num, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-lg bg-white border border-slate-300 flex items-center justify-center tabular-nums font-bold text-cobalt-700 text-base shadow-sm"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Match Tier Breakdown */}
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Tier 5 (40% Pool) */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-cobalt-700">TIER 1 (5 MATCH)</span>
                      <span className="text-[11px] text-slate-500">40% Pool</span>
                    </div>
                    <div className="text-lg tabular-nums font-bold text-slate-900">
                      ${activeSimulation.tier5Pool.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-600 mt-2">
                      Winners: <span className="font-bold text-slate-900 tabular-nums">{activeSimulation.tier5Winners.length}</span>
                    </div>
                    {activeSimulation.tier5Winners.length === 0 ? (
                      <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 tabular-nums">
                        🔥 Rollover: ${activeSimulation.jackpotRollover.toLocaleString()} moves to next jackpot!
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-slate-500 tabular-nums">
                        Payout/winner: ${(activeSimulation.tier5Pool / activeSimulation.tier5Winners.length).toFixed(2)}
                      </div>
                    )}
                  </div>

                  {/* Tier 4 (35% Pool) */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-slate-800">TIER 2 (4 MATCH)</span>
                      <span className="text-[11px] text-slate-500">35% Pool</span>
                    </div>
                    <div className="text-lg tabular-nums font-bold text-slate-900">
                      ${activeSimulation.tier4Pool.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-600 mt-2">
                      Winners: <span className="font-bold text-slate-900 tabular-nums">{activeSimulation.tier4Winners.length}</span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500 tabular-nums">
                      {activeSimulation.tier4Winners.length > 0
                        ? `Payout/winner: $${(activeSimulation.tier4Pool / activeSimulation.tier4Winners.length).toFixed(2)}`
                        : 'No matches in sample'}
                    </div>
                  </div>

                  {/* Tier 3 (25% Pool) */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-slate-800">TIER 3 (3 MATCH)</span>
                      <span className="text-[11px] text-slate-500">25% Pool</span>
                    </div>
                    <div className="text-lg tabular-nums font-bold text-slate-900">
                      ${activeSimulation.tier3Pool.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-600 mt-2">
                      Winners: <span className="font-bold text-slate-900 tabular-nums">{activeSimulation.tier3Winners.length}</span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500 tabular-nums">
                      {activeSimulation.tier3Winners.length > 0
                        ? `Payout/winner: $${(activeSimulation.tier3Pool / activeSimulation.tier3Winners.length).toFixed(2)}`
                        : 'No matches in sample'}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Historical Draws Table (Header directly on grid) */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Published Historical Draws</h3>
              <p className="text-sm font-normal text-slate-500">Record of all certified monthly draws and winner distributions.</p>
            </div>
            <div className="card-base rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto p-6">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="pb-3 font-semibold">DRAW ID</th>
                      <th className="pb-3 font-semibold">DRAW DATE</th>
                      <th className="pb-3 font-semibold">MODE</th>
                      <th className="pb-3 font-semibold">WINNING NUMBERS</th>
                      <th className="pb-3 font-semibold">TOTAL POOL</th>
                      <th className="pb-3 font-semibold">WINNERS (5/4/3)</th>
                      <th className="pb-3 font-semibold">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pastDraws.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                          No published draws yet.
                        </td>
                      </tr>
                    ) : (
                      pastDraws.map(d => (
                        <tr key={d.id} className="hover:bg-slate-50">
                          <td className="py-3 text-slate-900 font-bold tabular-nums">{d.id}</td>
                          <td className="py-3 text-slate-600 tabular-nums">{d.drawDate}</td>
                          <td className="py-3 text-cobalt-700 uppercase font-semibold">{d.type}</td>
                          <td className="py-3 text-slate-900 font-bold tabular-nums">[{d.winningNumbers.join(', ')}]</td>
                          <td className="py-3 text-slate-900 tabular-nums font-semibold">${d.totalPool.toLocaleString()}</td>
                          <td className="py-3 tabular-nums">{d.match5Count} / {d.match4Count} / {d.match3Count}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              PUBLISHED
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: WINNER VERIFICATION QUEUE (Header directly on grid) */}
      {activeAdminTab === 'verification' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Winner Verification & Proof Audit Queue</h2>
              <p className="text-sm font-normal text-slate-500 mt-0.5">
                Inspect member scorecard uploads, verify club attestations, and approve cash disbursements.
              </p>
            </div>
            <span className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium shadow-sm">
              {pendingClaimsCount} Claims Requiring Action
            </span>
          </div>

          <div className="card-base rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto p-6">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 font-semibold">CLAIMANT</th>
                    <th className="pb-3 font-semibold">DRAW & MATCH</th>
                    <th className="pb-3 font-semibold">MATCHED NUMBERS</th>
                    <th className="pb-3 font-semibold">PRIZE AMOUNT</th>
                    <th className="pb-3 font-semibold">PROOF STATUS</th>
                    <th className="pb-3 font-semibold">CLAIM STATUS</th>
                    <th className="pb-3 text-right font-semibold">AUDIT ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {winnerClaims.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                        No winner claims in verification queue.
                      </td>
                    </tr>
                  ) : (
                    winnerClaims.map(claim => (
                    <tr key={claim.id} className="hover:bg-slate-50">
                      <td className="py-3.5">
                        <div className="font-bold text-slate-900">{claim.userName}</div>
                        <div className="text-[10px] text-slate-400">{claim.userEmail}</div>
                      </td>
                      <td className="py-3.5">
                        <span className="text-slate-800 tabular-nums">Draw #{claim.drawId}</span>
                        <div className="text-[10px] text-cobalt-700 font-bold">Tier {claim.matchTier} Match</div>
                      </td>
                      <td className="py-3.5 text-slate-900 font-bold tabular-nums">
                        [{claim.matchedNumbers.join(', ')}]
                      </td>
                      <td className="py-3.5 text-cobalt-700 font-bold text-sm tabular-nums">
                        ${claim.prizeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5">
                        {claim.proofUrl ? (
                          <button
                            onClick={() => setInspectingClaim(claim)}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px] flex items-center gap-1 hover:bg-slate-100 shadow-sm"
                          >
                            <ZoomIn className="w-3 h-3 text-cobalt-600" /> View Scorecard
                          </button>
                        ) : (
                          <span className="text-[10px] text-rose-600 font-bold">NO PROOF UPLOADED</span>
                        )}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            claim.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : claim.status === 'approved'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : claim.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {claim.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        {claim.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveWinnerClaim(claim.id)}
                              className="px-3 py-1.5 rounded-lg btn-cobalt font-bold text-xs"
                            >
                              Approve & Pay
                            </button>
                            <button
                              onClick={() => {
                                setClaimToReject(claim.id);
                                setIsRejectModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {claim.status === 'paid' && (
                          <span className="text-emerald-600 text-xs font-sans font-medium flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Disbursed
                          </span>
                        )}
                        {claim.status === 'rejected' && (
                          <span className="text-slate-400 text-xs font-sans">Claim Closed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: USER MANAGEMENT (Header directly on grid) */}
      {activeAdminTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Platform Member Directory</h2>
              <p className="text-sm font-normal text-slate-500 mt-0.5">
                Inspect active golf members, audit rolling score counts, and test billing states.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search member or email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-cobalt-600 shadow-sm"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="card-base rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto p-6">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 font-semibold">MEMBER</th>
                    <th className="pb-3 font-semibold">ROLE</th>
                    <th className="pb-3 font-semibold">TIER</th>
                    <th className="pb-3 font-semibold">SCORES COUNT</th>
                    <th className="pb-3 font-semibold">LIFETIME CHARITY</th>
                    <th className="pb-3 font-semibold">STATUS</th>
                    <th className="pb-3 text-right font-semibold">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                        No registered members found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => {
                    const userScoresCount = allScores.filter(s => s.userId === user.id).length;

                    return (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="py-3.5 flex items-center gap-3">
                          <img
                            src={user.avatarUrl}
                            alt={user.fullName}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{user.fullName}</div>
                            <div className="text-[10px] text-slate-400">{user.email}</div>
                          </div>
                        </td>
                        <td className="py-3.5 uppercase text-cobalt-700 font-bold text-[11px]">
                          {user.role}
                        </td>
                        <td className="py-3.5 uppercase text-slate-800 font-bold text-[11px]">
                          {user.subscriptionTier}
                        </td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold tabular-nums">
                            {userScoresCount}/5 Active
                          </span>
                        </td>
                        <td className="py-3.5 text-rose-600 font-bold tabular-nums">
                          ${user.lifetimeCharityContributed.toFixed(2)}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              user.subscriptionStatus === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {user.subscriptionStatus}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => toggleLapsedState(user.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-sans transition-colors"
                          >
                            Toggle State
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: CHARITY MANAGEMENT CRUD (Header directly on grid) */}
      {activeAdminTab === 'charities' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Charity Partner Management (CRUD)</h2>
              <p className="text-sm font-normal text-slate-500 mt-0.5">
                Add new 501(c)(3) organizations, adjust funding targets, and configure homepage spotlights.
              </p>
            </div>
            <button
              onClick={handleOpenAddCharity}
              className="px-4 py-2 rounded-lg btn-cobalt text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Charity
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {charities.map(charity => (
              <div
                key={charity.id}
                className="card-base p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-[10px] text-slate-700 font-semibold">
                      {charity.category}
                    </span>
                    {charity.isFeatured && (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        SPOTLIGHT
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm">{charity.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                    {charity.description}
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Total Raised:</span>
                    <span className="text-cobalt-700 font-bold tabular-nums">${charity.totalRaised.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleEditCharity(charity)}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteCharity(charity.id)}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-rose-600 shadow-sm"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INSPECT SCORECARD PROOF MODAL (Rounded-xl, soft shadow) */}
      <AnimatePresence>
        {inspectingClaim && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-sm space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Scorecard Verification Audit</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Claimant: <span className="text-cobalt-700 font-semibold">{inspectingClaim.userName}</span> • Draw #{inspectingClaim.drawId} • Tier {inspectingClaim.matchTier}
                  </p>
                </div>
                <button
                  onClick={() => setInspectingClaim(null)}
                  className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Scorecard Preview Graphic */}
              <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 p-2 flex items-center justify-center">
                <img
                  src={inspectingClaim.proofUrl}
                  alt="Attested Scorecard"
                  className="w-full max-h-80 object-contain rounded"
                />
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="font-semibold text-slate-800 block">Attester / Member Notes:</span>
                <p className="text-slate-600">{inspectingClaim.proofNotes || 'No additional notes provided.'}</p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setInspectingClaim(null)}
                  className="px-4 py-2 rounded-lg btn-secondary text-xs font-semibold"
                >
                  Close
                </button>
                {inspectingClaim.status === 'pending' && (
                  <button
                    onClick={() => {
                      approveWinnerClaim(inspectingClaim.id);
                      setInspectingClaim(null);
                    }}
                    className="px-5 py-2 rounded-lg btn-cobalt text-xs font-semibold"
                  >
                    Approve & Disburse ${inspectingClaim.prizeAmount.toFixed(2)}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM PUBLISH OFFICIAL DRAW MODAL */}
      <AnimatePresence>
        {isPublishConfirmOpen && activeSimulation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 text-center"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Publish Official Draw Results?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  This will finalize Winning Numbers <span className="tabular-nums text-cobalt-700 font-bold">[{activeSimulation.winningNumbers.join(', ')}]</span>, lock Draw #{currentDraw.id}, and issue claim vouchers to eligible winners across the network.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2.5 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsPublishConfirmOpen(false)}
                  className="px-4 py-2 rounded-lg btn-secondary text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    publishOfficialDraw(activeSimulation);
                    setIsPublishConfirmOpen(false);
                  }}
                  className="px-5 py-2 rounded-lg btn-cobalt text-xs font-semibold"
                >
                  Confirm & Publish Live
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REJECT CLAIM MODAL */}
      <AnimatePresence>
        {isRejectModalOpen && claimToReject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4"
            >
              <div>
                <h3 className="text-base font-semibold text-slate-900">Reject Winner Claim</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Specify reason for scorecard verification rejection (e.g. illegible handicap, unverified signature):
                </p>
              </div>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Enter rejection explanation for user..."
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-rose-500 shadow-sm"
              />
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsRejectModalOpen(false);
                    setClaimToReject(null);
                  }}
                  className="px-4 py-2 rounded-lg btn-secondary text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    rejectWinnerClaim(claimToReject, rejectionReason);
                    setIsRejectModalOpen(false);
                    setClaimToReject(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHARITY ADD/EDIT MODAL */}
      <AnimatePresence>
        {isCharityModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-lg bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-semibold text-slate-900">
                  {editingCharity ? 'Edit Charity Partner' : 'Add New Charity Partner'}
                </h3>
                <button
                  onClick={() => setIsCharityModalOpen(false)}
                  className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveCharity} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Organization Title</label>
                  <input
                    type="text"
                    required
                    value={charityTitle}
                    onChange={e => setCharityTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-cobalt-600 shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Category</label>
                    <select
                      value={charityCategory}
                      onChange={e => setCharityCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-cobalt-600 shadow-sm"
                    >
                      <option value="Environment">Environment</option>
                      <option value="Health">Health</option>
                      <option value="Youth Sports">Youth Sports</option>
                      <option value="Education">Education</option>
                      <option value="Community">Community</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Efficiency Score (%)</label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={charityEfficiency}
                      onChange={e => setCharityEfficiency(parseInt(e.target.value) || 90)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-cobalt-600 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Description</label>
                  <textarea
                    rows={2}
                    required
                    value={charityDesc}
                    onChange={e => setCharityDesc(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-cobalt-600 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Image URL</label>
                  <input
                    type="url"
                    required
                    value={charityImg}
                    onChange={e => setCharityImg(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-cobalt-600 shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="featuredCheck"
                    checked={isFeatured}
                    onChange={e => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-cobalt-600 focus:ring-0"
                  />
                  <label htmlFor="featuredCheck" className="text-slate-700 cursor-pointer">
                    Feature on Homepage Spotlight
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCharityModalOpen(false)}
                    className="px-4 py-2 rounded-lg btn-secondary font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg btn-cobalt font-semibold"
                  >
                    Save Charity
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
