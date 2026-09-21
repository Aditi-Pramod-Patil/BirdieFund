import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  ChevronDown,
  Trophy,
  ShieldAlert,
  LogOut,
  CreditCard,
  Heart,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenStripe: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAuth,
  onOpenStripe
}) => {
  const {
    currentUser,
    currentRole,
    winnerClaims,
    signOutUser,
    userScores
  } = useApp();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pendingClaimsCount = winnerClaims.filter(c => c.status === 'pending').length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Links */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setCurrentTab(currentRole === 'admin' ? 'admin' : currentRole === 'subscriber' ? 'dashboard' : 'home')}
            className="flex items-center gap-3 group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-cobalt-600 p-1 flex items-center justify-center shadow-sm group-hover:bg-cobalt-700 transition-colors">
              <img src="/logo.svg" alt="BirdieFund" className="w-full h-full object-contain brightness-0 invert" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900 group-hover:text-cobalt-600 transition-colors">
                  BirdieFund
                </span>
              </div>
              <span className="text-[10px] font-medium tracking-wide text-slate-500 block -mt-0.5">
                Golf • Prize Pools • Impact
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {currentRole === 'visitor' ? (
              <>
                <button
                  onClick={() => setCurrentTab('home')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentTab === 'home'
                      ? 'text-cobalt-600 bg-cobalt-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setCurrentTab('how-it-works')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentTab === 'how-it-works'
                      ? 'text-cobalt-600 bg-cobalt-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  How It Works
                </button>
                <button
                  onClick={() => setCurrentTab('charities')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentTab === 'charities'
                      ? 'text-cobalt-600 bg-cobalt-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Charities
                </button>
                <button
                  onClick={() => setCurrentTab('prize-pools')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentTab === 'prize-pools'
                      ? 'text-cobalt-600 bg-cobalt-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Prize Pools
                </button>
                <button
                  onClick={() => setCurrentTab('pricing')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentTab === 'pricing'
                      ? 'text-cobalt-600 bg-cobalt-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Pricing
                </button>
              </>
            ) : currentRole === 'subscriber' ? (
              <>
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentTab === 'dashboard'
                      ? 'text-cobalt-600 bg-cobalt-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  My Dashboard
                </button>
                <button
                  onClick={() => setCurrentTab('scores')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentTab === 'scores'
                      ? 'text-cobalt-600 bg-cobalt-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Scores (5)
                </button>
                <button
                  onClick={() => setCurrentTab('charities')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentTab === 'charities'
                      ? 'text-cobalt-600 bg-cobalt-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Charity Allocation
                </button>
                <button
                  onClick={() => setCurrentTab('draws')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentTab === 'draws'
                      ? 'text-cobalt-600 bg-cobalt-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Draw Participation
                </button>
              </>
            ) : (
              // Admin View
              <>
                <button
                  onClick={() => setCurrentTab('admin')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-cobalt-700 bg-cobalt-50 border border-cobalt-200 flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-cobalt-600" />
                  Admin Executive Portal
                </button>
                <button
                  onClick={() => setCurrentTab('charities')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  Directory Preview
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Right Section: Persona Switcher & Controls */}
        <div className="flex items-center gap-3">


          {/* Conditional Right Content based on Role */}
          {currentRole === 'visitor' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onOpenStripe}
                className="px-4 py-2 rounded-xl btn-cobalt text-xs font-semibold transition-all"
              >
                Get Started
              </button>
            </div>
          ) : (
            // Subscriber / Admin Status & Dropdowns
            <div className="flex items-center gap-2.5">
              {/* Active Winnings summary badge (for subscriber) */}
              {currentRole === 'subscriber' && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200">
                  <Trophy className="w-3.5 h-3.5 text-cobalt-600" />
                  <span className="text-[11px] text-slate-500">Won:</span>
                  <span className="text-xs font-bold text-slate-900 tabular-nums">
                    ${currentUser.balanceWinnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {/* Status Badge */}
              <div
                className={`hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                  currentUser.subscriptionStatus === 'active'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {currentRole === 'admin'
                  ? 'SUPER ADMIN'
                  : currentUser.subscriptionTier === 'yearly'
                  ? 'PRO YEARLY'
                  : 'MONTHLY ACTIVE'}
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {pendingClaimsCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 p-3 shadow-sm z-50"
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-900">Platform Notifications</span>
                        <span className="text-[10px] text-blue-600 font-medium">Real-time</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        {currentRole === 'admin' ? (
                          <>
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                              <span className="font-semibold text-slate-800 block">
                                {pendingClaimsCount} Winner Claim(s) Awaiting Review
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {pendingClaimsCount > 0 ? 'Review scorecards in Verification Queue.' : 'No pending verification claims.'}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                              <span className="font-semibold text-slate-800 block">Draw Simulation Engine</span>
                              <span className="text-[11px] text-slate-500">
                                Real-time lottery simulator ready.
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                              <span className="font-semibold text-slate-800 block">
                                {winnerClaims.length > 0 ? `${winnerClaims.length} Active Claim(s)` : 'No Claims Pending'}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {winnerClaims.length > 0 ? 'Check status in your dashboard.' : 'Match 3, 4, or 5 numbers in monthly draws.'}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                              <span className="font-semibold text-slate-800 block">Active Score Pool</span>
                              <span className="text-[11px] text-slate-500">
                                You have {userScores.length}/5 valid rounds logged.
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Avatar Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-all border border-slate-200"
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-xl object-cover"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 mr-1" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 p-3 shadow-sm z-50"
                    >
                      <div className="pb-3 border-b border-slate-100 mb-2">
                        <div className="font-bold text-sm text-slate-900">{currentUser.fullName}</div>
                        <div className="text-xs text-slate-500">{currentUser.email}</div>
                      </div>

                      <div className="space-y-1 text-xs">
                        {currentRole === 'subscriber' && (
                          <>
                            <button
                              onClick={() => {
                                setCurrentTab('dashboard');
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                            >
                              <LayoutDashboard className="w-4 h-4 text-blue-600" />
                              Subscriber Dashboard
                            </button>
                            <button
                              onClick={() => {
                                setCurrentTab('charities');
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                            >
                              <Heart className="w-4 h-4 text-rose-500" />
                              My Charity Allocation
                            </button>
                            <button
                              onClick={() => {
                                onOpenStripe();
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                            >
                              <CreditCard className="w-4 h-4 text-emerald-600" />
                              Manage Stripe Billing
                            </button>
                          </>
                        )}

                        {currentRole === 'admin' && (
                          <button
                            onClick={() => {
                              setCurrentTab('admin');
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <ShieldAlert className="w-4 h-4 text-blue-600" />
                            Admin Console
                          </button>
                        )}

                        <div className="pt-2 border-t border-slate-100 mt-2">
                          <button
                            onClick={async () => {
                              await signOutUser();
                              setCurrentTab('home');
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-medium"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-4 overflow-hidden"
          >
            {/* Mobile Nav Links */}
            <div className="flex flex-col space-y-1 text-sm font-semibold">
              {currentRole === 'visitor' ? (
                <>
                  <button
                    onClick={() => {
                      setCurrentTab('home');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2.5 rounded-lg text-left transition-all ${
                      currentTab === 'home' ? 'text-cobalt-600 bg-cobalt-50 font-bold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab('how-it-works');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2.5 rounded-lg text-left transition-all ${
                      currentTab === 'how-it-works' ? 'text-cobalt-600 bg-cobalt-50 font-bold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    How It Works
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab('charities');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2.5 rounded-lg text-left transition-all ${
                      currentTab === 'charities' ? 'text-cobalt-600 bg-cobalt-50 font-bold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Charities Directory
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab('prize-pools');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2.5 rounded-lg text-left transition-all ${
                      currentTab === 'prize-pools' ? 'text-cobalt-600 bg-cobalt-50 font-bold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Prize Pools & Calculations
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab('pricing');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2.5 rounded-lg text-left transition-all ${
                      currentTab === 'pricing' ? 'text-cobalt-600 bg-cobalt-50 font-bold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Pricing & Membership
                  </button>
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full py-2.5 rounded-xl btn-secondary text-xs font-semibold text-center"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenStripe();
                      }}
                      className="w-full py-2.5 rounded-xl btn-cobalt text-xs font-semibold text-center"
                    >
                      Get Started
                    </button>
                  </div>
                </>
              ) : currentRole === 'subscriber' ? (
                <>
                  <button
                    onClick={() => {
                      setCurrentTab('dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2.5 rounded-lg text-left transition-all ${
                      currentTab === 'dashboard' ? 'text-cobalt-600 bg-cobalt-50 font-bold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    My Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab('scores');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2.5 rounded-lg text-left transition-all ${
                      currentTab === 'scores' ? 'text-cobalt-600 bg-cobalt-50 font-bold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Scores (Rolling 5 Queue)
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab('charities');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2.5 rounded-lg text-left transition-all ${
                      currentTab === 'charities' ? 'text-cobalt-600 bg-cobalt-50 font-bold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Charity Allocation
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab('draws');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2.5 rounded-lg text-left transition-all ${
                      currentTab === 'draws' ? 'text-cobalt-600 bg-cobalt-50 font-bold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Draw Claims
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setCurrentTab('admin');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2.5 rounded-lg text-left transition-all ${
                      currentTab === 'admin' ? 'text-cobalt-600 bg-cobalt-50 font-bold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Admin Executive Console
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab('charities');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2.5 rounded-lg text-left transition-all ${
                      currentTab === 'charities' ? 'text-cobalt-600 bg-cobalt-50 font-bold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Charity Directory Preview
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
