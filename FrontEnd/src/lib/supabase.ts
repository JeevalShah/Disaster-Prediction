import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'resident' | 'admin';
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: 'resident' | 'admin';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'resident' | 'admin';
          created_at?: string;
        };
      };
      photos: {
        Row: {
          id: string;
          user_id: string;
          photo_url: string;
          ai_result: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          photo_url: string;
          ai_result?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          photo_url?: string;
          ai_result?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};