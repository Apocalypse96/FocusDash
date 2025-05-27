import { supabase } from "./supabase";
import type { Database } from "./supabase";

// Type definitions for better type safety
type Tables = Database["public"]["Tables"];
type SessionRow = Tables["sessions"]["Row"];
type SessionInsert = Tables["sessions"]["Insert"];
type GoalRow = Tables["goals"]["Row"];
type GoalInsert = Tables["goals"]["Insert"];
type GoalUpdate = Tables["goals"]["Update"];
type UserSettingsRow = Tables["user_settings"]["Row"];
type UserSettingsUpdate = Tables["user_settings"]["Update"];

// ============================================================================
// PROFILE OPERATIONS
// ============================================================================

export async function createUserProfile(user: any) {
  try {
    console.log("Creating profile for user:", user);
    console.log("Current auth user:", await supabase.auth.getUser());

    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    console.log("Check existing profile result:", {
      existingProfile,
      checkError,
    });

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing profile:", checkError);
      return { error: checkError };
    }

    if (existingProfile) {
      console.log("Profile already exists");
      return { data: existingProfile };
    }

    // Create new profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        full_name:
          user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url:
          user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      })
      .select()
      .single();

    if (profileError) {
      console.error("Error creating profile:", profileError);
      return { error: profileError };
    }

    // Create default settings
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
      console.error("Error creating settings:", settingsError);
    }

    console.log("Profile created successfully:", profile);
    return { data: profile };
  } catch (error) {
    console.error("Unexpected error creating profile:", error);
    return { error };
  }
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return { data, error };
}

// ============================================================================
// SETTINGS OPERATIONS
// ============================================================================

export async function getUserSettings(userId: string) {
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  return { data, error };
}

export async function updateUserSettings(
  userId: string,
  settings: Partial<UserSettingsUpdate>
) {
  const { data, error } = await supabase
    .from("user_settings")
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  return { data, error };
}

// ============================================================================
// SESSION OPERATIONS
// ============================================================================

export async function createSession(
  userId: string,
  sessionData: Omit<SessionInsert, "user_id">
) {
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      ...sessionData,
      user_id: userId,
    })
    .select()
    .single();

  return { data, error };
}

export async function getUserSessions(userId: string, limit?: number) {
  let query = supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .order("start_time", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getSessionsInDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .gte("start_time", startDate.toISOString())
    .lte("start_time", endDate.toISOString())
    .order("start_time", { ascending: false });

  return { data, error };
}

export async function updateSession(
  sessionId: string,
  updates: Partial<SessionRow>
) {
  const { data, error } = await supabase
    .from("sessions")
    .update(updates)
    .eq("id", sessionId)
    .select()
    .single();

  return { data, error };
}

export async function deleteSession(sessionId: string) {
  const { data, error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId);

  return { data, error };
}

// ============================================================================
// GOALS OPERATIONS
// ============================================================================

export async function createGoal(
  userId: string,
  goalData: Omit<GoalInsert, "user_id">
) {
  const { data, error } = await supabase
    .from("goals")
    .insert({
      ...goalData,
      user_id: userId,
    })
    .select()
    .single();

  return { data, error };
}

export async function getUserGoals(userId: string) {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function getActiveGoals(userId: string) {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .eq("completed", false)
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function getCompletedGoals(userId: string) {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .eq("completed", true)
    .order("updated_at", { ascending: false });

  return { data, error };
}

export async function updateGoal(goalId: string, updates: Partial<GoalUpdate>) {
  const { data, error } = await supabase
    .from("goals")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", goalId)
    .select()
    .single();

  return { data, error };
}

export async function incrementGoalProgress(
  goalId: string,
  increment: number = 1
) {
  // First get the current goal to check progress
  const { data: goal, error: fetchError } = await supabase
    .from("goals")
    .select("current_pomodoros, target_pomodoros")
    .eq("id", goalId)
    .single();

  if (fetchError) {
    return { data: null, error: fetchError };
  }

  const newProgress = goal.current_pomodoros + increment;
  const isCompleted = newProgress >= goal.target_pomodoros;

  const { data, error } = await supabase
    .from("goals")
    .update({
      current_pomodoros: newProgress,
      completed: isCompleted,
      updated_at: new Date().toISOString(),
    })
    .eq("id", goalId)
    .select()
    .single();

  return { data, error };
}

export async function deleteGoal(goalId: string) {
  const { data, error } = await supabase
    .from("goals")
    .delete()
    .eq("id", goalId);

  return { data, error };
}

// ============================================================================
// STATS CALCULATIONS
// ============================================================================

export async function getDailyStats(userId: string, date: Date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const { data: sessions, error } = await getSessionsInDateRange(
    userId,
    dayStart,
    dayEnd
  );

  if (error) {
    return { data: null, error };
  }

  const totalPomodoros =
    sessions?.filter((s) => s.type === "pomodoro").length || 0;
  const completedPomodoros =
    sessions?.filter((s) => s.type === "pomodoro" && s.completed).length || 0;
  const totalFocusTime =
    sessions
      ?.filter((s) => s.type === "pomodoro" && s.completed)
      .reduce((sum, s) => sum + s.duration, 0) || 0;
  const totalBreakTime =
    sessions
      ?.filter((s) => s.type !== "pomodoro" && s.completed)
      .reduce((sum, s) => sum + s.duration, 0) || 0;

  const completionRate =
    totalPomodoros > 0
      ? Math.round((completedPomodoros / totalPomodoros) * 100)
      : 0;

  return {
    data: {
      date: date.toISOString().split("T")[0],
      totalPomodoros,
      completedPomodoros,
      totalFocusTime,
      totalBreakTime,
      completionRate,
      sessions: sessions || [],
    },
    error: null,
  };
}

export async function getWeeklyStats(userId: string, weekStart: Date) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const { data: sessions, error } = await getSessionsInDateRange(
    userId,
    weekStart,
    weekEnd
  );

  if (error) {
    return { data: null, error };
  }

  const totalPomodoros =
    sessions?.filter((s) => s.type === "pomodoro").length || 0;
  const completedPomodoros =
    sessions?.filter((s) => s.type === "pomodoro" && s.completed).length || 0;
  const totalFocusTime =
    sessions
      ?.filter((s) => s.type === "pomodoro" && s.completed)
      .reduce((sum, s) => sum + s.duration, 0) || 0;

  const averageSessionLength =
    completedPomodoros > 0
      ? Math.round(totalFocusTime / completedPomodoros)
      : 0;

  // Calculate daily stats for the week
  const dailyStats = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + i);

    const { data: dayStats } = await getDailyStats(userId, currentDate);
    if (dayStats) {
      dailyStats.push(dayStats);
    }
  }

  return {
    data: {
      weekStart: weekStart.toISOString().split("T")[0],
      totalPomodoros,
      completedPomodoros,
      totalFocusTime,
      averageSessionLength,
      dailyStats,
    },
    error: null,
  };
}

export async function getTodayStats(userId: string) {
  return getDailyStats(userId, new Date());
}

// ============================================================================
// TIMER STATE OPERATIONS (Real-time Synchronization)
// ============================================================================

type TimerStateRow = Tables["timer_state"]["Row"];
type TimerStateInsert = Tables["timer_state"]["Insert"];
type TimerStateUpdate = Tables["timer_state"]["Update"];

export async function getTimerState(userId: string) {
  const { data, error } = await supabase
    .from("timer_state")
    .select("*")
    .eq("user_id", userId)
    .single();

  return { data, error };
}

export async function upsertTimerState(
  userId: string,
  timerState: Omit<TimerStateInsert, "user_id">
) {
  const { data, error } = await supabase
    .from("timer_state")
    .upsert({
      ...timerState,
      user_id: userId,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  return { data, error };
}

export async function updateTimerState(
  userId: string,
  updates: Partial<TimerStateUpdate>
) {
  const { data, error } = await supabase
    .from("timer_state")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  return { data, error };
}

export async function deleteTimerState(userId: string) {
  const { data, error } = await supabase
    .from("timer_state")
    .delete()
    .eq("user_id", userId);

  return { data, error };
}

// Subscribe to timer state changes for real-time sync
export function subscribeToTimerState(
  userId: string,
  callback: (payload: any) => void
) {
  const subscription = supabase
    .channel(`timer_state:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "timer_state",
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();

  return subscription;
}

export async function getThisWeekStats(userId: string) {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
  weekStart.setHours(0, 0, 0, 0);

  return getWeeklyStats(userId, weekStart);
}
