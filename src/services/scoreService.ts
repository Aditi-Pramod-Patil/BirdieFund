import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { GolfScore } from '../types';


export interface ScoreSubmissionResult {
  success: boolean;
  message: string;
  scores?: GolfScore[];
  droppedScore?: GolfScore;
}

/**
 * Validates and submits a golf Stableford score (1 - 45 pts, 1 per date per user).
 * Inserts into public.scores table where trigger `trg_enforce_rolling_five_scores` automatically
 * manages the rolling 5-score limit.
 * Returns the updated latest 5 scores sorted in reverse chronological order (`ORDER BY played_at DESC`).
 */
export async function submitGolfScore(
  userId: string,
  scoreValue: number,
  playedAtDate: string,
  courseName?: string
): Promise<ScoreSubmissionResult> {
  // 1. Validate score range (integer between 1 and 45)
  if (!Number.isInteger(scoreValue) || scoreValue < 1 || scoreValue > 45) {
    return {
      success: false,
      message: 'Stableford score must be an integer between 1 and 45 points.',
    };
  }

  // 2. Validate date format (YYYY-MM-DD)
  if (!playedAtDate || !/^\d{4}-\d{2}-\d{2}$/.test(playedAtDate)) {
    return {
      success: false,
      message: 'Please provide a valid round date in YYYY-MM-DD format.',
    };
  }

  // 3. Date Validation: Check if score already exists for this date for this user
  if (isSupabaseConfigured()) {
    try {
      const { data: existing, error: checkErr } = await supabase
        .from('scores')
        .select('id, score_value, played_at')
        .eq('user_id', userId)
        .eq('played_at', playedAtDate)
        .maybeSingle();

      if (checkErr) {
        console.error('Score date check error:', checkErr);
      }

      if (existing) {
        return {
          success: false,
          message: 'You have already logged a score for this date.',
        };
      }

      // 4. Execution: Insert into public.scores
      // The Postgres database trigger `trg_enforce_rolling_five_scores` will
      // automatically delete the oldest score if user count >= 5.
      const { error: insertErr } = await supabase
        .from('scores')
        .insert({
          user_id: userId,
          score_value: scoreValue,
          played_at: playedAtDate,
        });

      if (insertErr) {
        // Postgres UNIQUE constraint fallback catch
        if (insertErr.code === '23505') {
          return {
            success: false,
            message: 'You have already logged a score for this date.',
          };
        }
        return {
          success: false,
          message: insertErr.message || 'Failed to record golf score in database.',
        };
      }

      // 5. Query and return latest 5 scores sorted by played_at DESC
      const { data: latestScores, error: fetchErr } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .limit(5);

      if (fetchErr) {
        console.error('Error fetching latest scores:', fetchErr);
      }

      const formatted: GolfScore[] = (latestScores || []).map(s => ({
        id: s.id,
        userId: s.user_id,
        scoreValue: s.score_value,
        playedAt: s.played_at,
        courseName: courseName?.trim() || 'Apex Championship Links',
        createdAt: s.created_at,
      }));

      return {
        success: true,
        message: `Score of ${scoreValue} pts recorded! (${formatted.length}/5 rolling scores active)`,
        scores: formatted,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Database error while submitting score.',
      };
    }
  }

  // Graceful offline fallback / local mirror
  const storedScores = localStorage.getItem('dh_scores');
  const allScoresList: GolfScore[] = storedScores ? JSON.parse(storedScores) : [];
  const userCurrentScores = allScoresList
    .filter(s => s.userId === userId)
    .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());

  // Check date collision
  const collision = userCurrentScores.find(s => s.playedAt === playedAtDate);
  if (collision) {
    return {
      success: false,
      message: 'You have already logged a score for this date.',
    };
  }

  const newScoreObj: GolfScore = {
    id: `score-${Date.now()}`,
    userId,
    scoreValue,
    playedAt: playedAtDate,
    courseName: courseName?.trim() || 'Apex Championship Links',
    createdAt: new Date().toISOString(),
  };

  const updatedUserScores = [newScoreObj, ...userCurrentScores].sort(
    (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
  );

  let droppedScore: GolfScore | undefined;
  if (updatedUserScores.length > 5) {
    droppedScore = updatedUserScores.pop(); // drop oldest
  }

  const finalUserScores = updatedUserScores.slice(0, 5);
  const otherUsersScores = allScoresList.filter(s => s.userId !== userId);
  const newAllScores = [...otherUsersScores, ...finalUserScores];

  localStorage.setItem('dh_scores', JSON.stringify(newAllScores));

  const msg = droppedScore
    ? `Score added (${scoreValue} pts)! Rolling limit reached: oldest score (${droppedScore.scoreValue} pts on ${droppedScore.playedAt}) was replaced.`
    : `Score of ${scoreValue} pts logged successfully! (${finalUserScores.length}/5 rolling scores active)`;

  return {
    success: true,
    message: msg,
    scores: finalUserScores,
    droppedScore,
  };
}

/**
 * Fetch latest 5 scores for a user sorted by played_at DESC.
 */
export async function fetchUserScores(userId: string): Promise<GolfScore[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        return data.map(s => ({
          id: s.id,
          userId: s.user_id,
          scoreValue: s.score_value,
          playedAt: s.played_at,
          courseName: 'Apex Championship Links',
          createdAt: s.created_at,
        }));
      }
    } catch (err) {
      console.error('Fetch scores error:', err);
    }
  }

  const storedScores = localStorage.getItem('dh_scores');
  const allScoresList: GolfScore[] = storedScores ? JSON.parse(storedScores) : [];
  return allScoresList
    .filter(s => s.userId === userId)
    .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())
    .slice(0, 5);
}

/**
 * Delete a score from user's active rolling pool.
 */
export async function deleteGolfScore(scoreId: string): Promise<{ success: boolean; message: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('scores').delete().eq('id', scoreId);
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Score deleted from pool.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Error deleting score.' };
    }
  }

  const storedScores = localStorage.getItem('dh_scores');
  const allScoresList: GolfScore[] = storedScores ? JSON.parse(storedScores) : [];
  const filtered = allScoresList.filter(s => s.id !== scoreId);
  localStorage.setItem('dh_scores', JSON.stringify(filtered));
  return { success: true, message: 'Score deleted from pool.' };
}
