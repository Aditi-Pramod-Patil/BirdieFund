import { createClient } from '@supabase/supabase-js';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'subscriber' | 'admin';
          subscription_status: 'active' | 'inactive' | 'canceled' | 'lapsed';
          subscription_tier: 'monthly' | 'yearly' | null;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'subscriber' | 'admin';
          subscription_status?: 'active' | 'inactive' | 'canceled' | 'lapsed';
          subscription_tier?: 'monthly' | 'yearly' | null;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'subscriber' | 'admin';
          subscription_status?: 'active' | 'inactive' | 'canceled' | 'lapsed';
          subscription_tier?: 'monthly' | 'yearly' | null;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      charities: {
        Row: {
          id: string;
          name: string;
          slug: string | null;
          description: string | null;
          logo_url: string | null;
          banner_url: string | null;
          category: string | null;
          is_featured: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string | null;
          description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          category?: string | null;
          is_featured?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string | null;
          description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          category?: string | null;
          is_featured?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      user_charities: {
        Row: {
          id: string;
          user_id: string;
          charity_id: string;
          contribution_percentage: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          charity_id: string;
          contribution_percentage?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          charity_id?: string;
          contribution_percentage?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      scores: {
        Row: {
          id: string;
          user_id: string;
          score_value: number;
          played_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          score_value: number;
          played_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          score_value?: number;
          played_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      draws: {
        Row: {
          id: string;
          draw_date: string;
          mode: 'random' | 'algorithmic';
          status: 'simulated' | 'published';
          winning_numbers: number[];
          total_prize_pool: number;
          jackpot_rollover_amount: number;
          published_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          draw_date: string;
          mode?: 'random' | 'algorithmic';
          status?: 'simulated' | 'published';
          winning_numbers?: number[];
          total_prize_pool?: number;
          jackpot_rollover_amount?: number;
          published_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          draw_date?: string;
          mode?: 'random' | 'algorithmic';
          status?: 'simulated' | 'published';
          winning_numbers?: number[];
          total_prize_pool?: number;
          jackpot_rollover_amount?: number;
          published_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      winners: {
        Row: {
          id: string;
          draw_id: string;
          user_id: string;
          match_tier: number;
          prize_amount: number;
          proof_screenshot_url: string | null;
          payout_status: 'pending' | 'approved' | 'paid' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          draw_id: string;
          user_id: string;
          match_tier: number;
          prize_amount: number;
          proof_screenshot_url?: string | null;
          payout_status?: 'pending' | 'approved' | 'paid' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          draw_id?: string;
          user_id?: string;
          match_tier?: number;
          prize_amount?: number;
          proof_screenshot_url?: string | null;
          payout_status?: 'pending' | 'approved' | 'paid' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'subscriber' | 'admin';
      subscription_status: 'active' | 'inactive' | 'canceled' | 'lapsed';
      subscription_tier: 'monthly' | 'yearly';
      draw_mode: 'random' | 'algorithmic';
      draw_status: 'simulated' | 'published';
      payout_status: 'pending' | 'approved' | 'paid' | 'rejected';
    };
  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key-here';

/**
 * Returns true if valid Supabase environment variables have been supplied.
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your-project-id') &&
    supabaseAnonKey !== 'your-supabase-anon-key-here' &&
    supabaseAnonKey.length > 20
  );
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
