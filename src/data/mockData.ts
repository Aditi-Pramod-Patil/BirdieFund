import { Charity, GolfScore, MonthlyDraw, UserProfile, WinnerClaim } from '../types';

export const INITIAL_CHARITIES: Charity[] = [
  {
    id: 'charity-1',
    title: 'Clean Seas Marine Initiative',
    category: 'Environment',
    description: 'Autonomous marine cleanup drones intercepting plastic waste in critical ocean river mouths.',
    longDescription: 'Clean Seas deploys advanced robotic surface barriers and AI-driven recovery vessels across high-density river deltas. Every $25 allocated funds the removal and circular recycling of 100 kg of marine debris before it reaches open open ocean reefs.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1484291470158-b8f8d608850d?auto=format&fit=crop&w=1200&q=80',
    isFeatured: true,
    isVerified: true,
    totalRaised: 64200,
    goalAmount: 85000,
    efficiencyScore: 93,
    events: [
      {
        id: 'event-1',
        charityId: 'charity-1',
        title: 'Coastal Cleanup & Charity Pro-Am',
        eventDate: '2026-10-15',
        location: 'Pacific Dunes & Coastline, CA',
        description: '36-hole charity invitational with 100% of player entry matching donated to coastal restoration.',
        registrationUrl: 'https://cleanseas.org/events/coastal-invitational'
      }
    ]
  },
  {
    id: 'charity-2',
    title: 'NextGen Youth Sports Foundation',
    category: 'Youth Sports',
    description: 'Providing elite coaching, equipment, and athletic scholarships to underprivileged student athletes.',
    longDescription: 'NextGen removes socioeconomic barriers to competitive athletics. We provide top-tier coaching, transportation grants, tournament fee coverage, and academic tutoring to ensure high school student-athletes can earn collegiate athletic scholarships.',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80',
    isFeatured: true,
    isVerified: true,
    totalRaised: 51800,
    goalAmount: 70000,
    efficiencyScore: 91,
    events: [
      {
        id: 'event-2',
        charityId: 'charity-2',
        title: 'NextGen High School Shootout',
        eventDate: '2026-11-04',
        location: 'Silverstone Athletic Complex, Austin TX',
        description: 'Showcase tournament for 120 aspiring junior athletes scouted by university athletic directors.',
      }
    ]
  },
  {
    id: 'charity-3',
    title: 'Precision Oncology Research',
    category: 'Health',
    description: 'Funding breakthrough genomic sequencing for rare and pediatric cancers.',
    longDescription: 'Traditional chemotherapy fails for many rare genomic variants. Precision Oncology funds targeted mRNA and CRISPR cellular immunotherapies with rapid clinical trial pipelines, directly increasing pediatric survival rates by 38%.',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80',
    isFeatured: true,
    isVerified: true,
    totalRaised: 42350,
    goalAmount: 60000,
    efficiencyScore: 96,
    events: [
      {
        id: 'event-3',
        charityId: 'charity-3',
        title: 'Global Oncology Summit & Gala',
        eventDate: '2026-11-20',
        location: 'Metro Convention Hall, Boston MA',
        description: 'Keynote by leading geneticists accompanied by live auctions for lab research grants.',
      }
    ]
  },
  {
    id: 'charity-4',
    title: 'Urban Canopy Forest Project',
    category: 'Environment',
    description: 'Cooling concrete heat islands by planting 50,000 native bio-diverse urban trees.',
    longDescription: 'Low-income urban corridors experience temperatures up to 10°F hotter due to lack of greenery. Urban Canopy collaborates with city planners and neighborhood youth corps to plant and steward micro-forests across disenfranchised metro areas.',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    isFeatured: false,
    isVerified: true,
    totalRaised: 18400,
    goalAmount: 40000,
    efficiencyScore: 89,
    events: []
  },
  {
    id: 'charity-5',
    title: 'CodeForward Tech Education',
    category: 'Education',
    description: 'Immersive coding bootcamps and laptop grants for first-generation university scholars.',
    longDescription: 'Bridging the digital divide by equipping resilient young adults with full-stack software development skills, mentor pairing with senior tech leads, and guaranteed internship placements.',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    isFeatured: false,
    isVerified: true,
    totalRaised: 29800,
    goalAmount: 45000,
    efficiencyScore: 92,
    events: []
  }
];

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user-alex',
    email: 'alex.rivers@birdiefund.com',
    fullName: 'Alex Rivers',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    role: 'subscriber',
    subscriptionStatus: 'active',
    subscriptionTier: 'yearly',
    nextRenewalDate: '2027-01-15',
    createdAt: '2026-01-15',
    lifetimeCharityContributed: 245.00,
    balanceWinnings: 1420.00
  },
  {
    id: 'user-admin',
    email: 'sarah.chen@birdiefund.com',
    fullName: 'Sarah Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    role: 'admin',
    subscriptionStatus: 'active',
    subscriptionTier: 'yearly',
    nextRenewalDate: '2027-03-01',
    createdAt: '2025-11-01',
    lifetimeCharityContributed: 650.00,
    balanceWinnings: 0.00
  },
  {
    id: 'user-marcus',
    email: 'marcus.v@gmail.com',
    fullName: 'Marcus Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    role: 'subscriber',
    subscriptionStatus: 'active',
    subscriptionTier: 'monthly',
    nextRenewalDate: '2026-10-12',
    createdAt: '2026-02-12',
    lifetimeCharityContributed: 84.00,
    balanceWinnings: 240.00
  },
  {
    id: 'user-elena',
    email: 'elena.rostova@techmail.io',
    fullName: 'Elena Rostova',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    role: 'subscriber',
    subscriptionStatus: 'active',
    subscriptionTier: 'yearly',
    nextRenewalDate: '2026-12-05',
    createdAt: '2025-12-05',
    lifetimeCharityContributed: 310.00,
    balanceWinnings: 3820.00
  },
  {
    id: 'user-david',
    email: 'd.kim.golf@outlook.com',
    fullName: 'David Kim',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    role: 'subscriber',
    subscriptionStatus: 'lapsed',
    subscriptionTier: 'monthly',
    nextRenewalDate: '2026-09-01',
    createdAt: '2026-03-01',
    lifetimeCharityContributed: 42.00,
    balanceWinnings: 0.00
  },
  {
    id: 'user-priya',
    email: 'priya.patel@impactcap.org',
    fullName: 'Priya Patel',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    role: 'subscriber',
    subscriptionStatus: 'active',
    subscriptionTier: 'yearly',
    nextRenewalDate: '2027-02-18',
    createdAt: '2026-02-18',
    lifetimeCharityContributed: 195.00,
    balanceWinnings: 620.00
  }
];

// Rolling 5 scores for user Alex Rivers (Stableford 1-45, sorted reverse chronological)
export const INITIAL_SCORES: GolfScore[] = [
  {
    id: 'score-5',
    userId: 'user-alex',
    scoreValue: 41,
    playedAt: '2026-09-18',
    courseName: 'Apex Championship Course',
    createdAt: '2026-09-18T16:20:00Z'
  },
  {
    id: 'score-4',
    userId: 'user-alex',
    scoreValue: 38,
    playedAt: '2026-09-11',
    courseName: 'Highland Ridge Links',
    createdAt: '2026-09-11T17:40:00Z'
  },
  {
    id: 'score-3',
    userId: 'user-alex',
    scoreValue: 34,
    playedAt: '2026-09-03',
    courseName: 'Cyber Pines National',
    createdAt: '2026-09-03T15:10:00Z'
  },
  {
    id: 'score-2',
    userId: 'user-alex',
    scoreValue: 42,
    playedAt: '2026-08-27',
    courseName: 'Summit Valley Club',
    createdAt: '2026-08-27T18:05:00Z'
  },
  {
    id: 'score-1',
    userId: 'user-alex',
    scoreValue: 36,
    playedAt: '2026-08-19',
    courseName: 'Silverstone Invitational',
    createdAt: '2026-08-19T14:30:00Z'
  },
  // Scores for other simulated users
  {
    id: 'score-m1',
    userId: 'user-marcus',
    scoreValue: 37,
    playedAt: '2026-09-16',
    courseName: 'Metro Links',
    createdAt: '2026-09-16T12:00:00Z'
  },
  {
    id: 'score-m2',
    userId: 'user-marcus',
    scoreValue: 39,
    playedAt: '2026-09-10',
    courseName: 'Metro Links',
    createdAt: '2026-09-10T12:00:00Z'
  },
  {
    id: 'score-m3',
    userId: 'user-marcus',
    scoreValue: 41,
    playedAt: '2026-09-02',
    courseName: 'Metro Links',
    createdAt: '2026-09-02T12:00:00Z'
  },
  {
    id: 'score-m4',
    userId: 'user-marcus',
    scoreValue: 35,
    playedAt: '2026-08-25',
    courseName: 'Metro Links',
    createdAt: '2026-08-25T12:00:00Z'
  },
  {
    id: 'score-m5',
    userId: 'user-marcus',
    scoreValue: 38,
    playedAt: '2026-08-18',
    courseName: 'Metro Links',
    createdAt: '2026-08-18T12:00:00Z'
  },
  {
    id: 'score-e1',
    userId: 'user-elena',
    scoreValue: 41,
    playedAt: '2026-09-15',
    courseName: 'Nordic Downs',
    createdAt: '2026-09-15T12:00:00Z'
  },
  {
    id: 'score-e2',
    userId: 'user-elena',
    scoreValue: 38,
    playedAt: '2026-09-09',
    courseName: 'Nordic Downs',
    createdAt: '2026-09-09T12:00:00Z'
  },
  {
    id: 'score-e3',
    userId: 'user-elena',
    scoreValue: 34,
    playedAt: '2026-09-01',
    courseName: 'Nordic Downs',
    createdAt: '2026-09-01T12:00:00Z'
  },
  {
    id: 'score-e4',
    userId: 'user-elena',
    scoreValue: 40,
    playedAt: '2026-08-24',
    courseName: 'Nordic Downs',
    createdAt: '2026-08-24T12:00:00Z'
  },
  {
    id: 'score-e5',
    userId: 'user-elena',
    scoreValue: 42,
    playedAt: '2026-08-17',
    courseName: 'Nordic Downs',
    createdAt: '2026-08-17T12:00:00Z'
  }
];

export const INITIAL_DRAWS: MonthlyDraw[] = [
  {
    id: 'draw-2026-08',
    drawDate: '2026-08-31',
    type: 'algorithmic',
    status: 'published',
    winningNumbers: [34, 38, 41, 29, 36],
    jackpotAmount: 25700,
    totalPool: 64250,
    match5Count: 0, // Rolled over!
    match4Count: 3,
    match3Count: 14,
    tier5PrizePerWinner: 0,
    tier4PrizePerWinner: 7495.83,
    tier3PrizePerWinner: 1147.32,
    jackpotRollover: 25700,
    publishedAt: '2026-08-31T20:00:00Z'
  },
  {
    id: 'draw-2026-09',
    drawDate: '2026-09-30',
    type: 'algorithmic',
    status: 'upcoming',
    winningNumbers: [],
    jackpotAmount: 38400, // Includes previous $25,700 rollover!
    totalPool: 78500,
    match5Count: 0,
    match4Count: 0,
    match3Count: 0,
    tier5PrizePerWinner: 0,
    tier4PrizePerWinner: 0,
    tier3PrizePerWinner: 0,
    jackpotRollover: 0
  }
];

// Sample scorecard proof preview (SVG high-res scorecard graphic encoded)
export const SAMPLE_SCORECARD_PROOF = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
  <rect width="600" height="380" fill="%23FFFFFF" rx="16" stroke="%23CBD5E1" stroke-width="1.5"/>
  <rect x="20" y="20" width="560" height="60" rx="10" fill="%23EFF6FF" stroke="%23BFDBFE" stroke-width="1"/>
  <text x="40" y="55" fill="%231D4ED8" font-family="Plus Jakarta Sans, sans-serif" font-size="16" font-weight="bold">OFFICIAL STABLEFORD SCORECARD VERIFICATION</text>
  <text x="470" y="55" fill="%2364748B" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600">SEPT 2026</text>
  
  <text x="40" y="115" fill="%230F172A" font-family="Plus Jakarta Sans, sans-serif" font-size="13">Player: <tspan fill="%232563EB" font-weight="bold">Alex Rivers</tspan></text>
  <text x="240" y="115" fill="%23475569" font-family="Plus Jakarta Sans, sans-serif" font-size="13">Club: Apex Championship Course</text>
  <text x="490" y="115" fill="%23475569" font-family="Plus Jakarta Sans, sans-serif" font-size="13">Index: 6.4</text>
  
  <rect x="20" y="140" width="560" height="130" fill="%23F8FAFC" rx="10" stroke="%23E2E8F0" stroke-width="1"/>
  <text x="40" y="170" fill="%2364748B" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="bold">HOLE</text>
  <text x="100" y="170" fill="%2364748B" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="bold">1-9 OUT</text>
  <text x="220" y="170" fill="%2364748B" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="bold">10-18 IN</text>
  <text x="340" y="170" fill="%2364748B" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="bold">GROSS</text>
  <text x="440" y="170" fill="%232563EB" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="bold">STABLEFORD PTS</text>
  
  <line x1="30" y1="185" x2="570" y2="185" stroke="%23E2E8F0" stroke-width="1"/>
  
  <text x="40" y="215" fill="%230F172A" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="500">Front/Back</text>
  <text x="100" y="215" fill="%23334155" font-family="Plus Jakarta Sans, sans-serif" font-size="13">36 (19 pts)</text>
  <text x="220" y="215" fill="%23334155" font-family="Plus Jakarta Sans, sans-serif" font-size="13">37 (22 pts)</text>
  <text x="340" y="215" fill="%23334155" font-family="Plus Jakarta Sans, sans-serif" font-size="13">73 (+1)</text>
  <text x="450" y="218" fill="%231D4ED8" font-family="Plus Jakarta Sans, sans-serif" font-size="20" font-weight="800">41 PTS</text>
  
  <line x1="30" y1="240" x2="570" y2="240" stroke="%23E2E8F0" stroke-width="1"/>
  <text x="40" y="260" fill="%2364748B" font-family="Plus Jakarta Sans, sans-serif" font-size="11">Attester Signature: T. Westwood (PGA Pro %238914) — Verified electronically</text>

  <rect x="20" y="290" width="560" height="70" rx="10" fill="%23EFF6FF" stroke="%23BFDBFE" stroke-width="1"/>
  <circle cx="45" cy="325" r="14" fill="%232563EB" fill-opacity="0.15"/>
  <path d="M40 325 L44 329 L51 321" stroke="%232563EB" stroke-width="2.5" fill="none"/>
  <text x="70" y="322" fill="%231E3A8A" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="bold">BirdieFund Verification Cryptographic Stamp</text>
  <text x="70" y="340" fill="%2364748B" font-family="Plus Jakarta Sans, sans-serif" font-size="11">SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069</text>
</svg>`;

export const INITIAL_WINNERS: WinnerClaim[] = [
  {
    id: 'claim-101',
    drawId: 'draw-2026-08',
    drawDate: '2026-08-31',
    userId: 'user-alex',
    userName: 'Alex Rivers',
    userEmail: 'alex.rivers@birdiefund.com',
    matchTier: 4,
    matchedNumbers: [34, 38, 41, 36],
    prizeAmount: 7495.83,
    proofUrl: SAMPLE_SCORECARD_PROOF,
    proofNotes: 'Attested scorecard from Apex Championship Course. Stableford total verified by Head Pro.',
    status: 'pending',
    submittedAt: '2026-09-02T11:15:00Z'
  },
  {
    id: 'claim-102',
    drawId: 'draw-2026-08',
    drawDate: '2026-08-31',
    userId: 'user-marcus',
    userName: 'Marcus Vance',
    userEmail: 'marcus.v@gmail.com',
    matchTier: 3,
    matchedNumbers: [38, 41, 36],
    prizeAmount: 1147.32,
    proofUrl: SAMPLE_SCORECARD_PROOF,
    proofNotes: 'Uploaded digital app scorecard screenshot from Metro Links club portal.',
    status: 'approved',
    submittedAt: '2026-09-01T14:22:00Z',
    reviewedAt: '2026-09-02T09:30:00Z'
  },
  {
    id: 'claim-103',
    drawId: 'draw-2026-08',
    drawDate: '2026-08-31',
    userId: 'user-elena',
    userName: 'Elena Rostova',
    userEmail: 'elena.rostova@techmail.io',
    matchTier: 3,
    matchedNumbers: [34, 38, 41],
    prizeAmount: 1147.32,
    proofUrl: SAMPLE_SCORECARD_PROOF,
    proofNotes: 'Club tournament official PDF export attached.',
    status: 'paid',
    submittedAt: '2026-08-31T22:45:00Z',
    reviewedAt: '2026-09-01T10:00:00Z'
  }
];
