"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Calendar, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getDailyStats } from "@/lib/database";

interface ChartData {
  date: string;
  pomodoros: number;
  focusTime: number;
  completionRate: number;
}

export function ProductivityChart() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<"pomodoros" | "time">("pomodoros");

  useEffect(() => {
    if (user) {
      loadChartData();
    }
  }, [user]);

  const loadChartData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const chartData: ChartData[] = [];
      const today = new Date();

      // Get data for the last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const { data: dayStats, error } = await getDailyStats(user.id, date);

        if (error) {
          console.error(
            `Error loading stats for ${date.toDateString()}:`,
            error
          );
          continue;
        }

        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

        chartData.push({
          date: dayName,
          pomodoros: dayStats?.completedPomodoros || 0,
          focusTime:
            Math.round(((dayStats?.totalFocusTime || 0) / 60) * 10) / 10, // Convert to hours
          completionRate: dayStats?.completionRate || 0,
        });
      }

      setChartData(chartData);
    } catch (error) {
      console.error("Unexpected error loading chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {viewType === "pomodoros" ? (
            <>
              <p className="text-red-600">
                Pomodoros:{" "}
                <span className="font-medium">{payload[0]?.value || 0}</span>
              </p>
              {payload[0]?.payload && (
                <p className="text-gray-600">
                  Completion:{" "}
                  <span className="font-medium">
                    {payload[0].payload.completionRate}%
                  </span>
                </p>
              )}
            </>
          ) : (
            <p className="text-blue-600">
              Focus Time:{" "}
              <span className="font-medium">{payload[0]?.value || 0}h</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">
            Productivity Trends
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center text-sm text-gray-500 mr-4">
            <Calendar className="h-4 w-4 mr-1" />
            Last 7 days
          </div>

          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewType("pomodoros")}
              className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                viewType === "pomodoros"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Sessions
            </button>
            <button
              onClick={() => setViewType("time")}
              className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                viewType === "time"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Time
            </button>
          </div>
        </div>
      </div>

      <div className="h-80">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {viewType === "pomodoros" ? (
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="pomodoros"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  name="Pomodoros"
                />
              </BarChart>
            ) : (
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="focusTime"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: "#3B82F6", strokeWidth: 2 }}
                  name="Focus Time (hours)"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {chartData.reduce((sum, day) => sum + day.pomodoros, 0)}
          </div>
          <div className="text-sm text-gray-500">Total Sessions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(
              chartData.reduce((sum, day) => sum + day.focusTime, 0) * 10
            ) / 10}
            h
          </div>
          <div className="text-sm text-gray-500">Focus Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(
              chartData.reduce((sum, day) => sum + day.completionRate, 0) /
                chartData.length
            )}
            %
          </div>
          <div className="text-sm text-gray-500">Avg. Completion</div>
        </div>
      </div>
    </div>
  );
}
