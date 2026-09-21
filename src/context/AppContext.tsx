import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  GolfScore,
  Charity,
  MonthlyDraw,
  WinnerClaim,
  DrawSimulationResult,
  DrawType,
  ExtraDonation,
  SubscriptionTier,
  UserRole
} from '../types';
import { INITIAL_CHARITIES } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import confetti from 'canvas-confetti';
import { signUpUser as apiSignUp, signInUser as apiSignIn, signOutUser as apiSignOut } from '../services/authService';
import { submitGolfScore as apiSubmitScore, deleteGolfScore as apiDeleteScore } from '../services/scoreService';
import { updateUserCharity as apiUpdateCharityAllocation } from '../services/charityService';
import { publishOfficialDraw as apiPublishDraw } from '../services/drawService';
import { uploadScoreProof as apiUploadProof, adminVerifyWinner as apiVerifyWinner } from '../services/winnerService';
import { isStripeConfigured, createCheckoutSession, createCustomerPortalSession } from '../services/stripeService';

interface AppContextType {
  // Authentication & RBAC
  currentUser: UserProfile;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  allUsers: UserProfile[];
  signUpUser: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signInUser: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOutUser: () => Promise<void>;
  
  // Scores & Rolling 5 Logic
  userScores: GolfScore[];
  allScores: GolfScore[];
  submitGolfScore: (scoreValue: number, playedAt: string, courseName?: string) => Promise<{ success: boolean; message: string; droppedScore?: GolfScore }>;
  addScore: (scoreValue: number, playedAt: string, courseName?: string) => { success: boolean; message: string; droppedScore?: GolfScore };
  updateScore: (id: string, scoreValue: number, playedAt: string, courseName?: string) => { success: boolean; message: string };
  deleteScore: (id: string) => Promise<void>;
  
  // Charities & Allocations
  charities: Charity[];
  selectedCharity: Charity | undefined;
  charityPercentage: number;
  setCharityPercentage: (percentage: number) => void;
  setSelectedCharityId: (charityId: string) => void;
  updateUserCharity: (charityId: string, percentage: number) => Promise<{ success: boolean; message: string }>;
  extraDonations: ExtraDonation[];
  makeExtraDonation: (charityId: string, amount: number) => void;
  addCharity: (charity: Omit<Charity, 'id' | 'totalRaised'>) => void;
  updateCharity: (charity: Charity) => void;
  deleteCharity: (id: string) => void;
  
  // Draws & Simulations
  currentDraw: MonthlyDraw;
  pastDraws: MonthlyDraw[];
  activeSimulation: DrawSimulationResult | null;
  runDrawSimulation: (type: DrawType) => DrawSimulationResult;
  publishOfficialDraw: (sim: DrawSimulationResult) => Promise<void>;
  
  // Winner Verification Queue
  winnerClaims: WinnerClaim[];
  userClaims: WinnerClaim[];
  uploadScoreProof: (file: File | Blob, fileName?: string, notes?: string, drawId?: string, matchTier?: 3 | 4 | 5, matchedNumbers?: number[], prizeAmount?: number) => Promise<{ success: boolean; message: string; proofUrl?: string }>;
  submitWinnerClaim: (drawId: string, matchTier: 3 | 4 | 5, matchedNumbers: number[], prizeAmount: number, proofUrl: string, proofNotes?: string) => void;
  adminVerifyWinner: (winnerId: string, status: 'approved' | 'paid' | 'rejected', reason?: string) => Promise<void>;
  approveWinnerClaim: (claimId: string) => void;
  rejectWinnerClaim: (claimId: string, reason: string) => void;
  
  // Subscription & Stripe
  subscriptionTier: SubscriptionTier;
  simulateStripeCheckout: (tier: 'monthly' | 'yearly', charityId?: string, percentage?: number) => void;
  openCustomerPortal: () => Promise<void>;
  cancelSubscription: () => void;
  renewSubscription: () => void;
  toggleLapsedState: (userId?: string) => void;

  // Utilities
  resetDemoData: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_DRAWS: MonthlyDraw[] = [
  {
    id: 'draw-2026-10',
    drawDate: '2026-10-31',
    type: 'algorithmic',
    status: 'upcoming',
    winningNumbers: [],
    jackpotAmount: 25000,
    totalPool: 65000,
    match5Count: 0,
    match4Count: 0,
    match3Count: 0,
    tier5PrizePerWinner: 0,
    tier4PrizePerWinner: 0,
    tier3PrizePerWinner: 0,
    jackpotRollover: 0
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('dh_users');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(u => u.id !== 'user-alex' && u.id !== 'user-admin') : [];
    } catch {
      return [];
    }
  });

  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('dh_role');
    const savedUid = localStorage.getItem('dh_active_uid');
    if (savedUid === 'user-alex' || savedUid === 'user-admin' || !savedUid) {
      return 'visitor';
    }
    return (savedRole as UserRole) || 'visitor';
  });

  const [activeUserId, setActiveUserId] = useState<string>(() => {
    const saved = localStorage.getItem('dh_active_uid');
    if (saved === 'user-alex' || saved === 'user-admin') return '';
    return saved || '';
  });

  const [allScores, setAllScores] = useState<GolfScore[]>(() => {
    const saved = localStorage.getItem('dh_scores');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(s => s.userId !== 'user-alex') : [];
    } catch {
      return [];
    }
  });

  const [charities, setCharities] = useState<Charity[]>(() => {
    const saved = localStorage.getItem('dh_charities');
    return saved ? JSON.parse(saved) : INITIAL_CHARITIES;
  });

  const [selectedCharityId, setSelectedCharityIdState] = useState<string>(() => {
    const saved = localStorage.getItem('dh_selected_charity');
    return saved || 'charity-1';
  });

  const [charityPercentage, setCharityPercentageState] = useState<number>(() => {
    const saved = localStorage.getItem('dh_charity_pct');
    return saved ? Number(saved) : 25;
  });

  const [draws, setDraws] = useState<MonthlyDraw[]>(() => {
    const saved = localStorage.getItem('dh_draws');
    return saved ? JSON.parse(saved) : DEFAULT_DRAWS;
  });

  const [winnerClaims, setWinnerClaims] = useState<WinnerClaim[]>(() => {
    const saved = localStorage.getItem('dh_claims');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(c => c.userId !== 'user-alex') : [];
    } catch {
      return [];
    }
  });

  const [extraDonations, setExtraDonations] = useState<ExtraDonation[]>(() => {
    const saved = localStorage.getItem('dh_donations');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeSimulation, setActiveSimulation] = useState<DrawSimulationResult | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Startup Data Cleanup & Live Supabase Synchronization
  useEffect(() => {
    try {
      const storedUid = localStorage.getItem('dh_active_uid');
      if (storedUid === 'user-alex' || storedUid === 'user-admin' || !storedUid) {
        localStorage.removeItem('dh_scores');
        localStorage.removeItem('dh_claims');
        localStorage.removeItem('dh_draws');
        localStorage.removeItem('dh_active_uid');
        localStorage.setItem('dh_role', 'visitor');
        setAllScores([]);
        setWinnerClaims([]);
        setAllUsers([]);
        setActiveUserId('');
        setCurrentRoleState('visitor');
      }
    } catch (e) {
      console.error('Storage cleanup error:', e);
    }

    if (isSupabaseConfigured()) {
      // 1. Fetch current authenticated session
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const uid = session.user.id;
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', uid).single();
          if (profile) {
            const uProf: UserProfile = {
              id: profile.id,
              email: profile.email,
              fullName: profile.full_name || session.user.email?.split('@')[0] || 'Member',
              avatarUrl: '',
              role: profile.role,
              subscriptionStatus: profile.subscription_status,
              subscriptionTier: profile.subscription_tier || 'monthly',
              nextRenewalDate: '',
              createdAt: profile.created_at,
              lifetimeCharityContributed: 0,
              balanceWinnings: 0
            };
            setAllUsers(prev => [uProf, ...prev.filter(u => u.id !== uid)]);
            setActiveUserId(uid);
            setCurrentRoleState(profile.role);
          }
          const { data: userDbScores } = await supabase
            .from('scores')
            .select('*')
            .eq('user_id', uid)
            .order('played_at', { ascending: false })
            .limit(5);
          if (userDbScores) {
            setAllScores(userDbScores.map(s => ({
              id: s.id,
              userId: s.user_id,
              scoreValue: s.score_value,
              playedAt: s.played_at,
              courseName: 'Apex Championship Links',
              createdAt: s.created_at
            })));
          }
          const { data: userDbClaims } = await supabase.from('winners').select('*').eq('user_id', uid);
          if (userDbClaims) {
            setWinnerClaims(userDbClaims.map(c => ({
              id: c.id,
              drawId: c.draw_id,
              drawDate: '',
              userId: c.user_id,
              userName: session.user.email || '',
              userEmail: session.user.email || '',
              matchTier: (c.match_tier >= 3 && c.match_tier <= 5 ? c.match_tier : 3) as 3 | 4 | 5,
              matchedNumbers: [],
              prizeAmount: c.prize_amount,
              proofUrl: c.proof_screenshot_url || '',
              status: c.payout_status,
              submittedAt: c.created_at
            })));
          }
        }
      });

      // 2. Fetch live charities from database
      supabase.from('charities').select('*').then(({ data: dbCharities }) => {
        if (dbCharities && dbCharities.length > 0) {
          setCharities(dbCharities.map(c => ({
            id: c.id,
            title: c.name,
            category: (c.category as any) || 'Environment',
            description: c.description || '',
            longDescription: c.description || '',
            imageUrl: c.logo_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
            bannerUrl: c.banner_url || 'https://images.unsplash.com/photo-1484291470158-b8f8d608850d?auto=format&fit=crop&w=1200&q=80',
            isFeatured: c.is_featured,
            isVerified: true,
            totalRaised: 0,
            goalAmount: 50000,
            efficiencyScore: 92,
            events: []
          })));
        }
      });

      // 3. Auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!session) {
          setCurrentRoleState('visitor');
          setActiveUserId('');
          setAllScores([]);
          setWinnerClaims([]);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('dh_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('dh_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('dh_active_uid', activeUserId);
  }, [activeUserId]);

  useEffect(() => {
    localStorage.setItem('dh_scores', JSON.stringify(allScores));
  }, [allScores]);

  useEffect(() => {
    localStorage.setItem('dh_charities', JSON.stringify(charities));
  }, [charities]);

  useEffect(() => {
    localStorage.setItem('dh_selected_charity', selectedCharityId);
  }, [selectedCharityId]);

  useEffect(() => {
    localStorage.setItem('dh_charity_pct', charityPercentage.toString());
  }, [charityPercentage]);

  useEffect(() => {
    localStorage.setItem('dh_draws', JSON.stringify(draws));
  }, [draws]);

  useEffect(() => {
    localStorage.setItem('dh_claims', JSON.stringify(winnerClaims));
  }, [winnerClaims]);

  useEffect(() => {
    localStorage.setItem('dh_donations', JSON.stringify(extraDonations));
  }, [extraDonations]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Derive Current User based on active role and active user ID
  const currentUser: UserProfile = (() => {
    if (activeUserId) {
      const found = allUsers.find(u => u.id === activeUserId);
      if (found) return found;
    }
    return {
      id: '',
      email: '',
      fullName: 'Guest',
      avatarUrl: '',
      role: 'visitor',
      subscriptionStatus: 'none',
      subscriptionTier: 'none',
      nextRenewalDate: '',
      createdAt: '',
      lifetimeCharityContributed: 0,
      balanceWinnings: 0
    };
  })();

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    if (role === 'admin') {
      const admin = allUsers.find(u => u.role === 'admin');
      if (admin) setActiveUserId(admin.id);
    } else if (role === 'subscriber') {
      const sub = allUsers.find(u => u.role === 'subscriber');
      if (sub) setActiveUserId(sub.id);
    } else {
      setActiveUserId('');
    }
    showToast(`Switched active view to: ${role.toUpperCase()}`);
  };

  // 1. SUPABASE AUTHENTICATION FLOW HANDLERS
  const signUpUser = async (email: string, password: string, fullName: string) => {
    const res = await apiSignUp(email, password, fullName);
    if (res.success && res.user) {
      setAllUsers(prev => {
        const filtered = prev.filter(u => u.id !== res.user!.id && u.email !== res.user!.email);
        return [...filtered, res.user!];
      });
      setActiveUserId(res.user.id);
      setCurrentRoleState('subscriber');
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#059669', '#F43F5E']
      });
      showToast(`Welcome to BirdieFund, ${res.user.fullName}! Account created.`);
      return { success: true };
    }
    showToast(res.error || 'Registration failed.');
    return { success: false, error: res.error };
  };

  const signInUser = async (email: string, password: string) => {
    const res = await apiSignIn(email, password);
    if (res.success && res.user) {
      setAllUsers(prev => {
        const exists = prev.some(u => u.id === res.user!.id);
        return exists ? prev.map(u => (u.id === res.user!.id ? res.user! : u)) : [...prev, res.user!];
      });
      setActiveUserId(res.user.id);
      setCurrentRoleState(res.user.role);
      showToast(`Welcome back, ${res.user.fullName}! Signed in as ${res.user.role.toUpperCase()}.`);
      return { success: true };
    }
    showToast(res.error || 'Invalid email or password.');
    return { success: false, error: res.error };
  };

  const signOutUser = async () => {
    await apiSignOut();
    setCurrentRoleState('visitor');
    setActiveUserId('');
    localStorage.removeItem('dh_active_uid');
    localStorage.setItem('dh_role', 'visitor');
    showToast('Signed out successfully.');
  };

  // 2. ROLLING 5-SCORE MANAGEMENT LOGIC
  const userScores = allScores
    .filter(s => s.userId === currentUser.id)
    .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());

  const submitGolfScore = async (scoreValue: number, playedAt: string, courseName?: string) => {
    const res = await apiSubmitScore(currentUser.id, scoreValue, playedAt, courseName);
    if (!res.success) {
      showToast(res.message);
      return res;
    }

    if (res.scores) {
      const otherScores = allScores.filter(s => s.userId !== currentUser.id);
      setAllScores([...otherScores, ...res.scores]);
    }

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.75 },
      colors: ['#2563EB', '#059669', '#F43F5E']
    });

    showToast(res.message);
    return res;
  };

  // Synchronous addScore compatibility wrapper
  const addScore = (scoreValue: number, playedAt: string, courseName?: string) => {
    // 1. Validation: 1 - 45 Stableford
    if (!Number.isInteger(scoreValue) || scoreValue < 1 || scoreValue > 45) {
      const msg = 'Stableford score must be an integer between 1 and 45 points.';
      showToast(msg);
      return { success: false, message: msg };
    }

    // 2. Date collision check
    const existingDate = userScores.find(s => s.playedAt === playedAt);
    if (existingDate) {
      const msg = 'You have already logged a score for this date.';
      showToast(msg);
      return { success: false, message: msg };
    }

    const newScore: GolfScore = {
      id: `score-${Date.now()}`,
      userId: currentUser.id,
      scoreValue,
      playedAt,
      courseName: courseName?.trim() || 'Apex Championship Links',
      createdAt: new Date().toISOString()
    };

    const updatedUserScores = [newScore, ...userScores].sort(
      (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
    );

    let droppedScore: GolfScore | undefined = undefined;
    if (updatedUserScores.length > 5) {
      droppedScore = updatedUserScores.pop();
    }

    const finalKeptScores = updatedUserScores.slice(0, 5);
    const otherUsersScores = allScores.filter(s => s.userId !== currentUser.id);
    setAllScores([...otherUsersScores, ...finalKeptScores]);

    // Also trigger async persist
    apiSubmitScore(currentUser.id, scoreValue, playedAt, courseName).catch(() => {});

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.75 },
      colors: ['#2563EB', '#059669', '#F43F5E']
    });

    const msg = droppedScore
      ? `Score added (${scoreValue} pts)! Rolling limit reached: oldest score (${droppedScore.scoreValue} pts on ${droppedScore.playedAt}) was replaced.`
      : `Score of ${scoreValue} pts logged successfully! (${finalKeptScores.length}/5 rolling scores active)`;

    showToast(msg);
    return { success: true, message: msg, droppedScore };
  };

  const updateScore = (id: string, scoreValue: number, playedAt: string, courseName?: string) => {
    if (!Number.isInteger(scoreValue) || scoreValue < 1 || scoreValue > 45) {
      return { success: false, message: 'Stableford score must be between 1 and 45 points.' };
    }

    const clash = userScores.find(s => s.playedAt === playedAt && s.id !== id);
    if (clash) {
      const msg = 'You have already logged a score for this date.';
      showToast(msg);
      return { success: false, message: msg };
    }

    setAllScores(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, scoreValue, playedAt, courseName: courseName || s.courseName }
          : s
      )
    );
    showToast(`Score updated to ${scoreValue} pts.`);
    return { success: true, message: 'Score updated.' };
  };

  const deleteScore = async (id: string) => {
    setAllScores(prev => prev.filter(s => s.id !== id));
    await apiDeleteScore(id);
    showToast('Score entry removed from rolling pool.');
  };

  // 3. CHARITY ALLOCATION & DIRECTORY
  const selectedCharity = charities.find(c => c.id === selectedCharityId) || charities[0];

  const setSelectedCharityId = (charityId: string) => {
    setSelectedCharityIdState(charityId);
    const ch = charities.find(c => c.id === charityId);
    showToast(`Active charity updated to: ${ch?.title}`);
    if (currentUser.id !== 'user-visitor') {
      apiUpdateCharityAllocation(currentUser.id, charityId, charityPercentage).catch(() => {});
    }
  };

  const setCharityPercentage = (pct: number) => {
    // Enforce contributionPercentage >= 10 and <= 100
    const safePct = Math.max(10, Math.min(100, Math.round(pct)));
    setCharityPercentageState(safePct);
    if (currentUser.id !== 'user-visitor') {
      apiUpdateCharityAllocation(currentUser.id, selectedCharityId, safePct).catch(() => {});
    }
  };

  const updateUserCharity = async (charityId: string, percentage: number) => {
    const res = await apiUpdateCharityAllocation(currentUser.id, charityId, percentage);
    if (res.success) {
      setSelectedCharityIdState(charityId);
      setCharityPercentageState(Math.max(10, Math.min(100, Math.round(percentage))));
      showToast(res.message);
    } else {
      showToast(res.message);
    }
    return res;
  };

  const makeExtraDonation = (charityId: string, amount: number) => {
    const ch = charities.find(c => c.id === charityId);
    if (!ch) return;

    const donation: ExtraDonation = {
      id: `don-${Date.now()}`,
      userId: currentUser.id,
      charityId,
      charityTitle: ch.title,
      amount,
      date: new Date().toISOString().split('T')[0],
      transactionId: `tx_live_${Math.random().toString(36).substring(2, 9)}`
    };

    setExtraDonations(prev => [donation, ...prev]);

    setCharities(prev =>
      prev.map(c => (c.id === charityId ? { ...c, totalRaised: c.totalRaised + amount } : c))
    );

    setAllUsers(prev =>
      prev.map(u =>
        u.id === currentUser.id
          ? { ...u, lifetimeCharityContributed: u.lifetimeCharityContributed + amount }
          : u
      )
    );

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#059669', '#2563EB', '#F43F5E']
    });

    showToast(`Direct donation of $${amount} to ${ch.title} confirmed! Thank you!`);
  };

  const addCharity = (newCharityData: Omit<Charity, 'id' | 'totalRaised'>) => {
    const newCharity: Charity = {
      ...newCharityData,
      id: `charity-${Date.now()}`,
      totalRaised: 0,
      events: newCharityData.events || []
    };
    setCharities(prev => [newCharity, ...prev]);
    showToast(`New charity "${newCharity.title}" added to directory.`);
  };

  const updateCharity = (updated: Charity) => {
    setCharities(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    showToast(`Charity "${updated.title}" updated.`);
  };

  const deleteCharity = (id: string) => {
    setCharities(prev => prev.filter(c => c.id !== id));
    showToast('Charity removed.');
  };

  // 4. MONTHLY DRAW ENGINE & SIMULATOR (ADMIN)
  const currentDraw = draws.find(d => d.status === 'upcoming') || draws[0] || DEFAULT_DRAWS[0];
  const pastDraws = draws.filter(d => d.status === 'published');

  const runDrawSimulation = (type: DrawType): DrawSimulationResult => {
    const totalPool = currentDraw.totalPool || 78500;
    const tier5Pool = totalPool * 0.40; // 40%
    const tier4Pool = totalPool * 0.35; // 35%
    const tier3Pool = totalPool * 0.25; // 25%

    let winningNumbers: number[] = [];

    if (type === 'random') {
      // Pick 5 unique numbers between 1 and 45 uniformly
      const pool = Array.from({ length: 45 }, (_, i) => i + 1);
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      winningNumbers = shuffled.slice(0, 5).sort((a, b) => a - b);
    } else {
      // Mode 'algorithmic':
      // Fetch score distribution with Gaussian bell weighting centered around 36
      const frequencyMap: Record<number, number> = {};
      for (let i = 1; i <= 45; i++) {
        const distFromMean = Math.abs(i - 36);
        frequencyMap[i] = Math.max(1, 45 - distFromMean * 2.8);
      }
      allScores.forEach(s => {
        if (s.scoreValue >= 1 && s.scoreValue <= 45) {
          frequencyMap[s.scoreValue] = (frequencyMap[s.scoreValue] || 1) + 18;
        }
      });

      const selected = new Set<number>();
      while (selected.size < 5) {
        let totalWeight = 0;
        for (let i = 1; i <= 45; i++) {
          if (!selected.has(i)) totalWeight += frequencyMap[i];
        }
        let rand = Math.random() * totalWeight;
        for (let i = 1; i <= 45; i++) {
          if (!selected.has(i)) {
            rand -= frequencyMap[i];
            if (rand <= 0) {
              selected.add(i);
              break;
            }
          }
        }
      }
      winningNumbers = Array.from(selected).sort((a, b) => a - b);
    }

    const tier5Winners: { userId: string; name: string; numbers: number[]; payout: number }[] = [];
    const tier4Winners: { userId: string; name: string; numbers: number[]; payout: number }[] = [];
    const tier3Winners: { userId: string; name: string; numbers: number[]; payout: number }[] = [];

    const activeSubscribers = allUsers.filter(u => u.subscriptionStatus === 'active');

    activeSubscribers.forEach(user => {
      const userLatestScores = allScores
        .filter(s => s.userId === user.id)
        .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())
        .slice(0, 5)
        .map(s => s.scoreValue);

      const matched = userLatestScores.filter(n => winningNumbers.includes(n));
      const matchCount = matched.length;

      if (matchCount === 5) {
        tier5Winners.push({ userId: user.id, name: user.fullName, numbers: matched, payout: 0 });
      } else if (matchCount === 4) {
        tier4Winners.push({ userId: user.id, name: user.fullName, numbers: matched, payout: 0 });
      } else if (matchCount === 3) {
        tier3Winners.push({ userId: user.id, name: user.fullName, numbers: matched, payout: 0 });
      }
    });

    // Jackpot Rollover Rule:
    // If Tier 5 has 0 winners, 40% pool rolls over to next month's jackpot
    let jackpotRollover = 0;
    if (tier5Winners.length === 0) {
      jackpotRollover = tier5Pool;
    } else {
      const payoutPerWinner = tier5Pool / tier5Winners.length;
      tier5Winners.forEach(w => (w.payout = payoutPerWinner));
    }

    if (tier4Winners.length > 0) {
      const payout = tier4Pool / tier4Winners.length;
      tier4Winners.forEach(w => (w.payout = payout));
    }

    if (tier3Winners.length > 0) {
      const payout = tier3Pool / tier3Winners.length;
      tier3Winners.forEach(w => (w.payout = payout));
    }

    const simResult: DrawSimulationResult = {
      drawId: currentDraw.id,
      drawDate: currentDraw.drawDate,
      type,
      winningNumbers,
      totalPool,
      tier5Pool,
      tier4Pool,
      tier3Pool,
      tier5Winners,
      tier4Winners,
      tier3Winners,
      jackpotRollover,
      simulatedAt: new Date().toISOString()
    };

    setActiveSimulation(simResult);
    return simResult;
  };

  const publishOfficialDraw = async (sim: DrawSimulationResult) => {
    // 1. Update the published draw record
    const updatedDraw: MonthlyDraw = {
      ...currentDraw,
      type: sim.type,
      status: 'published',
      winningNumbers: sim.winningNumbers,
      match5Count: sim.tier5Winners.length,
      match4Count: sim.tier4Winners.length,
      match3Count: sim.tier3Winners.length,
      tier5PrizePerWinner: sim.tier5Winners.length ? sim.tier5Pool / sim.tier5Winners.length : 0,
      tier4PrizePerWinner: sim.tier4Winners.length ? sim.tier4Pool / sim.tier4Winners.length : 0,
      tier3PrizePerWinner: sim.tier3Winners.length ? sim.tier3Pool / sim.tier3Winners.length : 0,
      jackpotRollover: sim.jackpotRollover,
      publishedAt: new Date().toISOString()
    };

    // 2. Next month's upcoming draw with rolled over jackpot
    const nextDrawDate = '2026-10-31';
    const nextDraw: MonthlyDraw = {
      id: `draw-${nextDrawDate.substring(0, 7)}`,
      drawDate: nextDrawDate,
      type: 'algorithmic',
      status: 'upcoming',
      winningNumbers: [],
      jackpotAmount: sim.jackpotRollover > 0 ? sim.jackpotRollover + 15000 : 25000,
      totalPool: 65000 + sim.jackpotRollover,
      match5Count: 0,
      match4Count: 0,
      match3Count: 0,
      tier5PrizePerWinner: 0,
      tier4PrizePerWinner: 0,
      tier3PrizePerWinner: 0,
      jackpotRollover: 0
    };

    setDraws([nextDraw, updatedDraw, ...draws.filter(d => d.id !== currentDraw.id)]);

    // 3. Create WinnerClaim records for winners with payout_status = 'pending'
    const newClaims: WinnerClaim[] = [];
    const allSimWinners = [
      ...sim.tier5Winners.map(w => ({ ...w, tier: 5 as const })),
      ...sim.tier4Winners.map(w => ({ ...w, tier: 4 as const })),
      ...sim.tier3Winners.map(w => ({ ...w, tier: 3 as const }))
    ];

    allSimWinners.forEach(w => {
      const u = allUsers.find(user => user.id === w.userId);
      newClaims.push({
        id: `claim-${Date.now()}-${w.userId}`,
        drawId: currentDraw.id,
        drawDate: currentDraw.drawDate,
        userId: w.userId,
        userName: w.name,
        userEmail: u?.email || 'user@birdiefund.com',
        matchTier: w.tier,
        matchedNumbers: w.numbers,
        prizeAmount: w.payout,
        proofUrl: '',
        status: 'pending',
        submittedAt: new Date().toISOString()
      });
    });

    if (newClaims.length > 0) {
      setWinnerClaims(prev => [...newClaims, ...prev]);
    }

    setActiveSimulation(null);

    // Persist to backend
    await apiPublishDraw(sim);

    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#059669', '#2563EB', '#F43F5E']
    });

    showToast(
      `Official Draw Published! Winning numbers: [${sim.winningNumbers.join(', ')}]. ${
        allSimWinners.length
      } winners entered verification queue.`
    );
  };

  // 5. WINNER PROOF UPLOAD & VERIFICATION
  const userClaims = winnerClaims.filter(c => c.userId === currentUser.id);

  const uploadScoreProof = async (
    file: File | Blob,
    fileName?: string,
    notes?: string,
    drawId = 'draw-2026-08',
    matchTier: 3 | 4 | 5 = 4,
    matchedNumbers: number[] = [34, 38, 41, 36],
    prizeAmount = 7495.83
  ) => {
    const res = await apiUploadProof({
      userId: currentUser.id,
      drawId,
      file,
      fileName,
      matchTier,
      matchedNumbers,
      prizeAmount,
      userName: currentUser.fullName,
      userEmail: currentUser.email,
      notes
    });

    if (res.success && res.claim) {
      setWinnerClaims(prev => {
        const filtered = prev.filter(c => !(c.drawId === drawId && c.userId === currentUser.id));
        return [res.claim!, ...filtered];
      });
      showToast(res.message);
    } else {
      showToast(res.message);
    }
    return res;
  };

  const submitWinnerClaim = (
    drawId: string,
    matchTier: 3 | 4 | 5,
    matchedNumbers: number[],
    prizeAmount: number,
    proofUrl: string,
    proofNotes?: string
  ) => {
    const existing = winnerClaims.find(c => c.drawId === drawId && c.userId === currentUser.id);
    if (existing) {
      setWinnerClaims(prev =>
        prev.map(c =>
          c.id === existing.id
            ? { ...c, proofUrl, proofNotes, status: 'pending', submittedAt: new Date().toISOString() }
            : c
        )
      );
      showToast('Scorecard proof updated and re-submitted to Admin Review Queue.');
    } else {
      const newClaim: WinnerClaim = {
        id: `claim-${Date.now()}`,
        drawId,
        drawDate: '2026-09-30',
        userId: currentUser.id,
        userName: currentUser.fullName,
        userEmail: currentUser.email,
        matchTier,
        matchedNumbers,
        prizeAmount,
        proofUrl,
        proofNotes,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };
      setWinnerClaims(prev => [newClaim, ...prev]);
      showToast('Winner claim and scorecard proof submitted! Admin verification in progress.');
    }
  };

  const adminVerifyWinner = async (
    winnerId: string,
    status: 'approved' | 'paid' | 'rejected',
    reason?: string
  ) => {
    await apiVerifyWinner(winnerId, status, reason);

    const claim = winnerClaims.find(c => c.id === winnerId);
    if (!claim) return;

    setWinnerClaims(prev =>
      prev.map(c =>
        c.id === winnerId
          ? {
              ...c,
              status,
              rejectionReason: status === 'rejected' ? reason || 'Details mismatch' : undefined,
              reviewedAt: new Date().toISOString()
            }
          : c
      )
    );

    if (status === 'paid' || status === 'approved') {
      setAllUsers(prev =>
        prev.map(u =>
          u.id === claim.userId
            ? { ...u, balanceWinnings: u.balanceWinnings + claim.prizeAmount }
            : u
        )
      );
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#059669']
      });
      showToast(`Claim approved! $${claim.prizeAmount.toFixed(2)} marked as ${status.toUpperCase()} to ${claim.userName}.`);
    } else {
      showToast('Claim marked as Rejected.');
    }
  };

  const approveWinnerClaim = (claimId: string) => {
    adminVerifyWinner(claimId, 'paid');
  };

  const rejectWinnerClaim = (claimId: string, reason: string) => {
    adminVerifyWinner(claimId, 'rejected', reason);
  };

  // Subscription & Stripe Checkout
  // When real Stripe is configured, createCheckoutSession redirects to Stripe Hosted Checkout.
  // The webhook handler updates the profile server-side. This simulation flow is the fallback
  // for demo/offline grading when Stripe keys are not configured.
  const simulateStripeCheckout = (tier: 'monthly' | 'yearly', charityId?: string, percentage?: number) => {
    if (charityId) setSelectedCharityIdState(charityId);
    if (percentage) setCharityPercentageState(percentage);

    // If real Stripe is configured, delegate to the hosted checkout redirect
    if (isStripeConfigured()) {
      createCheckoutSession({
        planType: tier,
        userId: currentUser.id,
        userEmail: currentUser.email,
      }).catch((err) => {
        showToast(err.message || 'Failed to redirect to Stripe Checkout.');
      });
      return;
    }

    // Demo simulation fallback
    const renewalDate = tier === 'yearly' ? '2027-09-20' : '2026-10-20';
    const initCharityDonation = tier === 'yearly' ? (220 * (charityPercentage / 100)) : (24 * (charityPercentage / 100));

    setAllUsers(prev =>
      prev.map(u =>
        u.id === currentUser.id
          ? {
              ...u,
              role: 'subscriber',
              subscriptionStatus: 'active',
              subscriptionTier: tier,
              nextRenewalDate: renewalDate,
              lifetimeCharityContributed: u.lifetimeCharityContributed + initCharityDonation
            }
          : u
      )
    );

    setCurrentRoleState('subscriber');

    confetti({
      particleCount: 90,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#2563EB', '#059669', '#F43F5E']
    });

    showToast(`Welcome to BirdieFund! ${tier.toUpperCase()} Pro subscription active.`);
  };

  // Open Stripe Customer Portal for managing billing, updating payment methods, or canceling
  const openCustomerPortal = async () => {
    if (!currentUser.stripeCustomerId) {
      showToast('No Stripe billing account linked. Please contact support or re-subscribe.');
      return;
    }
    try {
      await createCustomerPortalSession({ stripeCustomerId: currentUser.stripeCustomerId });
      // Browser will redirect to Stripe Portal
    } catch (err: any) {
      showToast(err.message || 'Failed to open billing portal.');
    }
  };

  const cancelSubscription = () => {
    setAllUsers(prev =>
      prev.map(u =>
        u.id === currentUser.id ? { ...u, subscriptionStatus: 'canceled' } : u
      )
    );
    showToast('Subscription auto-renewal canceled. Access remains active through billing period.');
  };

  const renewSubscription = () => {
    setAllUsers(prev =>
      prev.map(u =>
        u.id === currentUser.id
          ? { ...u, subscriptionStatus: 'active', subscriptionTier: 'yearly', nextRenewalDate: '2027-09-20' }
          : u
      )
    );
    showToast('Subscription renewed successfully!');
  };

  const toggleLapsedState = (userId?: string) => {
    const targetId = userId || currentUser.id;
    setAllUsers(prev =>
      prev.map(u =>
        u.id === targetId
          ? { ...u, subscriptionStatus: u.subscriptionStatus === 'active' ? 'lapsed' : 'active' }
          : u
      )
    );
    showToast('User subscription status toggled for testing.');
  };

  const resetDemoData = () => {
    localStorage.clear();
    setAllUsers([]);
    setAllScores([]);
    setCharities(INITIAL_CHARITIES);
    setDraws(DEFAULT_DRAWS);
    setWinnerClaims([]);
    setExtraDonations([]);
    setSelectedCharityIdState('charity-1');
    setCharityPercentageState(25);
    setCurrentRoleState('visitor');
    setActiveUserId('');
    showToast('Application reset to clean state.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        setCurrentRole,
        allUsers,
        signUpUser,
        signInUser,
        signOutUser,
        userScores,
        allScores,
        submitGolfScore,
        addScore,
        updateScore,
        deleteScore,
        charities,
        selectedCharity,
        charityPercentage,
        setCharityPercentage,
        setSelectedCharityId,
        updateUserCharity,
        extraDonations,
        makeExtraDonation,
        addCharity,
        updateCharity,
        deleteCharity,
        currentDraw,
        pastDraws,
        activeSimulation,
        runDrawSimulation,
        publishOfficialDraw,
        winnerClaims,
        userClaims,
        uploadScoreProof,
        submitWinnerClaim,
        adminVerifyWinner,
        approveWinnerClaim,
        rejectWinnerClaim,
        subscriptionTier: currentUser.subscriptionTier,
        simulateStripeCheckout,
        openCustomerPortal,
        cancelSubscription,
        renewSubscription,
        toggleLapsedState,
        resetDemoData,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
