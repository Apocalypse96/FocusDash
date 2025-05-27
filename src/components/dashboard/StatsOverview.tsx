"use client";

import { useState, useEffect } from "react";
import { Clock, Target, TrendingUp, Calendar } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getTodayStats, getThisWeekStats } from "@/lib/database";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
}

function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
                {change && (
                  <div
                    className={`ml-2 flex items-baseline text-sm font-semibold ${
                      changeType === "positive"
                        ? "text-green-600"
                        : changeType === "negative"
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {change}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatsOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayPomodoros: 0,
    todayFocusTime: 0,
    weeklyPomodoros: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get today's stats
      const { data: todayData, error: todayError } = await getTodayStats(
        user.id
      );

      // Get this week's stats
      const { data: weekData, error: weekError } = await getThisWeekStats(
        user.id
      );

      if (todayError) {
        console.error("Error loading today stats:", todayError);
      }

      if (weekError) {
        console.error("Error loading week stats:", weekError);
      }

      // Update stats with real data
      setStats({
        todayPomodoros: todayData?.completedPomodoros || 0,
        todayFocusTime: todayData?.totalFocusTime || 0,
        weeklyPomodoros: weekData?.completedPomodoros || 0,
        completionRate: todayData?.completionRate || 0,
      });
    } catch (error) {
      console.error("Unexpected error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white overflow-hidden shadow rounded-lg animate-pulse"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-gray-300 rounded"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Today's Pomodoros"
        value={stats.todayPomodoros.toString()}
        icon={Target}
      />
      <StatCard
        title="Focus Time Today"
        value={formatDuration(stats.todayFocusTime)}
        icon={Clock}
      />
      <StatCard
        title="This Week"
        value={`${stats.weeklyPomodoros} sessions`}
        icon={Calendar}
      />
      <StatCard
        title="Completion Rate"
        value={`${stats.completionRate}%`}
        icon={TrendingUp}
      />
    </div>
  );
}
