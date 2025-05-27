"use client";

import { useState } from "react";
import {
  Home,
  BarChart3,
  Settings,
  Target,
  Clock,
  Menu,
  X,
  Github,
  ExternalLink,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: Home, current: true },
  { name: "Analytics", href: "/analytics", icon: BarChart3, current: false },
  { name: "Goals", href: "/goals", icon: Target, current: false },
  { name: "Sessions", href: "/sessions", icon: Clock, current: false },
  { name: "Settings", href: "/settings", icon: Settings, current: false },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
                <span className="text-sm font-bold text-white">🍅</span>
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900">
                FocusDot
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  item.current
                    ? "bg-red-50 border-red-500 text-red-700"
                    : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  "group flex items-center px-2 py-2 text-sm font-medium border-l-4 rounded-r-md"
                )}
              >
                <item.icon
                  className={cn(
                    item.current
                      ? "text-red-500"
                      : "text-gray-400 group-hover:text-gray-500",
                    "mr-3 h-5 w-5"
                  )}
                />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
              <span className="text-sm font-bold text-white">🍅</span>
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900">
              FocusDot
            </span>
          </div>
          <nav className="mt-8 flex-1 space-y-1 px-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  item.current
                    ? "bg-red-50 border-red-500 text-red-700"
                    : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  "group flex items-center px-2 py-2 text-sm font-medium border-l-4 rounded-r-md"
                )}
              >
                <item.icon
                  className={cn(
                    item.current
                      ? "text-red-500"
                      : "text-gray-400 group-hover:text-gray-500",
                    "mr-3 h-5 w-5"
                  )}
                />
                {item.name}
              </a>
            ))}
          </nav>

          {/* User Info */}
          <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                  <User className="h-4 w-4 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.email?.split("@")[0] || "User"}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={signOut}
                className="text-gray-400 hover:text-gray-600"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <a
                href="https://github.com/Apocalypse96/FocusDot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <Github className="h-4 w-4 mr-1" />
                Extension
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
              <span className="text-xs text-gray-400">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
                <span className="text-sm font-bold text-white">🍅</span>
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900">
                FocusDot
              </span>
            </div>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
