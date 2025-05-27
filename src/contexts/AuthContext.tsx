"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // Helper function to ensure profile exists (non-blocking for existing users)
  const ensureProfileExists = async (
    user: User,
    isNewUser: boolean = false
  ) => {
    try {
      // For existing users, use a shorter timeout and make it truly non-blocking
      const timeoutDuration = isNewUser ? 10000 : 3000; // 10s for new users, 3s for existing

      const profileCheckPromise = (async () => {
        // Check if profile already exists
        const { data: existingProfile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          // PGRST116 is "not found" error, which is expected for new users
          console.error("Error checking profile:", profileError);
          return;
        }

        if (!existingProfile) {
          console.log("Creating new profile for user:", user.email);

          // Create user profile
          const { error } = await supabase.from("profiles").insert({
            id: user.id,
            email: user.email!,
            full_name:
              user.user_metadata?.full_name || user.user_metadata?.name || null,
            avatar_url:
              user.user_metadata?.avatar_url ||
              user.user_metadata?.picture ||
              null,
          });

          if (error) {
            console.error("Error creating profile:", error);
            return;
          }

          // Create default user settings
          const { error: settingsError } = await supabase
            .from("user_settings")
            .insert({
              user_id: user.id,
              pomodoro_minutes: 25,
              short_break_minutes: 5,
              long_break_minutes: 15,
              pomodoros_before_long_break: 4,
              auto_start_breaks: false,
              auto_start_pomodoros: false,
              notifications: true,
              timer_visibility: true,
              dot_size: 50,
            });

          if (settingsError) {
            console.error("Error creating user settings:", settingsError);
          } else {
            console.log("Profile and settings created successfully");
          }
        } else {
          console.log("Profile already exists for user:", user.email);
        }
      })();

      // For new users, wait for completion. For existing users, use timeout
      if (isNewUser) {
        await profileCheckPromise;
      } else {
        // For existing users, race with timeout but don't throw on timeout
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => {
            console.log(
              "Profile check timed out for existing user - continuing anyway"
            );
            resolve(null);
          }, timeoutDuration);
        });

        await Promise.race([profileCheckPromise, timeoutPromise]);
      }
    } catch (error) {
      console.error("Error ensuring profile exists:", error);
      // Don't throw - let the app continue
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error("Error getting session:", error);
        } else {
          console.log(
            "Initial session loaded:",
            session?.user?.email || "No session"
          );
          setSession(session);
          setUser(session?.user ?? null);

          // For existing users, run profile check in background (non-blocking)
          if (session?.user) {
            // Don't await this for existing users - let it run in background
            ensureProfileExists(session.user, false);
          }
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error);
      } finally {
        if (mounted) {
          setInitializing(false);
          setLoading(false);
        }
      }
    };

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log(
        "Auth event:",
        event,
        "Session:",
        session?.user?.email || "No session"
      );

      // Handle different auth events
      if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      // For all other events, update session and user
      setSession(session);
      setUser(session?.user ?? null);

      // IMMEDIATELY set window auth state for extension (before async operations)
      if (typeof window !== "undefined") {
        window.focusDotAuth = {
          isAuthenticated: !!session?.user,
          user: session?.user || null,
          session: session,
          lastUpdated: Date.now(),
        };

        console.log("FocusDot Dashboard: Auth state updated for extension", {
          isAuthenticated: !!session?.user,
          userEmail: session?.user?.email,
          event: event,
        });
      }

      // Handle profile creation for authenticated users
      if (session?.user) {
        if (event === "SIGNED_UP" || event === "SIGNED_IN") {
          // For new signups and sign-ins, ensure profile exists (blocking)
          try {
            await ensureProfileExists(session.user, true);
          } catch (error) {
            console.error("Error creating profile for new user:", error);
          }
        } else if (event === "TOKEN_REFRESHED" && initializing) {
          // For token refresh during initialization, run profile check in background
          ensureProfileExists(session.user, false);
        }

        // Dispatch custom event for FocusDot extension AFTER setting window object
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("focusdot:authChanged", {
              detail: {
                event,
                user: session?.user || null,
                session: session,
                isAuthenticated: !!session?.user,
              },
            })
          );

          console.log("FocusDot Dashboard: Custom auth event dispatched", {
            event,
            isAuthenticated: !!session?.user,
          });
        }
      } else {
        // Handle sign out case
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("focusdot:authChanged", {
              detail: {
                event,
                user: null,
                session: null,
                isAuthenticated: false,
              },
            })
          );
        }
      }

      setLoading(false);
    });

    // Start initialization
    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initializing]);

  const signOut = async () => {
    try {
      // Clear local state first to prevent UI issues
      setLoading(true);

      // Try to sign out from Supabase (use local scope to preserve other sessions)
      const { error } = await supabase.auth.signOut({ scope: "local" });

      if (error) {
        console.error("Error signing out:", error);
        // If local signout fails, try global signout as fallback
        try {
          await supabase.auth.signOut({ scope: "global" });
        } catch (globalError) {
          console.error("Global signout also failed:", globalError);
        }
      }

      // Clear local state regardless of Supabase response
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
      // Clear local state even if there's an unexpected error
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
      // Use router navigation instead of window.location for better UX
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
