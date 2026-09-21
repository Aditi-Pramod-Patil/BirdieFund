import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Charity, UserCharityAllocation } from '../types';
import { INITIAL_CHARITIES } from '../data/mockData';

export interface CharityFilterOptions {
  searchTerm?: string;
  category?: string;
}

/**
 * Retrieves all charities for discovery with optional search term and category filters.
 */
export async function fetchCharities(options?: CharityFilterOptions): Promise<Charity[]> {
  const { searchTerm, category } = options || {};

  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('charities').select('*');

      if (category && category !== 'All Categories') {
        query = query.eq('category', category);
      }

      if (searchTerm && searchTerm.trim() !== '') {
        query = query.ilike('name', `%${searchTerm.trim()}%`);
      }

      const { data, error } = await query.order('is_featured', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(c => ({
          id: c.id,
          title: c.name,
          category: (c.category as any) || 'Environment',
          description: c.description || '',
          longDescription: c.description || '',
          imageUrl: c.logo_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
          bannerUrl: c.banner_url || 'https://images.unsplash.com/photo-1484291470158-b8f8d608850d?auto=format&fit=crop&w=1200&q=80',
          isFeatured: c.is_featured,
          isVerified: true,
          totalRaised: 38400,
          goalAmount: 50000,
          efficiencyScore: 92,
          events: [],
        }));
      }
    } catch (err) {
      console.error('Fetch charities error:', err);
    }
  }

  // Graceful offline fallback
  const stored = localStorage.getItem('dh_charities');
  let list: Charity[] = stored ? JSON.parse(stored) : INITIAL_CHARITIES;

  if (category && category !== 'All Categories') {
    list = list.filter(c => c.category.toLowerCase() === category.toLowerCase());
  }

  if (searchTerm && searchTerm.trim() !== '') {
    const term = searchTerm.toLowerCase();
    list = list.filter(
      c => c.title.toLowerCase().includes(term) || c.description.toLowerCase().includes(term)
    );
  }

  return list;
}

/**
 * Updates or creates subscriber's selected charity allocation.
 * Enforces contributionPercentage >= 10 and <= 100.
 * Updates user_charities table.
 */
export async function updateUserCharity(
  userId: string,
  charityId: string,
  contributionPercentage: number
): Promise<{ success: boolean; message: string; allocation?: UserCharityAllocation }> {
  // Enforce minimum 10% allocation constraint
  if (contributionPercentage < 10) {
    return {
      success: false,
      message: 'Charity fee contribution must be at least 10%.',
    };
  }
  if (contributionPercentage > 100) {
    return {
      success: false,
      message: 'Charity fee contribution cannot exceed 100%.',
    };
  }

  const safePct = Math.round(contributionPercentage);

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('user_charities')
        .upsert(
          {
            user_id: userId,
            charity_id: charityId,
            contribution_percentage: safePct,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) {
        return { success: false, message: error.message };
      }

      return {
        success: true,
        message: `Charity allocation updated to ${safePct}%.`,
        allocation: {
          userId: data.user_id,
          charityId: data.charity_id,
          contributionPercentage: Number(data.contribution_percentage),
          updatedAt: data.updated_at,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Database error updating charity allocation.',
      };
    }
  }

  // Graceful offline fallback
  localStorage.setItem('dh_selected_charity', charityId);
  localStorage.setItem('dh_charity_pct', safePct.toString());

  return {
    success: true,
    message: `Charity allocation updated to ${safePct}%.`,
    allocation: {
      userId,
      charityId,
      contributionPercentage: safePct,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Fetch a user's active charity allocation.
 */
export async function fetchUserCharityAllocation(
  userId: string
): Promise<UserCharityAllocation | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('user_charities')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        return {
          userId: data.user_id,
          charityId: data.charity_id,
          contributionPercentage: Number(data.contribution_percentage),
          updatedAt: data.updated_at,
        };
      }
    } catch (err) {
      console.error('Fetch allocation error:', err);
    }
  }

  const charityId = localStorage.getItem('dh_selected_charity') || 'charity-1';
  const pct = Number(localStorage.getItem('dh_charity_pct')) || 25;

  return {
    userId,
    charityId,
    contributionPercentage: pct,
    updatedAt: new Date().toISOString(),
  };
}
