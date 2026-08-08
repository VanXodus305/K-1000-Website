"use client";

import React, { useState, useEffect } from "react";
import {
  LogOut,
  Clock,
  Grid,
  Radio,
  FileEdit,
  ShieldCheck,
} from "lucide-react";
import SharedHeader from "../../components/ui/SharedHeader";
import RoomBuilder from "../../components/admin/RoomBuilder";
import WaitingRoom from "../../components/admin/WaitingRoom";
import EvaluationForm from "../../components/panelist/EvaluationForm";
import { useSSEStream } from "../../hooks/useSSEStream";

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

type Tab = "evaluation" | "room_builder" | "waiting_room";

const tabLabels: Record<Tab, string> = {
  evaluation: "Evaluation",
  room_builder: "Panel Room Builder",
  waiting_room: "Waiting Room",
};

const panelistGroups = [
  "Internship: General Member",
  "Internship: Management",
  "Higher: General Member",
  "Higher: Management",
  "Events: General Member",
  "Events: Marketing",
  "Events: Photography and videograph",
  "Projects: Mentors",
  "Projects: Management",
  "Projects: General Member",
  "Projects: AI/ML",
  "Projects: Data Analyst",
  "Projects: IoT",
  "Projects: Linux",
  "Projects: Java",
  "Projects: Blockchain",
  "Projects: Web Development",
  "Projects: Data Analytics",
  "Training: General Member",
  "Training: App Development",
  "Training: Web Development",
  "Training: Game Development",
  "Training: Design & UI/UX",
  "Training: CyberSecurity",
  "Training: DSA&CP",
  "Training: Java",
  "Training: AI/ML",
  "Training: Data Analytics",
  "Research: Medical Imaging",
  "Research: Deep learning/ Machine learning",
  "Research: Astronomy/Space technology",
  "Research: Defence technology",
  "Research: Game theory",
  "Research: Finance and Economics",
  "Research: Quantum",
  "Research: Bio-Tech",
  "Finance: General Member",
  "Finance: Management",
  "Office: OSG",
  "Office: OTI",
  "Office: OCD",
  "Office: OPCR",
  "Office: OCA",
  "Office: OCC"
];

export default function PanelistPage() {
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("evaluation");

  // Load session on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("panelistSession");
      if (stored) {
        try {
          const { savedRole, savedPassword } = JSON.parse(stored);
          if (savedRole && savedPassword) {
            setRole(savedRole);
            setPassword(savedPassword);
            setIsAuthenticated(true);
          }
        } catch (e) {
          localStorage.removeItem("panelistSession");
        }
      }
    }
  }, []);

  const { status: sseStatus, lastCandidateStatusUpdate, lastPanelUpdate } = useSSEStream({
    apiUrl: API,
    authToken: password,
  });

  const fetchData = async (nextTab: Tab) => {
    setTab(nextTab);
    // Dynamic fetches handled inside components
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!password || !role) {
      setError("Please fill all fields.");
      return;
    }
    setLoading(true);
    setError("");
    fetch(`${API}/api/auth/panelist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, password }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success) {
          setIsAuthenticated(true);
          if (typeof window !== "undefined") {
            localStorage.setItem("panelistSession", JSON.stringify({ savedRole: role, savedPassword: password }));
          }
        } else {
          throw new Error(data.message || "Unauthorized");
        }
      })
      .catch((err) => setError(err.message || "Invalid password or unable to reach server."))
      .finally(() => setLoading(false));
  };

  const isLocked = !isAuthenticated;

  const closeSession = () => {
    setIsAuthenticated(false);
    setPassword("");
    setRole("");
    setError("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("panelistSession");
    }
  };

  const tabsList: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "evaluation", label: "Evaluation", icon: <FileEdit size={16} /> },
    { key: "room_builder", label: "Panel Room Builder", icon: <Grid size={16} /> },
    { key: "waiting_room", label: "Waiting Room", icon: <Clock size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-200 dark:bg-[#0a0a0f] dark:text-gray-100">
      <SharedHeader />

      {isLocked ? (
        <main className="mx-auto flex min-h-[100dvh] w-full max-w-lg items-center justify-center px-4 pb-16 pt-24">
          <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900 md:p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Panelist Console</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Sign in to evaluate candidates, manage interview panel rooms, and track real-time waiting queues.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Domain / Role
                </label>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:focus:border-blue-500 mb-4"
                >
                  <option value="" disabled>Select your domain / sub-domain</option>
                  {panelistGroups.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>

                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter panelist password"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !password || !role}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Authenticating..." : `View ${tabLabels[tab]}`}
              </button>
              {error ? <p className="text-center text-sm text-red-500">{error}</p> : null}
            </form>
          </div>
        </main>
      ) : (
        <main className="mx-auto w-full max-w-[1500px] px-4 pb-16 pt-28 md:px-8 md:pt-32">
          {/* Header section with live SSE status */}
          <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  {tabLabels[tab]}
                </h1>
                <div
                  className={`mt-1 flex items-center gap-2 rounded-full px-3 py-1 text-xs sm:mt-0 ${
                    sseStatus === "Connected"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : sseStatus === "Reconnecting" || sseStatus === "Connecting"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                      : sseStatus === "Polling"
                      ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400"
                      : "cursor-pointer bg-red-50 text-red-700 transition-colors hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/50"
                  }`}
                  title={sseStatus === "Error" ? "Click to reconnect SSE stream" : undefined}
                >
                  <span className="relative flex h-2.5 w-2.5">
                    {sseStatus === "Connected" && (
                      <>
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      </>
                    )}
                    {(sseStatus === "Reconnecting" || sseStatus === "Connecting") && (
                      <>
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
                      </>
                    )}
                    {sseStatus === "Polling" && (
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500" />
                    )}
                    {sseStatus === "Error" && (
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                    )}
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    <Radio size={12} /> {sseStatus === "Polling" ? "Fallback Polling" : `SSE: ${sseStatus}`}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Manage recruitment signals, interview panel rooms, and live candidate queues across all units.
              </p>
            </div>

            <button
              type="button"
              onClick={closeSession}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <LogOut size={16} /> Sign out
            </button>
          </header>

          {/* Navigation Tabs Bar */}
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
              {tabsList.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  disabled={loading}
                  onClick={() => fetchData(item.key)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    tab === item.key
                      ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[600px]">
            {tab === "evaluation" ? (
              <EvaluationForm 
                password={password} 
                role={role} 
                panelistName="Panelist" 
                panelistRoll="N/A" 
                livePanelUpdate={lastPanelUpdate}
              />
            ) : tab === "room_builder" ? (
              <RoomBuilder apiUrl={API} authToken={password} livePanelUpdate={lastPanelUpdate} panelistRole={role} />
            ) : tab === "waiting_room" ? (
              <WaitingRoom apiUrl={API} authToken={password} liveCandidateStatusUpdate={lastCandidateStatusUpdate} fixedDomainFilter={role} />
            ) : null}
          </div>
        </main>
      )}
    </div>
  );
}
