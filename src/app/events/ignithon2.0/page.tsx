"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { Check, ChevronDown, ChevronRight, Crown, LogOut, Plus, QrCode, Trash2, X } from "lucide-react";
import SharedHeader from "../../../components/ui/SharedHeader";
import Footer from "../../../components/footer/Footer";
import CubeBackground from "../../../components/ui/CubeBackground";

const conthrax = "font-['Conthrax',_sans-serif]";
const inputClass = "min-h-12 w-full min-w-0 rounded-[16px] border border-white/10 bg-[#020606]/80 px-4 py-3 text-base text-white outline-none transition-all placeholder:text-white/25 focus:border-cyan-400/70 focus:bg-cyan-500/[0.025] sm:text-sm";
const closeButtonClass = "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white/45 transition-colors hover:border-cyan-300/40 hover:text-cyan-200";
type Member = { name: string; email: string; is_kiit_student: boolean; roll_no: number; hostel: string | null; phone: string; branch: string; year: number; team_id: number };
type Portal = { team: { id: number; name: string; points: number; members: { email: string; role: "leader" | "member" }[] }; participants: Member[]; session: { email: string; role: "leader" | "member" } };
type MemberDraft = { name: string; email: string; is_kiit_student: boolean | null; roll_no: string; hostel: string; phone: string; branch: string; year: string };
const blankMember: MemberDraft = { name: "", email: "", is_kiit_student: null, roll_no: "", hostel: "", phone: "", branch: "", year: "" };
const branchOptions = ["Aerospace Engineering", "Biotechnology", "Civil Engineering", "Computer Science & Engineering", "Electrical Engineering", "Electronics & Tele-Communication Engineering", "Information Technology", "Mechanical Engineering", "Other"];
const RETURNING_IDENTITY_COOKIE = "ignithon_returning_identity";

function rememberReturningIdentity(rollNo: string, teamId: string) {
  document.cookie = `${RETURNING_IDENTITY_COOKIE}=${encodeURIComponent(JSON.stringify({ rollNo, teamId }))}; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax`;
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
    if (remembered) setAccess(remembered);
    const storedTeamId = window.localStorage.getItem("ignithon-team-id");
    if (storedTeamId) loadPortal(storedTeamId).catch(() => window.localStorage.removeItem("ignithon-team-id"));
  }, []);

  const handleAccess = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setMessage("");
    try { await readJson(await fetch("/api/ignithon/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rollNo: Number(access.rollNo), teamId: Number(access.teamId) }) })); rememberReturningIdentity(access.rollNo, access.teamId); await loadPortal(access.teamId); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to access the portal."); }
    finally { setLoading(false); }
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setMessage("");
    try { const result = await readJson(await fetch("/api/ignithon/teams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: teamName, leader: { ...leader, roll_no: Number(leader.roll_no), year: Number(leader.year), hostel: leader.hostel || null } }) })); rememberReturningIdentity(leader.roll_no, String(result.teamId)); await loadPortal(String(result.teamId)); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to create the team."); }
    finally { setLoading(false); }
  };

  const addMember = async (event: FormEvent) => {
    event.preventDefault(); if (!portal) return false; setLoading(true); setMessage("");
    try { await readJson(await fetch(`/api/ignithon/teams/${portal.team.id}/participants`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...member, roll_no: Number(member.roll_no), year: Number(member.year), hostel: member.hostel || null }) })); await loadPortal(String(portal.team.id)); setMember(blankMember); return true; }
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
      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-24 sm:px-6 sm:pb-24 sm:pt-28 md:px-10 md:pt-36">
        <div className="mx-auto mb-8 w-full max-w-2xl sm:mb-10">
          <p className="mb-3 text-[9px] uppercase tracking-[0.24em] text-cyan-300/60 sm:mb-4 sm:text-[10px] sm:tracking-[0.35em]">
            Ignithon 2.0 · 26th & 27th September 2026
          </p>
          <h1 className={`${conthrax} break-words text-[2rem] uppercase leading-[0.98] tracking-tight text-white sm:text-5xl md:text-6xl`}>
            {portal ? portal.team.name : "Team Registration"}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:mt-5 sm:text-base">
            {portal
              ? "Manage your Ignithon 2.0 team. Team leaders manage membership; participants can access and update their own details."
              : entryMode === "register"
                ? "Register as the team leader to create your team and receive a four-digit Team ID."
                : "Enter your registered roll number and four-digit Team ID to return to your team portal."}
          </p>
        </div>

        {message && (
          <div role="alert" className="mx-auto mb-5 w-full max-w-2xl rounded-2xl border border-red-400/30 bg-red-400/[0.06] px-4 py-3 text-sm leading-relaxed text-red-200">
            {message}
          </div>
        )}

        {portal ? (
          <PortalView portal={portal} member={member} setMember={setMember} addMember={addMember} removeMember={removeMember} transferLeadership={transferLeadership} refreshPortal={() => loadPortal(String(portal.team.id))} logout={logout} loading={loading} />
        ) : (
          <section ref={entryCardRef} className="mx-auto w-full max-w-2xl scroll-mt-24 rounded-[24px] border border-white/10 bg-white/[0.025] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:scroll-mt-28 sm:rounded-[28px] sm:p-8">
            {entryMode === "register" ? (
              <>
                <h2 className={`${conthrax} text-sm uppercase tracking-wider text-cyan-300 sm:text-base`}>
                  Register New Leader
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/45">
                  Create your team first. Your four-digit Team ID will be generated after registration.
                </p>
                <form onSubmit={handleCreate} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <input className={`${inputClass} sm:col-span-2`} required value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder="Team name" aria-label="Team name" />
                  <MemberFields value={leader} setValue={setLeader} leader />
                  <button disabled={loading} className={`${conthrax} flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-black transition-colors hover:bg-white disabled:opacity-50 sm:col-span-2 sm:text-[10px] sm:tracking-[0.22em]`}>
                    Create team <ChevronRight size={14} />
                  </button>
                </form>
                <div className="mt-6 border-t border-white/10 pt-5 text-center">
                  <p className="text-xs text-white/40">Already registered as a team leader?</p>
                  <button type="button" onClick={() => switchEntryMode("login")} className={`${conthrax} mt-3 min-h-11 w-full rounded-full border border-cyan-400/35 px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-cyan-300 transition-colors hover:bg-cyan-400 hover:text-black sm:w-auto`}>
                    Existing Leader Login
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-[9px] uppercase tracking-[0.25em] text-cyan-300/60 sm:text-[10px] sm:tracking-[0.3em]">Already registered</p>
                <h2 className={`${conthrax} mt-3 text-lg uppercase leading-tight text-white sm:mt-4 sm:text-xl`}>
                  Log in to your portal
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
                    Register New Leader
                  </button>
                </div>
              </>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function MemberFields({ value, setValue, leader = false }: { value: MemberDraft; setValue: (value: MemberDraft) => void; leader?: boolean }) {
  const update = (key: keyof MemberDraft, next: string) => setValue({ ...value, [key]: next });
  const setStudentType = (isKiitStudent: boolean) => setValue({
    ...value,
    is_kiit_student: isKiitStudent,
    email: "",
    roll_no: "",
  });
  const updateEmail = (email: string) => {
    const localPart = email.split("@")[0];
    setValue({
      ...value,
      email,
      roll_no: value.is_kiit_student && /^\d+$/.test(localPart) ? localPart : value.roll_no,
    });
  };

  return (
    <>
      <fieldset className="sm:col-span-2">
        <legend className="mb-2 text-xs text-white/55">Are you a KIIT student?</legend>
        <div className="grid grid-cols-2 gap-2 rounded-[16px] border border-white/10 bg-[#020606]/80 p-1.5">
          {[true, false].map((isKiitStudent) => (
            <label key={String(isKiitStudent)} className={`${conthrax} flex min-h-10 cursor-pointer items-center justify-center rounded-xl border text-[9px] uppercase tracking-[0.16em] transition-colors ${value.is_kiit_student === isKiitStudent ? "border-cyan-400/50 bg-cyan-400/12 text-cyan-200" : "border-transparent text-white/35 hover:text-white/60"}`}>
              <input className="sr-only" type="radio" name={leader ? "leader-kiit-student" : "member-kiit-student"} required checked={value.is_kiit_student === isKiitStudent} onChange={() => setStudentType(isKiitStudent)} />
              {isKiitStudent ? "Yes" : "No"}
            </label>
          ))}
        </div>
      </fieldset>
      <input className={inputClass} required value={value.name} onChange={(event) => update("name", event.target.value)} placeholder="Full name" aria-label={leader ? "Team leader full name" : "Participant full name"} />
      <input className={inputClass} required type="email" value={value.email} onChange={(event) => updateEmail(event.target.value)} placeholder={value.is_kiit_student ? "Roll number@kiit.ac.in" : "Email address"} aria-label={value.is_kiit_student ? "KIIT email" : "Email address"} pattern={value.is_kiit_student ? "^[0-9]+@kiit\\.ac\\.in$" : undefined} disabled={value.is_kiit_student === null} />
      <input className={inputClass} required inputMode="numeric" value={value.roll_no} onChange={(event) => update("roll_no", event.target.value.replace(/\D/g, ""))} placeholder={value.is_kiit_student ? "Roll number (autofilled)" : "College roll / ID number"} aria-label="Roll number" readOnly={value.is_kiit_student === true} disabled={value.is_kiit_student === null} />
      <input className={inputClass} required value={value.phone} onChange={(event) => update("phone", event.target.value)} placeholder="Phone" aria-label="Phone" />
      <InHouseSelect value={value.branch} onChange={(next) => update("branch", next)} placeholder="Branch" ariaLabel="Branch" options={branchOptions.map((branch) => ({ value: branch, label: branch }))} />
      <InHouseSelect value={value.year} onChange={(next) => update("year", next)} placeholder="Year" ariaLabel="Academic year" options={[1,2,3,4,5,6].map((year) => ({ value: String(year), label: `Year ${year}` }))} />
      <input className={`${inputClass} sm:col-span-2`} value={value.hostel} onChange={(event) => update("hostel", event.target.value)} placeholder="Hostel (leave blank for day boarder)" aria-label="Hostel" />
    </>
  );
}

function PortalView({ portal, member, setMember, addMember, removeMember, transferLeadership, refreshPortal, logout, loading }: { portal: Portal; member: MemberDraft; setMember: (member: MemberDraft) => void; addMember: (event: FormEvent) => Promise<boolean>; removeMember: (email: string) => void; transferLeadership: (email: string) => Promise<boolean>; refreshPortal: () => Promise<void>; logout: () => void; loading: boolean }) {
  const isLeader = portal.session.role === "leader";
  const [showAddMember, setShowAddMember] = useState(false);
  const [showTeamQr, setShowTeamQr] = useState(false);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [qrEmail, setQrEmail] = useState<string | null>(null);
  const leaderEmail = portal.team.members.find((entry) => entry.role === "leader")?.email;
  const registeredMembers = portal.participants.filter((participant) => participant.email !== leaderEmail);
  const selectedMember = portal.participants.find((participant) => participant.email === editingEmail);
  const qrMember = portal.participants.find((participant) => participant.email === qrEmail);

  const submitMember = async (event: FormEvent) => {
    const added = await addMember(event);
    if (added) setShowAddMember(false);
  };

  const submitLeadershipTransfer = async (email: string) => {
    const transferred = await transferLeadership(email);
    if (!transferred) return;
    setEditingEmail(null);
    setQrEmail(null);
    setShowAddMember(false);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:rounded-[28px] sm:p-6 md:p-8">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-end gap-5 sm:gap-8">
            <div>
              <p className="text-[9px] uppercase tracking-[0.28em] text-cyan-300/55">Team ID</p>
              <p className={`${conthrax} mt-2 text-3xl text-cyan-300 sm:text-4xl`}>{portal.team.id}</p>
            </div>
            <div className="border-l border-white/10 pl-5 sm:pl-8">
              <p className="text-[9px] uppercase tracking-[0.28em] text-white/35">Score</p>
              <p className={`${conthrax} mt-2 text-base text-white sm:text-lg`}>{portal.team.points} <span className="text-[9px] text-white/35">PTS</span></p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button type="button" aria-pressed={showTeamQr} onClick={() => setShowTeamQr((current) => !current)} className={`${conthrax} flex min-h-11 w-full items-center justify-center gap-2 rounded-full border px-5 py-3 text-[9px] uppercase tracking-[0.18em] transition-colors sm:w-auto ${showTeamQr ? "border-cyan-300 bg-cyan-400 text-black shadow-[0_0_24px_rgba(0,247,255,0.18)]" : "border-cyan-400/30 text-cyan-300 hover:bg-cyan-400 hover:text-black"}`}>
              <QrCode size={14} /> Team QR
            </button>
            <button type="button" onClick={logout} className={`${conthrax} flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-white/45 transition-colors hover:border-cyan-400/40 hover:text-cyan-300 sm:w-auto`}>
              <LogOut size={14} /> Log out
            </button>
          </div>
        </div>

        <div role="status" className="mt-5 flex items-start gap-3 rounded-[16px] border border-cyan-400/15 bg-cyan-400/[0.035] px-4 py-3 text-xs leading-relaxed text-white/55">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(0,247,255,0.8)]" />
          <p>{isLeader ? "Team registration is active. Select a member card to update details, or present the Team QR for team verification." : "Your registration is active. Select your own card to update your details, or present your participant QR at verification."}</p>
        </div>

        {showTeamQr && (
          <div className="mt-5 rounded-[22px] border border-cyan-300/45 bg-[#031011] p-4 shadow-[inset_0_0_32px_rgba(0,247,255,0.04)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.28em] text-cyan-300/55">Selected credential</p>
                <h2 className={`${conthrax} mt-2 break-words text-sm uppercase tracking-wider text-white sm:text-base`}>{portal.team.name}</h2>
              </div>
              <span className={`${conthrax} rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-[8px] uppercase tracking-[0.14em] text-cyan-200`}>Team QR active</span>
            </div>
            <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-center">
              <div className="overflow-hidden rounded-[20px] border border-white/15 bg-white p-3 shadow-[0_0_30px_rgba(0,247,255,0.12)]">
                <Image unoptimized src={`/api/ignithon/teams/${portal.team.id}/qr`} width={260} height={260} alt={`Team QR code for ${portal.team.name}`} className="h-auto w-[220px] sm:w-[260px]" />
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">Authenticated team</p>
                <p className={`${conthrax} mt-3 break-words text-xl uppercase text-white`}>{portal.team.name}</p>
                <p className={`${conthrax} mt-3 text-3xl text-cyan-300`}>#{portal.team.id}</p>
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

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                    <span className={`${conthrax} text-xl text-white/10`}>{String(isTeamLeader ? 0 : memberIndex).padStart(2, "0")}</span>
                  </div>
                  <div className={`mt-auto min-w-0 pt-8 ${canEditCard ? "pb-12" : ""}`}>
                    <h3 className={`${conthrax} break-words text-base uppercase leading-snug text-white`}>{participant.name}</h3>
                    <p className="mt-2 break-all text-xs leading-relaxed text-white/40">{participant.email}</p>
                    <p className="mt-1 text-xs text-white/30">Roll {participant.roll_no} · Year {participant.year}</p>
                  </div>
                  {isLeader && !isTeamLeader && (
                    <button type="button" disabled={loading} onClick={(event) => { event.stopPropagation(); removeMember(participant.email); }} className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/30 transition-colors hover:border-red-300/35 hover:bg-red-400/10 hover:text-red-300 disabled:opacity-40" aria-label={`Remove ${participant.name}`}>
                      <Trash2 size={15} />
                    </button>
                  )}
                  {canEditCard && (
                    <button type="button" onClick={(event) => { event.stopPropagation(); setQrEmail((current) => current === participant.email ? null : participant.email); }} className="absolute bottom-0 left-0 flex min-h-10 items-center gap-1.5 rounded-full border border-cyan-400/20 bg-black/25 px-3 text-[9px] uppercase tracking-[0.12em] text-cyan-300/60 transition-colors hover:border-cyan-300/50 hover:text-cyan-200" aria-label={`Show QR code for ${participant.name}`}>
                      <QrCode size={14} /> QR
                    </button>
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

      {qrMember && (
        <section className="rounded-[24px] border border-cyan-400/25 bg-cyan-400/[0.035] p-4 backdrop-blur-xl sm:rounded-[28px] sm:p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] uppercase tracking-[0.28em] text-cyan-300/55">Attendance identity</p>
              <h2 className={`${conthrax} mt-2 break-words text-sm uppercase tracking-wider text-cyan-200 sm:text-base`}>{qrMember.name}&apos;s QR</h2>
            </div>
            <button type="button" onClick={() => setQrEmail(null)} className={closeButtonClass} aria-label="Close participant QR"><X size={15} /></button>
          </div>
          <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <div className="overflow-hidden rounded-[20px] border border-white/15 bg-white p-3 shadow-[0_0_30px_rgba(0,247,255,0.1)]">
              <Image unoptimized src={`/api/ignithon/teams/${portal.team.id}/participants/${encodeURIComponent(qrMember.email)}/qr`} width={240} height={240} alt={`Attendance QR code for ${qrMember.name}`} className="h-auto w-[220px] sm:w-[240px]" />
            </div>
            <div className="min-w-0 text-center sm:pt-2 sm:text-left">
              <span className={`${conthrax} inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-[8px] uppercase tracking-[0.14em] text-cyan-200`}>Ready for verification</span>
              <p className="mt-4 break-all text-xs text-white/40">{qrMember.email}</p>
              <p className="mt-2 text-xs text-white/30">Team #{portal.team.id}</p>
            </div>
          </div>
        </section>
      )}

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
          <EditMyDetails member={selectedMember} onSaved={refreshPortal} onClose={() => setEditingEmail(null)} />
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

function EditMyDetails({ member, onSaved, onClose }: { member: Member; onSaved: () => Promise<void>; onClose: () => void }) {
  const [draft, setDraft] = useState({ name: member.name, hostel: member.hostel ?? "", phone: member.phone, branch: member.branch, year: String(member.year) });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true); setSaved(false); setError("");
    try {
      await readJson(await fetch(`/api/ignithon/teams/${member.team_id}/participants/${encodeURIComponent(member.email)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...draft, year: Number(draft.year), hostel: draft.hostel || null }) }));
      await onSaved();
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save your details.");
    } finally {
      setSaving(false);
    }
  };
  return <form onSubmit={save}><div className="flex items-start justify-between gap-4"><div><p className="text-[9px] uppercase tracking-[0.28em] text-cyan-300/55">Selected player</p><h3 className={`${conthrax} mt-2 break-words text-sm uppercase tracking-wider text-cyan-300`}>Edit {member.name}</h3></div><button type="button" onClick={onClose} className={closeButtonClass} aria-label="Close member details"><X size={15} /></button></div>{error && <p role="alert" className="mt-4 rounded-xl border border-red-400/25 bg-red-400/[0.06] px-3 py-2 text-xs text-red-200">{error}</p>}<div className="mt-5 grid gap-3 sm:grid-cols-2"><input className={inputClass} value={draft.name} onChange={(e) => { setSaved(false); setDraft({ ...draft, name: e.target.value }); }} required placeholder="Full name" aria-label="Edit full name" /><input className={inputClass} value={draft.phone} onChange={(e) => { setSaved(false); setDraft({ ...draft, phone: e.target.value }); }} required placeholder="Phone" aria-label="Edit phone" /><InHouseSelect value={draft.branch} onChange={(branch) => { setSaved(false); setDraft({ ...draft, branch }); }} placeholder="Branch" ariaLabel="Edit branch" options={branchOptions.map((branch) => ({ value: branch, label: branch }))} /><InHouseSelect value={draft.year} onChange={(year) => { setSaved(false); setDraft({ ...draft, year }); }} placeholder="Year" ariaLabel="Edit academic year" options={[1,2,3,4,5,6].map((year) => ({ value: String(year), label: `Year ${year}` }))} /><input className={`${inputClass} sm:col-span-2`} value={draft.hostel} onChange={(e) => { setSaved(false); setDraft({ ...draft, hostel: e.target.value }); }} placeholder="Hostel (leave blank for day boarder)" aria-label="Edit hostel" /></div><div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center"><button disabled={saving} className={`${conthrax} min-h-12 w-full rounded-full border border-cyan-400/50 px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-cyan-300 transition-colors hover:bg-cyan-400 hover:text-black disabled:opacity-50 sm:w-auto sm:text-[10px] sm:tracking-[0.2em]`}>{saving ? "Saving..." : "Save details"}</button>{saved && <span role="status" className="text-center text-xs text-cyan-300 sm:text-left">Changes saved successfully.</span>}</div></form>;
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
