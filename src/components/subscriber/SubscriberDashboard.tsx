import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Calendar,
  Heart,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  FileText,
  Upload
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { GolfScore } from '../../types';
import { ClaimProofModal } from './ClaimProofModal';
import { ExtraDonationModal } from './ExtraDonationModal';

interface SubscriberDashboardProps {
  onOpenStripe: () => void;
  onExploreCharities: () => void;
}

export const SubscriberDashboard: React.FC<SubscriberDashboardProps> = ({
  onExploreCharities
}) => {
  const {
    currentUser,
    userScores,
    submitGolfScore,
    updateScore,
    deleteScore,
    selectedCharity,
    charityPercentage,
    setCharityPercentage,
    currentDraw,
    userClaims
  } = useApp();

  // Score Entry Modal State
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [scoreVal, setScoreVal] = useState<number>(38);
  const [playedDate, setPlayedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [courseName, setCourseName] = useState<string>('Apex Links');
  const [formError, setFormError] = useState<string | null>(null);

  // Claim Proof Modal State
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedClaimToProof, setSelectedClaimToProof] = useState<any>(null);

  // Extra Donation Modal State
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  // Live Countdown to Next Draw
  const [timeLeft, setTimeLeft] = useState({ days: 10, hours: 8, minutes: 24, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle Score Form Submission
  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (scoreVal < 1 || scoreVal > 45) {
      setFormError('Stableford score must be between 1 and 45 points.');
      return;
    }

    if (editingScoreId) {
      const res = updateScore(editingScoreId, scoreVal, playedDate, courseName);
      if (!res.success) {
        setFormError(res.message);
        return;
      }
    } else {
      const res = await submitGolfScore(scoreVal, playedDate, courseName);
      if (!res.success) {
        setFormError(res.message);
        return;
      }
    }

    setIsScoreModalOpen(false);
    setEditingScoreId(null);
  };

  const handleEditClick = (score: GolfScore) => {
    setEditingScoreId(score.id);
    setScoreVal(score.scoreValue);
    setPlayedDate(score.playedAt);
    setCourseName(score.courseName || 'Apex Links');
    setFormError(null);
    setIsScoreModalOpen(true);
  };

  const openNewScoreModal = () => {
    setEditingScoreId(null);
    setScoreVal(38);
    const today = new Date().toISOString().split('T')[0];
    setPlayedDate(today);
    setCourseName('Apex Links');
    setFormError(null);
    setIsScoreModalOpen(true);
  };

  const planFee = currentUser.subscriptionTier === 'yearly' ? 220 : 24;
  const period = currentUser.subscriptionTier === 'yearly' ? '/ year' : '/ month';
  const charityDollarAmount = (planFee * (charityPercentage / 100)).toFixed(2);
  const userEntryNumbers = userScores.slice(0, 5).map(s => s.scoreValue);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. TOP PROFILE & SUMMARY BAR (Integrated, no nested floating boxes) */}
      <div className="card-base p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{currentUser.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[11px] font-semibold text-cobalt-700">
                  {currentUser.subscriptionTier === 'yearly' ? 'Pro Yearly' : 'Monthly Active'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openNewScoreModal}
              className="px-4 py-2 rounded-lg btn-cobalt text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Log Score
            </button>
            <button
              onClick={onExploreCharities}
              className="px-4 py-2 rounded-lg btn-secondary text-xs font-semibold flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              Charities
            </button>
          </div>
        </div>

        {/* Integrated Clean Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] font-medium">NEXT RENEWAL</span>
            <span className="text-sm font-semibold text-slate-800 mt-0.5 block tabular-nums">
              {currentUser.nextRenewalDate || '2027-01-15'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium">LIFETIME CHARITY</span>
            <span className="text-sm font-semibold text-rose-600 mt-0.5 block tabular-nums">
              ${currentUser.lifetimeCharityContributed.toFixed(2)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium">PRIZE BALANCE</span>
            <span className="text-sm font-semibold text-cobalt-700 mt-0.5 block tabular-nums">
              ${currentUser.balanceWinnings.toFixed(2)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium">ACTIVE SCORES</span>
            <span className="text-sm font-semibold text-slate-800 mt-0.5 block tabular-nums">
              {userScores.length}/5 Verified
            </span>
          </div>
        </div>
      </div>

      {/* 2. SECTION GRID */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: SCORE TRACKER & CLAIMS (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* SECTION HEADER DIRECTLY ON PAGE GRID */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Stableford Score Tracker</h2>
              <p className="text-sm font-normal text-slate-500 mt-0.5">
                Rolling pool of your latest 5 rounds (Stableford format 1–45). Adding a 6th round replaces your oldest entry.
              </p>
            </div>

            {/* Score Tracker Integrated Card */}
            <div className="card-base p-6 shadow-sm space-y-6">
              {/* Visual 5-Slot Rolling Queue */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium">Active 5-Slot Rolling Queue</span>
                  <span className="text-[11px]">Sorted Newest → Oldest</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4].map(idx => {
                    const score = userScores[idx];
                    const isOldest = idx === 4 && score;
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg border text-center transition-all ${
                          score
                            ? isOldest
                              ? 'bg-rose-50/50 border-rose-200 text-slate-800'
                              : 'bg-slate-50 border-slate-200 text-slate-900'
                            : 'bg-slate-50/30 border-dashed border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="text-[10px] text-slate-400 font-medium">Slot {idx + 1}</div>
                        <div className="text-base font-bold tabular-nums mt-0.5">
                          {score ? score.scoreValue : '—'}
                        </div>
                        <div className="text-[10px] truncate text-slate-500 tabular-nums mt-0.5">
                          {score ? score.playedAt.substring(5) : 'Empty'}
                        </div>
                        {isOldest && (
                          <span className="inline-block mt-1 text-[8px] px-1 py-0.2 rounded bg-rose-100 text-rose-700 font-bold uppercase">
                            Next Drop
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* List of Scores */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
                  Logged Rounds ({userScores.length}/5)
                </span>

                {userScores.length === 0 ? (
                  <div className="p-6 text-center rounded-lg bg-slate-50 text-slate-500 text-xs">
                    No scores logged yet—enter your latest round to get started!
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {userScores.map((score, index) => (
                      <div
                        key={score.id}
                        className="py-3 flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center tabular-nums font-bold text-cobalt-700 text-sm">
                            {score.scoreValue}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                              <span>{score.courseName || 'Apex Links'}</span>
                              <span className="text-[10px] text-emerald-700 font-medium px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-100">
                                {score.scoreValue >= 36 ? 'Net Par+' : 'Net Sub'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span className="tabular-nums">{score.playedAt}</span>
                              <span className="text-slate-300">•</span>
                              <span>Draw Ticket #{index + 1}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditClick(score)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Edit score"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteScore(score.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete score"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DRAW CLAIMS SECTION */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Draw Claims & Verification</h2>
              <p className="text-sm font-normal text-slate-500 mt-0.5">
                Prizes won from monthly draws. Upload scorecard proof to trigger administrative payout.
              </p>
            </div>

            <div className="card-base p-6 shadow-sm space-y-4">
              {userClaims.length === 0 ? (
                <div className="p-6 text-center rounded-lg bg-slate-50 text-slate-500 text-xs">
                  No past prize claims yet. Active scores are checked automatically upon monthly draw publication!
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {userClaims.map(claim => (
                    <div key={claim.id} className="py-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                            <span>Draw #{claim.drawId}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                claim.status === 'paid'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : claim.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {claim.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                            Matched: [{claim.matchedNumbers.join(', ')}] • Tier {claim.matchTier} Match
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-bold text-cobalt-700 tabular-nums">
                            ${claim.prizeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {claim.status === 'paid' ? 'Paid to Balance' : 'Pending Review'}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px] flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-cobalt-600" />
                          {claim.proofUrl ? 'Scorecard screenshot submitted' : 'Proof required for payout'}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedClaimToProof(claim);
                            setIsClaimModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg btn-secondary text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5 text-cobalt-600" />
                          {claim.proofUrl ? 'Update Proof' : 'Upload Proof'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CHARITY & DRAW DETAILS (5 Cols) */}
        <div className="lg:col-span-5 space-y-8">
          {/* CHARITY ALLOCATION SECTION */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Charity Allocation</h2>
              <p className="text-sm font-normal text-slate-500 mt-0.5">
                Minimum 10% of membership fee directed to chosen non-profit.
              </p>
            </div>

            <div className="card-base p-6 shadow-sm space-y-5">
              {/* Selected Charity Info */}
              {selectedCharity && (
                <div className="flex items-center gap-3.5">
                  <img
                    src={selectedCharity.imageUrl}
                    alt={selectedCharity.title}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{selectedCharity.title}</h4>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      {selectedCharity.efficiencyScore}% Direct Impact Audited
                    </span>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {selectedCharity.description}
                    </p>
                  </div>
                  <button
                    onClick={onExploreCharities}
                    className="text-xs text-cobalt-600 hover:text-cobalt-700 font-semibold"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Slider */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Fee Contribution:</span>
                  <span className="font-bold tabular-nums text-cobalt-700 text-sm">
                    {charityPercentage}%
                  </span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={charityPercentage}
                  onChange={e => setCharityPercentage(Number(e.target.value))}
                  className="w-full"
                />

                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>10% Floor</span>
                  <span>50%</span>
                  <span>100% Impact</span>
                </div>

                <div className="pt-3 flex items-center justify-between text-xs border-t border-slate-100">
                  <span className="text-slate-500">Calculated Impact:</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    ${charityDollarAmount} {period}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsDonationModalOpen(true)}
                className="w-full py-2.5 rounded-lg btn-outline text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5"
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                Make One-Time Extra Donation
              </button>
            </div>
          </div>

          {/* UPCOMING DRAW SECTION */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Upcoming Draw</h2>
              <p className="text-sm font-normal text-slate-500 mt-0.5">
                Scheduled for <span className="font-medium text-slate-800">{currentDraw.drawDate}</span>.
              </p>
            </div>

            <div className="card-base p-6 shadow-sm space-y-5">
              {/* Countdown */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-lg font-bold tabular-nums text-slate-900">{timeLeft.days}</div>
                  <div className="text-[9px] text-slate-400 uppercase font-medium">DAYS</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-lg font-bold tabular-nums text-slate-900">{timeLeft.hours}</div>
                  <div className="text-[9px] text-slate-400 uppercase font-medium">HOURS</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-lg font-bold tabular-nums text-slate-900">{timeLeft.minutes}</div>
                  <div className="text-[9px] text-slate-400 uppercase font-medium">MINS</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-lg font-bold tabular-nums text-cobalt-600">{timeLeft.seconds}</div>
                  <div className="text-[9px] text-slate-400 uppercase font-medium">SECS</div>
                </div>
              </div>

              {/* Pool Breakdown */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">5-Match Rollover Jackpot:</span>
                  <span className="font-bold text-cobalt-700 tabular-nums">${currentDraw.jackpotAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Projected Pool:</span>
                  <span className="font-bold text-slate-900 tabular-nums">${currentDraw.totalPool.toLocaleString()}</span>
                </div>
              </div>

              {/* Draw Numbers */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700 block">
                  Your Auto-Generated Draw Numbers:
                </span>
                <div className="flex items-center gap-1.5">
                  {userEntryNumbers.length === 5 ? (
                    userEntryNumbers.map((num, i) => (
                      <div
                        key={i}
                        className="flex-1 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-center tabular-nums font-bold text-cobalt-700 text-sm"
                      >
                        {num}
                      </div>
                    ))
                  ) : (
                    <div className="w-full text-center py-2.5 rounded-lg bg-slate-50 text-xs text-slate-500">
                      Log {5 - userEntryNumbers.length} more round(s) to finalize draw numbers
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SCORE ENTRY MODAL */}
      <AnimatePresence>
        {isScoreModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-sm"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-cobalt-600 flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingScoreId ? 'Edit Stableford Score' : 'Log Stableford Score'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsScoreModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleScoreSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Stableford Points (Strict Range 1 – 45)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="45"
                    required
                    value={scoreVal}
                    onChange={e => setScoreVal(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm tabular-nums font-bold text-slate-900 focus:outline-none focus:border-cobalt-600"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Points awarded based on net score vs par (e.g. 36 = Net Par, 38 = 2 Under Par)
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date Played (Strict 1 Score Per Date)
                  </label>
                  <input
                    type="date"
                    required
                    value={playedDate}
                    onChange={e => setPlayedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs tabular-nums text-slate-900 focus:outline-none focus:border-cobalt-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Course / Club Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Championship Links"
                    value={courseName}
                    onChange={e => setCourseName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-cobalt-600"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg btn-cobalt font-bold text-xs"
                  >
                    {editingScoreId ? 'Save Updated Score' : 'Submit & Update Rolling Pool'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WINNER CLAIM PROOF UPLOAD MODAL */}
      <ClaimProofModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        claimId={selectedClaimToProof?.id}
        matchTier={selectedClaimToProof?.matchTier}
        prizeAmount={selectedClaimToProof?.prizeAmount}
        drawId={selectedClaimToProof?.drawId}
        matchedNumbers={selectedClaimToProof?.matchedNumbers}
      />

      {/* EXTRA DONATION MODAL */}
      <ExtraDonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
      />
    </div>
  );
};
