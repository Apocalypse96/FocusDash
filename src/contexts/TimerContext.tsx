"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getTimerState,
  upsertTimerState,
  updateTimerState,
  subscribeToTimerState,
  createSession,
} from "@/lib/database";

interface TimerState {
  timerType: "pomodoro" | "shortBreak" | "longBreak";
  state: "idle" | "running" | "paused";
  timeRemaining: number; // seconds
  totalTime: number;
  startTime: Date | null;
  endTime: Date | null;
  completedPomodoros: number;
  sessionId: string | null;
}

interface TimerContextType {
  timerState: TimerState;
  loading: boolean;
  startTimer: () => Promise<void>;
  pauseTimer: () => Promise<void>;
  resetTimer: () => Promise<void>;
  skipTimer: () => Promise<void>;
  switchTimerType: (type: "pomodoro" | "shortBreak" | "longBreak") => Promise<void>;
}

const defaultTimerState: TimerState = {
  timerType: "pomodoro",
  state: "idle",
  timeRemaining: 25 * 60, // 25 minutes
  totalTime: 25 * 60,
  startTime: null,
  endTime: null,
  completedPomodoros: 0,
  sessionId: null,
};

const TimerContext = createContext<TimerContextType>({
  timerState: defaultTimerState,
  loading: true,
  startTimer: async () => {},
  pauseTimer: async () => {},
  resetTimer: async () => {},
  skipTimer: async () => {},
  switchTimerType: async () => {},
});

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
};

interface TimerProviderProps {
  children: React.ReactNode;
}

export const TimerProvider = ({ children }: TimerProviderProps) => {
  const { user } = useAuth();
  const [timerState, setTimerState] = useState<TimerState>(defaultTimerState);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionRef = useRef<any>(null);

  // Load initial timer state
  useEffect(() => {
    if (user) {
      loadTimerState();
      setupRealtimeSubscription();
    } else {
      setLoading(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [user]);

  // Update countdown when timer is running
  useEffect(() => {
    if (timerState.state === "running" && timerState.endTime) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const remaining = Math.max(0, Math.ceil((timerState.endTime!.getTime() - now.getTime()) / 1000));
        
        if (remaining <= 0) {
          handleTimerComplete();
        } else {
          setTimerState(prev => ({ ...prev, timeRemaining: remaining }));
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.state, timerState.endTime]);

  const loadTimerState = async () => {
    if (!user) return;

    try {
      const { data, error } = await getTimerState(user.id);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error("Error loading timer state:", error);
        return;
      }

      if (data) {
        const loadedState: TimerState = {
          timerType: data.timer_type,
          state: data.state,
          timeRemaining: data.time_remaining,
          totalTime: data.total_time,
          startTime: data.start_time ? new Date(data.start_time) : null,
          endTime: data.end_time ? new Date(data.end_time) : null,
          completedPomodoros: data.completed_pomodoros,
          sessionId: data.session_id,
        };

        // If timer was running, check if it should have completed
        if (loadedState.state === "running" && loadedState.endTime) {
          const now = new Date();
          if (now >= loadedState.endTime) {
            await handleTimerComplete();
            return;
          }
        }

        setTimerState(loadedState);
      }
    } catch (error) {
      console.error("Unexpected error loading timer state:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    subscriptionRef.current = subscribeToTimerState(user.id, (payload) => {
      console.log("Real-time timer update:", payload);
      
      if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
        const data = payload.new;
        const updatedState: TimerState = {
          timerType: data.timer_type,
          state: data.state,
          timeRemaining: data.time_remaining,
          totalTime: data.total_time,
          startTime: data.start_time ? new Date(data.start_time) : null,
          endTime: data.end_time ? new Date(data.end_time) : null,
          completedPomodoros: data.completed_pomodoros,
          sessionId: data.session_id,
        };
        
        setTimerState(updatedState);
      }
    });
  };

  const syncTimerState = async (updates: Partial<TimerState>) => {
    if (!user) return;

    const dbUpdates = {
      timer_type: updates.timerType || timerState.timerType,
      state: updates.state || timerState.state,
      time_remaining: updates.timeRemaining ?? timerState.timeRemaining,
      total_time: updates.totalTime ?? timerState.totalTime,
      start_time: updates.startTime?.toISOString() || timerState.startTime?.toISOString() || null,
      end_time: updates.endTime?.toISOString() || timerState.endTime?.toISOString() || null,
      completed_pomodoros: updates.completedPomodoros ?? timerState.completedPomodoros,
      session_id: updates.sessionId || timerState.sessionId,
    };

    const { error } = await upsertTimerState(user.id, dbUpdates);
    if (error) {
      console.error("Error syncing timer state:", error);
    }
  };

  const startTimer = async () => {
    const now = new Date();
    const endTime = new Date(now.getTime() + timerState.timeRemaining * 1000);
    
    const updates: Partial<TimerState> = {
      state: "running",
      startTime: now,
      endTime: endTime,
    };

    setTimerState(prev => ({ ...prev, ...updates }));
    await syncTimerState(updates);
  };

  const pauseTimer = async () => {
    const updates: Partial<TimerState> = {
      state: "paused",
      startTime: null,
      endTime: null,
    };

    setTimerState(prev => ({ ...prev, ...updates }));
    await syncTimerState(updates);
  };

  const resetTimer = async () => {
    const totalTime = getTimerDuration(timerState.timerType);
    const updates: Partial<TimerState> = {
      state: "idle",
      timeRemaining: totalTime,
      totalTime: totalTime,
      startTime: null,
      endTime: null,
      sessionId: null,
    };

    setTimerState(prev => ({ ...prev, ...updates }));
    await syncTimerState(updates);
  };

  const skipTimer = async () => {
    await handleTimerComplete();
  };

  const switchTimerType = async (type: "pomodoro" | "shortBreak" | "longBreak") => {
    const totalTime = getTimerDuration(type);
    const updates: Partial<TimerState> = {
      timerType: type,
      state: "idle",
      timeRemaining: totalTime,
      totalTime: totalTime,
      startTime: null,
      endTime: null,
      sessionId: null,
    };

    setTimerState(prev => ({ ...prev, ...updates }));
    await syncTimerState(updates);
  };

  const handleTimerComplete = async () => {
    // Save completed session if it was a pomodoro
    if (timerState.timerType === "pomodoro" && timerState.sessionId) {
      await createSession(user!.id, {
        type: "pomodoro",
        start_time: timerState.startTime!.toISOString(),
        end_time: new Date().toISOString(),
        duration: Math.round(timerState.totalTime / 60), // Convert to minutes
        completed: true,
        interrupted: false,
      });
    }

    // Determine next timer type
    let nextType: "pomodoro" | "shortBreak" | "longBreak" = "pomodoro";
    let newCompletedPomodoros = timerState.completedPomodoros;

    if (timerState.timerType === "pomodoro") {
      newCompletedPomodoros++;
      const isLongBreak = newCompletedPomodoros % 4 === 0;
      nextType = isLongBreak ? "longBreak" : "shortBreak";
    }

    const totalTime = getTimerDuration(nextType);
    const updates: Partial<TimerState> = {
      timerType: nextType,
      state: "idle",
      timeRemaining: totalTime,
      totalTime: totalTime,
      startTime: null,
      endTime: null,
      completedPomodoros: newCompletedPomodoros,
      sessionId: null,
    };

    setTimerState(prev => ({ ...prev, ...updates }));
    await syncTimerState(updates);
  };

  const getTimerDuration = (type: "pomodoro" | "shortBreak" | "longBreak"): number => {
    switch (type) {
      case "pomodoro": return 25 * 60; // 25 minutes
      case "shortBreak": return 5 * 60; // 5 minutes
      case "longBreak": return 15 * 60; // 15 minutes
      default: return 25 * 60;
    }
  };

  const value = {
    timerState,
    loading,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    switchTimerType,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};
