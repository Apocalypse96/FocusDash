export interface TimerState {
  type: 'pomodoro' | 'shortBreak' | 'longBreak';
  state: 'idle' | 'running' | 'paused';
  timeRemaining: number;
  totalTime: number;
}

export interface PomodoroSession {
  id: string;
  type: 'pomodoro' | 'shortBreak' | 'longBreak';
  startTime: Date;
  endTime: Date;
  duration: number;
  completed: boolean;
  interrupted?: boolean;
}

export interface DailyStats {
  date: string;
  totalPomodoros: number;
  totalFocusTime: number; // in minutes
  totalBreakTime: number; // in minutes
  completionRate: number; // percentage
  sessions: PomodoroSession[];
}

export interface WeeklyStats {
  weekStart: string;
  totalPomodoros: number;
  totalFocusTime: number;
  averageSessionLength: number;
  dailyStats: DailyStats[];
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetPomodoros: number;
  currentPomodoros: number;
  deadline?: Date;
  completed: boolean;
  createdAt: Date;
}

export interface Settings {
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  pomodorosBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  notifications: boolean;
  timerVisibility: boolean;
  dotSize: number;
}

export interface ExtensionMessage {
  action: string;
  data?: any;
}

export interface ExtensionResponse {
  success: boolean;
  data?: any;
  error?: string;
}
