"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, ChevronRight, Crown, LogOut, Pencil, Plus, QrCode, Trash2, X } from "lucide-react";
import SharedHeader from "../../../components/ui/SharedHeader";
import Footer from "../../../components/footer/Footer";
import CubeBackground from "../../../components/ui/CubeBackground";
import { isKiitEmailDomain } from "@/lib/ignithon-identity";

const conthrax = "font-['Conthrax',_sans-serif]";
const orbitron = "font-['Orbitron',_sans-serif]";
const inputClass = "min-h-12 w-full min-w-0 rounded-[16px] border border-white/10 bg-[#020606]/80 px-4 py-3 text-base text-white outline-none transition-all placeholder:text-white/25 focus:border-cyan-400/70 focus:bg-cyan-500/[0.025] sm:text-sm";
const closeButtonClass = "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white/45 transition-colors hover:border-cyan-300/40 hover:text-cyan-200";
type Member = { id: string; name: string; email: string; roll_no: string; qr_separator: string; hostel: string | null; phone: string; branch: string; year: number; team_id: string };
type Portal = { team: { id: number; name: string; room: string | null; points: number; leader_email: string; member_count: number }; participants: Member[]; session: { email: string; role: "leader" | "member" } };
type MemberDraft = { name: string; email: string; roll_no: string; hostel: string; phone: string; branch: string; year: string };
const blankMember: MemberDraft = { name: "", email: "", roll_no: "", hostel: "", phone: "", branch: "", year: "" };
const branchOptions = [
  "Aerospace Engineering", "BCA", "Biotech", "Chemical Engineering", "Civil Engineering",
  "Computer Science & Communication Engineering", "Computer Science & Engineering", "Computer Science & Systems Engineering",
  "Computer Science and Engineering with specialization Artificial Intelligence",
  "Computer Science and Engineering with specialization Artificial Intelligence and Machine Learning",
  "Computer Science and Engineering with specialization Cyber Security",
  "Computer Science and Engineering with specialization Data Science",
  "Computer Science and Engineering with specialization Internet of Things",
  "Computer Science and Engineering with specialization Internet of Things and Cyber Security Including Block Chain Technology",
  "Construction Technology", "Electrical and Computer Engineering", "Electrical Engineering", "Electronics & Electrical Engineering",
  "Electronics & Tele-Communication Engineering", "Electronics and Computer Science Engineering", "Electronics and Instrumentation",
  "Electronics Engineering VLSI Design and Technology", "Information Technology", "Law", "MCA", "Mechanical Engineering",
  "Mechanical Engineering (Automobile)", "Mechatronics Engineering", "Others",
];
const RETURNING_IDENTITY_COOKIE = "ignithon_returning_identity";
const REMEMBERED_PORTAL_TTL_SECONDS = 60 * 60 * 24 * 120;
const academicYearOptions = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
  { value: "5", label: "5th Year" },
];

function rememberReturningIdentity(rollNo: string, teamId: string) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${RETURNING_IDENTITY_COOKIE}=${encodeURIComponent(JSON.stringify({ rollNo, teamId }))}; Max-Age=${REMEMBERED_PORTAL_TTL_SECONDS}; Path=/; SameSite=Lax${secure}`;
}

function readReturningIdentity() {
  try {
    const raw = document.cookie.split("; ").find((entry) => entry.startsWith(`${RETURNING_IDENTITY_COOKIE}=`))?.split("=").slice(1).join("=");
    if (!raw) return null;
    const parsed = JSON.parse(decodeURIComponent(raw)) as { rollNo?: unknown; teamId?: unknown };
    return typeof parsed.rollNo === "string" && typeof parsed.teamId === "string" ? { rollNo: parsed.rollNo, teamId: parsed.teamId } : null;
  } catch {
    return null;
  }
}

async function readJson(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? "Something went wrong.");
  return body;
}

export default function IgnithonRegistrationPage() {
  const [portal, setPortal] = useState<Portal | null>(null);
  const [entryMode, setEntryMode] = useState<"register" | "login">("register");
  const entryCardRef = useRef<HTMLElement>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [access, setAccess] = useState({ rollNo: "", teamId: "" });
  const [teamName, setTeamName] = useState("");
  const [leader, setLeader] = useState<MemberDraft>(blankMember);
  const [member, setMember] = useState<MemberDraft>(blankMember);

  const loadPortal = async (teamId: string) => {
    const data = await readJson(await fetch(`/api/ignithon/teams/${teamId}`));
    setPortal(data); window.localStorage.setItem("ignithon-team-id", teamId);
  };

  useEffect(() => {
    const remembered = readReturningIdentity();
    if (remembered) {
      setAccess(remembered);
      void (async () => {
        try {
          const data = await readJson(await fetch("/api/ignithon/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rollNo: remembered.rollNo, teamId: Number(remembered.teamId) }) }));
          if (data.portal) { setPortal(data.portal); window.localStorage.setItem("ignithon-team-id", remembered.teamId); }
        } catch {
          // The remembered identity only restores an active, matching registration.
        }
      })();
    }
    const storedTeamId = window.localStorage.getItem("ignithon-team-id");
    if (!remembered && storedTeamId) loadPortal(storedTeamId).catch(() => window.localStorage.removeItem("ignithon-team-id"));
  }, []);

  const handleAccess = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setMessage("");
    try { const data = await readJson(await fetch("/api/ignithon/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rollNo: access.rollNo, teamId: Number(access.teamId) }) })); rememberReturningIdentity(access.rollNo, access.teamId); setPortal(data.portal); window.localStorage.setItem("ignithon-team-id", access.teamId); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to access the portal."); }
    finally { setLoading(false); }
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setMessage("");
    try { const result = await readJson(await fetch("/api/ignithon/teams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: teamName, leader: { ...leader, roll_no: leader.roll_no, year: Number(leader.year), hostel: leader.hostel || null } }) })); rememberReturningIdentity(leader.roll_no, String(result.teamId)); await loadPortal(String(result.teamId)); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to create the team."); }
    finally { setLoading(false); }
  };

  const addMember = async (event: FormEvent) => {
    event.preventDefault(); if (!portal) return false; setLoading(true); setMessage("");
    try { await readJson(await fetch(`/api/ignithon/teams/${portal.team.id}/participants`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...member, roll_no: member.roll_no, year: Number(member.year), hostel: member.hostel || null }) })); await loadPortal(String(portal.team.id)); setMember(blankMember); return true; }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to add this participant."); return false; }
    finally { setLoading(false); }
  };

  const removeMember = async (email: string) => {
    if (!portal || !window.confirm("Remove this participant? They will have a five-minute cooling period before joining another team.")) return;
    setLoading(true); setMessage("");
    try { await readJson(await fetch(`/api/ignithon/teams/${portal.team.id}/participants/${encodeURIComponent(email)}`, { method: "DELETE" })); await loadPortal(String(portal.team.id)); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to remove this participant."); }
    finally { setLoading(false); }
  };

  const transferLeadership = async (email: string) => {
    if (!portal || !window.confirm("Make this member the new team leader? You will immediately lose team administration access.")) return false;
    setLoading(true); setMessage("");
    try {
      await readJson(await fetch(`/api/ignithon/teams/${portal.team.id}/leader`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }));
      await loadPortal(String(portal.team.id));
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to transfer team leadership.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => { await fetch("/api/ignithon/session/logout", { method: "POST" }); setPortal(null); window.localStorage.removeItem("ignithon-team-id"); };

  const switchEntryMode = (mode: "register" | "login") => {
    setEntryMode(mode);
    setMessage("");
    requestAnimationFrame(() => entryCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#020202] text-white">
      <CubeBackground zIndex={0} disableLinesOnMobile />
      <SharedHeader />
      <main className={`relative z-10 mx-auto w-full px-4 pb-20 pt-24 sm:px-6 sm:pb-24 sm:pt-28 md:px-10 md:pt-36 ${portal ? "max-w-7xl" : "max-w-5xl"}`}>
        <div className="mx-auto mb-8 w-full max-w-2xl sm:mb-10">
          <p className="mb-3 text-[9px] uppercase tracking-[0.24em] text-cyan-300/60 sm:mb-4 sm:text-[10px] sm:tracking-[0.35em]">
            Ignithon 2.0 · 26th & 27th September 2026
          </p>
          <h1 className={`${conthrax} break-words text-[2rem] uppercase leading-[0.98] tracking-tight text-white sm:text-5xl md:text-6xl`}>
            {portal ? portal.team.name : "Team Registration"}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:mt-5 sm:text-base">
            {portal
              ? `${portal.participants[0]?.name ?? "Team leader"} leads this team. Team leaders manage membership; participants can update their own details.`
              : entryMode === "register"
                ? "Register as the team leader to create your team and receive a four-digit Team ID."
                : "Enter your registered roll number and four-digit Team ID to return to your team portal."}
          </p>
        </div>

        {message && <NotificationBox message={message} onDismiss={() => setMessage("")} />}

        {portal ? (
          <PortalView portal={portal} member={member} setMember={setMember} addMember={addMember} removeMember={removeMember} transferLeadership={transferLeadership} refreshPortal={() => loadPortal(String(portal.team.id))} logout={logout} loading={loading} notify={setMessage} />
        ) : (
          <section ref={entryCardRef} className="mx-auto grid w-full max-w-5xl scroll-mt-24 gap-8 rounded-[24px] border border-white/10 bg-white/[0.025] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:scroll-mt-28 sm:rounded-[28px] sm:p-8 md:grid-cols-[0.76fr_1.24fr] md:gap-10 md:p-10">
            <div className="flex flex-col justify-between border-b border-white/10 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-10">
              <div>
                <p className={`${orbitron} text-[9px] uppercase tracking-[0.28em] text-cyan-300/55`}>Ignithon 2.0 access</p>
                <h2 className={`${conthrax} mt-3 text-xl uppercase leading-tight tracking-tight text-white sm:text-2xl`}>
                  {entryMode === "register" ? "Build your team" : "Return to your team"}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-white/45">
                  {entryMode === "register" ? "Create the team record once, then use your portal to manage the roster." : "Use the roll number and Team ID already assigned to your registration."}
                </p>
              </div>
              <div className="mt-8 hidden rounded-[18px] border border-cyan-300/15 bg-cyan-400/[0.04] p-4 md:block">
                <p className={`${orbitron} text-[8px] uppercase tracking-[0.24em] text-cyan-300/60`}>Registration window</p>
                <p className={`${conthrax} mt-2 text-xs uppercase tracking-[0.1em] text-white/70`}>26–27 September 2026</p>
              </div>
            </div>
            <div className="min-w-0">
            {entryMode === "register" ? (
              <>
                <h2 className={`${conthrax} text-sm uppercase tracking-wider text-cyan-300 sm:text-base`}>
                  Register New Team
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/45">
                  Create your team first. Your four-digit Team ID will be generated after registration.
                </p>
                <form onSubmit={handleCreate} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <input className={`${inputClass} sm:col-span-2`} required value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder="Team name" aria-label="Team name" />
                  <MemberFields value={leader} setValue={setLeader} nameLabel="Team Leader Name" />
                  <button disabled={loading} className={`${conthrax} flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-black transition-colors hover:bg-white disabled:opacity-50 sm:col-span-2 sm:text-[10px] sm:tracking-[0.22em]`}>
                    Create team <ChevronRight size={14} />
                  </button>
                </form>
                <div className="mt-6 border-t border-white/10 pt-5 text-center">
                  <p className="text-xs text-white/40">Already registered with a team?</p>
                  <button type="button" onClick={() => switchEntryMode("login")} className={`${conthrax} mt-3 min-h-11 w-full rounded-full border border-cyan-400/35 px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-cyan-300 transition-colors hover:bg-cyan-400 hover:text-black sm:w-auto`}>
                    Existing Team Login
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-[9px] uppercase tracking-[0.25em] text-cyan-300/60 sm:text-[10px] sm:tracking-[0.3em]">Already registered</p>
                <h2 className={`${conthrax} mt-3 text-lg uppercase leading-tight text-white sm:mt-4 sm:text-xl`}>
                  Existing Team Login
                </h2>
                <form onSubmit={handleAccess} className="mt-6 space-y-3 sm:mt-7 sm:space-y-4">
                  <input className={inputClass} required inputMode="numeric" value={access.rollNo} onChange={(event) => setAccess({ ...access, rollNo: event.target.value.replace(/\D/g, "") })} placeholder="Registered roll number" aria-label="Registered roll number" />
                  <input className={inputClass} required inputMode="numeric" pattern="[0-9]{4}" maxLength={4} value={access.teamId} onChange={(event) => setAccess({ ...access, teamId: event.target.value.replace(/\D/g, "") })} placeholder="Four-digit Team ID" aria-label="Four-digit Team ID" />
                  <button disabled={loading} className={`${conthrax} flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-black transition-colors hover:bg-white disabled:opacity-50 sm:text-[10px] sm:tracking-[0.22em]`}>
                    Access portal <ChevronRight size={14} />
                  </button>
                </form>
                <div className="mt-6 border-t border-white/10 pt-5 text-center">
                  <p className="text-xs text-white/40">Creating a team for the first time?</p>
                  <button type="button" onClick={() => switchEntryMode("register")} className={`${conthrax} mt-3 min-h-11 w-full rounded-full border border-cyan-400/35 px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-cyan-300 transition-colors hover:bg-cyan-400 hover:text-black sm:w-auto`}>
                    Register New Team
                  </button>
                </div>
              </>
            )}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function NotificationBox({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 7000);
    return () => window.clearTimeout(timeout);
  }, [message, onDismiss]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[max(5rem,calc(env(safe-area-inset-top)+4rem))] z-[200] mx-auto w-full max-w-md px-4 sm:top-24 sm:max-w-xl" role="alert" aria-live="assertive">
      <div className="pointer-events-auto flex items-start gap-3 rounded-[20px] border border-red-300/50 bg-[#25090d]/95 px-4 py-3.5 shadow-[0_18px_50px_rgba(255,50,70,0.25),0_0_28px_rgba(255,60,80,0.14)] backdrop-blur-xl animate-[pulse_0.7s_ease-out_1] sm:px-5">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-red-300/35 bg-red-400/15 text-sm font-bold text-red-200">!</span>
        <div className="min-w-0 flex-1">
          <p className={`${conthrax} text-[10px] uppercase tracking-[0.18em] text-red-200`}>Registration notice</p>
          <p className="mt-1 text-sm leading-relaxed text-red-100/90">{message}</p>
        </div>
        <button type="button" onClick={onDismiss} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-red-100/60 transition-colors hover:bg-white/10 hover:text-white" aria-label="Dismiss notification"><X size={16} /></button>
      </div>
    </div>
  );
}

function MemberFields({ value, setValue, nameLabel = "Full name" }: { value: MemberDraft; setValue: (value: MemberDraft) => void; nameLabel?: string }) {
  const update = (key: keyof MemberDraft, next: string) => setValue({ ...value, [key]: next });
  const updateEmail = (email: string) => {
    const localPart = email.split("@")[0];
    setValue({
      ...value,
      email,
      roll_no: isKiitEmailDomain(email) && /^\d+$/.test(localPart) ? localPart : value.roll_no,
    });
  };

  return (
    <>
      <input className={inputClass} required value={value.name} onChange={(event) => update("name", event.target.value)} placeholder={nameLabel} aria-label={nameLabel} />
      <div className="min-w-0">
        <input className={`${inputClass} ${value.email && !isKiitEmailDomain(value.email) ? "border-red-300/60 focus:border-red-300" : ""}`} required type="email" value={value.email} onChange={(event) => updateEmail(event.target.value)} placeholder="KIIT email address" aria-label="KIIT email address" aria-invalid={Boolean(value.email && !isKiitEmailDomain(value.email))} />
        {value.email && !isKiitEmailDomain(value.email) && <p className="mt-1.5 px-1 text-[11px] leading-relaxed text-red-200/85">Only an approved KIIT email address is allowed.</p>}
      </div>
      <input className={inputClass} required inputMode="numeric" value={value.roll_no} onChange={(event) => update("roll_no", event.target.value.replace(/\D/g, ""))} placeholder="Roll / user ID" aria-label="Roll or user ID" />
      <input className={inputClass} required value={value.phone} onChange={(event) => update("phone", event.target.value)} placeholder="Phone" aria-label="Phone" />
      <InHouseSelect value={value.branch} onChange={(next) => update("branch", next)} placeholder="Branch" ariaLabel="Branch" options={branchOptions.map((branch) => ({ value: branch, label: branch }))} />
      <InHouseSelect value={value.year} onChange={(next) => update("year", next)} placeholder="Year" ariaLabel="Academic year" options={academicYearOptions} />
      <input className={`${inputClass} sm:col-span-2`} value={value.hostel} onChange={(event) => update("hostel", event.target.value)} placeholder="Hostel (leave blank for day boarder)" aria-label="Hostel" />
    </>
  );
}

function PortalView({ portal, member, setMember, addMember, removeMember, transferLeadership, refreshPortal, logout, loading, notify }: { portal: Portal; member: MemberDraft; setMember: (member: MemberDraft) => void; addMember: (event: FormEvent) => Promise<boolean>; removeMember: (email: string) => void; transferLeadership: (email: string) => Promise<boolean>; refreshPortal: () => Promise<void>; logout: () => void; loading: boolean; notify: (message: string) => void }) {
  const isLeader = portal.session.role === "leader";
  const [showAddMember, setShowAddMember] = useState(false);
  const [showPersonalQr, setShowPersonalQr] = useState(false);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [teamNameDraft, setTeamNameDraft] = useState(portal.team.name);
  const [savingTeamName, setSavingTeamName] = useState(false);
  const leaderEmail = portal.team.leader_email;
  const leader = portal.participants[0];
  const signedInParticipant = portal.participants.find((participant) => participant.email === portal.session.email);
  const registeredMembers = portal.participants.filter((participant) => participant.email !== leaderEmail);
  const selectedMember = portal.participants.find((participant) => participant.email === editingEmail);

  useEffect(() => setTeamNameDraft(portal.team.name), [portal.team.name]);

  const saveTeamName = async (event: FormEvent) => {
    event.preventDefault();
    setSavingTeamName(true);
    try {
      await readJson(await fetch(`/api/ignithon/teams/${portal.team.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: teamNameDraft }) }));
      await refreshPortal();
      notify("Team name updated successfully.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to update the team name.");
    } finally {
      setSavingTeamName(false);
    }
  };

  const submitMember = async (event: FormEvent) => {
    const added = await addMember(event);
    if (added) setShowAddMember(false);
  };

  const submitLeadershipTransfer = async (email: string) => {
    const transferred = await transferLeadership(email);
    if (!transferred) return;
    setEditingEmail(null);
    setShowAddMember(false);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:rounded-[28px] sm:p-6 md:p-8">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div>
              <p className="text-[9px] uppercase tracking-[0.28em] text-cyan-300/55">Team ID</p>
              <p className={`${conthrax} mt-2 text-3xl text-cyan-300 sm:text-4xl`}>{portal.team.id}</p>
            </div>
            <p className="mt-3 text-xs text-white/40">Team Leader · <span className="text-white/70">{leader?.name ?? "Not available"}</span></p>
            {isLeader && (
              <form onSubmit={saveTeamName} className="mt-4 flex max-w-xl flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor="team-name-editor">Team name</label>
                <input id="team-name-editor" className={`${inputClass} min-h-11 sm:max-w-sm`} value={teamNameDraft} onChange={(event) => setTeamNameDraft(event.target.value)} maxLength={80} required aria-label="Team name" />
                <button type="submit" disabled={savingTeamName || teamNameDraft.trim() === portal.team.name} className={`${conthrax} min-h-11 rounded-full border border-cyan-400/35 px-4 text-[9px] uppercase tracking-[0.14em] text-cyan-300 transition-colors hover:bg-cyan-400 hover:text-black disabled:opacity-35`}>{savingTeamName ? "Saving..." : "Update name"}</button>
              </form>
            )}
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button type="button" aria-pressed={showPersonalQr} onClick={() => setShowPersonalQr((current) => !current)} className={`${conthrax} flex min-h-11 w-full items-center justify-center gap-2 rounded-full border px-5 py-3 text-[9px] uppercase tracking-[0.18em] transition-colors sm:w-auto ${showPersonalQr ? "border-cyan-300 bg-cyan-400 text-black shadow-[0_0_24px_rgba(0,247,255,0.18)]" : "border-cyan-400/30 text-cyan-300 hover:bg-cyan-400 hover:text-black"}`}>
              <QrCode size={14} /> My QR
            </button>
            <button type="button" onClick={logout} className={`${conthrax} flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-white/45 transition-colors hover:border-cyan-400/40 hover:text-cyan-300 sm:w-auto`}>
              <LogOut size={14} /> Log out
            </button>
          </div>
        </div>

        {showPersonalQr && signedInParticipant && (
          <div className="mt-5 rounded-[22px] border border-cyan-300/45 bg-[#031011] p-4 shadow-[inset_0_0_32px_rgba(0,247,255,0.04)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.28em] text-cyan-300/55">Personal credential</p>
                <h2 className={`${conthrax} mt-2 break-words text-sm uppercase tracking-wider text-white sm:text-base`}>{signedInParticipant.name}</h2>
              </div>
            </div>
            <div className="mt-5 flex justify-center">
              <div className="shrink-0 overflow-hidden rounded-[20px] border border-white/15 bg-white p-3 shadow-[0_0_30px_rgba(0,247,255,0.12)]">
                <BrandedPersonalQr value={`${signedInParticipant.id}|${portal.team.id}`} name={signedInParticipant.name} />
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-end justify-between gap-4 sm:mt-8">
          <div>
            <p className="text-[9px] uppercase tracking-[0.28em] text-cyan-300/55">Player loadout</p>
            <h2 className={`${conthrax} mt-2 text-sm uppercase tracking-wider text-white sm:text-base`}>Team roster</h2>
          </div>
          <p className={`${conthrax} shrink-0 text-[10px] text-white/35`}>{portal.participants.length}/4</p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {portal.participants.map((participant) => {
            const isTeamLeader = participant.email === leaderEmail;
            const memberIndex = registeredMembers.findIndex((entry) => entry.email === participant.email) + 1;
            const canEditCard = isLeader || participant.email === portal.session.email;

            return (
              <article
                key={participant.email}
                role={canEditCard ? "button" : undefined}
                tabIndex={canEditCard ? 0 : undefined}
                aria-label={canEditCard ? `Edit ${participant.name}'s details` : undefined}
                aria-expanded={canEditCard ? editingEmail === participant.email : undefined}
                onClick={canEditCard ? () => setEditingEmail((current) => current === participant.email ? null : participant.email) : undefined}
                onKeyDown={canEditCard ? (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setEditingEmail((current) => current === participant.email ? null : participant.email);
                  }
                } : undefined}
                className={`group relative min-h-[210px] min-w-0 overflow-hidden rounded-[22px] border bg-gradient-to-br from-white/[0.045] to-transparent p-5 transition-colors ${canEditCard ? "cursor-pointer focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/20" : ""} ${editingEmail === participant.email ? "border-cyan-300/55 bg-cyan-400/[0.07]" : "border-white/10 hover:border-cyan-400/30"}`}
              >
                <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-cyan-400/[0.055] blur-2xl transition-colors group-hover:bg-cyan-400/10" />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`${conthrax} rounded-full border px-3 py-1.5 text-[8px] uppercase tracking-[0.16em] ${isTeamLeader ? "border-cyan-400/35 bg-cyan-400/10 text-cyan-200" : "border-white/10 bg-white/[0.035] text-white/45"}`}>
                      {isTeamLeader ? "Team Leader" : `Member ${memberIndex}`}
                    </span>
                    <span className={`${conthrax} text-xl text-white/10`}>{String(isTeamLeader ? 1 : memberIndex + 1)}</span>
                  </div>
                  <div className={`mt-auto min-w-0 pt-8 ${canEditCard ? "pb-12" : ""}`}>
                    <h3 className={`${conthrax} break-words text-base uppercase leading-snug text-white`}>{participant.name}</h3>
                    <p className="mt-2 break-all text-xs leading-relaxed text-white/40">{participant.email}</p>
                    <p className="mt-1 text-xs text-white/30">Roll {participant.roll_no} · Year {participant.year}</p>
                  </div>
                  {canEditCard && (
                    <div className="absolute bottom-0 right-0 flex items-center gap-2">
                      <button type="button" onClick={(event) => { event.stopPropagation(); setEditingEmail((current) => current === participant.email ? null : participant.email); }} className="flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-full border border-cyan-400/20 bg-black/25 px-3 text-[9px] uppercase tracking-[0.12em] text-cyan-300/60 transition-colors hover:border-cyan-300/50 hover:text-cyan-200" aria-label={`Edit ${participant.name}`}>
                        <Pencil size={14} /> <span className="hidden sm:inline">Edit</span>
                      </button>
                      {isLeader && !isTeamLeader && (
                        <button type="button" disabled={loading} onClick={(event) => { event.stopPropagation(); removeMember(participant.email); }} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white/30 transition-colors hover:border-red-300/35 hover:bg-red-400/10 hover:text-red-300 disabled:opacity-40" aria-label={`Remove ${participant.name}`}>
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}

          {isLeader && registeredMembers.length < 3 && (
            <button type="button" onClick={() => setShowAddMember((current) => !current)} aria-expanded={showAddMember} className={`group flex min-h-[210px] flex-col items-center justify-center rounded-[22px] border border-dashed p-5 text-center transition-all ${showAddMember ? "border-cyan-300/65 bg-cyan-400/[0.09]" : "border-cyan-400/25 bg-cyan-400/[0.025] hover:border-cyan-300/55 hover:bg-cyan-400/[0.07]"}`}>
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/35 bg-cyan-400/10 text-cyan-300 transition-transform group-hover:scale-105">
                <Plus size={24} />
              </span>
              <span className={`${conthrax} mt-5 text-[11px] uppercase tracking-[0.16em] text-cyan-200`}>Add New Member</span>
              <span className={`${conthrax} mt-2 text-[10px] text-white/35`}>({registeredMembers.length + 1}/3)</span>
            </button>
          )}
        </div>
      </section>

      {isLeader && showAddMember && registeredMembers.length < 3 && (
        <form onSubmit={submitMember} className="rounded-[24px] border border-cyan-400/25 bg-cyan-400/[0.035] p-4 backdrop-blur-xl sm:rounded-[28px] sm:p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[9px] uppercase tracking-[0.28em] text-cyan-300/55">New roster slot</p>
              <h2 className={`${conthrax} mt-2 text-sm uppercase tracking-wider text-cyan-200 sm:text-base`}>Member {registeredMembers.length + 1} details</h2>
            </div>
            <button type="button" onClick={() => setShowAddMember(false)} className={closeButtonClass} aria-label="Close new member form"><X size={15} /></button>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <MemberFields value={member} setValue={setMember} />
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setShowAddMember(false)} className={`${conthrax} min-h-12 w-full rounded-full border border-white/10 px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-white/45 transition-colors hover:border-white/25 hover:text-white sm:w-auto`}>Cancel</button>
            <button disabled={loading} className={`${conthrax} flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-black transition-colors hover:bg-white disabled:opacity-50 sm:w-auto sm:text-[10px] sm:tracking-[0.22em]`}>
              <Plus size={14} /> Add Member {registeredMembers.length + 1}
            </button>
          </div>
        </form>
      )}

      {selectedMember && (
        <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-4 backdrop-blur-xl sm:rounded-[28px] sm:p-6 md:p-8">
          <EditMyDetails key={selectedMember.id} member={selectedMember} onSaved={refreshPortal} onClose={() => setEditingEmail(null)} notify={notify} />
          {isLeader && selectedMember.email !== leaderEmail && (
            <div className="mt-7 border-t border-white/10 pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.28em] text-cyan-300/55">Team administration</p>
                  <h3 className={`${conthrax} mt-2 text-xs uppercase tracking-wider text-white sm:text-sm`}>Transfer leadership</h3>
                  <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/40">Promote {selectedMember.name} to team leader. Your account will become a regular team member immediately.</p>
                </div>
                <button type="button" disabled={loading} onClick={() => submitLeadershipTransfer(selectedMember.email)} className={`${conthrax} flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full border border-cyan-400/45 px-5 py-3 text-[9px] uppercase tracking-[0.16em] text-cyan-300 transition-colors hover:bg-cyan-400 hover:text-black disabled:opacity-50 sm:w-auto`}>
                  <Crown size={14} /> Make Team Leader
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function BrandedPersonalQr({ value, name }: { value: string; name: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    setReady(false);

    void import("qr-code-styling").then(async ({ default: QRCodeStyling }) => {
      if (cancelled || !container) return;
      const qrCode = new QRCodeStyling({
        width: 320,
        height: 320,
        type: "svg",
        data: value,
        image: "/k1000-qr-logo.png",
        margin: 12,
        qrOptions: { errorCorrectionLevel: "H" },
        dotsOptions: { color: "#020202", type: "square" },
        cornersSquareOptions: { color: "#020202", type: "extra-rounded" },
        cornersDotOptions: { color: "#020202", type: "dot" },
        backgroundOptions: { color: "#ffffff" },
        imageOptions: { hideBackgroundDots: true, imageSize: 0.35, margin: 0 },
      });
      qrCode.applyExtension((svg) => {
        const image = svg.querySelector("image");
        if (!image) return;
        const x = Number.parseFloat(image.getAttribute("x") ?? "0");
        const y = Number.parseFloat(image.getAttribute("y") ?? "0");
        const width = Number.parseFloat(image.getAttribute("width") ?? "0");
        const height = Number.parseFloat(image.getAttribute("height") ?? "0");
        if (!width || !height) return;
        const clipId = "qr-logo-rounded-clip";
        const defs = svg.querySelector("defs") ?? svg.insertBefore(svg.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "defs"), svg.firstChild);
        const clipPath = svg.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        clipPath.setAttribute("id", clipId);
        const roundedRect = svg.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "rect");
        roundedRect.setAttribute("x", String(x)); roundedRect.setAttribute("y", String(y)); roundedRect.setAttribute("width", String(width)); roundedRect.setAttribute("height", String(height));
        roundedRect.setAttribute("rx", String(Math.min(width, height) * 0.16)); roundedRect.setAttribute("ry", String(Math.min(width, height) * 0.16));
        clipPath.appendChild(roundedRect); defs.appendChild(clipPath); image.setAttribute("clip-path", `url(#${clipId})`);
      });
      await qrCode.getRawData("svg");
      if (cancelled) return;
      container.replaceChildren();
      qrCode.append(container);
      setReady(true);
    });

    return () => {
      cancelled = true;
      container?.replaceChildren();
    };
  }, [value]);

  return (
    <div role="img" aria-label={`Personal QR code for ${name}`} className="relative h-[220px] w-[220px] min-h-[220px] min-w-[220px] shrink-0 sm:h-[260px] sm:w-[260px] sm:min-h-[260px] sm:min-w-[260px]">
      <div ref={containerRef} className={`flex h-full w-full items-center justify-center overflow-hidden rounded-[16px] bg-white [&_svg]:block [&_svg]:h-full [&_svg]:w-full ${ready ? "" : "animate-pulse"}`} />
      {!ready && <span className={`${conthrax} pointer-events-none absolute inset-0 flex items-center justify-center text-center text-[9px] uppercase tracking-[0.18em] text-black/45`}>Generating secure QR</span>}
    </div>
  );
}

function EditMyDetails({ member, onSaved, onClose, notify }: { member: Member; onSaved: () => Promise<void>; onClose: () => void; notify: (message: string) => void }) {
  const [draft, setDraft] = useState(() => ({ name: member.name, hostel: member.hostel ?? "", phone: member.phone, branch: member.branch, year: String(member.year) }));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setDraft({ name: member.name, hostel: member.hostel ?? "", phone: member.phone, branch: member.branch, year: String(member.year) });
  }, [member.id, member.name, member.hostel, member.phone, member.branch, member.year]);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true); setSaved(false);
    try {
      await readJson(await fetch(`/api/ignithon/teams/${member.team_id}/participants/${encodeURIComponent(member.email)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...draft, year: Number(draft.year), hostel: draft.hostel || null }) }));
      await onSaved();
      setSaved(true);
    } catch (saveError) {
      notify(saveError instanceof Error ? saveError.message : "Unable to save your details.");
    } finally {
      setSaving(false);
    }
  };
  return <form onSubmit={save}><div className="flex items-start justify-between gap-4"><div><p className="text-[9px] uppercase tracking-[0.28em] text-cyan-300/55">Selected player</p><h3 className={`${conthrax} mt-2 break-words text-sm uppercase tracking-wider text-cyan-300`}>Edit {member.name}</h3></div><button type="button" onClick={onClose} className={closeButtonClass} aria-label="Close member details"><X size={15} /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><input className={inputClass} value={draft.name} onChange={(e) => { setSaved(false); setDraft({ ...draft, name: e.target.value }); }} required placeholder="Full name" aria-label="Edit full name" /><input className={inputClass} value={draft.phone} onChange={(e) => { setSaved(false); setDraft({ ...draft, phone: e.target.value }); }} required placeholder="Phone" aria-label="Edit phone" /><InHouseSelect value={draft.branch} onChange={(branch) => { setSaved(false); setDraft({ ...draft, branch }); }} placeholder="Branch" ariaLabel="Edit branch" options={branchOptions.map((branch) => ({ value: branch, label: branch }))} /><InHouseSelect value={draft.year} onChange={(year) => { setSaved(false); setDraft({ ...draft, year }); }} placeholder="Year" ariaLabel="Edit academic year" options={academicYearOptions} /><input className={`${inputClass} sm:col-span-2`} value={draft.hostel} onChange={(e) => { setSaved(false); setDraft({ ...draft, hostel: e.target.value }); }} placeholder="Hostel (leave blank for day boarder)" aria-label="Edit hostel" /></div><div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center"><button disabled={saving} className={`${conthrax} min-h-12 w-full rounded-full border border-cyan-400/50 px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-cyan-300 transition-colors hover:bg-cyan-400 hover:text-black disabled:opacity-50 sm:w-auto sm:text-[10px] sm:tracking-[0.2em]`}>{saving ? "Saving..." : "Save details"}</button>{saved && <span role="status" className="text-center text-xs text-cyan-300 sm:text-left">Changes saved successfully.</span>}</div></form>;
}

function InHouseSelect({ value, onChange, placeholder, ariaLabel, options }: { value: string; onChange: (value: string) => void; placeholder: string; ariaLabel: string; options: { value: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative min-w-0 ${open ? "z-40" : "z-0"}`}>
      <button type="button" role="combobox" aria-label={ariaLabel} aria-controls={menuId} aria-expanded={open} aria-haspopup="listbox" onClick={() => setOpen((current) => !current)} className={`${inputClass} flex items-center justify-between gap-3 text-left ${open ? "border-cyan-400/70 bg-cyan-500/[0.035]" : ""}`}>
        <span className={`min-w-0 truncate ${selected ? "text-white" : "text-white/35"}`}>{selected?.label ?? placeholder}</span>
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 text-cyan-300 transition-transform ${open ? "rotate-180 bg-cyan-400/10" : ""}`}><ChevronDown size={14} /></span>
      </button>
      {open && (
        <div data-lenis-prevent id={menuId} role="listbox" aria-label={`${ariaLabel} options`} onWheel={(event) => event.stopPropagation()} onTouchMove={(event) => event.stopPropagation()} className="absolute left-0 right-0 top-full z-50 mt-2 max-h-56 touch-pan-y overflow-y-auto overscroll-contain rounded-[16px] border border-cyan-400/25 bg-[#030909]/98 p-1.5 shadow-[0_20px_55px_rgba(0,0,0,0.8),0_0_24px_rgba(0,247,255,0.08)] backdrop-blur-2xl [scrollbar-color:rgba(0,247,255,0.35)_transparent] [scrollbar-width:thin]">
          {options.map((option) => (
            <button key={option.value} type="button" role="option" aria-selected={option.value === value} onClick={() => { onChange(option.value); setOpen(false); }} className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${option.value === value ? "bg-cyan-400/12 text-cyan-200" : "text-white/55 hover:bg-white/[0.06] hover:text-white"}`}>
              <span>{option.label}</span>
              {option.value === value && <Check size={14} className="shrink-0 text-cyan-300" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
