"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createUserProfile, getUserProfile } from "@/lib/database";
import { supabase } from "@/lib/supabase";

export function UserDebug() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkProfile();
    }
  }, [user]);

  const checkProfile = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await getUserProfile(user.id);

    if (error) {
      console.error("Error fetching profile:", error);
    }

    setProfile(data);
    setLoading(false);
  };

  const handleCreateProfile = async () => {
    if (!user) return;

    setLoading(true);
    const result = await createUserProfile(user);

    if (result.error) {
      console.error("Error creating profile:", result.error);
      alert("Error creating profile: " + result.error.message);
    } else {
      console.log("Profile created:", result.data);
      alert("Profile created successfully!");
      checkProfile();
    }

    setLoading(false);
  };

  const checkTables = async () => {
    try {
      console.log("Checking tables...");
      console.log("Current user:", user);
      console.log("Supabase auth:", await supabase.auth.getUser());

      // Check if tables exist and are accessible
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .limit(1);

      const { data: settings, error: settingsError } = await supabase
        .from("user_settings")
        .select("*")
        .limit(1);

      console.log("Tables check results:");
      console.log("Profiles:", { data: profiles, error: profilesError });
      console.log("Settings:", { data: settings, error: settingsError });

      const profileStatus = profilesError
        ? `ERROR: ${profilesError.message}`
        : "OK";
      const settingsStatus = settingsError
        ? `ERROR: ${settingsError.message}`
        : "OK";

      alert(
        `Tables check:\nProfiles: ${profileStatus}\nSettings: ${settingsStatus}\n\nCheck console for details.`
      );
    } catch (error) {
      console.error("Error checking tables:", error);
      alert("Error checking tables: " + error);
    }
  };

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          Debug Panel
        </h3>
        <p className="text-yellow-700">No user logged in</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium text-blue-800 mb-4">Debug Panel</h3>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-blue-700">User Info:</h4>
          <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto">
            {JSON.stringify(
              {
                id: user.id,
                email: user.email,
                metadata: user.user_metadata,
              },
              null,
              2
            )}
          </pre>
        </div>

        <div>
          <h4 className="font-medium text-blue-700">Profile Status:</h4>
          <p className="text-sm">
            {loading
              ? "Loading..."
              : profile
              ? "✅ Profile exists"
              : "❌ No profile found"}
          </p>
          {profile && (
            <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(profile, null, 2)}
            </pre>
          )}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleCreateProfile}
            disabled={loading}
            className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Profile"}
          </button>

          <button
            onClick={checkProfile}
            disabled={loading}
            className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 disabled:opacity-50"
          >
            Refresh
          </button>

          <button
            onClick={checkTables}
            className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Check Tables
          </button>
        </div>
      </div>
    </div>
  );
}
