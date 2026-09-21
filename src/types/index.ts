export type UserRole = 'visitor' | 'subscriber' | 'admin';

export type SubscriptionStatus = 'active' | 'inactive' | 'lapsed' | 'canceled' | 'none';

export type SubscriptionTier = 'monthly' | 'yearly' | 'none';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
  subscriptionTier: SubscriptionTier;
  stripeCustomerId?: string;
  nextRenewalDate: string;
  createdAt: string;
  lifetimeCharityContributed: number;
  balanceWinnings: number;
}

export interface GolfScore {
  id: string;
  userId: string;
  scoreValue: number; // 1 - 45 Stableford
  playedAt: string; // YYYY-MM-DD
  courseName?: string;
  createdAt: string;
}

export interface CharityEvent {
  id: string;
  charityId: string;
  title: string;
  eventDate: string;
  location: string;
  description: string;
  registrationUrl?: string;
}

export interface Charity {
  id: string;
  title: string;
  category: 'Environment' | 'Health' | 'Youth Sports' | 'Education' | 'Community';
  description: string;
  longDescription: string;
  imageUrl: string;
  bannerUrl: string;
  isFeatured: boolean;
  isVerified: boolean;
  totalRaised: number;
  goalAmount: number;
  efficiencyScore: number; // e.g. 94% to direct programs
  events: CharityEvent[];
}

export interface UserCharityAllocation {
  userId: string;
  charityId: string;
  contributionPercentage: number; // minimum 10%, up to 100%
  updatedAt: string;
}

export type DrawType = 'random' | 'algorithmic';

export type DrawStatus = 'upcoming' | 'simulated' | 'published';

export interface DrawSimulationResult {
  drawId: string;
  drawDate: string;
  type: DrawType;
  winningNumbers: number[];
  totalPool: number;
  tier5Winners: { userId: string; name: string; numbers: number[]; payout: number }[];
  tier4Winners: { userId: string; name: string; numbers: number[]; payout: number }[];
  tier3Winners: { userId: string; name: string; numbers: number[]; payout: number }[];
  tier5Pool: number; // 40%
  tier4Pool: number; // 35%
  tier3Pool: number; // 25%
  jackpotRollover: number; // amount rolled over if tier5 is 0
  simulatedAt: string;
}

export interface MonthlyDraw {
  id: string;
  drawDate: string;
  type: DrawType;
  status: DrawStatus;
  winningNumbers: number[];
  jackpotAmount: number; // e.g. 25700
  totalPool: number; // e.g. 64250
  match5Count: number;
  match4Count: number;
  match3Count: number;
  tier5PrizePerWinner: number;
  tier4PrizePerWinner: number;
  tier3PrizePerWinner: number;
  jackpotRollover: number;
  publishedAt?: string;
}

export type WinnerClaimStatus = 'pending' | 'approved' | 'paid' | 'rejected';

export interface WinnerClaim {
  id: string;
  drawId: string;
  drawDate: string;
  userId: string;
  userName: string;
  userEmail: string;
  matchTier: 3 | 4 | 5;
  matchedNumbers: number[];
  prizeAmount: number;
  proofUrl: string;
  proofNotes?: string;
  status: WinnerClaimStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface ExtraDonation {
  id: string;
  userId: string;
  charityId: string;
  charityTitle: string;
  amount: number;
  date: string;
  transactionId: string;
}
