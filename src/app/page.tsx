"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { TimerControl } from "@/components/dashboard/TimerControl";
// import { ProductivityChart } from "@/components/dashboard/ProductivityChart";
import { SessionHistory } from "@/components/dashboard/SessionHistory";
import { Goals } from "@/components/dashboard/Goals";
import { ExtensionStatus } from "@/components/dashboard/ExtensionStatus";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ClientOnly } from "@/components/ui/ClientOnly";
import { TestDataButton } from "@/components/debug/TestDataButton";

export default function Home() {
  const [isExtensionConnected, setIsExtensionConnected] = useState(false);

  useEffect(() => {
    // Check if extension is available
    const checkExtension = () => {
      if (
        typeof window !== "undefined" &&
        window.chrome &&
        window.chrome.runtime
      ) {
        setIsExtensionConnected(true);
      }
    };

    checkExtension();
  }, []);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                FocusDot Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Track your productivity and manage your focus sessions
              </p>
            </div>
            <ClientOnly
              fallback={
                <div className="h-10 w-48 bg-gray-200 animate-pulse rounded"></div>
              }
            >
              <ExtensionStatus isConnected={isExtensionConnected} />
            </ClientOnly>
          </div>

          {/* Stats Overview */}
          <ClientOnly
            fallback={
              <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
            }
          >
            <StatsOverview />
          </ClientOnly>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Timer Control */}
            <div className="lg:col-span-1">
              <ClientOnly
                fallback={
                  <div className="h-96 bg-gray-200 animate-pulse rounded"></div>
                }
              >
                <TimerControl />
              </ClientOnly>
            </div>

            {/* Productivity Chart - Temporarily disabled */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg p-6 h-96 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-lg font-medium mb-2">
                    Productivity Chart
                  </div>
                  <div className="text-sm">
                    Coming soon with real data integration
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Session History */}
            <ClientOnly
              fallback={
                <div className="h-80 bg-gray-200 animate-pulse rounded"></div>
              }
            >
              <SessionHistory />
            </ClientOnly>

            {/* Goals */}
            <ClientOnly
              fallback={
                <div className="h-80 bg-gray-200 animate-pulse rounded"></div>
              }
            >
              <Goals />
            </ClientOnly>
          </div>
        </div>

        {/* Test Data Button - Remove this in production */}
        <TestDataButton />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
