"use client";

import React, { useState } from "react";
import SharedHeader from "../../components/ui/SharedHeader";
import RoomBuilder from "../../components/admin/RoomBuilder";
import { useSSEStream } from "../../hooks/useSSEStream";

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export default function SuperadminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sseStatus = useSSEStream(isAuthenticated ? password : "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError("");
    try {
      // Admin check
      const res = await fetch(`${API}/api/admin/registrations`, {
        headers: { Authorization: password },
      });
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        setError("Invalid superadmin password");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100 dark:bg-gray-950 dark:text-gray-100 dark:selection:bg-blue-900/30">
      <SharedHeader />
      
      {!isAuthenticated ? (
        <main className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-gray-50/50 p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900/50 backdrop-blur-xl">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Superadmin Access</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Enter the superadmin password to manage panel rooms.
            </p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter superadmin password"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !password}
                className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Access System"}
              </button>
              {error && <p className="text-center text-sm text-red-500">{error}</p>}
            </form>
          </div>
        </main>
      ) : (
        <main className="mx-auto w-full max-w-[1500px] px-4 pb-16 pt-28 md:px-8 md:pt-32">
          <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Superadmin Panel</h1>
                <div className="mt-1 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  SSE: {sseStatus}
                </div>
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Manage rooms and panels</p>
            </div>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
            >
              Sign out
            </button>
          </header>
          
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
            <RoomBuilder apiUrl={API} authToken={password} />
          </div>
        </main>
      )}
    </div>
  );
}
