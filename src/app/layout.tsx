import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { TimerProvider } from "@/contexts/TimerContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FocusDot Dashboard - Productivity Analytics & Control",
  description:
    "Comprehensive dashboard for FocusDot Pomodoro extension with analytics, session management, and productivity insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased bg-gray-50`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <TimerProvider>{children}</TimerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
