"use client";

import { FormEvent, useState } from "react";
import { ChevronDown, Crown, Download, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import SharedHeader from "../../../../components/ui/SharedHeader";
import Footer from "../../../../components/footer/Footer";
import CubeBackground from "../../../../components/ui/CubeBackground";

const conthrax = "font-['Conthrax',_sans-serif]";

type Registration = {
  team_id: number;
  team_name: string;
  team_points: number;
  role: "leader" | "member";
  status: "ACTIVE" | "REMOVED";
  name: string;
  email: string;
  is_kiit_student: boolean;
  roll_no: number;
  phone: string;
  branch: string;
  year: number;
  hostel: string;
  checked_in_at: string;
  checked_in_by: string;
  removed_at: string;
};

type RegistrationData = {
  generatedAt: string;
  summary: { teams: number; registrations: number; active: number; checkedIn: number };
  teams: { id: number; name: string; points: number; memberCount: number }[];
  registrations: Registration[];
};

async function getError(response: Response) {
  const data = await response.json().catch(() => ({}));
  return data.error ?? "Unable to load registrations.";
}

export default function IgnithonAdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [data, setData] = useState<RegistrationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const teamTrees = data?.teams.map((team) => {
    const registrations = data.registrations.filter((registration) => registration.team_id === team.id);
    return {
      team,
      leader: registrations.find((registration) => registration.role === "leader"),
      members: registrations.filter((registration) => registration.role === "member"),
    };
  }) ?? [];

  const loadRegistrations = async (event?: FormEvent) => {
    event?.preventDefault();
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/ignithon/admin/registrations", { headers: { "x-ignithon-admin-key": adminKey }, cache: "no-store" });
      if (!response.ok) throw new Error(await getError(response));
      setData(await response.json());
    } catch (loadError) {
      setData(null);
      setError(loadError instanceof Error ? loadError.message : "Unable to load registrations.");
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/ignithon/admin/registrations?format=csv", { headers: { "x-ignithon-admin-key": adminKey }, cache: "no-store" });
      if (!response.ok) throw new Error(await getError(response));
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `ignithon-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Unable to export registrations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#020202] text-white">
      <CubeBackground zIndex={0} disableLinesOnMobile />
      <SharedHeader />
      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pt-28 md:px-10 md:pt-36">
        <div className="max-w-3xl">
          <p className="text-[9px] uppercase tracking-[0.3em] text-cyan-300/60">Protected operations console</p>
          <h1 className={`${conthrax} mt-4 break-words text-3xl uppercase leading-none sm:text-5xl`}>Registration Registry</h1>
          <p className="mt-4 text-sm leading-relaxed text-white/50 sm:text-base">Live Ignithon 2.0 team, participant, and attendance records fetched directly from MongoDB.</p>
        </div>

        <form onSubmit={loadRegistrations} className="mt-8 flex max-w-3xl flex-col gap-3 rounded-[24px] border border-white/10 bg-white/[0.025] p-4 backdrop-blur-xl sm:flex-row sm:p-5">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Ignithon admin key</span>
            <input type="password" required value={adminKey} onChange={(event) => setAdminKey(event.target.value)} autoComplete="off" placeholder="Enter admin key" className="min-h-12 w-full rounded-[16px] border border-white/10 bg-black/50 px-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-400/60" />
          </label>
          <button disabled={loading} className={`${conthrax} flex min-h-12 items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 text-[9px] uppercase tracking-[0.18em] text-black transition-colors hover:bg-white disabled:opacity-50`}>
            <ShieldCheck size={15} /> {loading ? "Loading" : "Open registry"}
          </button>
        </form>

        {error && <p role="alert" className="mt-4 max-w-3xl rounded-2xl border border-red-400/25 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200">{error}</p>}

        {data && (
          <section className="mt-6 space-y-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[["Teams", data.summary.teams], ["Registrations", data.summary.registrations], ["Active", data.summary.active], ["Checked in", data.summary.checkedIn]].map(([label, value]) => (
                <div key={label} className="rounded-[20px] border border-white/10 bg-black/35 p-4 sm:p-5">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-white/35">{label}</p>
                  <p className={`${conthrax} mt-3 text-2xl text-cyan-300`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-3 backdrop-blur-xl sm:p-5">
              <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-white/40">Updated {new Date(data.generatedAt).toLocaleString()}</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button type="button" disabled={loading} onClick={() => loadRegistrations()} className={`${conthrax} flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 px-4 text-[8px] uppercase tracking-[0.16em] text-white/55 hover:border-cyan-400/35 hover:text-cyan-300`}><RefreshCw size={13} /> Refresh</button>
                  <button type="button" disabled={loading} onClick={exportCsv} className={`${conthrax} flex min-h-11 items-center justify-center gap-2 rounded-full bg-cyan-400 px-4 text-[8px] uppercase tracking-[0.16em] text-black hover:bg-white`}><Download size={13} /> Export CSV</button>
                </div>
              </div>

              <div data-lenis-prevent className="max-h-[68vh] space-y-3 overflow-y-auto overscroll-contain rounded-[16px] [scrollbar-color:rgba(0,247,255,0.35)_transparent] [scrollbar-width:thin]">
                {teamTrees.map(({ team, leader, members }) => (
                  <details key={team.id} className="group rounded-[20px] border border-white/10 bg-black/30 open:border-cyan-400/20" open>
                    <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 marker:hidden sm:px-5">
                      <div className="min-w-0">
                        <h2 className={`${conthrax} break-words text-sm uppercase text-white sm:text-base`}>{team.name}</h2>
                        <p className="mt-1 text-xs text-white/35">Team #{team.id} · {team.memberCount}/4 active members · {team.points} points</p>
                      </div>
                      <ChevronDown size={18} className="shrink-0 text-cyan-300/60 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-white/10 px-3 py-4 sm:px-5">
                      <div className="ml-2 space-y-3 border-l border-cyan-400/20 pl-3 sm:ml-4 sm:pl-5">
                        {leader && <RegistryPerson registration={leader} leader />}
                        {members.map((registration, index) => <RegistryPerson key={`${registration.email}-${registration.status}`} registration={registration} memberNumber={index + 1} />)}
                        {!leader && !members.length && <p className="py-3 text-sm text-white/35">No participant records found for this team.</p>}
                      </div>
                    </div>
                  </details>
                ))}
                {!teamTrees.length && <p className="rounded-[20px] border border-white/10 p-8 text-center text-sm text-white/35">No teams found.</p>}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function RegistryPerson({ registration, leader = false, memberNumber }: { registration: Registration; leader?: boolean; memberNumber?: number }) {
  return (
    <article className="relative rounded-[16px] border border-white/[0.08] bg-white/[0.02] p-4 before:absolute before:-left-4 before:top-7 before:h-px before:w-4 before:bg-cyan-400/20 sm:before:-left-6 sm:before:w-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${leader ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300" : "border-white/10 bg-white/[0.03] text-white/40"}`}>
            {leader ? <Crown size={15} /> : <UserRound size={15} />}
          </span>
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.18em] text-cyan-300/55">{leader ? "Team Leader" : `Member ${memberNumber}`}</p>
            <h3 className="mt-1 break-words text-sm font-medium text-white">{registration.name}</h3>
            <p className="mt-1 break-all text-xs text-white/40">{registration.email}</p>
          </div>
        </div>
        <span className={`w-fit rounded-full border px-2.5 py-1 text-[8px] uppercase tracking-[0.14em] ${registration.status === "ACTIVE" ? "border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300" : "border-red-400/20 bg-red-400/[0.05] text-red-300/70"}`}>{registration.status}</span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/[0.07] pt-4 text-xs sm:grid-cols-3 lg:grid-cols-6">
        <RegistryField label="Roll" value={registration.roll_no} />
        <RegistryField label="Phone" value={registration.phone} />
        <RegistryField label="Branch" value={registration.branch} />
        <RegistryField label="Year" value={registration.year} />
        <RegistryField label="Residence" value={registration.hostel} />
        <RegistryField label="Check-in" value={registration.checked_in_at ? new Date(registration.checked_in_at).toLocaleString() : "Pending"} />
      </dl>
    </article>
  );
}

function RegistryField({ label, value }: { label: string; value: string | number }) {
  return <div className="min-w-0"><dt className="text-[8px] uppercase tracking-[0.15em] text-white/25">{label}</dt><dd className="mt-1 break-words leading-relaxed text-white/55">{value}</dd></div>;
}
