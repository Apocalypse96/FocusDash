import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          type: "pomodoro" | "shortBreak" | "longBreak";
          start_time: string;
          end_time: string;
          duration: number;
          completed: boolean;
          interrupted: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "pomodoro" | "shortBreak" | "longBreak";
          start_time: string;
          end_time: string;
          duration: number;
          completed: boolean;
          interrupted?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "pomodoro" | "shortBreak" | "longBreak";
          start_time?: string;
          end_time?: string;
          duration?: number;
          completed?: boolean;
          interrupted?: boolean;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          target_pomodoros: number;
          current_pomodoros: number;
          deadline: string | null;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          target_pomodoros: number;
          current_pomodoros?: number;
          deadline?: string | null;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          target_pomodoros?: number;
          current_pomodoros?: number;
          deadline?: string | null;
          completed?: boolean;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          user_id: string;
          pomodoro_minutes: number;
          short_break_minutes: number;
          long_break_minutes: number;
          pomodoros_before_long_break: number;
          auto_start_breaks: boolean;
          auto_start_pomodoros: boolean;
          notifications: boolean;
          timer_visibility: boolean;
          dot_size: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          pomodoro_minutes?: number;
          short_break_minutes?: number;
          long_break_minutes?: number;
          pomodoros_before_long_break?: number;
          auto_start_breaks?: boolean;
          auto_start_pomodoros?: boolean;
          notifications?: boolean;
          timer_visibility?: boolean;
          dot_size?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          pomodoro_minutes?: number;
          short_break_minutes?: number;
          long_break_minutes?: number;
          pomodoros_before_long_break?: number;
          auto_start_breaks?: boolean;
          auto_start_pomodoros?: boolean;
          notifications?: boolean;
          timer_visibility?: boolean;
          dot_size?: number;
          updated_at?: string;
        };
      };
      timer_state: {
        Row: {
          user_id: string;
          timer_type: "pomodoro" | "shortBreak" | "longBreak";
          state: "idle" | "running" | "paused";
          time_remaining: number;
          total_time: number;
          start_time: string | null;
          end_time: string | null;
          completed_pomodoros: number;
          session_id: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          timer_type: "pomodoro" | "shortBreak" | "longBreak";
          state: "idle" | "running" | "paused";
          time_remaining?: number;
          total_time?: number;
          start_time?: string | null;
          end_time?: string | null;
          completed_pomodoros?: number;
          session_id?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          timer_type?: "pomodoro" | "shortBreak" | "longBreak";
          state?: "idle" | "running" | "paused";
          time_remaining?: number;
          total_time?: number;
          start_time?: string | null;
          end_time?: string | null;
          completed_pomodoros?: number;
          session_id?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}
