"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, SkipForward, Settings } from "lucide-react";
import { formatTime, getTimerTypeLabel, getTimerTypeColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTimer } from "@/contexts/TimerContext";

export function TimerControl() {
  const { timerState, loading, startTimer, pauseTimer, resetTimer, skipTimer } =
    useTimer();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartPause = async () => {
    if (timerState.state === "running") {
      await pauseTimer();
    } else {
      await startTimer();
    }
  };

  const handleReset = async () => {
    await resetTimer();
  };

  const handleSkip = async () => {
    await skipTimer();
  };

  const progress =
    ((timerState.totalTime - timerState.timeRemaining) / timerState.totalTime) *
    100;

  if (!mounted || loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-6"></div>
          <div className="w-48 h-48 bg-gray-200 rounded-full mx-auto mb-8"></div>
          <div className="flex justify-center space-x-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Timer Control</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-8">
        <div
          className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4",
            getTimerTypeColor(timerState.timerType)
          )}
        >
          {getTimerTypeLabel(timerState.timerType)}
        </div>

        <div className="relative w-48 h-48 mx-auto mb-4">
          {/* Progress Circle */}
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className={cn(
                "transition-all duration-1000 ease-in-out",
                timerState.timerType === "pomodoro"
                  ? "text-red-500"
                  : timerState.timerType === "shortBreak"
                  ? "text-green-500"
                  : "text-blue-500"
              )}
              strokeLinecap="round"
            />
          </svg>

          {/* Timer Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {formatTime(timerState.timeRemaining)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                #{timerState.completedPomodoros + 1}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handleReset}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          title="Reset Timer"
        >
          <RotateCcw className="h-5 w-5" />
        </button>

        <button
          onClick={handleStartPause}
          className={cn(
            "p-4 rounded-full text-white transition-colors",
            timerState.timerType === "pomodoro"
              ? "bg-red-500 hover:bg-red-600"
              : timerState.timerType === "shortBreak"
              ? "bg-green-500 hover:bg-green-600"
              : "bg-blue-500 hover:bg-blue-600"
          )}
          title={timerState.state === "running" ? "Pause Timer" : "Start Timer"}
        >
          {timerState.state === "running" ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </button>

        <button
          onClick={handleSkip}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          title="Skip to Next Timer"
        >
          <SkipForward className="h-5 w-5" />
        </button>
      </div>

      {/* Session Info */}
      <div className="mt-6 text-center">
        <div className="text-sm text-gray-500">
          Completed today:{" "}
          <span className="font-medium text-gray-900">
            {timerState.completedPomodoros} pomodoros
          </span>
        </div>
      </div>
    </div>
  );
}
