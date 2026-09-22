"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { BellRing, Check, ChevronDown, ChevronRight, Crown, Download, LoaderCircle, LogOut, MessageCircle, Pencil, Plus, QrCode, Trash2, X } from "lucide-react";
import BootSequence from "../../../components/boot/BootSequence";
import SharedHeader from "../../../components/ui/SharedHeader";
import Footer from "../../../components/footer/Footer";
import CubeBackground from "../../../components/ui/CubeBackground";
import { isKiitEmailDomain } from "@/lib/ignithon-identity";
import { IGNITHON_PORTAL_MUTATIONS_OPEN, IGNITHON_REGISTRATION_OPEN } from "@/lib/ignithon-feature-flags";

const conthrax = "font-['Conthrax',_sans-serif]";
const orbitron = "font-['Orbitron',_sans-serif]";
const inputClass = "min-h-12 w-full min-w-0 rounded-[16px] border border-amber-100/20 bg-[#062a33]/82 px-4 py-3 text-base text-white shadow-[inset_0_1px_0_rgba(255,213,108,0.05)] outline-none transition-all placeholder:text-amber-50/35 focus:border-amber-200/70 focus:bg-[#083b45]/92 focus:ring-2 focus:ring-amber-300/10 sm:text-sm";
const closeButtonClass = "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white transition-colors hover:border-amber-300/40 hover:bg-white/10 hover:text-white active:bg-white/10";
type Member = { id: string; name: string; email: string; roll_no: string; hostel: string | null; phone: string; branch: string; year: number; team_id: string };
type Portal = { team: { id: number; name: string; room: string | null; points: number; leader_email: string; member_count: number }; participants: Member[]; session: { email: string; role: "leader" | "member" } };
type MemberDraft = { name: string; email: string; roll_no: string; hostel: string; phone: string; branch: string; year: string };
type Confirmation = { title: string; message: string; confirmLabel: string; onConfirm: () => Promise<void> };
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
  "Mechanical Engineering (Automobile)", "Mechatronics Engineering", "M.Tech","Others",
];
const RETURNING_IDENTITY_COOKIE = "ignithon_returning_identity";
const PORTAL_CACHE_KEY = "ignithon-portal-cache";
const DEVICE_COOKIE = "ignithon_device_id";
const REMEMBERED_PORTAL_TTL_SECONDS = 60 * 60 * 24 * 120;
const academicYearOptions = [
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
];
const supportContacts = ["+918617785546", "+917304693169", "+919341488391"] as const;
const whatsappGroupUrl = "https://chat.whatsapp.com/Js237YhquV62dElsc5wEGA?s=cl&p=i&mlu=4&ilr=4";

function validateClientParticipant(value: MemberDraft) {
  if (value.name.trim().length < 2) return "Name must contain at least 2 characters.";
  if (!value.email.trim() || !isKiitEmailDomain(value.email)) return "Email address must be an approved KIIT address.";
  if (!/^\d+$/.test(value.roll_no) || Number(value.roll_no) <= 0) return "Roll number must contain only digits.";
  if (!/^\d{10}$/.test(value.phone.trim())) return "Phone number must contain exactly 10 digits.";
  if (!value.branch) return "Branch must be selected.";
  if (!value.year) return "Academic year must be selected.";
  return null;
}

function clearLoginCookies() {
  for (const cookieName of [RETURNING_IDENTITY_COOKIE, DEVICE_COOKIE]) {
    document.cookie = `${cookieName}=; Max-Age=0; Path=/; SameSite=Lax`;
  }
}

function clearBrowserAuthArtifacts() {
  clearLoginCookies();
  window.localStorage.removeItem("ignithon-team-id");
  window.localStorage.removeItem(PORTAL_CACHE_KEY);
}

function ensureBrowserDeviceIdentity() {
  if (document.cookie.split("; ").some((entry) => entry.startsWith(`${DEVICE_COOKIE}=`))) return;
  const id = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${DEVICE_COOKIE}=${id}; Max-Age=${REMEMBERED_PORTAL_TTL_SECONDS}; Path=/; SameSite=Lax${secure}`;
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
  const [entryMode, setEntryMode] = useState<"register" | "login">("login");
  const entryCardRef = useRef<HTMLElement>(null);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success">("error");
  const [loading, setLoading] = useState(false);
  const [access, setAccess] = useState({ rollNo: "", teamId: "" });
  const [teamName, setTeamName] = useState("");
  const [leader, setLeader] = useState<MemberDraft>(blankMember);
  const [member, setMember] = useState<MemberDraft>(blankMember);
  const [booting, setBooting] = useState<"login" | "create" | null>(null);
  const [bootProcessComplete, setBootProcessComplete] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const initializationRef = useRef(false);
  const showMessage = (nextMessage: string, tone: "error" | "success" = "error") => {
    setMessageTone(tone);
    setMessage(nextMessage);
  };

  const loadPortal = async (teamId: string, commit = true) => {
    const data = await readJson(await fetch(`/api/ignithon/teams/${teamId}`, { cache: "no-store" }));
    if (commit) {
      setPortal(data);
      window.localStorage.setItem("ignithon-team-id", teamId);
      window.localStorage.setItem(PORTAL_CACHE_KEY, JSON.stringify(data));
    }
    return data as Portal;
  };

  const beginBoot = (kind: "login" | "create") => {
    setBooting(kind);
    setBootProcessComplete(false);
  };

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;
    const cachedPortal = window.localStorage.getItem(PORTAL_CACHE_KEY);
    if (cachedPortal) {
      try {
        const parsed = JSON.parse(cachedPortal) as Portal;
        if (parsed?.team?.id && parsed?.participants?.length && parsed?.session?.email) {
          setPortal(parsed);
          clearLoginCookies();
          beginBoot("login");
          void loadPortal(String(parsed.team.id)).then(() => setBootProcessComplete(true)).catch(() => setBootProcessComplete(true));
          setHydrated(true);
          return;
        }
      } catch {
        window.localStorage.removeItem(PORTAL_CACHE_KEY);
      }
    }
    ensureBrowserDeviceIdentity();
    const remembered = readReturningIdentity();
    if (remembered) {
      beginBoot("login");
      setAccess(remembered);
      void (async () => {
        try {
          const data = await readJson(await fetch("/api/ignithon/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rollNo: remembered.rollNo, teamId: Number(remembered.teamId) }) }));
          if (data.portal) { setPortal(data.portal); window.localStorage.setItem("ignithon-team-id", remembered.teamId); window.localStorage.setItem(PORTAL_CACHE_KEY, JSON.stringify(data.portal)); clearLoginCookies(); setBootProcessComplete(true); }
        } catch {
          // The remembered identity only restores an active, matching registration.
          setBooting(null);
        }
      })();
    }
    const storedTeamId = window.localStorage.getItem("ignithon-team-id");
    if (!remembered && storedTeamId) {
      beginBoot("login");
      loadPortal(storedTeamId).then(() => { clearLoginCookies(); setBootProcessComplete(true); }).catch(() => { setBooting(null); window.localStorage.removeItem("ignithon-team-id"); window.localStorage.removeItem(PORTAL_CACHE_KEY); });
    }
    setHydrated(true);
  }, []);

  const handleAccess = async (event: FormEvent) => {
    event.preventDefault(); beginBoot("login"); setLoading(true); setMessage("");
    try { const data = await readJson(await fetch("/api/ignithon/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rollNo: access.rollNo, teamId: Number(access.teamId) }) })); setPortal(data.portal); window.localStorage.setItem("ignithon-team-id", access.teamId); window.localStorage.setItem(PORTAL_CACHE_KEY, JSON.stringify(data.portal)); clearLoginCookies(); setAccess({ rollNo: "", teamId: "" }); setTeamName(""); setLeader(blankMember); setMember(blankMember); setBootProcessComplete(true); }
    catch (error) { setBooting(null); setMessage(error instanceof Error ? error.message : "Unable to access the portal."); }
    finally { setLoading(false); }
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    const validationError = validateClientParticipant(leader) || (teamName.trim().length < 2 ? "Team name must contain at least 2 characters." : null);
    if (validationError) { showMessage(validationError); return; }
    beginBoot("create"); setLoading(true); setMessage("");
    try { const result = await readJson(await fetch("/api/ignithon/teams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: teamName, leader: { ...leader, roll_no: leader.roll_no, year: Number(leader.year), hostel: leader.hostel || null } }) })); await loadPortal(String(result.teamId)); clearLoginCookies(); setTeamName(""); setLeader(blankMember); setMember(blankMember); setBootProcessComplete(true); }
    catch (error) { setBooting(null); setMessage(error instanceof Error ? error.message : "Unable to create the team."); }
    finally { setLoading(false); }
  };

  const addMember = async (event: FormEvent) => {
    event.preventDefault(); if (!portal) return false;
    const validationError = validateClientParticipant(member);
    if (validationError) { showMessage(validationError); return false; }
    setLoading(true); setMessage("");
    try { await readJson(await fetch(`/api/ignithon/teams/${portal.team.id}/participants`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...member, roll_no: member.roll_no, year: Number(member.year), hostel: member.hostel || null }) })); await loadPortal(String(portal.team.id)); setMember(blankMember); return true; }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to add this participant."); return false; }
    finally { setLoading(false); }
  };

  const removeMember = async (email: string) => {
    if (!portal) return;
    setLoading(true); setMessage("");
    try { await readJson(await fetch(`/api/ignithon/teams/${portal.team.id}/participants/${encodeURIComponent(email)}`, { method: "DELETE" })); await loadPortal(String(portal.team.id)); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to remove this participant."); }
    finally { setLoading(false); }
  };

  const transferLeadership = async (email: string) => {
    if (!portal) return false;
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

  const logout = async () => { await fetch("/api/ignithon/session/logout", { method: "POST" }); clearBrowserAuthArtifacts(); setPortal(null); setAccess({ rollNo: "", teamId: "" }); setTeamName(""); setLeader(blankMember); setMember(blankMember); setEntryMode("login"); setMessage(""); };

  const switchEntryMode = (mode: "register" | "login") => {
    setEntryMode(mode);
    setMessage("");
    requestAnimationFrame(() => entryCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#020202] text-white">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <picture className="absolute inset-0 block">
          <source media="(max-width: 767px)" srcSet="/events/generated/ignithon2-registration-mobile.webp" />
          <Image
            src="/events/generated/ignithon2-registration-desktop.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_42%] opacity-95 md:object-center"
          />
        </picture>
        <div className="absolute inset-0 bg-[#020202]/12" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020202]/5 via-[#020b0e]/16 to-[#020202]/64" />
      </div>
      <CubeBackground zIndex={0} disableLinesOnMobile />
      {booting && <BootSequence replay processComplete={bootProcessComplete} overlayOnly showProcessCompleteStatus={false} onReady={() => setBooting(null)} />}
      {!hydrated && !booting && <div className="fixed inset-0 z-[9998] bg-[#020202]" aria-label="Preparing portal" />}
      <SharedHeader />
      {message && <NotificationBox message={message} tone={messageTone} onDismiss={() => setMessage("")} />}
      <main className={`relative z-10 mx-auto w-full px-4 pb-20 pt-24 sm:px-6 sm:pb-24 sm:pt-28 md:px-10 md:pt-36 ${portal ? "max-w-7xl" : "max-w-5xl"}`}>
        <div className="mx-auto mb-8 w-full max-w-2xl sm:mb-10">
          <p className="mb-3 text-[9px] uppercase tracking-[0.24em] text-amber-300/60 sm:mb-4 sm:text-[10px] sm:tracking-[0.35em]">
            Ignithon 2.0 · 26th September 2026
          </p>
          <h1 className={`${conthrax} break-words text-[2rem] uppercase leading-[0.98] tracking-tight text-white sm:text-5xl md:text-6xl`}>
            {portal ? portal.team.name : IGNITHON_REGISTRATION_OPEN ? "Team Registration" : "Existing Team Login"}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white sm:mt-5 sm:text-base">
            {portal
              ? `${portal.participants[0]?.name ?? "Team leader"} leads this team. ${IGNITHON_PORTAL_MUTATIONS_OPEN ? "Team leaders manage membership; participants can update their own details." : "Team roster updates are currently closed for the event."}`
              : IGNITHON_REGISTRATION_OPEN && entryMode === "register"
                ? "Register as the team leader to create your team and receive a four-digit Team ID."
                : "Registration is closed. Enter your registered roll number and four-digit Team ID to return to your team portal."}
          </p>
        </div>

        {portal ? (
          <PortalView portal={portal} member={member} setMember={setMember} addMember={addMember} removeMember={removeMember} transferLeadership={transferLeadership} refreshPortal={async () => { await loadPortal(String(portal.team.id)); }} logout={logout} loading={loading} notify={showMessage} requestConfirmation={(next) => setConfirmation(next)} />
        ) : (
          <section ref={entryCardRef} className="mx-auto grid w-full max-w-5xl scroll-mt-24 gap-8 rounded-[24px] border border-amber-100/25 bg-transparent p-4 shadow-[0_24px_80px_rgba(0,12,20,0.42),inset_0_1px_0_rgba(255,210,110,0.09)] backdrop-blur-sm sm:scroll-mt-28 sm:rounded-[28px] sm:p-8 md:grid-cols-[0.76fr_1.24fr] md:gap-10 md:p-10">
            <div className="flex flex-col justify-between border-b border-white/10 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-10">
              <div>
                <p className={`${orbitron} text-[9px] uppercase tracking-[0.28em] text-amber-300/55`}>Ignithon 2.0 access</p>
                <h2 className={`${conthrax} mt-3 text-xl uppercase leading-tight tracking-tight text-white sm:text-2xl`}>
                  {IGNITHON_REGISTRATION_OPEN && entryMode === "register" ? "Build your team" : "Return to your team"}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-white">
                  {IGNITHON_REGISTRATION_OPEN && entryMode === "register" ? "Create the team record once, then use your portal to manage the roster." : "New team registration is closed. Use the roll number and Team ID already assigned to your team."}
                </p>
                <SupportContacts className="mt-5" />
              </div>
              <div className="mt-8 hidden rounded-[18px] border border-amber-300/15 bg-amber-400/[0.04] p-4 md:block">
                <p className={`${orbitron} text-[8px] uppercase tracking-[0.24em] text-amber-300/60`}>Event date</p>
                <p className={`${conthrax} mt-2 text-xs uppercase tracking-[0.1em] text-white`}>26 September 2026</p>
              </div>
            </div>
            <div className="min-w-0">
            {IGNITHON_REGISTRATION_OPEN && entryMode === "register" ? (
              <>
                <h2 className={`${conthrax} text-sm uppercase tracking-wider text-amber-300 sm:text-base`}>
                  Register New Team
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white">
                  Create your team first. Your four-digit Team ID will be generated after registration.
                </p>
                <form onSubmit={handleCreate} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <input className={`${inputClass} sm:col-span-2`} required minLength={2} value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder="Team name" aria-label="Team name" />
                  <MemberFields value={leader} setValue={setLeader} nameLabel="Team Leader Name" />
                  <button disabled={loading} aria-busy={loading} className={`${conthrax} flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-black transition-colors hover:bg-white hover:text-black active:bg-white active:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 disabled:cursor-wait disabled:opacity-50 sm:col-span-2 sm:text-[10px] sm:tracking-[0.22em]`}>
                    {loading ? <><LoaderCircle size={15} className="animate-spin" /> Creating team…</> : <>Create team <ChevronRight size={14} /></>}
                  </button>
                </form>
                <div className="mt-6 border-t border-white/10 pt-5 text-center">
                  <p className="text-xs text-white">Already registered with a team?</p>
                  <button type="button" onClick={() => switchEntryMode("login")} className={`${conthrax} mt-3 min-h-11 w-full rounded-full border border-amber-400/35 px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-amber-300 transition-colors hover:bg-white hover:text-black active:bg-white active:text-black sm:w-auto`}>
                    Existing Team Login
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-[9px] uppercase tracking-[0.25em] text-amber-300/60 sm:text-[10px] sm:tracking-[0.3em]">Already registered</p>
                <h2 className={`${conthrax} mt-3 text-lg uppercase leading-tight text-white sm:mt-4 sm:text-xl`}>
                  Existing Team Login
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white">New team registration is closed. Use the roll number and Team ID already assigned to your team.</p>
                <form onSubmit={handleAccess} className="mt-6 space-y-3 sm:mt-7 sm:space-y-4">
                  <input className={inputClass} required inputMode="numeric" value={access.rollNo} onChange={(event) => setAccess({ ...access, rollNo: event.target.value.replace(/\D/g, "") })} placeholder="Registered roll number" aria-label="Registered roll number" />
                  <input className={inputClass} required inputMode="numeric" pattern="[0-9]{4}" maxLength={4} value={access.teamId} onChange={(event) => setAccess({ ...access, teamId: event.target.value.replace(/\D/g, "") })} placeholder="Four-digit Team ID" aria-label="Four-digit Team ID" />
                  <p className="-mt-1 px-1 text-[11px] leading-relaxed text-white">Forgot your Team ID? Check your previously logged device or contact the event team.</p>
                  <SupportContacts className="px-1" />
                  <button disabled={loading} aria-busy={loading} className={`${conthrax} flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-black transition-colors hover:bg-white hover:text-black active:bg-white active:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 disabled:cursor-wait disabled:opacity-50 sm:text-[10px] sm:tracking-[0.22em]`}>
                    {loading ? <><LoaderCircle size={15} className="animate-spin" /> Opening portal…</> : <>Access portal <ChevronRight size={14} /></>}
                  </button>
                </form>
                {IGNITHON_REGISTRATION_OPEN && <div className="mt-6 border-t border-white/10 pt-5 text-center">
                  <p className="text-xs text-white">Creating a team for the first time?</p>
                  <button type="button" onClick={() => switchEntryMode("register")} className={`${conthrax} mt-3 min-h-11 w-full rounded-full border border-amber-400/35 px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-amber-300 transition-colors hover:bg-white hover:text-black active:bg-white active:text-black sm:w-auto`}>
                    Register New Team
                  </button>
                </div>}
              </>
            )}
            </div>
          </section>
        )}
      </main>
      <Footer />
      {confirmation && <ConfirmationDialog confirmation={confirmation} onClose={() => setConfirmation(null)} />}
    </div>
  );
}

function NotificationBox({ message, tone, onDismiss }: { message: string; tone: "error" | "success"; onDismiss: () => void }) {
  const success = tone === "success";
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 10000);
    return () => window.clearTimeout(timeout);
  }, [message, onDismiss]);

  return (
    <div className="pointer-events-none fixed left-1/2 top-[calc(5.5rem+env(safe-area-inset-top))] z-[1000] w-[min(92vw,36rem)] -translate-x-1/2" role="alert" aria-live="assertive">
      <div className={`pointer-events-auto flex w-full items-start gap-3 rounded-[20px] border px-4 py-3.5 backdrop-blur-xl animate-[pulse_0.7s_ease-out_1] sm:px-5 ${success ? "border-emerald-300/50 bg-[#062518]/95 shadow-[0_18px_50px_rgba(52,211,153,0.25),0_0_28px_rgba(52,211,153,0.14)]" : "border-red-300/50 bg-[#25090d]/95 shadow-[0_18px_50px_rgba(255,50,70,0.25),0_0_28px_rgba(255,60,80,0.14)]"}`}>
        <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${success ? "border-emerald-300/35 bg-emerald-400/15 text-emerald-200" : "border-red-300/35 bg-red-400/15 text-red-200"}`}>{success ? "✓" : "!"}</span>
        <div className="min-w-0 flex-1">
          <p className={`${conthrax} text-[10px] uppercase tracking-[0.18em] ${success ? "text-emerald-200" : "text-red-200"}`}>{success ? "Update successful" : "Registration notice"}</p>
          <p className={`mt-1 text-sm leading-relaxed ${success ? "text-emerald-100/90" : "text-red-100/90"}`}>{message}</p>
        </div>
        <button type="button" onClick={onDismiss} className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10 hover:text-white ${success ? "text-emerald-100/60" : "text-red-100/60"}`} aria-label="Dismiss notification"><X size={16} /></button>
      </div>
    </div>
  );
}

function SupportContacts({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-white/80 ${className}`}>
      For assistance, please contact any of the following numbers:{" "}
      {supportContacts.map((phone, index) => (
        <span key={phone}>
          {index > 0 ? (index === supportContacts.length - 1 ? ", or " : ", ") : ""}
          <a className="text-amber-300 underline decoration-amber-300/35 underline-offset-2 transition-colors hover:text-white" href={`tel:${phone}`}>
            {phone.replace(/^(\+\d{2})(\d{5})(\d{5})$/, "$1 $2 $3")}
          </a>
        </span>
      ))}
      .
    </p>
  );
}

function ConfirmationDialog({ confirmation, onClose }: { confirmation: Confirmation; onClose: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const confirm = async () => {
    setConfirming(true);
    try {
      await confirmation.onConfirm();
      onClose();
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (!confirming && event.target === event.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="confirmation-title" className="w-full max-w-md rounded-[24px] border border-amber-300/25 bg-[#050b0c]/[.98] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.65),0_0_30px_rgba(245, 174, 55,0.08)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`${orbitron} text-[9px] uppercase tracking-[0.24em] text-amber-300/65`}>Confirmation required</p>
            <h2 id="confirmation-title" className={`${conthrax} mt-2 text-base uppercase tracking-wider text-white`}>{confirmation.title}</h2>
          </div>
          <button type="button" disabled={confirming} onClick={onClose} className={closeButtonClass} aria-label="Close confirmation dialog"><X size={16} /></button>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-white">{confirmation.message}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" disabled={confirming} onClick={onClose} className={`${conthrax} min-h-11 rounded-full border border-white/10 px-5 py-3 text-[9px] uppercase tracking-[0.16em] text-white transition-colors hover:border-white/25 hover:bg-white/10 active:bg-white/10 disabled:opacity-50`}>Cancel</button>
          <button type="button" disabled={confirming} aria-busy={confirming} onClick={confirm} className={`${conthrax} flex min-h-11 items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-[9px] uppercase tracking-[0.16em] text-black transition-colors hover:bg-white hover:text-black active:bg-white active:text-black disabled:cursor-wait disabled:opacity-50`}>{confirming ? <><LoaderCircle size={14} className="animate-spin" /> Updating…</> : confirmation.confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function MemberFields({ value, setValue, nameLabel = "Full name" }: { value: MemberDraft; setValue: (value: MemberDraft) => void; nameLabel?: string }) {
  const update = (key: keyof MemberDraft, next: string) => setValue({ ...value, [key]: next });
  const nameInvalid = Boolean(value.name && value.name.trim().length < 2);
  const rollInvalid = Boolean(value.roll_no && !/^\d+$/.test(value.roll_no));
  const phoneInvalid = Boolean(value.phone && !/^\d{10}$/.test(value.phone.trim()));
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
      <div className="min-w-0"><input className={`${inputClass} ${nameInvalid ? "border-red-300/60 focus:border-red-300" : ""}`} required minLength={2} value={value.name} onChange={(event) => update("name", event.target.value)} placeholder={nameLabel} aria-label={nameLabel} aria-invalid={nameInvalid} />{nameInvalid && <p className="mt-1.5 px-1 text-[11px] text-red-200/85">Name must contain at least 2 characters.</p>}</div>
      <div className="min-w-0">
        <input className={`${inputClass} ${value.email && !isKiitEmailDomain(value.email) ? "border-red-300/60 focus:border-red-300" : ""}`} required type="email" value={value.email} onChange={(event) => updateEmail(event.target.value)} placeholder="KIIT email address" aria-label="KIIT email address" aria-invalid={Boolean(value.email && !isKiitEmailDomain(value.email))} />
        {value.email && !isKiitEmailDomain(value.email) && <p className="mt-1.5 px-1 text-[11px] leading-relaxed text-red-200/85">Only an approved KIIT email address is allowed.</p>}
      </div>
      <input className={`${inputClass} ${rollInvalid ? "border-red-300/60 focus:border-red-300" : ""}`} required inputMode="numeric" maxLength={20} pattern="[0-9]+" value={value.roll_no} onChange={(event) => update("roll_no", event.target.value.replace(/\D/g, ""))} placeholder="Roll / user ID" aria-label="Roll or user ID" aria-invalid={rollInvalid} />
      <div className="min-w-0"><input className={`${inputClass} ${phoneInvalid ? "border-red-300/60 focus:border-red-300" : ""}`} required maxLength={10} pattern="[0-9]{10}" inputMode="numeric" type="tel" value={value.phone} onChange={(event) => update("phone", event.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Phone number (10 digits)" aria-label="Phone number" aria-invalid={phoneInvalid} />{phoneInvalid && <p className="mt-1.5 px-1 text-[11px] text-red-200/85">Phone number must contain exactly 10 digits.</p>}</div>
      <InHouseSelect value={value.branch} onChange={(next) => update("branch", next)} placeholder="Branch" ariaLabel="Branch" options={branchOptions.map((branch) => ({ value: branch, label: branch }))} />
      <InHouseSelect value={value.year} onChange={(next) => update("year", next)} placeholder="Year" ariaLabel="Academic year" options={academicYearOptions} />
      <input className={`${inputClass} sm:col-span-2`} value={value.hostel} onChange={(event) => update("hostel", event.target.value)} placeholder="Hostel (leave blank for day boarder)" aria-label="Hostel" />
    </>
  );
}

function PortalView({ portal, member, setMember, addMember, removeMember, transferLeadership, refreshPortal, logout, loading, notify, requestConfirmation }: { portal: Portal; member: MemberDraft; setMember: (member: MemberDraft) => void; addMember: (event: FormEvent) => Promise<boolean>; removeMember: (email: string) => Promise<void>; transferLeadership: (email: string) => Promise<boolean>; refreshPortal: () => Promise<void>; logout: () => Promise<void>; loading: boolean; notify: (message: string, tone?: "error" | "success") => void; requestConfirmation: (confirmation: Confirmation) => void }) {
  const isLeader = portal.team.leader_email === portal.session.email;
  const [showAddMember, setShowAddMember] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const addMemberFormRef = useRef<HTMLFormElement>(null);
  const rosterSectionRef = useRef<HTMLElement>(null);
  const [showPersonalQr, setShowPersonalQr] = useState(false);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const memberDetailsRef = useRef<HTMLElement>(null);
  const [teamNameDraft, setTeamNameDraft] = useState(portal.team.name);
  const [savingTeamName, setSavingTeamName] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [evaluationAlertActive, setEvaluationAlertActive] = useState(false);
  const [evaluationPollingEnabled, setEvaluationPollingEnabled] = useState(false);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const leaderEmail = portal.team.leader_email;
  const leader = portal.participants[0];
  const signedInParticipant = portal.participants.find((participant) => participant.email === portal.session.email);
  const evaluationTeamId = signedInParticipant?.team_id ?? leader?.team_id ?? null;
  const registeredMembers = portal.participants.filter((participant) => participant.email !== leaderEmail);
  const selectedMember = portal.participants.find((participant) => participant.email === editingEmail);
  const evaluationStatusCheckedRef = useRef<string | null>(null);

  useEffect(() => setTeamNameDraft(portal.team.name), [portal.team.name]);

  useEffect(() => {
    if (!evaluationTeamId || evaluationStatusCheckedRef.current === evaluationTeamId) return;
    evaluationStatusCheckedRef.current = evaluationTeamId;
    let cancelled = false;
    void (async () => {
      const data = await readJson(await fetch(`/api/evaluation/alerts?teamId=${encodeURIComponent(evaluationTeamId)}`, { cache: "no-store" }));
      if (!cancelled) {
        const active = Boolean(data.active);
        setEvaluationAlertActive(active);
        setEvaluationPollingEnabled(active);
      }
    })()
      .catch(() => { if (!cancelled) setEvaluationAlertActive(false); });
    return () => { cancelled = true; };
  }, [evaluationTeamId]);

  useEffect(() => {
    if (!evaluationPollingEnabled || !evaluationTeamId) return;
    let cancelled = false;
    let requestInFlight = false;

    const checkEvaluationAlert = async () => {
      if (cancelled || requestInFlight) return;
      requestInFlight = true;
      try {
        const data = await readJson(await fetch(`/api/evaluation/alerts?teamId=${encodeURIComponent(evaluationTeamId)}`, { cache: "no-store" }));
        if (!cancelled && !Boolean(data.active)) {
          setEvaluationAlertActive(false);
          setEvaluationPollingEnabled(false);
        }
      } catch {
        // Keep polling through transient background refresh failures.
      } finally {
        requestInFlight = false;
      }
    };

    const intervalId = window.setInterval(() => { void checkEvaluationAlert(); }, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [evaluationPollingEnabled, evaluationTeamId]);

  useEffect(() => {
    if (!editingEmail || !window.matchMedia("(max-width: 639px)").matches) return;
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        memberDetailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [editingEmail]);

  const saveTeamName = async (event: FormEvent) => {
    event.preventDefault();
    setSavingTeamName(true);
    try {
      await readJson(await fetch(`/api/ignithon/teams/${portal.team.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: teamNameDraft }) }));
      await refreshPortal();
      notify("Team name updated successfully.", "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to update the team name.");
    } finally {
      setSavingTeamName(false);
    }
  };

  const submitMember = async (event: FormEvent) => {
    setAddingMember(true);
    try {
      const added = await addMember(event);
      if (added) {
        setShowAddMember(false);
        requestAnimationFrame(() => requestAnimationFrame(() => rosterSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })));
      }
    } finally {
      setAddingMember(false);
    }
  };

  const submitLeadershipTransfer = async (email: string) => {
    const transferred = await transferLeadership(email);
    if (!transferred) return;
    setEditingEmail(null);
    setShowAddMember(false);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  const toggleEvaluationAlert = async () => {
    if (!evaluationTeamId || evaluationLoading) return;
    setEvaluationLoading(true);
    try {
      const body = evaluationAlertActive
        ? { teamId: evaluationTeamId, action: "dismiss" }
        : { teamId: evaluationTeamId };
      const data = await readJson(await fetch("/api/evaluation/alerts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
      const active = Boolean(data.active);
      setEvaluationAlertActive(active);
      setEvaluationPollingEnabled(active);
      notify(data.active ? "Evaluation call sent to the event team." : "Evaluation call dismissed.", "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to update the evaluation call.");
    } finally {
      setEvaluationLoading(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <section ref={rosterSectionRef} className="scroll-mt-24 rounded-[24px] border border-white/10 bg-white/[0.025] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:rounded-[28px] sm:p-6 md:p-8">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div>
              <p className="text-[9px] uppercase tracking-[0.28em] text-amber-300/55">Team ID</p>
              <p className={`${conthrax} mt-2 text-3xl text-amber-300 sm:text-4xl`}>{portal.team.id}</p>
            </div>
            <p className="mt-3 text-xs text-white">Team Leader · <span className="text-white">{leader?.name ?? "Not available"}</span></p>
            <SupportContacts className="mt-3 max-w-xl" />
            {isLeader && IGNITHON_PORTAL_MUTATIONS_OPEN && (
              <form onSubmit={saveTeamName} className="mt-4 flex max-w-xl flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor="team-name-editor">Team name</label>
                <input id="team-name-editor" className={`${inputClass} min-h-11 sm:max-w-sm`} value={teamNameDraft} onChange={(event) => setTeamNameDraft(event.target.value)} required aria-label="Team name" />
                <button type="submit" disabled={savingTeamName || teamNameDraft.trim() === portal.team.name} aria-busy={savingTeamName} className={`${conthrax} flex min-h-11 items-center justify-center gap-2 rounded-full bg-amber-400 px-4 text-[9px] uppercase tracking-[0.14em] text-black transition-colors hover:bg-white hover:text-black active:bg-white active:text-black disabled:cursor-wait disabled:opacity-35`}>{savingTeamName ? <><LoaderCircle size={14} className="animate-spin" /> Saving…</> : "Update name"}</button>
              </form>
            )}
          </div>
          <div className="grid w-full grid-cols-1 gap-2 sm:w-[min(100%,42rem)] sm:grid-cols-2 sm:gap-3">
              <button type="button" aria-pressed={showPersonalQr} onClick={() => setShowPersonalQr((current) => !current)} className={`${conthrax} flex min-h-11 w-full items-center justify-center gap-2 rounded-full border px-5 py-3 text-[9px] uppercase tracking-[0.18em] transition-colors ${showPersonalQr ? "border-amber-300 bg-amber-400 text-black shadow-[0_0_24px_rgba(245, 174, 55,0.18)] hover:bg-white hover:text-black active:bg-white active:text-black" : "border-amber-400/30 text-amber-300 hover:bg-white hover:text-black active:bg-white active:text-black"}`}>
                <QrCode size={14} /> My QR
              </button>
              <a href={whatsappGroupUrl} target="_blank" rel="noreferrer" className={`${conthrax} flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-emerald-300/35 px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-emerald-200 transition-colors hover:border-white hover:bg-white hover:text-black active:bg-white active:text-black`}>
                <MessageCircle size={14} /> Join WhatsApp group
              </a>
              <button type="button" disabled={!evaluationTeamId || evaluationLoading} aria-busy={evaluationLoading} aria-pressed={evaluationAlertActive} onClick={() => { void toggleEvaluationAlert(); }} className={`${conthrax} flex min-h-11 w-full items-center justify-center gap-2 rounded-full border px-5 py-3 text-[9px] uppercase tracking-[0.18em] transition-colors disabled:cursor-wait disabled:opacity-50 ${evaluationAlertActive ? "border-red-300/45 bg-red-400/15 text-red-100 hover:bg-white hover:text-black active:bg-white active:text-black" : "border-amber-300/35 text-amber-200 hover:bg-white hover:text-black active:bg-white active:text-black"}`}>
                {evaluationLoading ? <><LoaderCircle size={14} className="animate-spin" /> Updating…</> : <><BellRing size={14} /> {evaluationAlertActive ? "Dismiss evaluation call" : "Call for evaluation"}</>}
              </button>
              <button type="button" disabled={loggingOut} aria-busy={loggingOut} onClick={handleLogout} className={`${conthrax} flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-white transition-colors hover:border-white hover:bg-white hover:text-black active:bg-white active:text-black disabled:cursor-wait disabled:opacity-50`}>
              {loggingOut ? <><LoaderCircle size={14} className="animate-spin" /> Logging out…</> : <><LogOut size={14} /> Log out</>}
              </button>
          </div>
        </div>

        {showPersonalQr && signedInParticipant && (
          <div className="mt-5 rounded-[22px] border border-amber-300/45 bg-[#031011] p-4 shadow-[inset_0_0_32px_rgba(245, 174, 55,0.04)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.28em] text-amber-300/55">Personal credential</p>
                <h2 className={`${conthrax} mt-2 break-words text-sm uppercase tracking-wider text-white sm:text-base`}>{signedInParticipant.name}</h2>
              </div>
            </div>
            <div className="mt-5 flex justify-center">
              <div className="shrink-0 overflow-hidden rounded-[20px] border border-white/15 bg-white p-3 shadow-[0_0_30px_rgba(245, 174, 55,0.12)]">
                <BrandedPersonalQr value={`${signedInParticipant.id}|${portal.team.id}`} name={signedInParticipant.name} />
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-end justify-between gap-4 sm:mt-8">
          <div>
            <p className="text-[9px] uppercase tracking-[0.28em] text-amber-300/55">Player loadout</p>
            <h2 className={`${conthrax} mt-2 text-sm uppercase tracking-wider text-white sm:text-base`}>Team roster</h2>
          </div>
          <p className={`${conthrax} shrink-0 text-[10px] text-white`}>{portal.participants.length}/4</p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {portal.participants.map((participant) => {
            const isTeamLeader = participant.email === leaderEmail;
            const memberIndex = registeredMembers.findIndex((entry) => entry.email === participant.email) + 1;
            const canEditCard = IGNITHON_PORTAL_MUTATIONS_OPEN && (isLeader || participant.email === portal.session.email);

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
                className={`group relative min-h-[210px] min-w-0 overflow-hidden rounded-[22px] border bg-gradient-to-br from-white/[0.045] to-transparent p-5 transition-colors ${canEditCard ? "cursor-pointer focus:border-amber-300/60 focus:outline-none focus:ring-2 focus:ring-amber-400/20" : ""} ${editingEmail === participant.email ? "border-amber-300/55 bg-amber-400/[0.07]" : "border-white/10 hover:border-amber-400/30"}`}
              >
                <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-amber-400/[0.055] blur-2xl transition-colors group-hover:bg-amber-400/10" />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`${conthrax} rounded-full border px-3 py-1.5 text-[8px] uppercase tracking-[0.16em] ${isTeamLeader ? "border-amber-400/35 bg-amber-400/10 text-amber-200" : "border-white/10 bg-white/[0.035] text-white"}`}>
                      {isTeamLeader ? "Team Leader" : `Member ${memberIndex}`}
                    </span>
                    <span className={`${conthrax} text-xl text-white`}>{String(isTeamLeader ? 1 : memberIndex + 1)}</span>
                  </div>
                  <div className={`mt-auto min-w-0 pt-8 ${canEditCard ? "pb-12" : ""}`}>
                    <h3 className={`${conthrax} break-words text-base uppercase leading-snug text-white`}>{participant.name}</h3>
                    <p className="mt-2 break-all text-xs leading-relaxed text-white">{participant.email}</p>
                    <p className="mt-1 text-xs text-white">Roll {participant.roll_no} · Year {participant.year}</p>
                  </div>
                  {canEditCard && (
                    <div className="absolute bottom-0 right-0 flex items-center gap-2">
                      <button type="button" onClick={(event) => { event.stopPropagation(); setEditingEmail((current) => current === participant.email ? null : participant.email); }} className="flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-full border border-amber-400/20 bg-black/25 px-3 text-[9px] uppercase tracking-[0.12em] text-amber-300/60 transition-colors hover:border-white hover:bg-white hover:text-black active:bg-white active:text-black" aria-label={`Edit ${participant.name}`}>
                        <Pencil size={14} /> <span className="hidden sm:inline">Edit</span>
                      </button>
                      {isLeader && !isTeamLeader && (
                        <button type="button" disabled={loading} onClick={(event) => { event.stopPropagation(); requestConfirmation({ title: "Remove team member?", message: `${participant.name} will be removed from this team and will have a five-minute cooling period before joining another team.`, confirmLabel: "Remove member", onConfirm: () => removeMember(participant.email) }); }} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white transition-colors hover:border-red-300/35 hover:bg-red-400/10 hover:text-red-100 active:bg-red-400/10 active:text-red-100 disabled:opacity-40" aria-label={`Remove ${participant.name}`}>
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}

          {isLeader && IGNITHON_PORTAL_MUTATIONS_OPEN && registeredMembers.length < 3 && (
            <button type="button" onClick={() => { const next = !showAddMember; setShowAddMember(next); if (next) requestAnimationFrame(() => addMemberFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })); }} aria-expanded={showAddMember} className={`group flex min-h-[210px] flex-col items-center justify-center rounded-[22px] border border-dashed p-5 text-center transition-all active:bg-amber-400/[0.1] ${showAddMember ? "border-amber-300/65 bg-amber-400/[0.09]" : "border-amber-400/25 bg-amber-400/[0.025] hover:border-amber-300/55 hover:bg-amber-400/[0.07]"}`}>
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/35 bg-amber-400/10 text-amber-300 transition-transform group-hover:scale-105">
                <Plus size={24} />
              </span>
              <span className={`${conthrax} mt-5 text-[11px] uppercase tracking-[0.16em] text-amber-200`}>Add New Member</span>
              <span className={`${conthrax} mt-2 text-[10px] text-white`}>({registeredMembers.length + 1}/3)</span>
            </button>
          )}
        </div>
      </section>

      {isLeader && IGNITHON_PORTAL_MUTATIONS_OPEN && showAddMember && registeredMembers.length < 3 && (
        <form ref={addMemberFormRef} onSubmit={submitMember} className="scroll-mt-6 rounded-[24px] border border-amber-400/25 bg-amber-400/[0.035] p-4 backdrop-blur-xl sm:scroll-mt-8 sm:rounded-[28px] sm:p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[9px] uppercase tracking-[0.28em] text-amber-300/55">New roster slot</p>
              <h2 className={`${conthrax} mt-2 text-sm uppercase tracking-wider text-amber-200 sm:text-base`}>Member {registeredMembers.length + 1} details</h2>
            </div>
            <button type="button" disabled={addingMember} onClick={() => setShowAddMember(false)} className={closeButtonClass} aria-label="Close new member form"><X size={15} /></button>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <MemberFields value={member} setValue={setMember} />
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" disabled={addingMember} onClick={() => setShowAddMember(false)} className={`${conthrax} min-h-12 w-full rounded-full border border-white/10 px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-white transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white active:bg-white/10 disabled:opacity-50 sm:w-auto`}>Cancel</button>
            <button disabled={loading || addingMember} aria-busy={addingMember} className={`${conthrax} flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-black transition-colors hover:bg-white hover:text-black active:bg-white active:text-black disabled:cursor-wait disabled:opacity-50 sm:w-auto sm:text-[10px] sm:tracking-[0.22em]`}>
              {addingMember ? <><LoaderCircle size={15} className="animate-spin" /> Adding Member…</> : <><Plus size={14} /> Add Member {registeredMembers.length + 1}</>}
            </button>
          </div>
        </form>
      )}

      {selectedMember && IGNITHON_PORTAL_MUTATIONS_OPEN && (
        <section ref={memberDetailsRef} className="scroll-mt-6 rounded-[24px] border border-white/10 bg-white/[0.025] p-4 backdrop-blur-xl sm:scroll-mt-8 sm:rounded-[28px] sm:p-6 md:p-8">
          <EditMyDetails key={selectedMember.id} member={selectedMember} teamId={portal.team.id} onSaved={refreshPortal} onClose={() => setEditingEmail(null)} notify={notify} />
          {isLeader && selectedMember.email !== leaderEmail && (
            <div className="mt-7 border-t border-white/10 pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.28em] text-amber-300/55">Team administration</p>
                  <h3 className={`${conthrax} mt-2 text-xs uppercase tracking-wider text-white sm:text-sm`}>Transfer leadership</h3>
                  <p className="mt-2 max-w-xl text-xs leading-relaxed text-white">Promote {selectedMember.name} to team leader. Your account will become a regular team member immediately.</p>
                </div>
                <button type="button" disabled={loading} onClick={() => requestConfirmation({ title: "Transfer team leadership?", message: `Make ${selectedMember.name} the new team leader? Your account will become a regular team member immediately.`, confirmLabel: "Transfer leadership", onConfirm: async () => { await submitLeadershipTransfer(selectedMember.email); } })} className={`${conthrax} flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full border border-amber-400/45 px-5 py-3 text-[9px] uppercase tracking-[0.16em] text-amber-300 transition-colors hover:bg-white hover:text-black active:bg-white active:text-black disabled:opacity-50 sm:w-auto`}>
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
  const qrCodeRef = useRef<{ download: (options: { name: string; extension: "png" }) => Promise<void> } | null>(null);
  const [ready, setReady] = useState(false);
  const [downloading, setDownloading] = useState(false);

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
        imageOptions: { hideBackgroundDots: false, imageSize: 0.46, margin: 6 },
      });
      qrCodeRef.current = qrCode;
      qrCode.applyExtension((svg) => {
        const image = svg.querySelector("image");
        if (!image) return;
        const x = Number.parseFloat(image.getAttribute("x") ?? "0");
        const y = Number.parseFloat(image.getAttribute("y") ?? "0");
        const width = Number.parseFloat(image.getAttribute("width") ?? "0");
        const height = Number.parseFloat(image.getAttribute("height") ?? "0");
        if (!width || !height) return;
        const defs = svg.querySelector("defs") ?? svg.insertBefore(svg.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "defs"), svg.firstChild);
        const clipPath = svg.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        clipPath.setAttribute("id", "qr-logo-subtle-rounded-clip");
        const roundedRect = svg.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "rect");
        roundedRect.setAttribute("x", String(x)); roundedRect.setAttribute("y", String(y)); roundedRect.setAttribute("width", String(width)); roundedRect.setAttribute("height", String(height));
        roundedRect.setAttribute("rx", String(Math.min(width, height) * 0.12)); roundedRect.setAttribute("ry", String(Math.min(width, height) * 0.12));
        const logoMask = roundedRect.cloneNode() as SVGRectElement;
        logoMask.removeAttribute("id"); logoMask.setAttribute("fill", "#ffffff");
        image.parentNode?.insertBefore(logoMask, image);
        clipPath.appendChild(roundedRect); defs.appendChild(clipPath); image.setAttribute("clip-path", "url(#qr-logo-subtle-rounded-clip)");
      });
      await qrCode.getRawData("svg");
      if (cancelled) return;
      container.replaceChildren();
      qrCode.append(container);
      setReady(true);
    });

    return () => {
      cancelled = true;
      qrCodeRef.current = null;
      container?.replaceChildren();
    };
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div role="img" aria-label={`Personal QR code for ${name}`} className="relative h-[220px] w-[220px] min-h-[220px] min-w-[220px] shrink-0 sm:h-[260px] sm:w-[260px] sm:min-h-[260px] sm:min-w-[260px]">
        <div ref={containerRef} className={`flex h-full w-full items-center justify-center overflow-hidden rounded-[16px] bg-white [&_svg]:block [&_svg]:h-full [&_svg]:w-full ${ready ? "" : "animate-pulse"}`} />
        {!ready && <span className={`${conthrax} pointer-events-none absolute inset-0 flex items-center justify-center text-center text-[9px] uppercase tracking-[0.18em] text-black/45`}>Generating secure QR</span>}
      </div>
      <button type="button" disabled={!ready || downloading} aria-busy={downloading} onClick={() => { void (async () => { setDownloading(true); try { await qrCodeRef.current?.download({ name: `k1000-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, extension: "png" }); } finally { setDownloading(false); } })(); }} className={`${conthrax} flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-amber-300/70 bg-amber-400 px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-black transition-colors hover:bg-white hover:text-black active:bg-white active:text-black disabled:cursor-wait disabled:opacity-40 sm:w-auto`}>
        {downloading ? <><LoaderCircle size={14} className="animate-spin" /> Preparing download…</> : <><Download size={14} /> Download QR</>}
      </button>
    </div>
  );
}

function EditMyDetails({ member, teamId, onSaved, onClose, notify }: { member: Member; teamId: number; onSaved: () => Promise<void>; onClose: () => void; notify: (message: string, tone?: "error" | "success") => void }) {
  const [draft, setDraft] = useState(() => ({ name: member.name, hostel: member.hostel ?? "", phone: member.phone, branch: member.branch, year: String(member.year) }));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setDraft({ name: member.name, hostel: member.hostel ?? "", phone: member.phone, branch: member.branch, year: String(member.year) });
  }, [member.id, member.name, member.hostel, member.phone, member.branch, member.year]);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    const validationError = validateClientParticipant({ ...draft, email: member.email, roll_no: member.roll_no });
    if (validationError) { notify(validationError); return; }
    setSaving(true); setSaved(false);
    try {
      await readJson(await fetch(`/api/ignithon/teams/${teamId}/participants/${encodeURIComponent(member.email)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...draft, year: Number(draft.year), hostel: draft.hostel || null }) }));
      await onSaved();
      setSaved(true);
    } catch (saveError) {
      notify(saveError instanceof Error ? saveError.message : "Unable to save your details.");
    } finally {
      setSaving(false);
    }
  };
  return <form onSubmit={save}><div className="flex items-start justify-between gap-4"><div><p className="text-[9px] uppercase tracking-[0.28em] text-amber-300/55">Selected player</p><h3 className={`${conthrax} mt-2 break-words text-sm uppercase tracking-wider text-amber-300`}>Edit {member.name}</h3></div><button type="button" disabled={saving} onClick={onClose} className={closeButtonClass} aria-label="Close member details"><X size={15} /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><input className={inputClass} value={draft.name} onChange={(e) => { setSaved(false); setDraft({ ...draft, name: e.target.value }); }} required minLength={2} placeholder="Full name" aria-label="Edit full name" /><input className={inputClass} value={draft.phone} onChange={(e) => { setSaved(false); setDraft({ ...draft, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }); }} required maxLength={10} pattern="[0-9]{10}" inputMode="numeric" type="tel" placeholder="Phone number (10 digits)" aria-label="Edit phone number" /><InHouseSelect value={draft.branch} onChange={(branch) => { setSaved(false); setDraft({ ...draft, branch }); }} placeholder="Branch" ariaLabel="Edit branch" options={branchOptions.map((branch) => ({ value: branch, label: branch }))} /><InHouseSelect value={draft.year} onChange={(year) => { setSaved(false); setDraft({ ...draft, year }); }} placeholder="Year" ariaLabel="Edit academic year" options={academicYearOptions} /><input className={`${inputClass} sm:col-span-2`} value={draft.hostel} onChange={(e) => { setSaved(false); setDraft({ ...draft, hostel: e.target.value }); }} placeholder="Hostel (leave blank for day boarder)" aria-label="Edit hostel" /></div><div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center"><button disabled={saving} aria-busy={saving} className={`${conthrax} flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-black transition-colors hover:bg-white hover:text-black active:bg-white active:text-black disabled:cursor-wait disabled:opacity-50 sm:w-auto sm:text-[10px] sm:tracking-[0.2em]`}>{saving ? <><LoaderCircle size={15} className="animate-spin" /> Saving details…</> : "Save details"}</button>{saved && <span role="status" className="text-center text-xs text-amber-300 sm:text-left">Changes saved successfully.</span>}</div></form>;
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
      <button type="button" role="combobox" aria-label={ariaLabel} aria-controls={menuId} aria-expanded={open} aria-haspopup="listbox" onClick={() => setOpen((current) => !current)} className={`${inputClass} flex items-center justify-between gap-3 text-left hover:border-amber-300/55 hover:bg-amber-400/[0.05] active:bg-amber-400/[0.08] ${open ? "border-amber-400/70 bg-amber-500/[0.035]" : ""}`}>
        <span className={`min-w-0 truncate ${selected ? "text-white" : "text-white"}`}>{selected?.label ?? placeholder}</span>
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 text-amber-300 transition-transform ${open ? "rotate-180 bg-amber-400/10" : ""}`}><ChevronDown size={14} /></span>
      </button>
      {open && (
        <div data-lenis-prevent id={menuId} role="listbox" aria-label={`${ariaLabel} options`} onWheel={(event) => event.stopPropagation()} onTouchMove={(event) => event.stopPropagation()} className="absolute left-0 right-0 top-full z-50 mt-2 max-h-56 touch-pan-y overflow-y-auto overscroll-contain rounded-[16px] border border-amber-400/25 bg-[#030909]/98 p-1.5 shadow-[0_20px_55px_rgba(0,0,0,0.8),0_0_24px_rgba(245, 174, 55,0.08)] backdrop-blur-2xl [scrollbar-color:rgba(245, 174, 55,0.35)_transparent] [scrollbar-width:thin]">
          {options.map((option) => (
            <button key={option.value} type="button" role="option" aria-selected={option.value === value} onClick={() => { onChange(option.value); setOpen(false); }} className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${option.value === value ? "bg-amber-400/12 text-amber-200" : "text-white hover:bg-white/[0.06] hover:text-white active:bg-white/[0.1]"}`}>
              <span>{option.label}</span>
              {option.value === value && <Check size={14} className="shrink-0 text-amber-300" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
