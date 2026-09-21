import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';


export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

/**
 * Register a new user account with Supabase Auth and initialize public profile.
 */
export async function signUpUser(
  email: string,
  password: string,
  fullName: string
): Promise<AuthResponse> {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Fetch or create public.profiles record
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const userProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: profile?.full_name || fullName || email.split('@')[0],
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
          role: (profile?.role as UserRole) || 'subscriber',
          subscriptionStatus: profile?.subscription_status || 'inactive',
          subscriptionTier: profile?.subscription_tier || 'monthly',
          nextRenewalDate: '2026-10-20',
          createdAt: profile?.created_at || new Date().toISOString(),
          lifetimeCharityContributed: 0,
          balanceWinnings: 0,
        };

        return { success: true, user: userProfile };
      }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error signing up.' };
    }
  }

  // Graceful offline fallback / demo registration
  const newId = `user-${Date.now()}`;
  const newUser: UserProfile = {
    id: newId,
    email,
    fullName: fullName || email.split('@')[0],
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    role: 'subscriber',
    subscriptionStatus: 'active',
    subscriptionTier: 'monthly',
    nextRenewalDate: '2026-10-20',
    createdAt: new Date().toISOString(),
    lifetimeCharityContributed: 0,
    balanceWinnings: 0,
  };

  const storedUsers = localStorage.getItem('dh_users');
  const userList: UserProfile[] = storedUsers ? JSON.parse(storedUsers) : [];
  userList.push(newUser);
  localStorage.setItem('dh_users', JSON.stringify(userList));

  return { success: true, user: newUser };
}

/**
 * Sign in existing user, fetch role ('subscriber' vs 'admin') and profile status.
 */
export async function signInUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Query public.profiles to verify role and subscription status
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileErr && profileErr.code !== 'PGRST116') {
          console.warn('Profile fetch notice:', profileErr);
        }

        const role: UserRole = (profile?.role as UserRole) || 'subscriber';
        const userProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: profile?.full_name || email.split('@')[0],
          avatarUrl:
            role === 'admin'
              ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          role,
          subscriptionStatus: profile?.subscription_status || 'active',
          subscriptionTier: profile?.subscription_tier || 'monthly',
          nextRenewalDate: '2026-10-20',
          createdAt: profile?.created_at || new Date().toISOString(),
          lifetimeCharityContributed: 340,
          balanceWinnings: 0,
        };

        return { success: true, user: userProfile };
      }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Authentication failed.' };
    }
  }

  // Local storage lookup
  const storedUsers = localStorage.getItem('dh_users');
  const userList: UserProfile[] = storedUsers ? JSON.parse(storedUsers) : [];
  const found = userList.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (found) {
    return { success: true, user: found };
  }

  return { success: false, error: 'No account found with this email. Please sign up first.' };
}

/**
 * Sign out the current user.
 */
export async function signOutUser(): Promise<{ success: boolean }> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }
  return { success: true };
}
