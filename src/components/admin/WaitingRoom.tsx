"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Users,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  Tv,
  RefreshCw,
  X,
  UserCheck,
  Building,
} from "lucide-react";
import { WaitingCandidate, CandidateStatusUpdatedPayload, Panel } from "../../types/admin";
import { domains } from "../../data/domain";
import { offices } from "../../data/offices";

interface WaitingRoomProps {
  apiUrl: string;
  authToken: string;
  liveCandidateStatusUpdate?: CandidateStatusUpdatedPayload | null;
  fixedDomainFilter?: string;
}

const domainLabels: Record<string, string> = {};
for (const domain of domains) domainLabels[domain.key] = domain.title;
for (const office of offices) domainLabels[office.key] = office.title;

function getDomainLabel(key: string) {
  return domainLabels[key] || key;
}

function getDomainList(value: string) {
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

function formatRelativeTime(dateString: string) {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export default function WaitingRoom({ apiUrl, authToken, liveCandidateStatusUpdate, fixedDomainFilter }: WaitingRoomProps) {
  const [candidates, setCandidates] = useState<WaitingCandidate[]>([]);
  const [availablePanels, setAvailablePanels] = useState<Panel[]>([]);
  const [selectedPanels, setSelectedPanels] = useState<Record<number, number>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  
  const [manualRoll, setManualRoll] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualRoll.trim()) return;
    setIsAdding(true);
    setError("");
    setSuccessMessage("");
    try {
      const rollRes = await fetch(`${apiUrl}/api/registration/by-roll/${manualRoll.trim()}`, { 
        headers: { Authorization: authToken },
        cache: "no-store",
      });
      const rollData = await rollRes.json();
      
      if (rollData.success && rollData.data) {
        const candidateId = rollData.data.id;
        const updateRes = await fetch(`${apiUrl}/api/registration/${candidateId}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: authToken },
          body: JSON.stringify({ status: "waiting" })
        });
        const updateData = await updateRes.json();
        if (updateData.success) {
          // Free the candidate from any ghost panels they might be stuck in
          const ghostPanels = availablePanels.filter(p => p.current_candidate_id === candidateId);
          for (const p of ghostPanels) {
            await fetch(`${apiUrl}/api/panels/${p.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json", Authorization: authToken },
              body: JSON.stringify({ status: "empty", current_candidate_id: null })
            });
          }

          setSuccessMessage(`Candidate ${rollData.data.full_name} added to waiting queue.`);
          setManualRoll("");
          fetchWaitingCandidates();
          if (ghostPanels.length > 0) fetchPanels();
        } else {
          setError(updateData.message || "Failed to update status to waiting.");
        }
      } else {
        setError(rollData.message || "Candidate not found with this roll number.");
      }
    } catch {
      setError("Network error while adding candidate manually.");
    } finally {
      setIsAdding(false);
    }
  };

  // Fetch Waiting Candidates from REST API
  const fetchWaitingCandidates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/registrations?status=waiting`, {
        headers: { Authorization: authToken },
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCandidates(data.data);
      } else {
        setError(data.message || "Failed to fetch waiting candidates queue.");
      }
    } catch {
      setError("Unable to connect to backend server for waiting queue.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, authToken]);

  // Fetch Panels for Quick Assignment
  const fetchPanels = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/panels`, {
        headers: { Authorization: authToken },
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAvailablePanels(data.data);
      }
    } catch (err) {
      console.error("Error fetching panels for assignment:", err);
    }
  }, [apiUrl, authToken]);

  useEffect(() => {
    fetchWaitingCandidates();
    fetchPanels();

    // Fallback polling interval (since Vercel Serverless doesn't support SSE)
    const intervalId = setInterval(() => {
      fetchWaitingCandidates();
      fetchPanels();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchWaitingCandidates, fetchPanels]);

  // Use a ref to keep track of latest available panels without triggering effect re-runs
  const availablePanelsRef = useRef(availablePanels);
  useEffect(() => {
    availablePanelsRef.current = availablePanels;
  }, [availablePanels]);

  // Handle Live Candidate Status Update via SSE
  useEffect(() => {
    if (!liveCandidateStatusUpdate) return;
    
    if (liveCandidateStatusUpdate.status === "waiting") {
      // Auto-purge the candidate from any ghost panels if they were scanned in from the mobile app
      // to ensure they don't get hidden by the assignedCandidateIds filter.
      const ghostPanels = availablePanelsRef.current.filter(p => Number(p.current_candidate_id) === liveCandidateStatusUpdate.id);
      if (ghostPanels.length > 0) {
        ghostPanels.forEach(p => {
          fetch(`${apiUrl}/api/panels/${p.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: authToken },
            body: JSON.stringify({ status: "empty", current_candidate_id: null })
          });
        });
      }
    }

    setCandidates((prev) => {
      const existingIndex = prev.findIndex((c) => c.id === liveCandidateStatusUpdate.id);

      if (liveCandidateStatusUpdate.status === "waiting") {
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            status: liveCandidateStatusUpdate.status,
            full_name: liveCandidateStatusUpdate.full_name || updated[existingIndex].full_name,
            kiit_email: liveCandidateStatusUpdate.kiit_email || updated[existingIndex].kiit_email,
            domain_choice: liveCandidateStatusUpdate.domain_choice || updated[existingIndex].domain_choice,
            updated_at: liveCandidateStatusUpdate.updated_at || new Date().toISOString(),
          };
          return updated;
        } else {
          // New candidate added to waiting queue
          const newCandidate: WaitingCandidate = {
            id: liveCandidateStatusUpdate.id,
            full_name: liveCandidateStatusUpdate.full_name || "Scanned Candidate",
            kiit_email: liveCandidateStatusUpdate.kiit_email || "",
            domain_choice: liveCandidateStatusUpdate.domain_choice || "General",
            status: "waiting",
            created_at: liveCandidateStatusUpdate.updated_at || new Date().toISOString(),
            updated_at: liveCandidateStatusUpdate.updated_at || new Date().toISOString(),
          };
          return [newCandidate, ...prev];
        }
      } else {
        // Candidate status changed away from "waiting" -> remove from waiting queue
        if (existingIndex >= 0) {
          return prev.filter((c) => c.id !== liveCandidateStatusUpdate.id);
        }
      }
      return prev;
    });
  }, [liveCandidateStatusUpdate]);

  // Quick Panel Assignment handler
  const handleAssignToPanel = async (candidateId: number) => {
    const panelId = selectedPanels[candidateId];
    if (!panelId) {
      setError("Please select a panel from the dropdown first.");
      return;
    }

    try {
      const panel = availablePanels.find((p) => p.id === panelId);
      const candidate = candidates.find((c) => c.id === candidateId);

      // Update Panel status to ongoing and assign candidate ID
      const resPanel = await fetch(`${apiUrl}/api/panels/${panelId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify({
          status: "ongoing",
          current_candidate_id: candidateId,
        }),
      });
      const dataPanel = await resPanel.json();

      if (dataPanel.success) {
        setSuccessMessage(
          `Candidate "${candidate?.full_name || candidateId}" assigned to ${panel?.name || "Panel"}.`
        );
        fetchPanels();
      } else {
        setError(dataPanel.message || "Failed to assign candidate to panel.");
      }
    } catch {
      setError("Network error performing panel assignment.");
    }
  };

  // Permanently remove candidate from waiting queue
  const handleMarkAsDone = async (candidateId: number) => {
    try {
      const res = await fetch(`${apiUrl}/api/registration/${candidateId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify({ status: "interviewed" }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Candidate #${candidateId} marked as completely done.`);
        setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
      } else {
        setError(data.message || "Failed to mark candidate as done.");
      }
    } catch {
      setError("Network error marking candidate as done.");
    }
  };

  // Filtered Candidates computation
  const unassignedCandidates = useMemo(() => {
    const assignedCandidateIds = new Set(
      availablePanels
        .filter((p) => p.current_candidate_id)
        .map((p) => Number(p.current_candidate_id))
    );
    return candidates.filter(c => !assignedCandidateIds.has(c.id));
  }, [candidates, availablePanels]);

  const filteredCandidates = useMemo(() => {
    const query = search.toLowerCase().trim();
    return unassignedCandidates.filter((c) => {

      const matchesSearch =
        !query ||
        c.full_name.toLowerCase().includes(query) ||
        c.kiit_email.toLowerCase().includes(query) ||
        (c.phone && c.phone.includes(query)) ||
        String(c.id).includes(query);
      const matchesDomain =
        !domainFilter || getDomainList(c.domain_choice).includes(domainFilter);
      
      let matchesFixedDomain = true;
      if (fixedDomainFilter) {
        const fullCandidateDomainStr = `${c.domain_choice} ${c.sub_domains || ""}`.toLowerCase();
        const searchPhrase = (fixedDomainFilter.split(":")[1] || fixedDomainFilter).trim().toLowerCase();
        matchesFixedDomain = fullCandidateDomainStr.includes(searchPhrase) || (c.domain_choice.toLowerCase() === searchPhrase);
      }
        
      return matchesSearch && matchesDomain && matchesFixedDomain;
    });
  }, [candidates, search, domainFilter, fixedDomainFilter, availablePanels]);

  const uniqueDomains = useMemo(() => {
    return Array.from(
      new Set(unassignedCandidates.flatMap((c) => getDomainList(c.domain_choice)))
    ).sort();
  }, [unassignedCandidates]);

  const emptyPanels = useMemo(() => {
    return availablePanels.filter((p) => p.status === "empty");
  }, [availablePanels]);

  return (
    <div className="space-y-6">
      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Waiting Candidates
              </p>
              <p className="mt-2 font-mono text-3xl font-bold text-amber-500 dark:text-amber-400">
                {unassignedCandidates.length}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Active in queue</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Users size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Available Panels
              </p>
              <p className="mt-2 font-mono text-3xl font-bold text-emerald-500 dark:text-emerald-400">
                {emptyPanels.length}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Ready for interview ({availablePanels.length} total)
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Tv size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Filtered Queue
              </p>
              <p className="mt-2 font-mono text-3xl font-bold text-blue-500 dark:text-blue-400">
                {filteredCandidates.length}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Current filter match</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Filter size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Unique Domains
              </p>
              <p className="mt-2 font-mono text-3xl font-bold text-cyan-500 dark:text-cyan-400">
                {uniqueDomains.length}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Waiting across domains</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400">
              <Building size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications / Feedback Messages */}
      {error && (
        <div className="flex items-center justify-between rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {successMessage && (
        <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          <span>{successMessage}</span>
          <button type="button" onClick={() => setSuccessMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Table & Filter Controls Container */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Header Control Bar */}
        <div className="flex flex-col gap-4 border-b border-gray-200 p-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between md:p-5">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
            </span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Live Waiting Queue
            </h2>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              {unassignedCandidates.length} Waiting
            </span>
          </div>

          <div className="flex items-center gap-3">
            <form onSubmit={handleAddManual} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Roll Number"
                value={manualRoll}
                onChange={(e) => setManualRoll(e.target.value)}
                className="w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={isAdding || !manualRoll.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-amber-600 active:scale-95 disabled:opacity-50"
              >
                {isAdding ? "Adding..." : "+ Add"}
              </button>
            </form>
            <button
              type="button"
              onClick={() => {
                fetchWaitingCandidates();
                fetchPanels();
              }}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh Queue
            </button>
          </div>
        </div>

        {/* Search & Domain Filter */}
        <div className="grid grid-cols-1 gap-4 border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/50 md:grid-cols-[1fr_280px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate name, KIIT email, phone, or ID..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-9 text-sm text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Domains</option>
              {uniqueDomains.map((d) => (
                <option key={d} value={d}>
                  {getDomainLabel(d)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Candidate List Table */}
        {filteredCandidates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Candidate ID</th>
                  <th className="px-6 py-4 font-medium">Candidate Info</th>
                  <th className="px-6 py-4 font-medium">Selected Domains</th>
                  <th className="px-6 py-4 font-medium">Check-In Time</th>
                  <th className="px-6 py-4 font-medium">Quick Panel Assignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredCandidates.map((c) => (
                  <tr
                    key={c.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
                  >
                    <td className="px-6 py-4 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                      #{c.id}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{c.full_name}</p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{c.kiit_email}</p>
                      {c.academic_year && (
                        <p className="mt-0.5 text-[11px] text-gray-400">
                          {c.academic_year} · {c.course}
                        </p>
                      )}
                    </td>
                    <td className="max-w-[280px] px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {getDomainList(c.domain_choice).map((domain) => (
                          <span
                            key={domain}
                            className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          >
                            {getDomainLabel(domain)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Clock size={14} className="text-amber-500" />
                        <span>{formatRelativeTime(c.updated_at || c.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedPanels[c.id] || ""}
                          onChange={(e) =>
                            setSelectedPanels((prev) => ({
                              ...prev,
                              [c.id]: Number(e.target.value),
                            }))
                          }
                          className="w-40 rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-900 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="" disabled>
                            Select Panel
                          </option>
                          {emptyPanels.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleAssignToPanel(c.id)}
                          disabled={!selectedPanels[c.id]}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-cyan-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CheckCircle2 size={14} />
                          Assign
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarkAsDone(c.id)}
                          title="Mark as completely done (remove from queue)"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-300 active:scale-95 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          <X size={14} />
                          Done
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <UserCheck className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
              No Candidates Waiting
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              When panelists scan candidate QR codes, they will automatically appear here in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
