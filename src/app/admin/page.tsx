"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Filter,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import SharedHeader from "../../components/ui/SharedHeader";
import CubeBackground from "../../components/ui/CubeBackground";
import { domains } from "../../data/domain";

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
const conthrax = "font-['Conthrax',_sans-serif]";
const orbitron = "font-['Orbitron',_sans-serif]";

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
  motivation: string;
  experience: string;
  skills: string[];
  referral_source: string;
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

type Tab = "registrations" | "interviews";

const domainLabels: Record<string, string> = {};
for (const domain of domains) domainLabels[domain.key] = domain.title;
domainLabels.osg = "Office of Strategy & Growth";
domainLabels.oti = "Office of Technology & Innovation";
domainLabels.ocd = "Office of Creativity & Design";
domainLabels.opcr = "Office of Public & Corporate Relations";
domainLabels.oca = "Office of Campus Ambassadors";
domainLabels.occ = "Office of Content & Communications";
domainLabels.relations = "Office of Public & Corporate Relations";
domainLabels.creative = "Office of Creativity & Design";
domainLabels.comms = "Office of Content & Communications";

function getDomainLabel(key: string) {
  return domainLabels[key] || key;
}

function getDomainList(value: string) {
  return value.split(",").filter(Boolean);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function statusClass(status: string) {
  if (status === "completed" || status === "shortlisted") {
    return "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300";
  }
  if (status === "scheduled") {
    return "border-amber-400/25 bg-amber-400/[0.08] text-amber-300";
  }
  return "border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300";
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`${orbitron} inline-flex rounded-lg border px-2.5 py-1 text-[8px] uppercase tracking-[0.16em] ${statusClass(status)}`}>
      {status}
    </span>
  );
}

function DomainBadges({ value }: { value: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {getDomainList(value).map((domain) => (
        <span key={domain} className="rounded-lg border border-cyan-400/15 bg-cyan-400/[0.045] px-2 py-1 text-[9px] text-cyan-100/70">
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
    <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-black/35 p-4 md:p-5">
      <div className="absolute right-0 top-0 h-20 w-20 bg-cyan-400/[0.06] blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className={`${orbitron} text-[8px] uppercase tracking-[0.24em] text-white/30`}>{label}</p>
          <p className={`${conthrax} mt-3 text-xl text-white md:text-2xl`}>{value}</p>
          <p className="mt-1 text-[10px] text-white/30">{detail}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300">
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
    <div className="grid grid-cols-1 gap-3 border-b border-white/10 p-4 md:grid-cols-[1fr_280px] md:p-5">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400/45" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-[16px] border border-white/10 bg-black/45 py-3 pl-11 pr-11 text-xs text-white outline-none transition-all placeholder:text-white/20 focus:border-cyan-400/45 focus:shadow-[0_0_0_3px_rgba(0,247,255,0.06)] md:text-sm"
        />
        {search ? (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      <div className="relative">
        <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400/45" />
        <select
          value={domainFilter}
          onChange={(event) => setDomainFilter(event.target.value)}
          aria-label="Filter by domain"
          className="w-full appearance-none rounded-[16px] border border-white/10 bg-black/45 py-3 pl-11 pr-4 text-xs text-white/70 outline-none transition-all focus:border-cyan-400/45 md:text-sm"
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
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead>
            <tr className={`${orbitron} bg-white/[0.025] text-[8px] uppercase tracking-[0.18em] text-white/30`}>
              <th className="px-5 py-4 font-normal">Signal ID</th>
              <th className="px-5 py-4 font-normal">Applicant</th>
              <th className="px-5 py-4 font-normal">KIIT account</th>
              <th className="px-5 py-4 font-normal">Selected units</th>
              <th className="px-5 py-4 font-normal">Received</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((registration) => (
              <tr key={registration.id} className="border-t border-white/[0.06] transition-colors hover:bg-cyan-400/[0.025]">
                <td className={`${orbitron} px-5 py-5 text-[10px] text-cyan-300/65`}>#{registration.id}</td>
                <td className="px-5 py-5">
                  <p className={`${conthrax} text-xs text-white/85`}>{registration.full_name}</p>
                  <p className="mt-1 text-[10px] text-white/30">{registration.academic_year} · {registration.course}</p>
                </td>
                <td className="px-5 py-5 text-xs text-white/55">{registration.kiit_email}</td>
                <td className="max-w-[300px] px-5 py-5"><DomainBadges value={registration.domain_choice} /></td>
                <td className="px-5 py-5 text-[10px] text-white/35">{formatDate(registration.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 md:hidden">
        {registrations.map((registration) => (
          <article key={registration.id} className="rounded-[20px] border border-white/10 bg-black/30 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`${orbitron} text-[8px] uppercase tracking-[0.2em] text-cyan-300/55`}>Signal #{registration.id}</p>
                <h3 className={`${conthrax} mt-2 text-sm text-white`}>{registration.full_name}</h3>
              </div>
              <StatusBadge status={registration.status} />
            </div>
            <p className="mt-3 break-all text-[11px] text-white/45">{registration.kiit_email}</p>
            <div className="mt-4"><DomainBadges value={registration.domain_choice} /></div>
            <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[9px] text-white/25">
              <span>{registration.academic_year}</span>
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
    return <span className={`${conthrax} text-xs text-white/60`}>{interview.marks ?? "—"}</span>;
  }

  return (
    <div className="space-y-1">
      {interview.criteria.map((criterion) => (
        <p key={criterion.name} className="text-[9px] text-white/35">
          {criterion.name}: <span className="text-white/70">{criterion.score}/{criterion.max_score}</span>
        </p>
      ))}
      <p className={`${orbitron} border-t border-white/10 pt-1 text-[9px] text-cyan-300`}>Total: {interview.marks ?? "—"}</p>
    </div>
  );
}

function InterviewTable({ interviews }: { interviews: Interview[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead>
            <tr className={`${orbitron} bg-white/[0.025] text-[8px] uppercase tracking-[0.18em] text-white/30`}>
              <th className="px-5 py-4 font-normal">Interview</th>
              <th className="px-5 py-4 font-normal">Candidate</th>
              <th className="px-5 py-4 font-normal">Panelist</th>
              <th className="px-5 py-4 font-normal">Unit</th>
              <th className="px-5 py-4 font-normal">Score matrix</th>
              <th className="px-5 py-4 font-normal">Status</th>
              <th className="px-5 py-4 font-normal">Recorded</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map((interview) => (
              <tr key={interview.id} className="border-t border-white/[0.06] align-top transition-colors hover:bg-cyan-400/[0.025]">
                <td className={`${orbitron} px-5 py-5 text-[10px] text-cyan-300/65`}>#{interview.id}</td>
                <td className="px-5 py-5">
                  <p className={`${conthrax} text-xs text-white/85`}>{interview.full_name}</p>
                  <p className="mt-1 text-[10px] text-white/30">{interview.roll_number}</p>
                </td>
                <td className="px-5 py-5">
                  <p className="text-xs text-white/65">{interview.panelist_name}</p>
                  <p className="mt-1 text-[10px] text-white/30">{interview.panelist_roll} · {interview.panelist_branch}</p>
                </td>
                <td className="px-5 py-5"><DomainBadges value={interview.domain_choice} /></td>
                <td className="px-5 py-5"><InterviewScore interview={interview} /></td>
                <td className="px-5 py-5"><StatusBadge status={interview.status} /></td>
                <td className="px-5 py-5 text-[10px] text-white/35">{formatDate(interview.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 md:hidden">
        {interviews.map((interview) => (
          <article key={interview.id} className="rounded-[20px] border border-white/10 bg-black/30 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`${orbitron} text-[8px] uppercase tracking-[0.2em] text-cyan-300/55`}>Interview #{interview.id}</p>
                <h3 className={`${conthrax} mt-2 text-sm text-white`}>{interview.full_name}</h3>
              </div>
              <StatusBadge status={interview.status} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-y border-white/[0.06] py-3">
              <div>
                <p className={`${orbitron} text-[7px] uppercase tracking-wider text-white/25`}>Panelist</p>
                <p className="mt-1 text-[10px] text-white/60">{interview.panelist_name}</p>
              </div>
              <div>
                <p className={`${orbitron} text-[7px] uppercase tracking-wider text-white/25`}>Score</p>
                <div className="mt-1"><InterviewScore interview={interview} /></div>
              </div>
            </div>
            <div className="mt-3"><DomainBadges value={interview.domain_choice} /></div>
            <p className="mt-3 text-right text-[9px] text-white/25">{formatDate(interview.created_at)}</p>
          </article>
        ))}
      </div>
    </>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [data, setData] = useState<Registration[] | null>(null);
  const [interviews, setInterviews] = useState<Interview[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("registrations");
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("");

  const fetchData = async (nextTab: Tab) => {
    setLoading(true);
    setError("");
    setTab(nextTab);
    setSearch("");
    setDomainFilter("");

    try {
      if (nextTab === "registrations") {
        const response = await fetch(`${API}/api/admin/registrations`, {
          headers: { Authorization: password },
        });
        const result = await response.json();
        if (!result.success) {
          setError(result.message || "Unable to load registrations.");
          setData(null);
        } else {
          setData(result.data);
          setInterviews(null);
        }
      } else {
        const response = await fetch(`${API}/api/interviews/with-registration?password=${encodeURIComponent(password)}`);
        const result = await response.json();
        if (!result.success) {
          setError(result.message || "Unable to load interviews.");
          setInterviews(null);
        } else {
          setInterviews(result.data);
          setData(null);
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
    return data.filter((registration) => {
      const matchesSearch = !query
        || registration.full_name.toLowerCase().includes(query)
        || registration.kiit_email?.toLowerCase().includes(query)
        || registration.phone.includes(query);
      const matchesDomain = !domainFilter || getDomainList(registration.domain_choice).includes(domainFilter);
      return matchesSearch && matchesDomain;
    });
  }, [data, search, domainFilter]);

  const filteredInterviews = useMemo(() => {
    if (!interviews) return [];
    const query = search.toLowerCase();
    return interviews.filter((interview) => {
      const matchesSearch = !query
        || interview.full_name?.toLowerCase().includes(query)
        || interview.panelist_name?.toLowerCase().includes(query)
        || interview.panelist_roll?.toLowerCase().includes(query);
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
  const isLocked = !data && !interviews;

  const closeSession = () => {
    setData(null);
    setInterviews(null);
    setPassword("");
    setSearch("");
    setDomainFilter("");
    setError("");
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#020202] text-white selection:bg-cyan-400/25">
      <CubeBackground zIndex={0} disableLinesOnMobile />
      <div className="fixed inset-0 z-[1] bg-[radial-gradient(circle_at_12%_10%,rgba(0,247,255,0.09),transparent_28%),radial-gradient(circle_at_88%_65%,rgba(0,247,255,0.05),transparent_32%),linear-gradient(180deg,rgba(0,0,0,0.05),#020202_92%)] pointer-events-none" />
      <div className="fixed inset-0 z-[1] bg-[linear-gradient(rgba(0,247,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,247,255,0.08)_1px,transparent_1px)] bg-[size:76px_76px] opacity-[0.07] pointer-events-none" />
      <div className="relative z-10">
        <SharedHeader />

        {isLocked ? (
          <main className="mx-auto flex min-h-[100dvh] w-full max-w-6xl items-center justify-center px-4 pb-16 pt-28">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "circOut" }}
              className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-[#050909]/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl md:p-8"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent" />
              <div className="absolute right-0 top-0 h-40 w-40 bg-cyan-400/[0.08] blur-[60px]" />

              <div className="relative">
                <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-[16px] border border-cyan-400/25 bg-cyan-400/[0.07] text-cyan-300">
                  <ShieldCheck size={22} strokeWidth={1.7} />
                </div>
                <p className={`${orbitron} text-[8px] uppercase tracking-[0.35em] text-cyan-300/55`}>Restricted node</p>
                <h1 className={`${conthrax} mt-3 text-2xl uppercase tracking-tight md:text-3xl`}>Admin Console</h1>
                <p className="mt-3 text-xs leading-relaxed text-white/40 md:text-sm">
                  Authenticate to inspect recruitment signals and interview records.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                  <div className="grid grid-cols-2 gap-2 rounded-[18px] border border-white/10 bg-black/35 p-1.5">
                    {(["registrations", "interviews"] as Tab[]).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setTab(item)}
                        className={`${orbitron} rounded-[13px] px-3 py-3 text-[8px] uppercase tracking-[0.16em] transition-all ${
                          tab === item
                            ? "bg-cyan-400 text-black shadow-[0_0_18px_rgba(0,247,255,0.22)]"
                            : "text-white/30 hover:bg-white/[0.04] hover:text-white/55"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className={`${orbitron} mb-2 block text-[8px] uppercase tracking-[0.22em] text-white/35`}>
                      Access key
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter admin password"
                      className="w-full rounded-[18px] border border-white/10 bg-black/45 px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-cyan-400/50 focus:shadow-[0_0_0_3px_rgba(0,247,255,0.06)]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !password}
                    className={`${conthrax} w-full rounded-[16px] border border-cyan-300 bg-cyan-400 px-4 py-3.5 text-[9px] uppercase tracking-[0.22em] text-black transition-all hover:bg-cyan-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-30`}
                  >
                    {loading ? "Opening console..." : `View ${tab}`}
                  </button>
                  {error ? <p className="text-center text-xs text-red-300">{error}</p> : null}
                </form>
              </div>
            </motion.section>
          </main>
        ) : (
          <main className="mx-auto w-full max-w-[1500px] px-4 pb-16 pt-28 md:px-8 md:pt-32">
            <motion.header
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "circOut" }}
              className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <p className={`${orbitron} text-[8px] uppercase tracking-[0.35em] text-cyan-300/55`}>K-1000 / Intake control</p>
                  <span className="h-px w-10 bg-cyan-400/25" />
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(0,247,255,0.8)]" />
                </div>
                <h1 className={`${conthrax} mt-4 max-w-4xl text-2xl uppercase tracking-tight sm:text-4xl md:text-5xl`}>
                  Recruitment <span className="text-cyan-300">Command</span>
                </h1>
                <p className="mt-3 max-w-2xl text-xs leading-relaxed text-white/40 md:text-sm">
                  Review applicant signals, track interview progress, and filter records by operational unit.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-[14px] border border-cyan-400/15 bg-cyan-400/[0.045] px-4 py-2.5">
                  <p className={`${orbitron} text-[7px] uppercase tracking-[0.22em] text-cyan-300/55`}>
                    Secure session
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeSession}
                  className={`${orbitron} flex items-center gap-2 rounded-[14px] border border-white/10 bg-black/30 px-4 py-2.5 text-[8px] uppercase tracking-[0.16em] text-white/40 transition-all hover:border-white/25 hover:text-white/70`}
                >
                  <ArrowLeft size={13} /> Lock
                </button>
              </div>
            </motion.header>

            <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {tab === "registrations" ? (
                <>
                  <MetricCard label="Total signals" value={data?.length ?? 0} detail="Received applications" icon={<Users size={17} />} />
                  <MetricCard label="Visible" value={filteredRegistrations.length} detail="Current result set" icon={<Search size={17} />} />
                  <MetricCard label="Units" value={registrationDomains.length} detail="Selected across records" icon={<ClipboardCheck size={17} />} />
                  <MetricCard label="Mode" value="LIVE" detail="Data environment" icon={<ShieldCheck size={17} />} />
                </>
              ) : (
                <>
                  <MetricCard label="Interviews" value={interviews?.length ?? 0} detail="Recorded sessions" icon={<ClipboardCheck size={17} />} />
                  <MetricCard label="Completed" value={completedInterviews} detail="Evaluation finished" icon={<CheckCircle2 size={17} />} />
                  <MetricCard label="Average" value={averageScore} detail="Across scored sessions" icon={<Users size={17} />} />
                  <MetricCard label="Mode" value="LIVE" detail="Data environment" icon={<ShieldCheck size={17} />} />
                </>
              )}
            </section>

            <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#050909]/75 shadow-[0_22px_70px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
              <div className="flex flex-col gap-4 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between md:p-5">
                <div className="flex rounded-[16px] border border-white/10 bg-black/35 p-1">
                  {(["registrations", "interviews"] as Tab[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      disabled={loading}
                      onClick={() => fetchData(item)}
                      className={`${orbitron} rounded-[12px] px-4 py-2.5 text-[8px] uppercase tracking-[0.16em] transition-all md:px-5 ${
                        tab === item
                          ? "bg-cyan-400 text-black"
                          : "text-white/30 hover:bg-white/[0.04] hover:text-white/55"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={`${orbitron} text-[8px] uppercase tracking-[0.24em] text-white/25`}>Active registry</p>
                    <p className={`${conthrax} mt-1 text-xs text-white/70`}>
                      {tab === "registrations" ? "Applicant Signals" : "Interview Records"}
                    </p>
                  </div>
                  <span className="flex h-9 min-w-9 items-center justify-center rounded-[12px] border border-cyan-400/20 bg-cyan-400/[0.06] px-3 text-xs text-cyan-300">
                    {tab === "registrations" ? filteredRegistrations.length : filteredInterviews.length}
                  </span>
                </div>
              </div>

              <FilterBar
                search={search}
                setSearch={setSearch}
                domainFilter={domainFilter}
                setDomainFilter={setDomainFilter}
                domainOptions={tab === "registrations" ? registrationDomains : interviewDomains}
                placeholder={tab === "registrations" ? "Search applicant, KIIT account, or phone..." : "Search candidate, panelist, or roll..."}
              />

              {error ? (
                <div className="m-4 rounded-[16px] border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-xs text-red-200 md:m-5">
                  {error}
                </div>
              ) : null}

              {tab === "registrations" ? (
                filteredRegistrations.length ? (
                  <RegistrationTable registrations={filteredRegistrations} />
                ) : (
                  <div className="px-6 py-16 text-center">
                    <Search className="mx-auto h-6 w-6 text-white/15" />
                    <p className={`${conthrax} mt-4 text-xs uppercase text-white/35`}>No signals found</p>
                    <p className="mt-2 text-[10px] text-white/20">Adjust the search or domain filter.</p>
                  </div>
                )
              ) : filteredInterviews.length ? (
                <InterviewTable interviews={filteredInterviews} />
              ) : (
                <div className="px-6 py-16 text-center">
                  <ClipboardCheck className="mx-auto h-6 w-6 text-white/15" />
                  <p className={`${conthrax} mt-4 text-xs uppercase text-white/35`}>No interviews found</p>
                  <p className="mt-2 text-[10px] text-white/20">Adjust the search or domain filter.</p>
                </div>
              )}
            </section>
          </main>
        )}
      </div>
    </div>
  );
}
