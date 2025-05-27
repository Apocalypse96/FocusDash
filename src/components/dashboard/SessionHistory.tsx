"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, Filter } from "lucide-react";
import {
  getTimerTypeLabel,
  getTimerTypeColor,
  formatDuration,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getUserSessions } from "@/lib/database";

interface Session {
  id: string;
  type: "pomodoro" | "shortBreak" | "longBreak";
  startTime: Date;
  endTime: Date;
  duration: number;
  completed: boolean;
  interrupted?: boolean;
}

export function SessionHistory() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pomodoro" | "break">("all");

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get recent sessions (limit to 20 for performance)
      const { data, error } = await getUserSessions(user.id, 20);

      if (error) {
        console.error("Error loading sessions:", error);
        return;
      }

      // Transform database data to component format
      const transformedSessions: Session[] = (data || []).map((session) => ({
        id: session.id,
        type: session.type as "pomodoro" | "shortBreak" | "longBreak",
        startTime: new Date(session.start_time),
        endTime: new Date(session.end_time),
        duration: session.duration,
        completed: session.completed,
        interrupted: session.interrupted || false,
      }));

      setSessions(transformedSessions);
    } catch (error) {
      console.error("Unexpected error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter((session) => {
    if (filter === "all") return true;
    if (filter === "pomodoro") return session.type === "pomodoro";
    if (filter === "break") return session.type !== "pomodoro";
    return true;
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Recent Sessions</h3>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">All Sessions</option>
            <option value="pomodoro">Pomodoros</option>
            <option value="break">Breaks</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg animate-pulse"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-32"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-300 rounded w-12 mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No sessions found</p>
            <p className="text-sm">
              Start a pomodoro to see your session history
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full",
                    session.completed ? "bg-green-100" : "bg-red-100"
                  )}
                >
                  {session.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                        getTimerTypeColor(session.type)
                      )}
                    >
                      {getTimerTypeLabel(session.type)}
                    </span>
                    {session.interrupted && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Interrupted
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {formatTime(session.startTime)} -{" "}
                    {formatTime(session.endTime)}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {formatDuration(session.duration)}
                </div>
                <div className="text-xs text-gray-500">
                  {session.completed ? "Completed" : "Incomplete"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredSessions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-500">
            <span>
              {filteredSessions.filter((s) => s.completed).length} of{" "}
              {filteredSessions.length} completed
            </span>
            <span>
              Total:{" "}
              {formatDuration(
                filteredSessions.reduce(
                  (sum, s) => sum + (s.completed ? s.duration : 0),
                  0
                )
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
