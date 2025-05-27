"use client";

import { useState, useEffect } from "react";
import { Target, Plus, CheckCircle, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from "@/lib/database";

interface Goal {
  id: string;
  title: string;
  description?: string;
  targetPomodoros: number;
  currentPomodoros: number;
  deadline?: Date;
  completed: boolean;
  createdAt: Date;
}

export function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetPomodoros: "",
    deadline: "",
  });

  // Load goals from database
  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await getUserGoals(user.id);

      if (error) {
        console.error("Error loading goals:", error);
        return;
      }

      // Transform database data to component format
      const transformedGoals: Goal[] = (data || []).map((goal) => ({
        id: goal.id,
        title: goal.title,
        description: goal.description || undefined,
        targetPomodoros: goal.target_pomodoros,
        currentPomodoros: goal.current_pomodoros,
        deadline: goal.deadline ? new Date(goal.deadline) : undefined,
        completed: goal.completed,
        createdAt: new Date(goal.created_at),
      }));

      setGoals(transformedGoals);
    } catch (error) {
      console.error("Unexpected error loading goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!user || !formData.title || !formData.targetPomodoros) return;

    try {
      const goalData = {
        title: formData.title,
        description: formData.description || null,
        target_pomodoros: parseInt(formData.targetPomodoros),
        deadline: formData.deadline
          ? new Date(formData.deadline).toISOString()
          : null,
      };

      const { data, error } = await createGoal(user.id, goalData);

      if (error) {
        console.error("Error creating goal:", error);
        return;
      }

      // Reload goals to get the updated list
      await loadGoals();

      // Reset form
      setFormData({
        title: "",
        description: "",
        targetPomodoros: "",
        deadline: "",
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Unexpected error creating goal:", error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const { error } = await deleteGoal(goalId);

      if (error) {
        console.error("Error deleting goal:", error);
        return;
      }

      // Remove from local state
      setGoals(goals.filter((goal) => goal.id !== goalId));
    } catch (error) {
      console.error("Unexpected error deleting goal:", error);
    }
  };

  const formatDeadline = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 0) return `${diffDays} days left`;
    return `${Math.abs(diffDays)} days overdue`;
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const activeGoals = goals.filter((goal) => !goal.completed);
  const completedGoals = goals.filter((goal) => goal.completed);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Target className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Goals</h3>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Goal
        </button>
      </div>

      {/* Add Goal Form */}
      {showAddForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Create New Goal
          </h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Goal title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            />
            <textarea
              placeholder="Description (optional)"
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            />
            <div className="flex space-x-3">
              <input
                type="number"
                placeholder="Target pomodoros"
                min="1"
                value={formData.targetPomodoros}
                onChange={(e) =>
                  setFormData({ ...formData, targetPomodoros: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({
                    title: "",
                    description: "",
                    targetPomodoros: "",
                    deadline: "",
                  });
                }}
                className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGoal}
                disabled={!formData.title || !formData.targetPomodoros}
                className="px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Goals */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p>Loading goals...</p>
          </div>
        ) : activeGoals.length === 0 && !showAddForm ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No active goals</p>
            <p className="text-sm">Create a goal to track your progress</p>
          </div>
        ) : (
          activeGoals.map((goal) => (
            <div
              key={goal.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {goal.title}
                  </h4>
                  {goal.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {goal.description}
                    </p>
                  )}
                </div>
                {goal.deadline && (
                  <div className="flex items-center text-xs text-gray-500 ml-4">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDeadline(goal.deadline)}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-gray-900">
                    {goal.currentPomodoros} / {goal.targetPomodoros} pomodoros
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      getProgressColor(
                        goal.currentPomodoros,
                        goal.targetPomodoros
                      )
                    )}
                    style={{
                      width: `${Math.min(
                        (goal.currentPomodoros / goal.targetPomodoros) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {Math.round(
                    (goal.currentPomodoros / goal.targetPomodoros) * 100
                  )}
                  % complete
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {goal.targetPomodoros - goal.currentPomodoros} remaining
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Completed Goals
          </h4>
          <div className="space-y-2">
            {completedGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center justify-between p-2 bg-green-50 rounded-md"
              >
                <span className="text-sm text-gray-900">{goal.title}</span>
                <span className="text-xs text-green-600 font-medium">
                  {goal.targetPomodoros} pomodoros
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
