"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createSession, createGoal } from "@/lib/database";

export function TestDataButton() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createTestData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Create test sessions for today
      const today = new Date();
      const sessions = [];

      // Create 3 completed pomodoro sessions
      for (let i = 0; i < 3; i++) {
        const startTime = new Date(today);
        startTime.setHours(9 + i, 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 25);

        sessions.push({
          type: 'pomodoro' as const,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration: 25,
          completed: true,
          interrupted: false,
        });
      }

      // Create sessions
      for (const sessionData of sessions) {
        await createSession(user.id, sessionData);
      }

      // Create test goals
      const goals = [
        {
          title: 'Complete Dashboard Integration',
          description: 'Finish Phase 2 of the FocusDot dashboard',
          target_pomodoros: 10,
          current_pomodoros: 3,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          title: 'Daily Focus Goal',
          description: 'Complete 5 pomodoros today',
          target_pomodoros: 5,
          current_pomodoros: 3,
          deadline: new Date().toISOString(),
        },
      ];

      // Create goals
      for (const goalData of goals) {
        await createGoal(user.id, goalData);
      }

      console.log('✅ Test data created successfully!');
      alert('Test data created! Refresh the page to see the changes.');

    } catch (error) {
      console.error('Error creating test data:', error);
      alert('Error creating test data. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={createTestData}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg disabled:opacity-50"
      >
        {loading ? 'Creating...' : '🧪 Add Test Data'}
      </button>
    </div>
  );
}
