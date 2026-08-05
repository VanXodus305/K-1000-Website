"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Send, RotateCcw, ChevronDown, ChevronRight, MapPin, X } from "lucide-react";
import QRCode from "qrcode";
import Link from "next/link";
import SharedHeader from "../../components/ui/SharedHeader";
import Footer from "../../components/footer/Footer";
import CubeBackground from "../../components/ui/CubeBackground";
import { domains } from "../../data/domain";
import { offices } from "../../data/offices";
import { SITE_TAGLINE } from "../../data/site";

const conthrax = "font-['Conthrax',_sans-serif]";
const orbitron = "font-['Orbitron',_sans-serif]";

const academicYears = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const courseOptions = [
  "Aerospace Engineering",
  "BCA",
  "Biotech",
  "Chemical Engineering",
  "Civil Engineering",
  "Computer Science & Communication Engineering",
  "Computer Science & Engineering",
  "Computer Science & Systems Engineering",
  "Computer Science and Engineering with specialization Artificial Intelligence",
  "Computer Science and Engineering with specialization Artificial Intelligence and Machine Learning",
  "Computer Science and Engineering with specialization Cyber Security",
  "Computer Science and Engineering with specialization Data Science",
  "Computer Science and Engineering with specialization Internet of Things",
  "Computer Science and Engineering with specialization Internet of Things and Cyber Security Including Block Chain Technology",
  "Construction Technology",
  "Electrical and Computer Engineering",
  "Electrical Engineering",
  "Electronics & Electrical Engineering",
  "Electronics & Tele-Communication Engineering",
  "Electronics and Computer Science Engineering",
  "Electronics and Instrumentation",
  "Electronics Engineering VLSI Design and Technology",
  "Information Technology",
  "Law",
  "MCA",
  "Mechanical Engineering",
  "Mechanical Engineering (Automobile)",
  "Mechatronics Engineering",
  "Others"
];

const branchDomains = domains;

const recruitingOfficeKeys = new Set(["ocd", "opcr", "oca", "occ"]);
const officeChoices = offices
  .filter((office) => recruitingOfficeKeys.has(office.key))
  .map((office) => ({
    id: office.key,
    title: office.title,
    message: office.overview,
  }));

const subdomainMap: Record<string, string[]> = {
  internship: ["General Member", "Management"],
  higher: ["General Member", "Management"],
  events: ["General Member"],
  projects: ["Mentors", "Management", "General Member"],
  training: ["General Member", "App Development", "Web Development", "Game Development", "Design & UI/UX", "CyberSecurity", "DSA&CP", "Java", "AI/ML", "Data Analytics"],
  research: ["Medical Imaging", "Deep learning/ Machine learning", "Astronomy/Space technology", "Defence technology", "Game theory", "Finance and Economics", "Quantum", "Bio-Tech"],
  finance: ["General Member", "Management"],
};

const nestedSubdomainMap: Record<string, string[]> = {
  "events:General Member": ["Marketing", "Photography and videograph"],
  "projects:Mentors": ["AI/ML", "Data Analyst", "IoT"],
  "projects:General Member": ["Linux", "AI/ML", "Java", "Blockchain", "Web Development", "Data Analytics", "IoT"],
};

const ONSPOT_RECEIPT_KEY = "k1000-onspot-receipt-v1";

type OnspotReceipt = {
  id: number | null;
  email: string;
  submittedAt: string;
};

function readOnspotReceipt(): OnspotReceipt | null {
  try {
    const storedReceipt = window.localStorage.getItem(ONSPOT_RECEIPT_KEY);
    if (!storedReceipt) return null;

    const parsedReceipt = JSON.parse(storedReceipt) as OnspotReceipt;
    if (!parsedReceipt.email || !parsedReceipt.submittedAt) return null;
    return parsedReceipt;
  } catch {
    return null;
  }
}

const inputCls = "w-full bg-[#020606]/80 border border-white/10 rounded-[18px] px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none focus:border-amber-400/80 focus:bg-amber-500/[0.025] focus:shadow-[0_0_0_3px_rgba(255,191,0,0.08),0_0_28px_rgba(255,191,0,0.08)] transition-all";

type SelectOption = {
  value: string;
  label: string;
};

function CustomSelect({
  value,
  options,
  placeholder,
  onChange,
  ariaLabel,
  inlineMenu = false,
}: {
  value: string;
  options: SelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  inlineMenu?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const openSelect = () => {
    const selectedIndex = options.findIndex((option) => option.value === value);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  };

  const chooseOption = (option: SelectOption) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        openSelect();
        return;
      }
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => {
        const startingIndex = current < 0 ? 0 : current;
        return (startingIndex + direction + options.length) % options.length;
      });
    }

    if (event.key === "Enter" && isOpen && activeIndex >= 0) {
      event.preventDefault();
      chooseOption(options[activeIndex]);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${isOpen ? "z-40" : "z-0"}`}>
      <button
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-controls={`${ariaLabel.replace(/\s+/g, "-").toLowerCase()}-options`}
        onClick={() => (isOpen ? setIsOpen(false) : openSelect())}
        onKeyDown={handleKeyDown}
        className={`group flex w-full items-center justify-between gap-3 rounded-[18px] border bg-[#020606]/80 px-4 py-3.5 text-left text-sm outline-none transition-all ${
          isOpen
            ? "border-amber-400/80 bg-amber-500/[0.025] shadow-[0_0_0_3px_rgba(255,191,0,0.08),0_0_28px_rgba(255,191,0,0.08)]"
            : "border-white/10 hover:border-white/20"
        }`}
      >
        <span className={`min-w-0 truncate ${selectedOption ? "text-white" : "text-white/25"}`}>
          {selectedOption?.label ?? placeholder}
        </span>
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] border transition-all ${
          isOpen
            ? "rotate-180 border-amber-400/50 bg-amber-400/10 text-amber-300"
            : "border-white/10 bg-white/[0.025] text-white/35 group-hover:text-white/60"
        }`}>
          <ChevronDown size={14} strokeWidth={1.8} />
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`${ariaLabel.replace(/\s+/g, "-").toLowerCase()}-options`}
            role="listbox"
            initial={
              inlineMenu
                ? { opacity: 0, height: 0, marginTop: 0 }
                : { opacity: 0, y: -8, scale: 0.98 }
            }
            animate={
              inlineMenu
                ? { opacity: 1, height: "auto", marginTop: 6 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              inlineMenu
                ? { opacity: 0, height: 0, marginTop: 0 }
                : { opacity: 0, y: -6, scale: 0.98 }
            }
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={`${inlineMenu ? "relative" : "absolute left-0 right-0 top-full z-50 mt-1.5 origin-top"} max-h-64 overflow-y-auto overscroll-contain rounded-[18px] border border-amber-400/20 bg-[#040909]/95 p-1.5 shadow-[0_18px_55px_rgba(0,0,0,0.72),0_0_28px_rgba(255,191,0,0.07)] backdrop-blur-2xl [scrollbar-color:rgba(255,191,0,0.35)_rgba(255,255,255,0.04)] [scrollbar-gutter:stable] [scrollbar-width:thin]`}
            data-lenis-prevent
            onWheel={(event) => event.stopPropagation()}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => chooseOption(option)}
                  className={`flex w-full items-center justify-between gap-3 rounded-[13px] px-3 py-3 text-left text-xs leading-relaxed transition-colors md:text-sm ${
                    isSelected
                      ? "bg-amber-400/10 text-amber-200"
                      : isActive
                        ? "bg-white/[0.055] text-white"
                        : "text-white/55 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check size={13} className="shrink-0 text-amber-300" strokeWidth={2} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getDomainLabel(key: string) {
  if (key === "events") return "Event Management";
  if (key === "finance") return "Finance & Entrepreneurship";
  return domains.find((domain) => domain.key === key)?.title
    ?? offices.find((office) => office.key === key)?.title
    ?? key;
}

type OnspotFormData = {
  full_name: string;
  phone: string;
  kiit_email: string;
  gender: string;
  academic_year: string;
  course: string;
  domain_choice: string;
  sub_domains: string;
};

const initialForm: OnspotFormData = {
  full_name: "",
  phone: "",
  kiit_email: "",
  gender: "",
  academic_year: "",
  course: "",
  domain_choice: "",
  sub_domains: "",
};

export default function OnspotRegistrationPage() {
  const [form, setForm] = useState<OnspotFormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [regId, setRegId] = useState<number | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: string; text: string } | null>(null);
  const [customCourse, setCustomCourse] = useState("");
  const [storedReceipt, setStoredReceipt] = useState<OnspotReceipt | null>(null);
  const [cacheReady, setCacheReady] = useState(false);

  useEffect(() => {
    setStoredReceipt(readOnspotReceipt());
    setCacheReady(true);
  }, []);

  const downloadQR = async (id: number) => {
    try {
      const url = await QRCode.toDataURL(String(id), { width: 400, margin: 2, color: { dark: "#000", light: "#fff" } });
      setQrDataUrl(url);
      const a = document.createElement("a");
      a.href = url;
      a.download = `k1000-onspot-${id}.png`;
      a.click();
    } catch { /* silent */ }
  };

  const update = (field: keyof OnspotFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    setToast(null);
  };

  const toggleDomainChoice = (key: string) => {
    const current = form.domain_choice ? form.domain_choice.split(",").filter(Boolean) : [];
    let nextDomains: string[];
    if (current.includes(key)) {
      nextDomains = current.filter(d => d !== key);
    } else {
      if (current.length >= 3) {
        setToast({ type: "error", text: "You can select up to 3 domains." });
        return;
      }
      nextDomains = [...current, key];
    }
    update("domain_choice", nextDomains.join(","));
    // Clear sub_domains for removed domains
    const currentSubs = form.sub_domains ? form.sub_domains.split(",").filter(Boolean) : [];
    const filteredSubs = currentSubs.filter(s => nextDomains.some(d => s.startsWith(d + ":")));
    setForm(prev => ({ ...prev, sub_domains: filteredSubs.join(",") }));
  };

  const toggleSubDomain = (sub: string) => {
    const current = form.sub_domains ? form.sub_domains.split(",").filter(Boolean) : [];
    let nextSub: string[];
    if (current.includes(sub)) {
      nextSub = current.filter(s => s !== sub);
      nextSub = nextSub.filter(s => !s.startsWith(sub + ":"));
    } else {
      const parts = sub.split(":");
      const branchId = parts[0];
      const isNested = parts.length > 2;

      if (!isNested) {
        const maxTopLevel = (branchId === "projects" || branchId === "internship" || branchId === "higher" || branchId === "finance") ? 1 : 2;
        const currentTopLevelForBranch = current.filter(s => s.startsWith(branchId + ":") && s.split(":").length === 2);
        if (currentTopLevelForBranch.length >= maxTopLevel) {
          setToast({ type: "error", text: `You can select up to ${maxTopLevel} role(s) for this branch.` });
          return;
        }
      } else {
        const parentRole = `${parts[0]}:${parts[1]}`;
        const maxNested = (parentRole === "projects:Mentors" || parentRole === "projects:General Member" || parentRole === "events:General Member") ? 2 : 1;
        const currentNestedForParent = current.filter(s => s.startsWith(parentRole + ":") && s.split(":").length > 2);

        if (currentNestedForParent.length >= maxNested) {
          if (maxNested === 1) {
            nextSub = [...current.filter(s => !(s.startsWith(parentRole + ":") && s.split(":").length > 2)), sub];
            setForm(prev => ({ ...prev, sub_domains: nextSub.join(",") }));
            return;
          } else {
            setToast({ type: "error", text: `You can select up to ${maxNested} specializations for this role.` });
            return;
          }
        }
      }
      nextSub = [...current, sub];
    }
    setForm(prev => ({ ...prev, sub_domains: nextSub.join(",") }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.full_name.trim() || form.full_name.trim().length < 3) errs.full_name = "Full name must be at least 3 characters";
    if (!form.phone.trim() || !/^\+?[1-9]\d{9,14}$/.test(form.phone)) errs.phone = "Invalid phone number (10-15 digits)";
    if (!form.kiit_email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.kiit_email)) errs.kiit_email = "Invalid email address";
    else if (!form.kiit_email.toLowerCase().endsWith(".ac.in")) errs.kiit_email = "Must be a valid .ac.in email";
    if (!form.gender) errs.gender = "Select your gender";
    if (!form.academic_year) errs.academic_year = "Select your academic year";
    if (!form.course) errs.course = "Select your course";
    else if (form.course === "Others" && !customCourse.trim()) errs.customCourse = "Please specify your course";
    if (!form.domain_choice) errs.domain_choice = "Select at least one domain (max 3)";
    else {
      const selectedDomains = form.domain_choice.split(",").filter(Boolean);
      const selectedSub = form.sub_domains ? form.sub_domains.split(",").filter(Boolean) : [];
      let missingBranch = false;
      let missingNested = false;

      for (const d of selectedDomains) {
        if (subdomainMap[d] && subdomainMap[d].length > 0) {
          const hasSubForBranch = selectedSub.some(s => s.startsWith(d + ":"));
          if (!hasSubForBranch) {
            missingBranch = true;
            break;
          }
          const topLevelSelectedForBranch = selectedSub.filter(s => s.startsWith(d + ":") && s.split(":").length === 2);
          for (const topRole of topLevelSelectedForBranch) {
            if (nestedSubdomainMap[topRole] && nestedSubdomainMap[topRole].length > 0) {
              const hasNested = selectedSub.some(s => s.startsWith(topRole + ":") && s.split(":").length > 2);
              if (!hasNested) {
                missingNested = true;
              }
            }
          }
        }
      }

      if (missingBranch) {
        errs.sub_domains = "Select at least 1 role for each selected branch";
      } else if (missingNested) {
        errs.sub_domains = "Please select a specialization for your chosen role(s)";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setToast({ type: "error", text: "Please fix the highlighted errors." });
      return;
    }
    setSubmitting(true);
    setToast(null);
    try {
      const payload = {
        ...form,
        is_onspot: true,
        skills: [],
        technical_skills: [],
        non_technical_skills: [],
        motivation: "On-spot registration",
        experience: "",
        referral_source: "On-spot",
        referred_by: "",
      };
      if (form.course === "Others") payload.course = customCourse.trim();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/registration`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        const registrationId = result.data?.id ?? null;
        const receipt: OnspotReceipt = {
          id: registrationId,
          email: form.kiit_email,
          submittedAt: new Date().toISOString(),
        };

        window.localStorage.setItem(ONSPOT_RECEIPT_KEY, JSON.stringify(receipt));
        setSubmitted(true);
        setRegId(registrationId);
        setToast({ type: "success", text: "On-spot registration submitted successfully!" });
        setForm(initialForm);
        if (registrationId) downloadQR(registrationId);
      } else if (result.errors) {
        const fieldErrors: Record<string, string> = {};
        result.errors.forEach((error: { field: string; message: string }) => {
          fieldErrors[error.field] = error.message;
        });
        setErrors(fieldErrors);
        setToast({ type: "error", text: "Please fix the highlighted errors." });
      } else {
        setToast({ type: "error", text: result.message || "Submission failed." });
      }
    } catch { setToast({ type: "error", text: "Cannot reach the server. Please check your internet connection or try again." }); }
    finally { setSubmitting(false); }
  };

  const resetForm = () => { setForm(initialForm); setErrors({}); setToast(null); setCustomCourse(""); };

  const selectedDomains = form.domain_choice ? form.domain_choice.split(",").filter(Boolean) : [];

  if (!cacheReady) {
    return <div className="min-h-screen bg-[#020202]" />;
  }

  if (storedReceipt) {
    return <AlreadyRegistered receipt={storedReceipt} />;
  }

  return (
    <div className="relative w-full min-h-screen bg-[#020202] text-white selection:bg-amber-500/30 flex flex-col overflow-x-hidden cursor-default">
      <CubeBackground zIndex={0} disableLinesOnMobile />
      <SharedHeader />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,191,0,0.08)_0%,transparent_30%),radial-gradient(circle_at_82%_72%,rgba(255,140,0,0.045)_0%,transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.2),#020202_88%)] pointer-events-none z-[1]" />
      <div className="fixed inset-0 opacity-[0.06] pointer-events-none z-[1] bg-[linear-gradient(rgba(255,191,0,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,191,0,0.18)_1px,transparent_1px)] bg-[size:72px_72px]" />

      {toast && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 md:px-6 py-3 md:py-4 rounded-2xl backdrop-blur-xl text-xs md:text-sm text-center max-w-[90vw] ${
            toast.type === "success" ? "bg-green-500/10 border border-green-500/30 text-green-300" : "bg-red-500/10 border border-red-500/30 text-red-300"
          }`}>{toast.text}</motion.div>
      )}

      {submitted && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="p-6 md:p-10 rounded-[24px] md:rounded-[32px] bg-white/[0.03] backdrop-blur-xl border border-amber-500/30 text-center max-w-md w-full">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4 md:mb-6"><Check size={24} className="text-amber-400 md:w-8 md:h-8" /></div>
            <h2 className={`${conthrax} text-lg md:text-xl mb-2 md:mb-3 text-amber-400 uppercase tracking-wider`}>Walk-in Confirmed</h2>
            <p className="text-white/60 text-xs md:text-sm leading-relaxed mb-4">Your on-spot registration has been submitted successfully. You&apos;re all set for the recruitment!</p>
            {qrDataUrl && (
              <div className="flex flex-col items-center gap-2 mb-4">
                <img src={qrDataUrl} alt="QR Code" className="w-32 h-32 md:w-40 md:h-40 rounded-lg bg-white p-1" />
                <button onClick={() => { const a = document.createElement("a"); a.href = qrDataUrl; a.download = `k1000-onspot-${regId}.png`; a.click(); }}
                  className={`${conthrax} px-5 py-2 border border-amber-400/50 text-amber-400 rounded-full text-[9px] tracking-[0.2em] uppercase hover:bg-amber-400 hover:text-black transition-all cursor-pointer`}>Download QR</button>
              </div>
            )}
            <button
              onClick={() => {
                setSubmitted(false);
                setStoredReceipt(readOnspotReceipt());
              }}
              className={`${conthrax} mt-1 px-6 md:px-8 py-2.5 md:py-3 border border-amber-400 text-amber-400 rounded-full text-[9px] md:text-[10px] tracking-[0.3em] uppercase hover:bg-amber-400 hover:text-black transition-all cursor-pointer`}>Close</button>
          </div>
        </motion.div>
      )}

      {/* ─── HERO ─── */}
      <section className="relative z-10 pt-24 md:pt-32 pb-5 md:pb-7 text-center px-4">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "circOut" }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-400/30 bg-amber-400/[0.06] mb-5">
            <MapPin size={14} className="text-amber-400" />
            <span className={`${orbitron} text-[9px] md:text-[10px] tracking-[0.35em] uppercase text-amber-300/80`}>
              On-Spot Registration
            </span>
          </div>
          <h1 className={`${conthrax} text-2xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none`}>
            Walk-In <br className="md:hidden" />
            <span className="text-amber-400 drop-shadow-[0_0_18px_rgba(255,191,0,0.35)]">Registration</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-white/45">
            Quick registration for candidates attending the K-1000 recruitment in person. Fill in your basic details, pick your preferred domain, and you&apos;re in.
          </p>
          <motion.div
            className="mx-auto mt-6 flex max-w-xl flex-col items-center justify-center gap-2 rounded-[24px] border border-amber-300/25 bg-amber-400/[0.055] px-4 py-4 shadow-[0_0_36px_rgba(255,191,0,0.08)] sm:flex-row sm:gap-4"
            animate={{
              boxShadow: [
                "0 0 22px rgba(255,191,0,0.06)",
                "0 0 42px rgba(255,191,0,0.18)",
                "0 0 22px rgba(255,191,0,0.06)",
              ],
            }}
            transition={{ duration: 1.45, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className={`${orbitron} text-[8px] uppercase tracking-[0.34em] text-amber-300/70`}>
              Recruitment Dates
            </span>
            <span className={`${conthrax} text-sm uppercase tracking-[0.1em] text-white sm:text-base`}>
              8th &amp; 9th August 2026
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── FORM ─── */}
      <div className="relative z-10 max-w-3xl mx-auto w-full px-4 pb-16 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease: "circOut" }}
          className="relative overflow-visible rounded-[28px] md:rounded-[40px] border border-white/10 bg-white/[0.028] backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.32)]"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(255,191,0,0.1),transparent_34%)] pointer-events-none" />
          <div className="relative z-10 p-5 sm:p-7 md:p-9">

            <form onSubmit={handleSubmit}>

              {/* ─── Personal Information ─── */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-amber-300 bg-amber-400 text-black text-[10px] font-black shadow-[0_0_18px_rgba(255,191,0,0.55)]">01</div>
                  <h2 className={`${conthrax} text-base sm:text-lg md:text-xl uppercase tracking-tight text-white`}>Personal Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <Field label="Full Name" error={errors.full_name}>
                    <input type="text" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="e.g. John Doe" className={inputCls} />
                  </Field>
                  <Field label="Gender" error={errors.gender}>
                    <CustomSelect
                      value={form.gender}
                      options={genderOptions}
                      placeholder="Select gender"
                      ariaLabel="Gender"
                      onChange={(value) => update("gender", value)}
                    />
                  </Field>
                  <Field label="Phone" error={errors.phone}>
                    <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 9876543210" className={inputCls} />
                  </Field>
                  <Field label="Email" error={errors.kiit_email} helper="Use your official KIIT account ending in @kiit.ac.in.">
                    <input type="email" value={form.kiit_email} onChange={(e) => update("kiit_email", e.target.value)} placeholder="john@kiit.ac.in" className={inputCls} />
                  </Field>
                </div>
              </div>

              {/* ─── Academic Information ─── */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-amber-300 bg-amber-400 text-black text-[10px] font-black shadow-[0_0_18px_rgba(255,191,0,0.55)]">02</div>
                  <h2 className={`${conthrax} text-base sm:text-lg md:text-xl uppercase tracking-tight text-white`}>Academics</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <Field label="Academic Year" error={errors.academic_year}>
                    <CustomSelect
                      value={form.academic_year}
                      options={academicYears.map((year) => ({ value: year, label: year }))}
                      placeholder="Select year"
                      ariaLabel="Academic year"
                      inlineMenu
                      onChange={(value) => update("academic_year", value)}
                    />
                  </Field>
                  <Field label="Course" error={errors.course}>
                    <CustomSelect
                      value={form.course}
                      options={courseOptions.map((course) => ({ value: course, label: course }))}
                      placeholder="Select course"
                      ariaLabel="Course"
                      inlineMenu
                      onChange={(value) => update("course", value)}
                    />
                  </Field>
                  {form.course === "Others" && (
                    <div className="md:col-span-2">
                      <Field label="Specify Course" error={errors.customCourse}>
                        <input type="text" value={customCourse} onChange={(e) => { setCustomCourse(e.target.value); setErrors(prev => { const n = { ...prev }; delete n.customCourse; return n; }); }} placeholder="Enter your course name" className={inputCls} />
                      </Field>
                    </div>
                  )}
                </div>
              </div>

              {/* ─── Domain Preference ─── */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-amber-300 bg-amber-400 text-black text-[10px] font-black shadow-[0_0_18px_rgba(255,191,0,0.55)]">03</div>
                  <h2 className={`${conthrax} text-base sm:text-lg md:text-xl uppercase tracking-tight text-white`}>Domain Preference</h2>
                </div>
                <p className="text-xs md:text-sm text-white/50 mb-4 md:mb-6 leading-relaxed">Select your preferred domain (up to 3).</p>
                <h5 className={`${conthrax} text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-amber-400/60 mb-3`}>Branches</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mb-6">
                  {branchDomains.map((d) => {
                    const key = d.key as string;
                    const label = getDomainLabel(key);
                    const selected = selectedDomains.includes(key);
                    return (
                      <button key={key} type="button" onClick={() => toggleDomainChoice(key)}
                        className={`text-left px-4 py-4 rounded-[20px] border text-xs md:text-sm transition-all duration-300 cursor-pointer ${
                          selected ? "bg-amber-500/10 border-amber-400/70 text-amber-300 shadow-[0_0_18px_rgba(255,191,0,0.1)]" : "bg-white/[0.025] border-white/10 text-white/60 hover:border-amber-500/35 hover:text-white/85 hover:bg-white/[0.04]"
                        }`}>
                        <div className={`${conthrax} text-[8px] md:text-[9px] tracking-wider mb-1 ${selected ? "text-amber-400" : "text-white/30"}`}>BRANCH</div>
                        {label}
                      </button>
                    );
                  })}
                </div>
                <h5 className={`${conthrax} text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-amber-400/60 mb-3`}>Offices</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  {officeChoices.map((o) => {
                    const selected = selectedDomains.includes(o.id);
                    return (
                      <button key={o.id} type="button" onClick={() => toggleDomainChoice(o.id)}
                        className={`text-left px-4 py-4 rounded-[20px] border text-xs md:text-sm transition-all duration-300 cursor-pointer ${
                          selected ? "bg-amber-500/10 border-amber-400/70 text-amber-300 shadow-[0_0_18px_rgba(255,191,0,0.1)]" : "bg-white/[0.025] border-white/10 text-white/60 hover:border-amber-500/35 hover:text-white/85 hover:bg-white/[0.04]"
                        }`}>
                        <div className={`${conthrax} text-[8px] md:text-[9px] tracking-wider mb-1 ${selected ? "text-amber-400" : "text-white/30"}`}>OFFICE</div>
                        {o.title}
                      </button>
                    );
                  })}
                </div>

                {/* Sub-Domains */}
                {(() => {
                  if (selectedDomains.length === 0) return null;
                  const hasAnySubdomains = selectedDomains.some(d => subdomainMap[d]?.length > 0);
                  if (!hasAnySubdomains) return null;

                  return (
                    <div className="mt-8 border-t border-white/10 pt-6 text-left">
                      <h5 className={`${conthrax} text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-amber-400/60 mb-3`}>Sub-Domains & Roles</h5>
                      <p className="text-xs md:text-sm text-white/40 mb-4">Select your specific roles and specializations based on branch limits.</p>
                      <div className="flex flex-col gap-6">
                        {selectedDomains.map((d) => {
                          const subs = subdomainMap[d];
                          if (!subs || subs.length === 0) return null;

                          let label = d;
                          const branchMatch = branchDomains.find(b => b.key === d);
                          if (branchMatch) label = branchMatch.title;
                          const officeMatch = officeChoices.find(o => o.id === d);
                          if (officeMatch) label = officeMatch.title;

                          return (
                            <div key={d} className="flex flex-col gap-4">
                              <div>
                                <h6 className="text-[10px] md:text-[11px] text-amber-400/40 uppercase tracking-[0.15em] mb-3">{label}</h6>
                                <div className="flex flex-wrap gap-2 md:gap-3">
                                  {subs.map((sub) => {
                                    const uniqueSubKey = `${d}:${sub}`;
                                    const selected = (form.sub_domains ? form.sub_domains.split(",") : []).includes(uniqueSubKey);
                                    return (
                                      <button key={sub} type="button" onClick={() => toggleSubDomain(uniqueSubKey)}
                                        className={`px-4 py-2.5 rounded-[14px] border text-xs md:text-sm transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                                          selected ? "bg-amber-500/10 border-amber-400/70 text-amber-300 shadow-[0_0_18px_rgba(255,191,0,0.1)]" : "bg-white/[0.025] border-white/10 text-white/60 hover:border-amber-500/35 hover:text-white/85 hover:bg-white/[0.04]"
                                        }`}>
                                        {selected && <Check size={14} className="shrink-0 text-amber-400" />}
                                        {sub}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              {subs.map(sub => {
                                const uniqueSubKey = `${d}:${sub}`;
                                const selected = (form.sub_domains ? form.sub_domains.split(",") : []).includes(uniqueSubKey);
                                if (selected && nestedSubdomainMap[uniqueSubKey] && nestedSubdomainMap[uniqueSubKey].length > 0) {
                                  return (
                                    <div key={`nested-${sub}`} className="pl-4 md:pl-6 border-l-2 border-amber-500/20">
                                      <h6 className="text-[9px] md:text-[10px] text-amber-400/30 uppercase tracking-[0.15em] mb-2">{sub} Specialization</h6>
                                      <div className="flex flex-wrap gap-2">
                                        {nestedSubdomainMap[uniqueSubKey].map(nestedSub => {
                                          const nestedKey = `${uniqueSubKey}:${nestedSub}`;
                                          const nestedSelected = (form.sub_domains ? form.sub_domains.split(",") : []).includes(nestedKey);
                                          return (
                                            <button key={nestedSub} type="button" onClick={() => toggleSubDomain(nestedKey)}
                                              className={`px-3 py-1.5 rounded-[10px] border text-[11px] md:text-xs transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                                                nestedSelected ? "bg-orange-500/10 border-orange-400/70 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.1)]" : "bg-white/[0.02] border-white/5 text-white/50 hover:border-orange-500/35 hover:text-white/70"
                                              }`}>
                                              {nestedSelected && <Check size={12} className="shrink-0 text-orange-400" />}
                                              {nestedSub}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          );
                        })}
                      </div>
                      {errors.sub_domains && <p className="text-red-400 text-xs mt-3">{errors.sub_domains}</p>}
                    </div>
                  );
                })()}
                {errors.domain_choice && <p className="text-red-400 text-xs mt-3">{errors.domain_choice}</p>}
              </div>

              {/* ─── Summary & Actions ─── */}
              <div className="p-5 md:p-6 rounded-[24px] bg-amber-500/[0.018] border border-amber-500/10 mb-6">
                <h5 className={`${conthrax} text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-amber-400/60 mb-3`}>Quick Summary</h5>
                <div className="grid grid-cols-2 gap-2 text-[11px] md:text-xs text-white/50">
                  <span className="text-white/30">Name:</span><span className="text-white/70">{form.full_name || "—"}</span>
                  <span className="text-white/30">Email:</span><span className="text-white/70">{form.kiit_email || "—"}</span>
                  <span className="text-white/30">Year:</span><span className="text-white/70">{form.academic_year || "—"}</span>
                  <span className="text-white/30">Course:</span><span className="text-white/70">{form.course === "Others" ? customCourse || "—" : form.course || "—"}</span>
                  <span className="text-white/30">Domains:</span>
                  <span className="text-white/70 capitalize">{form.domain_choice ? form.domain_choice.split(",").map(getDomainLabel).join(", ") : "—"}</span>
                  {form.sub_domains && (
                    <>
                      <span className="text-white/30">Roles:</span>
                      <span className="text-white/70 capitalize">{form.sub_domains.split(",").map(sub => sub.replace(/:/g, " → ")).join(", ")}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-5 md:pt-6 border-t border-white/10">
                <button type="button" onClick={resetForm}
                  className={`${conthrax} flex items-center gap-1.5 px-4 md:px-6 py-2.5 md:py-3 rounded-full border border-white/10 text-white/40 text-[9px] md:text-[10px] tracking-[0.3em] uppercase hover:border-white/30 hover:text-white/70 transition-all cursor-pointer`}>
                  <RotateCcw size={12} /> Reset
                </button>
                <button type="submit" disabled={submitting}
                  className={`${conthrax} flex items-center gap-1.5 px-5 md:px-8 py-2.5 md:py-3 rounded-full border border-amber-400 text-amber-400 text-[9px] md:text-[10px] tracking-[0.3em] uppercase hover:bg-amber-400 hover:text-black transition-all shadow-[0_0_20px_rgba(255,191,0,0.1)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer`}>
                  {submitting ? "Submitting..." : <><Send size={12} /> Register</>}
                </button>
              </div>
            </form>

          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

function AlreadyRegistered({ receipt }: { receipt: OnspotReceipt }) {
  const submittedDate = new Date(receipt.submittedAt);
  const formattedDate = Number.isNaN(submittedDate.getTime())
    ? "Previously submitted"
    : new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(submittedDate);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#020202] text-white">
      <CubeBackground zIndex={0} disableLinesOnMobile />
      <SharedHeader />
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16 pt-28 md:pt-36">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-amber-400/25 bg-black/65 p-6 text-center shadow-[0_0_70px_rgba(255,191,0,0.1)] backdrop-blur-2xl md:p-10"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] border border-amber-400/35 bg-amber-400/10 text-amber-300">
            <Check size={24} />
          </div>
          <p className={`${orbitron} mt-6 text-[8px] uppercase tracking-[0.35em] text-amber-300/55`}>
            On-spot receipt found
          </p>
          <h1 className={`${conthrax} mt-3 text-xl uppercase text-white md:text-3xl`}>
            Already Registered
          </h1>
          <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-white/50 md:text-sm">
            This browser already has an on-spot registration receipt. You&apos;re good to go!
          </p>
          <div className="mt-7 rounded-[20px] border border-white/10 bg-white/[0.025] p-4 text-left">
            <div className="grid grid-cols-[90px_1fr] gap-2 text-[10px] md:grid-cols-[120px_1fr] md:text-xs">
              <span className="text-white/30">KIIT account</span>
              <span className="break-all text-white/70">{receipt.email}</span>
              <span className="text-white/30">Signal ID</span>
              <span className="text-amber-300">{receipt.id ? `#${receipt.id}` : "Recorded"}</span>
              <span className="text-white/30">Submitted</span>
              <span className="text-white/70">{formattedDate}</span>
            </div>
          </div>
          <Link
            href="/"
            className={`${conthrax} mt-7 inline-flex items-center gap-2 rounded-full border border-amber-400/50 px-6 py-3 text-[9px] uppercase tracking-[0.2em] text-amber-300 transition-all hover:bg-amber-400 hover:text-black`}
          >
            Return Home <ChevronRight size={13} />
          </Link>
          <p className={`${conthrax} mt-7 text-[7px] uppercase tracking-[0.35em] text-amber-400/35`}>
            {SITE_TAGLINE}
          </p>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
}

function Field({
  label,
  error,
  helper,
  required = true,
  children,
}: {
  label: string;
  error?: string;
  helper?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 md:mb-4">
      <label className="block text-[10px] md:text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5 md:mb-2">
        {label}{" "}
        {required ? (
          <span className="text-amber-400">*</span>
        ) : (
          <span className="text-white/25 normal-case tracking-normal">(optional)</span>
        )}
      </label>
      {children}
      {helper && !error && <p className="mt-1.5 text-[10px] leading-relaxed text-amber-200/45 md:text-[11px]">{helper}</p>}
      {error && <p className="text-red-400 text-[10px] md:text-[11px] mt-1">{error}</p>}
    </div>
  );
}
