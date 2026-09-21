import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DrawSimulationResult, DrawType, GolfScore, UserProfile } from '../types';


export interface RunDrawParams {
  mode: DrawType;
  drawDate?: string;
  totalPool?: number;
  allScores?: GolfScore[];
  allUsers?: UserProfile[];
}

/**
 * Runs monthly prize draw simulation (algorithmic weighted distribution vs uniform random).
 * Calculates winners across Tier 5 (40%), Tier 4 (35%), and Tier 3 (25%).
 * Implements jackpot rollover rule: if Tier 5 has 0 winners, 40% pool share rolls over.
 * Returns simulation summary object WITHOUT writing to published_at.
 */
export async function runDrawSimulation(params: RunDrawParams): Promise<DrawSimulationResult> {
  const { mode, drawDate = '2026-09-30', totalPool = 78500 } = params;

  let activeScores: GolfScore[] = params.allScores || [];
  let activeUsers: UserProfile[] = params.allUsers || [];

  // If Supabase configured and lists not provided, fetch from DB
  if (isSupabaseConfigured() && (!params.allScores || !params.allUsers)) {
    try {
      const [{ data: dbScores }, { data: dbProfiles }] = await Promise.all([
        supabase.from('scores').select('*'),
        supabase.from('profiles').select('*').eq('subscription_status', 'active'),
      ]);

      if (dbScores) {
        activeScores = dbScores.map(s => ({
          id: s.id,
          userId: s.user_id,
          scoreValue: s.score_value,
          playedAt: s.played_at,
          createdAt: s.created_at,
        }));
      }

      if (dbProfiles) {
        activeUsers = dbProfiles.map(p => ({
          id: p.id,
          email: p.email,
          fullName: p.full_name || p.email.split('@')[0],
          avatarUrl: '',
          role: p.role,
          subscriptionStatus: p.subscription_status,
          subscriptionTier: p.subscription_tier || 'monthly',
          nextRenewalDate: '',
          createdAt: p.created_at,
          lifetimeCharityContributed: 0,
          balanceWinnings: 0,
        }));
      }
    } catch (err) {
      console.error('Error fetching draw simulation data from Supabase:', err);
    }
  }

  // Fallback to local state if empty
  if (activeScores.length === 0) {
    const saved = localStorage.getItem('dh_scores');
    activeScores = saved ? JSON.parse(saved) : [];
  }
  if (activeUsers.length === 0) {
    const saved = localStorage.getItem('dh_users');
    activeUsers = saved ? JSON.parse(saved) : [];
  }

  let winningNumbers: number[] = [];

  if (mode === 'random') {
    // Pick 5 unique random numbers between 1 and 45
    const pool = Array.from({ length: 45 }, (_, i) => i + 1);
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    winningNumbers = shuffled.slice(0, 5).sort((a, b) => a - b);
  } else {
    // Mode 'algorithmic':
    // Calculate frequency weightings from actual user scores + Gaussian bell distribution centered around 36
    const frequencyMap: Record<number, number> = {};
    for (let i = 1; i <= 45; i++) {
      const distFromMean = Math.abs(i - 36);
      frequencyMap[i] = Math.max(1, 45 - distFromMean * 2.8);
    }

    activeScores.forEach(s => {
      if (s.scoreValue >= 1 && s.scoreValue <= 45) {
        frequencyMap[s.scoreValue] = (frequencyMap[s.scoreValue] || 1) + 18;
      }
    });

    // Weighted sampling without replacement
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

  // Winner Calculation
  const tier5Pool = totalPool * 0.40; // 40%
  const tier4Pool = totalPool * 0.35; // 35%
  const tier3Pool = totalPool * 0.25; // 25%

  const tier5Winners: { userId: string; name: string; numbers: number[]; payout: number }[] = [];
  const tier4Winners: { userId: string; name: string; numbers: number[]; payout: number }[] = [];
  const tier3Winners: { userId: string; name: string; numbers: number[]; payout: number }[] = [];

  const eligibleSubscribers = activeUsers.filter(u => u.subscriptionStatus === 'active');

  eligibleSubscribers.forEach(user => {
    const latest5Scores = activeScores
      .filter(s => s.userId === user.id)
      .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())
      .slice(0, 5)
      .map(s => s.scoreValue);

    const matched = latest5Scores.filter(num => winningNumbers.includes(num));
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
  // If Tier 5 has 0 winners, set jackpot_rollover = true / rollover amount = 40% pool share
  let jackpotRollover = 0;
  if (tier5Winners.length === 0) {
    jackpotRollover = tier5Pool;
  } else {
    const payout = tier5Pool / tier5Winners.length;
    tier5Winners.forEach(w => (w.payout = payout));
  }

  if (tier4Winners.length > 0) {
    const payout = tier4Pool / tier4Winners.length;
    tier4Winners.forEach(w => (w.payout = payout));
  }

  if (tier3Winners.length > 0) {
    const payout = tier3Pool / tier3Winners.length;
    tier3Winners.forEach(w => (w.payout = payout));
  }

  return {
    drawId: `draw-${drawDate.substring(0, 7)}`,
    drawDate,
    type: mode,
    winningNumbers,
    totalPool,
    tier5Pool,
    tier4Pool,
    tier3Pool,
    tier5Winners,
    tier4Winners,
    tier3Winners,
    jackpotRollover,
    simulatedAt: new Date().toISOString(),
  };
}

/**
 * Publishes official draw results to public.draws and inserts records into public.winners table.
 */
export async function publishOfficialDraw(
  simulation: DrawSimulationResult
): Promise<{ success: boolean; message: string }> {
  if (isSupabaseConfigured()) {
    try {
      // 1. Update public.draws
      const { error: drawErr } = await supabase
        .from('draws')
        .upsert({
          id: simulation.drawId.includes('-') && simulation.drawId.length === 36
            ? simulation.drawId
            : undefined,
          draw_date: simulation.drawDate,
          mode: simulation.type,
          status: 'published',
          winning_numbers: simulation.winningNumbers,
          total_prize_pool: simulation.totalPool,
          jackpot_rollover_amount: simulation.jackpotRollover,
          published_at: new Date().toISOString(),
        });

      if (drawErr) {
        console.error('Publish draw error:', drawErr);
      }

      // 2. Insert into public.winners with payout_status = 'pending'
      const allWinners = [
        ...simulation.tier5Winners.map(w => ({ ...w, tier: 5 as const })),
        ...simulation.tier4Winners.map(w => ({ ...w, tier: 4 as const })),
        ...simulation.tier3Winners.map(w => ({ ...w, tier: 3 as const })),
      ];

      for (const w of allWinners) {
        await supabase.from('winners').insert({
          draw_id: simulation.drawId,
          user_id: w.userId,
          match_tier: w.tier,
          prize_amount: w.payout,
          payout_status: 'pending',
        });
      }

      return {
        success: true,
        message: `Draw published with numbers [${simulation.winningNumbers.join(', ')}].`,
      };
    } catch (err: any) {
      console.error('Publish error:', err);
    }
  }

  return {
    success: true,
    message: `Draw published with numbers [${simulation.winningNumbers.join(', ')}].`,
  };
}
