"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  LogOut,
  CheckCircle2,
  ClipboardCheck,
  Filter,
  Plus,
  Search,
  ShieldCheck,
  Users,
  X,
  Grid,
  Clock,
  Radio,
} from "lucide-react";
import SharedHeader from "../../components/ui/SharedHeader";
import { domains } from "../../data/domain";
import { offices } from "../../data/offices";
import RoomBuilder from "../../components/admin/RoomBuilder";
import WaitingRoom from "../../components/admin/WaitingRoom";
import Ongoing from "../../components/admin/Ongoing";
import { useSSEStream } from "../../hooks/useSSEStream";
import { OnspotForm } from "../onspot/page";

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

type Registration = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  kiit_email: string;
  gender: string;
  roll_number: string;
  academic_year: string;
  course: string;
  branch: string;
  domain_choice: string;
  sub_domains: string;
  motivation: string;
  experience: string;
  skills: string[];
  referral_source: string;
  referred_by: string;
  status: string;
  created_at: string;
};

type Criterion = {
  name: string;
  max_score: number;
  score: number;
};

type Interview = {
  id: number;
  registration_id: number;
  panelist_name: string;
  panelist_roll: string;
  panelist_branch: string;
  panelist_domain: string;
  marks: number | null;
  remarks: string;
  status: string;
  created_at: string;
  full_name: string;
  email: string;
  roll_number: string;
  domain_choice: string;
  criteria?: Criterion[];
};

type Tab = "registrations" | "interviews" | "room_builder" | "waiting_room" | "ongoing" | "walk_in";

const tabLabels: Record<Tab, string> = {
  registrations: "Registrations",
  interviews: "Interviews",
  room_builder: "Panel Room Builder",
  waiting_room: "Waiting Room",
  ongoing: "Ongoing",
  walk_in: "Walk In",
};

const domainLabels: Record<string, string> = {};
for (const domain of domains) domainLabels[domain.key] = domain.title;
for (const office of offices) domainLabels[office.key] = office.title;

function getDomainLabel(key: string) {
  return domainLabels[key] || key;
}

function getDomainList(value: string) {
  if (!value) return [];
  return value.split(",").filter(Boolean);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: string }) {
  const getStyle = () => {
    if (status === "completed" || status === "shortlisted") {
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
    }
    if (status === "scheduled" || status === "waiting") {
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
    }
    return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
  };
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider ${getStyle()}`}>
      {status}
    </span>
  );
}

function DomainBadges({ value }: { value: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {getDomainList(value).map((domain) => (
        <span key={domain} className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {getDomainLabel(domain)}
        </span>
      ))}
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{detail}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          {icon}
        </div>
      </div>
    </div>
  );
}

function FilterBar({
  search,
  setSearch,
  domainFilter,
  setDomainFilter,
  domainOptions,
  placeholder,
}: {
  search: string;
  setSearch: (value: string) => void;
  domainFilter: string;
  setDomainFilter: (value: string) => void;
  domainOptions: string[];
  placeholder: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50 md:grid-cols-[1fr_280px]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-9 text-sm text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500"
        />
        {search ? (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      <div className="relative">
        <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <select
          value={domainFilter}
          onChange={(event) => setDomainFilter(event.target.value)}
          className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500"
        >
          <option value="">All domains</option>
          {domainOptions.map((domain) => (
            <option key={domain} value={domain}>{getDomainLabel(domain)}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function RegistrationTable({ registrations }: { registrations: Registration[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[850px] text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">ID</th>
              <th className="px-6 py-4 font-medium">Applicant</th>
              <th className="px-6 py-4 font-medium">Contact</th>
              <th className="px-6 py-4 font-medium">Academic Info</th>
              <th className="px-6 py-4 font-medium">Domains & Roles</th>
              <th className="px-6 py-4 font-medium">Date Applied</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {registrations.map((registration) => (
              <tr key={registration.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td className="px-6 py-4 font-mono text-xs text-blue-600 dark:text-blue-400">#{registration.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white">{registration.full_name}</p>
                    {registration.gender && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {registration.gender}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{registration.roll_number || registration.kiit_email?.split('@')[0] || "No Roll"}</p>
                  {registration.referred_by && (
                    <p className="mt-1 text-[10px] font-medium text-indigo-500 dark:text-indigo-400">Ref: {registration.referred_by}</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900 dark:text-gray-300">{registration.kiit_email}</p>
                  <p className="mt-1 text-xs text-gray-500">{registration.phone || "No Phone"}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900 dark:text-gray-300">{registration.course} {registration.branch ? `(${registration.branch})` : ""}</p>
                  <p className="mt-1 text-xs text-gray-500">{registration.academic_year}</p>
                </td>
                <td className="max-w-[300px] px-6 py-4">
                  <DomainBadges value={registration.domain_choice} />
                  {registration.sub_domains ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {registration.sub_domains.split(",").map((sub) => (
                        <span key={sub} className="inline-flex items-center rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-700 dark:border-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 capitalize">
                          {sub.split(":").join(" - ")}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">{formatDate(registration.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 p-4 md:hidden">
        {registrations.map((registration) => (
          <article key={registration.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-blue-600 dark:text-blue-400">#{registration.id}</p>
                <h3 className="mt-1 font-medium text-gray-900 dark:text-white">{registration.full_name}</h3>
              </div>
              <StatusBadge status={registration.status} />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="truncate">{registration.kiit_email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <p>{registration.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Academic</p>
                <p className="truncate">{registration.course} {registration.branch ? `(${registration.branch})` : ""}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Year & Gender</p>
                <p>{registration.academic_year} · {registration.gender || "N/A"}</p>
              </div>
            </div>
            {registration.referred_by && (
              <div className="mt-3">
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-medium text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  Referred by: {registration.referred_by}
                </span>
              </div>
            )}
            <div className="mt-3"><DomainBadges value={registration.domain_choice} /></div>
            {registration.sub_domains && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {registration.sub_domains.split(",").map((sub) => (
                  <span key={sub} className="inline-flex items-center rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-700 dark:border-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 capitalize">
                    {sub.split(":").join(" - ")}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800">
              <span>{registration.roll_number || registration.kiit_email?.split('@')[0] || "No Roll"}</span>
              <span>{formatDate(registration.created_at)}</span>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function InterviewScore({ interview }: { interview: Interview }) {
  if (!interview.criteria?.length) {
    return <span className="font-medium text-gray-900 dark:text-white">{interview.marks ?? "—"}</span>;
  }

  return (
    <div className="space-y-1">
      {interview.criteria.map((criterion) => (
        <p key={criterion.name} className="text-xs text-gray-500 dark:text-gray-400">
          {criterion.name}: <span className="font-medium text-gray-900 dark:text-white">{criterion.score}/{criterion.max_score}</span>
        </p>
      ))}
      <p className="border-t border-gray-200 pt-1 text-xs font-medium text-gray-900 dark:border-gray-800 dark:text-white">
        Total: {interview.marks ?? "—"}
      </p>
    </div>
  );
}

function InterviewTable({ interviews }: { interviews: Interview[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1100px] text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">Interview ID</th>
              <th className="px-6 py-4 font-medium">Candidate</th>
              <th className="px-6 py-4 font-medium">Panelist</th>
              <th className="px-6 py-4 font-medium">Domain/Office</th>
              <th className="px-6 py-4 font-medium">Score Details</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Date Recorded</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {interviews.map((interview) => (
              <tr key={interview.id} className="align-top transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td className="px-6 py-4 font-mono text-xs text-blue-600 dark:text-blue-400">#{interview.id}</td>
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900 dark:text-white">{interview.full_name}</p>
                  <p className="mt-1 text-xs text-gray-500">{interview.roll_number}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-900 dark:text-white">{interview.panelist_name}</p>
                  <p className="mt-1 text-xs text-gray-500">{interview.panelist_roll} · {interview.panelist_branch}</p>
                </td>
                <td className="px-6 py-4"><DomainBadges value={interview.domain_choice} /></td>
                <td className="px-6 py-4"><InterviewScore interview={interview} /></td>
                <td className="px-6 py-4"><StatusBadge status={interview.status} /></td>
                <td className="px-6 py-4 text-xs text-gray-500">{formatDate(interview.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 p-4 md:hidden">
        {interviews.map((interview) => (
          <article key={interview.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-blue-600 dark:text-blue-400">#{interview.id}</p>
                <h3 className="mt-1 font-medium text-gray-900 dark:text-white">{interview.full_name}</h3>
              </div>
              <StatusBadge status={interview.status} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-y border-gray-100 py-3 dark:border-gray-800">
              <div>
                <p className="text-xs text-gray-500">Panelist</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{interview.panelist_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Score</p>
                <div className="mt-1"><InterviewScore interview={interview} /></div>
              </div>
            </div>
            <div className="mt-3"><DomainBadges value={interview.domain_choice} /></div>
            <p className="mt-3 text-right text-xs text-gray-500">{formatDate(interview.created_at)}</p>
          </article>
        ))}
      </div>
    </>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState<Registration[] | null>(null);
  const [interviews, setInterviews] = useState<Interview[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("registrations");
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("");

  // Load session on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("adminSession");
      if (stored) {
        try {
          const { savedPassword } = JSON.parse(stored);
          if (savedPassword) {
            setPassword(savedPassword);
            fetchData("registrations", savedPassword);
          }
        } catch (e) {
          localStorage.removeItem("adminSession");
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Connect Custom SSE Stream Hook
  const { status: sseStatus, lastCandidateStatusUpdate, lastPanelUpdate, reconnect } = useSSEStream({
    apiUrl: API,
    authToken: password,
  });

  const fetchData = async (nextTab: Tab, overridePassword?: string) => {
    const currentPassword = overridePassword || password;
    setLoading(true);
    setError("");
    setTab(nextTab);
    setSearch("");
    setDomainFilter("");

    try {
      if (nextTab === "registrations") {
        const response = await fetch(`${API}/api/admin/registrations`, {
          headers: { Authorization: currentPassword },
        });
        const result = await response.json();
        if (!result.success) {
          setError(result.message || "Unable to load registrations.");
          setData(null);
        } else {
          setData(result.data);
          setInterviews(null);
          setIsAuthenticated(true);
          if (typeof window !== "undefined") {
            localStorage.setItem("adminSession", JSON.stringify({ savedPassword: currentPassword }));
          }
        }
      } else if (nextTab === "interviews") {
        const response = await fetch(`${API}/api/interviews/with-registration?password=${encodeURIComponent(currentPassword)}`);
        const result = await response.json();
        if (!result.success) {
          setError(result.message || "Unable to load interviews.");
          setInterviews(null);
        } else {
          setInterviews(result.data);
          setData(null);
          setIsAuthenticated(true);
          if (typeof window !== "undefined") {
            localStorage.setItem("adminSession", JSON.stringify({ savedPassword: currentPassword }));
          }
        }
      } else {
        // For room_builder or waiting_room, authenticate session
        setIsAuthenticated(true);
        if (typeof window !== "undefined") {
          localStorage.setItem("adminSession", JSON.stringify({ savedPassword: currentPassword }));
        }
      }
    } catch {
      setError("The admin server could not be reached.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetchData(tab);
  };

  const filteredRegistrations = useMemo(() => {
    if (!data) return [];
    const query = search.toLowerCase();
    const safeQuery = query.replace('#', '');
    return data.filter((registration) => {
      const matchesSearch = !query
        || registration.full_name.toLowerCase().includes(query)
        || registration.kiit_email?.toLowerCase().includes(query)
        || registration.phone.includes(query)
        || registration.id.toString().includes(safeQuery);
      const matchesDomain = !domainFilter || getDomainList(registration.domain_choice).includes(domainFilter);
      return matchesSearch && matchesDomain;
    });
  }, [data, search, domainFilter]);

  const filteredInterviews = useMemo(() => {
    if (!interviews) return [];
    const query = search.toLowerCase();
    const safeQuery = query.replace('#', '');
    return interviews.filter((interview) => {
      const matchesSearch = !query
        || interview.full_name?.toLowerCase().includes(query)
        || interview.panelist_name?.toLowerCase().includes(query)
        || interview.panelist_roll?.toLowerCase().includes(query)
        || interview.id.toString().includes(safeQuery);
      const matchesDomain = !domainFilter || getDomainList(interview.domain_choice).includes(domainFilter);
      return matchesSearch && matchesDomain;
    });
  }, [interviews, search, domainFilter]);

  const registrationDomains = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.flatMap((registration) => getDomainList(registration.domain_choice)))).sort();
  }, [data]);

  const interviewDomains = useMemo(() => {
    if (!interviews) return [];
    return Array.from(new Set(interviews.flatMap((interview) => getDomainList(interview.domain_choice)))).sort();
  }, [interviews]);

  const completedInterviews = interviews?.filter((interview) => interview.status === "completed").length ?? 0;
  const scoredInterviews = interviews?.filter((interview) => interview.marks !== null) ?? [];
  const averageScore = scoredInterviews.length
    ? (scoredInterviews.reduce((total, interview) => total + (interview.marks ?? 0), 0) / scoredInterviews.length).toFixed(1)
    : "—";

  const isLocked = !isAuthenticated && !data && !interviews;

  const closeSession = () => {
    setIsAuthenticated(false);
    setData(null);
    setInterviews(null);
    setPassword("");
    setSearch("");
    setDomainFilter("");
    setError("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminSession");
    }
  };

  const tabsList: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "registrations", label: "Registrations", icon: <Users size={16} /> },
    { key: "interviews", label: "Interviews", icon: <ClipboardCheck size={16} /> },
    { key: "room_builder", label: "Panel Room Builder", icon: <Grid size={16} /> },
    { key: "waiting_room", label: "Waiting Room", icon: <Clock size={16} /> },
    { key: "ongoing", label: "Ongoing", icon: <Radio size={16} /> },
    { key: "walk_in", label: "Walk In", icon: <Plus size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0a0a0a] dark:text-gray-100">
      <SharedHeader />

      {isLocked ? (
        <main className="mx-auto flex min-h-[100dvh] w-full max-w-lg items-center justify-center px-4 pb-16 pt-24">
          <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900 md:p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Console</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Sign in to view recruitment records, manage interview panel rooms, and track real-time waiting candidates.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">


              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter admin password"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !password}
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
                  Dashboard
                </h1>
                {/* Live SSE Status Badge */}
                <div
                  onClick={sseStatus === "Error" ? reconnect : undefined}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                    sseStatus === "Connected"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : sseStatus === "Reconnecting" || sseStatus === "Connecting"
                      ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      : sseStatus === "Polling"
                      ? "border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300"
                      : "cursor-pointer border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300"
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

          {/* Metric Section for Registrations and Interviews */}
          {(tab === "registrations" || tab === "interviews") && (
            <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tab === "registrations" ? (
                <>
                  <MetricCard label="Total Registrations" value={data?.length ?? 0} detail="Received applications" icon={<Users size={20} />} />
                  <MetricCard label="Filtered Results" value={filteredRegistrations.length} detail="Current search match" icon={<Search size={20} />} />
                  <MetricCard label="Domains Applied" value={registrationDomains.length} detail="Unique domains in results" icon={<ClipboardCheck size={20} />} />
                  <MetricCard label="System Status" value={sseStatus === "Connected" ? "Live Stream" : sseStatus === "Polling" ? "Fallback Polling" : sseStatus} detail={sseStatus === "Polling" ? "Syncing every 5s" : "SSE Event Stream"} icon={<Radio size={20} />} />
                </>
              ) : (
                <>
                  <MetricCard label="Total Interviews" value={interviews?.length ?? 0} detail="Recorded sessions" icon={<ClipboardCheck size={20} />} />
                  <MetricCard label="Completed" value={completedInterviews} detail="Finished evaluations" icon={<CheckCircle2 size={20} />} />
                  <MetricCard label="Average Score" value={averageScore} detail="Out of total marks" icon={<Users size={20} />} />
                  <MetricCard label="System Status" value={sseStatus === "Connected" ? "Live Stream" : sseStatus === "Polling" ? "Fallback Polling" : sseStatus} detail={sseStatus === "Polling" ? "Syncing every 5s" : "SSE Event Stream"} icon={<Radio size={20} />} />
                </>
              )}
            </section>
          )}

          {/* Domain Breakdown for Interviews */}
          {tab === "interviews" && interviews && (
            <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Object.entries(
                interviews.reduce((acc, curr) => {
                  const rawDomain = curr.panelist_domain || curr.domain_choice;
                  const domain = getDomainList(rawDomain)[0] || "Unknown";
                  acc[domain] = (acc[domain] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort((a, b) => b[1] - a[1])
                .map(([domain, count]) => (
                  <div key={domain} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <p className="truncate text-xs font-medium text-gray-500 dark:text-gray-400" title={getDomainLabel(domain)}>
                      {getDomainLabel(domain)}
                    </p>
                    <p className="mt-1 font-mono text-xl font-bold text-gray-900 dark:text-white">{count}</p>
                  </div>
                ))}
            </section>
          )}

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

            {(tab === "registrations" || tab === "interviews") && (
              <div className="pr-3 text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-medium text-gray-900 dark:text-white">{tab === "registrations" ? filteredRegistrations.length : filteredInterviews.length}</span> records
              </div>
            )}
          </div>

          {tab === "room_builder" ? (
            <RoomBuilder apiUrl={API} authToken={password} livePanelUpdate={lastPanelUpdate} />
          ) : tab === "waiting_room" ? (
            <WaitingRoom apiUrl={API} authToken={password} liveCandidateStatusUpdate={lastCandidateStatusUpdate} />
          ) : tab === "ongoing" ? (
            <Ongoing apiUrl={API} authToken={password} livePanelUpdate={lastPanelUpdate} />
          ) : tab === "walk_in" ? (
            <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-[#020202] shadow-sm dark:border-gray-800">
              <OnspotForm isEmbed />
            </div>
          ) : (
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <FilterBar
                search={search}
                setSearch={setSearch}
                domainFilter={domainFilter}
                setDomainFilter={setDomainFilter}
                domainOptions={tab === "registrations" ? registrationDomains : interviewDomains}
                placeholder={tab === "registrations" ? "Search applicant, KIIT email, or phone..." : "Search candidate or panelist..."}
              />

              {error ? (
                <div className="m-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400 md:m-5">
                  {error}
                </div>
              ) : null}

              {tab === "registrations" ? (
                filteredRegistrations.length ? (
                  <RegistrationTable registrations={filteredRegistrations} />
                ) : (
                  <div className="px-6 py-16 text-center">
                    <Search className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No registrations found</p>
                    <p className="mt-1 text-sm text-gray-500">Adjust your search or filters to see more results.</p>
                  </div>
                )
              ) : filteredInterviews.length ? (
                <InterviewTable interviews={filteredInterviews} />
              ) : (
                <div className="px-6 py-16 text-center">
                  <ClipboardCheck className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No interviews found</p>
                  <p className="mt-1 text-sm text-gray-500">Adjust your search or filters to see more results.</p>
                </div>
              )}
            </section>
          )}
        </main>
      )}
    </div>
  );
}
