import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function getTimerTypeLabel(type: string): string {
  switch (type) {
    case "pomodoro":
      return "Focus Time";
    case "shortBreak":
      return "Short Break";
    case "longBreak":
      return "Long Break";
    default:
      return "Timer";
  }
}

export function getTimerTypeColor(type: string): string {
  switch (type) {
    case "pomodoro":
      return "text-red-600 bg-red-50 border-red-200";
    case "shortBreak":
      return "text-green-600 bg-green-50 border-green-200";
    case "longBreak":
      return "text-blue-600 bg-blue-50 border-blue-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

export function generateMockData() {
  // Use completely static data to avoid hydration issues
  const sessions = [];
  const baseDate = new Date("2024-05-16"); // Fixed base date

  // Generate mock sessions for the last 7 days with fixed data
  const mockSessionsData = [
    {
      dayOffset: 6,
      sessions: [
        { hour: 9, minute: 15, type: "pomodoro", completed: true },
        { hour: 10, minute: 0, type: "shortBreak", completed: true },
        { hour: 10, minute: 30, type: "pomodoro", completed: true },
        { hour: 11, minute: 15, type: "shortBreak", completed: true },
        { hour: 14, minute: 0, type: "pomodoro", completed: false },
      ],
    },
    {
      dayOffset: 5,
      sessions: [
        { hour: 9, minute: 0, type: "pomodoro", completed: true },
        { hour: 9, minute: 45, type: "shortBreak", completed: true },
        { hour: 10, minute: 15, type: "pomodoro", completed: true },
        { hour: 11, minute: 0, type: "longBreak", completed: true },
        { hour: 14, minute: 30, type: "pomodoro", completed: true },
        { hour: 15, minute: 15, type: "shortBreak", completed: true },
      ],
    },
    {
      dayOffset: 4,
      sessions: [
        { hour: 8, minute: 30, type: "pomodoro", completed: true },
        { hour: 9, minute: 15, type: "shortBreak", completed: true },
        { hour: 10, minute: 0, type: "pomodoro", completed: true },
        { hour: 11, minute: 30, type: "pomodoro", completed: true },
      ],
    },
    {
      dayOffset: 3,
      sessions: [
        { hour: 9, minute: 0, type: "pomodoro", completed: true },
        { hour: 9, minute: 45, type: "shortBreak", completed: true },
        { hour: 10, minute: 15, type: "pomodoro", completed: true },
        { hour: 11, minute: 0, type: "shortBreak", completed: true },
        { hour: 14, minute: 0, type: "pomodoro", completed: true },
        { hour: 14, minute: 45, type: "longBreak", completed: true },
        { hour: 16, minute: 0, type: "pomodoro", completed: false },
      ],
    },
    {
      dayOffset: 2,
      sessions: [
        { hour: 9, minute: 30, type: "pomodoro", completed: true },
        { hour: 10, minute: 15, type: "shortBreak", completed: true },
        { hour: 11, minute: 0, type: "pomodoro", completed: true },
        { hour: 15, minute: 0, type: "pomodoro", completed: true },
      ],
    },
    {
      dayOffset: 1,
      sessions: [
        { hour: 8, minute: 45, type: "pomodoro", completed: true },
        { hour: 9, minute: 30, type: "shortBreak", completed: true },
        { hour: 10, minute: 0, type: "pomodoro", completed: true },
        { hour: 10, minute: 45, type: "shortBreak", completed: true },
        { hour: 11, minute: 15, type: "pomodoro", completed: true },
        { hour: 14, minute: 30, type: "pomodoro", completed: true },
      ],
    },
    {
      dayOffset: 0,
      sessions: [
        { hour: 9, minute: 0, type: "pomodoro", completed: true },
        { hour: 9, minute: 45, type: "shortBreak", completed: true },
        { hour: 10, minute: 15, type: "pomodoro", completed: true },
        { hour: 11, minute: 0, type: "shortBreak", completed: true },
        { hour: 14, minute: 0, type: "pomodoro", completed: false },
      ],
    },
  ];

  mockSessionsData.forEach((dayData, dayIndex) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + dayData.dayOffset);

    dayData.sessions.forEach((sessionData, sessionIndex) => {
      const startTime = new Date(date);
      startTime.setHours(sessionData.hour, sessionData.minute, 0, 0);

      const duration =
        sessionData.type === "pomodoro"
          ? 25
          : sessionData.type === "shortBreak"
          ? 5
          : 15;

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + duration);

      sessions.push({
        id: `session-${dayIndex}-${sessionIndex}`,
        type: sessionData.type,
        startTime,
        endTime,
        duration,
        completed: sessionData.completed,
        interrupted: !sessionData.completed,
      });
    });
  });

  return sessions;
}

export function calculateDailyStats(sessions: any[], date: Date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const daySessions = sessions.filter(
    (session) => session.startTime >= dayStart && session.startTime <= dayEnd
  );

  const totalPomodoros = daySessions.filter(
    (s) => s.type === "pomodoro"
  ).length;
  const completedPomodoros = daySessions.filter(
    (s) => s.type === "pomodoro" && s.completed
  ).length;
  const totalFocusTime = daySessions
    .filter((s) => s.type === "pomodoro" && s.completed)
    .reduce((sum, s) => sum + s.duration, 0);
  const totalBreakTime = daySessions
    .filter((s) => s.type !== "pomodoro" && s.completed)
    .reduce((sum, s) => sum + s.duration, 0);

  return {
    date: date.toISOString().split("T")[0],
    totalPomodoros,
    totalFocusTime,
    totalBreakTime,
    completionRate:
      totalPomodoros > 0 ? (completedPomodoros / totalPomodoros) * 100 : 0,
    sessions: daySessions,
  };
}
