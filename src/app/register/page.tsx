"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Send, RotateCcw, Plus, ChevronRight, ChevronLeft, ChevronDown, Quote } from "lucide-react";
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

const referralOptions = [
  "Social Media (Instagram/LinkedIn)", "Friend or Senior", "Faculty Member",
  "College Notice Board", "KIIT Website", "WhatsApp Group", "Campus Event", "Other",
];

const technicalSkillOptions = [
  "Programming Fundamentals",
  "Python",
  "JavaScript / TypeScript",
  "Java",
  "C++",
  "React / Next.js",
  "Backend Development",
  "Database Management",
  "AI / ML",
  "Data Science",
  "Cloud & DevOps",
  "Cybersecurity",
  "UI / UX Design",
  "Research Methodology",
  "Academic Writing",
  "Resume Building",
  "Mock Interview Prep",
  "Financial Planning",
  "Startup Strategy",
];

const nonTechnicalSkillOptions = [
  "Leadership",
  "Team Coordination",
  "Communication",
  "Public Speaking",
  "Event Planning",
  "Logistics Management",
  "Content Writing",
  "Social Media Handling",
  "Public Relations",
  "Sponsorship Outreach",
  "Campus Outreach",
  "Creative Direction",
  "Documentation",
  "Mentorship",
  "Problem Solving",
];

const branchDomains = domains;

const branchMessages: Record<string, string> = {
  events: `"We look for individuals who plan with precision, execute with passion, and bring every event to life for the K-1000 community."`,
  higher: `"We are here to guide you through every step with mentorship, workshops, and a supportive community. If you're curious, eager to learn, and ready to grow, we'd love to have you with us. We look forward to welcoming you to the Higher Study Domain!"`,
  research: `"Welcome to the Research & Publications Wing of Team K-1000! Research is a journey of asking meaningful questions, embracing challenges, and growing through collaboration. We encourage you to approach this recruitment process with honesty and confidence. There are no perfect answers, only opportunities to demonstrate how you think."`,
  projects: `"At Project Wing, we build ideas into real-world projects. If you have a basic foundation in your domain and are passionate about building, we'd love to have you on board. We're also looking for AI/ML and Data Analytics Mentors with strong domain knowledge to guide our teams. Ready to build? Join Project Wing!"`,
  training: `"Every expert starts as a beginner. Whether you're new to a domain or looking to sharpen your skills, the K-1000 Training Program welcomes curious minds ready to learn, build, and grow. Join us and take the next step in your learning journey."`,
  finance: `"We look for individuals who don't just understand finance, they live it. If you think in numbers, speak in ideas, and have the drive to build something that matters, Finance & Entrepreneurship is where you belong."`,
  internship: `"The Academic Internship and Placement Guidance (AIPG) wing warmly welcomes driven individuals—for both general and management roles—who are passionate about shaping careers and bridging the gap between academia and the professional world. Join us in empowering our peers by training students to successfully meet and exceed industry expectations."`,
  oca: `"The Office of Campus Ambassadors seeks individuals who lead by influence, inspire through action, and create a meaningful impact within the KIIT community."`,
  ocd: `"The Office of Creativity & Design seeks individuals who lead with creativity, design with purpose, and leave a lasting visual impact across the KIIT community."`,
  opcr: `"We look for individuals who communicate with purpose, build relationships with intent, bring in the support that powers every event, and represent K-1000 with pride in every room they walk into."`,
  occ: `"The Office of Content and Communication seeks dedicated individuals who are willing to contribute their time, work collaboratively, and play an active role in strengthening the functioning of the K1000 Society through commitment, responsibility, and initiative."`,
};

const designations: Record<string, string> = {
  events: "Director & Deputy Director | Event Management",
  higher: "Deputy Director | Higher Studies",
  research: "Director & Deputy Director | Research & Publications Wing",
  projects: "Director & Deputy Director | Project Wing",
  training: "Deputy Director | Training Program",
  finance: "Director & Deputy Director | Finance & Entrepreneurship",
  internship: "Director and Deputy Director | AIPG",
  oca: "Deputy Director, OCA",
  ocd: "Deputy Director, OCD",
  opcr: "Director | OPCR",
  occ: "Deputy Director | OCC",
};

const recruitingOfficeKeys = new Set(["ocd", "opcr", "oca", "occ"]);
const officeChoices = offices
  .filter((office) => recruitingOfficeKeys.has(office.key))
  .map((office) => ({
    id: office.key,
    title: office.title,
    message: office.overview,
  }));

const steps = [
  { id: 1, label: "Personal", title: "Personal Information" },
  { id: 2, label: "Academic", title: "Academic Details" },
  { id: 3, label: "Experience", title: "Experience & Motivation" },
  { id: 4, label: "Domain", title: "Choose Your Domain" },
  { id: 5, label: "Review", title: "Review & Submit" },
];

type FormData = {
  full_name: string; phone: string; kiit_email: string;
  gender: string;
  academic_year: string; course: string;
  domain_choice: string; motivation: string; experience: string;
  technical_skills: string[]; non_technical_skills: string[];
  referral_source: string;
};

const initialForm: FormData = {
  full_name: "", phone: "", kiit_email: "", gender: "",
  academic_year: "", course: "",
  domain_choice: "", motivation: "", experience: "",
  technical_skills: [], non_technical_skills: [], referral_source: "",
};

const REGISTRATION_RECEIPT_KEY = "k1000-registration-receipt-v1";

type RegistrationReceipt = {
  id: number | null;
  email: string;
  submittedAt: string;
};

function readRegistrationReceipt(): RegistrationReceipt | null {
  try {
    const storedReceipt = window.localStorage.getItem(REGISTRATION_RECEIPT_KEY);
    if (!storedReceipt) return null;

    const parsedReceipt = JSON.parse(storedReceipt) as RegistrationReceipt;
    if (!parsedReceipt.email || !parsedReceipt.submittedAt) return null;
    return parsedReceipt;
  } catch {
    return null;
  }
}

const inputCls = "w-full bg-[#020606]/80 border border-white/10 rounded-[18px] px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-400/80 focus:bg-cyan-500/[0.025] focus:shadow-[0_0_0_3px_rgba(0,247,255,0.08),0_0_28px_rgba(0,247,255,0.08)] transition-all";

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
            ? "border-cyan-400/80 bg-cyan-500/[0.025] shadow-[0_0_0_3px_rgba(0,247,255,0.08),0_0_28px_rgba(0,247,255,0.08)]"
            : "border-white/10 hover:border-white/20"
        }`}
      >
        <span className={`min-w-0 truncate ${selectedOption ? "text-white" : "text-white/25"}`}>
          {selectedOption?.label ?? placeholder}
        </span>
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] border transition-all ${
          isOpen
            ? "rotate-180 border-cyan-400/50 bg-cyan-400/10 text-cyan-300"
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
            className={`${inlineMenu ? "relative" : "absolute left-0 right-0 top-full z-50 mt-1.5 origin-top"} max-h-64 overflow-y-auto overscroll-contain rounded-[18px] border border-cyan-400/20 bg-[#040909]/95 p-1.5 shadow-[0_18px_55px_rgba(0,0,0,0.72),0_0_28px_rgba(0,247,255,0.07)] backdrop-blur-2xl [scrollbar-color:rgba(0,247,255,0.35)_rgba(255,255,255,0.04)] [scrollbar-gutter:stable] [scrollbar-width:thin]`}
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
                      ? "bg-cyan-400/10 text-cyan-200"
                      : isActive
                        ? "bg-white/[0.055] text-white"
                        : "text-white/55 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check size={13} className="shrink-0 text-cyan-300" strokeWidth={2} />}
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

function getDomainMsg(key: string) {
  if (branchMessages[key]) return branchMessages[key];
  const d = domains.find(x => x.key === key);
  if (d) return `"${d.overview.split(".")[0]}."`;
  return "";
}

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [regId, setRegId] = useState<number | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: string; text: string } | null>(null);
  const [customTechnicalSkill, setCustomTechnicalSkill] = useState("");
  const [customNonTechnicalSkill, setCustomNonTechnicalSkill] = useState("");
  const [customCourse, setCustomCourse] = useState("");
  const [flashMsg, setFlashMsg] = useState<string | null>(null);
  const [flashLabel, setFlashLabel] = useState("");
  const [storedRegistration, setStoredRegistration] = useState<RegistrationReceipt | null>(null);
  const [registrationCacheReady, setRegistrationCacheReady] = useState(false);

  useEffect(() => {
    setStoredRegistration(readRegistrationReceipt());
    setRegistrationCacheReady(true);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setErrors({});
    setToast(null);
  }, [step]);

  useEffect(() => {
    if (!flashMsg) return;
    const timer = setTimeout(() => {
      setFlashMsg(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [flashMsg]);

  const downloadQR = async (id: number) => {
    try {
      const url = await QRCode.toDataURL(String(id), { width: 400, margin: 2, color: { dark: "#000", light: "#fff" } });
      setQrDataUrl(url);
      const a = document.createElement("a");
      a.href = url;
      a.download = `k1000-registration-${id}.png`;
      a.click();
    } catch { /* silent */ }
  };

  const update = (field: keyof FormData, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    setToast(null);
  };

  const toggleSkill = (field: "technical_skills" | "non_technical_skills", skill: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(skill) ? prev[field].filter((s) => s !== skill) : [...prev[field], skill],
    }));
  };

  const addCustomSkill = (field: "technical_skills" | "non_technical_skills", value: string, reset: () => void) => {
    const skill = value.trim();
    if (skill && !form[field].includes(skill)) {
      setForm((prev) => ({ ...prev, [field]: [...prev[field], skill] }));
    }
    reset();
  };

  const showFlash = (key: string, label: string) => {
    const msg = getDomainMsg(key) || officeChoices.find((office) => office.id === key)?.message || "";
    if (!msg) return;
    setFlashLabel(designations[key] || label);
    setFlashMsg(msg);
  };

  const toggleDomainChoice = (key: string, label: string) => {
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
    showFlash(key, label);
  };

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!form.full_name.trim() || form.full_name.trim().length < 3) errs.full_name = "Full name must be at least 3 characters";
      if (!form.phone.trim() || !/^\+?[1-9]\d{9,14}$/.test(form.phone)) errs.phone = "Invalid phone number (10-15 digits)";
      if (!form.kiit_email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.kiit_email)) errs.kiit_email = "Invalid email address";
      else if (!form.kiit_email.toLowerCase().endsWith(".ac.in")) errs.kiit_email = "Must be a valid .ac.in email";
      if (!form.gender) errs.gender = "Select your gender";
    } else if (step === 2) {
      if (!form.academic_year) errs.academic_year = "Select your academic year";
      if (!form.course) errs.course = "Select your course";
      else if (form.course === "Others" && !customCourse.trim()) errs.customCourse = "Please specify your course";
    } else if (step === 3) {
      if (!form.motivation.trim() || form.motivation.trim().length < 20) errs.motivation = "Motivation must be at least 20 characters";
    } else if (step === 4) {
      if (!form.domain_choice) errs.domain_choice = "Select a domain (max 3)";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;

    setErrors({});
    setToast(null);
    setStep((currentStepNumber) => Math.min(currentStepNumber + 1, 5));
  };
  const prev = () => { setStep(s => Math.max(s - 1, 1)); setErrors({}); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 5) {
      next();
      return;
    }
    
    if (!validateStep()) { setToast({ type: "error", text: "Please fix the highlighted errors." }); return; }
    setSubmitting(true);
    setToast(null);
    try {
      const combinedSkills = [...form.technical_skills, ...form.non_technical_skills];
      const payload = {
        ...form,
        skills: combinedSkills,
        referral_source: form.referral_source || "Not specified",
      };
      if (form.course === "Others") payload.course = customCourse.trim();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/registration`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        const registrationId = result.data?.id ?? null;
        const receipt: RegistrationReceipt = {
          id: registrationId,
          email: form.kiit_email,
          submittedAt: new Date().toISOString(),
        };

        window.localStorage.setItem(REGISTRATION_RECEIPT_KEY, JSON.stringify(receipt));
        setSubmitted(true);
        setRegId(registrationId);
        setToast({ type: "success", text: "Registration submitted successfully!" });
        setForm(initialForm);
        setStep(1);
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

  const resetForm = () => { setForm(initialForm); setErrors({}); setToast(null); setStep(1); };

  const currentStep = steps[step - 1];
  const selectedDomains = form.domain_choice ? form.domain_choice.split(",").filter(Boolean) : [];

  if (!registrationCacheReady) {
    return <div className="min-h-screen bg-[#020202]" />;
  }

  if (storedRegistration) {
    return <AlreadyRegistered receipt={storedRegistration} />;
  }

  return (
    <div className="relative w-full min-h-screen bg-[#020202] text-white selection:bg-cyan-500/30 flex flex-col overflow-x-hidden cursor-default">
      <CubeBackground zIndex={0} disableLinesOnMobile />
      <SharedHeader />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(0,247,255,0.08)_0%,transparent_30%),radial-gradient(circle_at_82%_72%,rgba(0,247,255,0.045)_0%,transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.2),#020202_88%)] pointer-events-none z-[1]" />
      <div className="fixed inset-0 opacity-[0.06] pointer-events-none z-[1] bg-[linear-gradient(rgba(0,247,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(0,247,255,0.18)_1px,transparent_1px)] bg-[size:72px_72px]" />

      {toast && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 md:px-6 py-3 md:py-4 rounded-2xl backdrop-blur-xl text-xs md:text-sm text-center max-w-[90vw] ${
            toast.type === "success" ? "bg-green-500/10 border border-green-500/30 text-green-300" : "bg-red-500/10 border border-red-500/30 text-red-300"
          }`}>{toast.text}</motion.div>
      )}

      {submitted && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="p-6 md:p-10 rounded-[24px] md:rounded-[32px] bg-white/[0.03] backdrop-blur-xl border border-cyan-500/30 text-center max-w-md w-full">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4 md:mb-6"><Check size={24} className="text-cyan-400 md:w-8 md:h-8" /></div>
            <h2 className={`${conthrax} text-lg md:text-xl mb-2 md:mb-3 text-cyan-400 uppercase tracking-wider`}>Application Received</h2>
            <p className="text-white/60 text-xs md:text-sm leading-relaxed mb-4">Your registration has been submitted successfully.</p>
            {qrDataUrl && (
              <div className="flex flex-col items-center gap-2 mb-4">
                <img src={qrDataUrl} alt="QR Code" className="w-32 h-32 md:w-40 md:h-40 rounded-lg bg-white p-1" />
                <button onClick={() => { const a = document.createElement("a"); a.href = qrDataUrl; a.download = `k1000-registration-${regId}.png`; a.click(); }}
                  className={`${conthrax} px-5 py-2 border border-cyan-400/50 text-cyan-400 rounded-full text-[9px] tracking-[0.2em] uppercase hover:bg-cyan-400 hover:text-black transition-all cursor-pointer`}>Download QR</button>
              </div>
            )}
            <button
              onClick={() => {
                setSubmitted(false);
                setStoredRegistration(readRegistrationReceipt());
              }}
              className={`${conthrax} mt-1 px-6 md:px-8 py-2.5 md:py-3 border border-cyan-400 text-cyan-400 rounded-full text-[9px] md:text-[10px] tracking-[0.3em] uppercase hover:bg-cyan-400 hover:text-black transition-all cursor-pointer`}>Close</button>
          </div>
        </motion.div>
      )}

      <section className="relative z-10 pt-24 md:pt-32 pb-5 md:pb-7 text-center px-4">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "circOut" }}>
          <p className={`${orbitron} text-[9px] md:text-[10px] tracking-[0.45em] uppercase text-cyan-300/60 mb-4`}>
            Intake console
          </p>
          <h1 className={`${conthrax} text-2xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none`}>
            Recruitment <br className="md:hidden" />
            <span className="text-cyan-400 drop-shadow-[0_0_18px_rgba(0,247,255,0.35)]">Registration</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-white/45">
            Complete the recruitment signal with your academic profile, preferred domains, and intent to join KIIT&apos;s official R&amp;D society.
          </p>
        </motion.div>
      </section>

      {/* ─── STEP INDICATOR ─── */}
      <div className="relative z-10 max-w-3xl mx-auto w-full px-4 mb-6 md:mb-8">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#030707]/70 backdrop-blur-xl p-3.5 md:p-5 shadow-[0_0_40px_rgba(0,0,0,0.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,247,255,0.1),transparent_48%)] pointer-events-none" />
          <div className="relative z-10 grid grid-cols-5 gap-1.5 sm:gap-2">
            {steps.map((s) => {
              const isActive = step === s.id;
              const isComplete = step > s.id;
              const isReachable = s.id <= step;

              return (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`${s.label} step`}
                  onClick={() => {
                    if (isReachable) setStep(s.id);
                  }}
                  className={`group relative min-w-0 overflow-hidden rounded-[20px] border px-1.5 py-2.5 text-center transition-all duration-300 sm:px-2 sm:py-3 ${
                    isActive
                      ? "border-cyan-400/45 bg-cyan-500/[0.09] shadow-[inset_0_0_20px_rgba(0,247,255,0.04)]"
                      : isComplete
                        ? "border-cyan-400/15 bg-cyan-500/[0.025] hover:border-cyan-400/30 hover:bg-cyan-500/[0.04]"
                        : "border-white/5 bg-white/[0.015]"
                  } ${isReachable ? "cursor-pointer" : "cursor-default"}`}
                >
                  {isActive && (
                    <motion.div layoutId="registerNumberBarActive" className="absolute inset-0 bg-cyan-400/[0.04] blur-xl" />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-[12px] border text-[10px] font-black tabular-nums transition-all duration-300 md:h-10 md:w-10 md:rounded-[14px] md:text-xs ${
                      isActive
                        ? "border-cyan-300 bg-cyan-400 text-black shadow-[0_0_18px_rgba(0,247,255,0.55)]"
                        : isComplete
                          ? "border-cyan-400/45 bg-cyan-500/10 text-cyan-300"
                          : "border-white/10 bg-black/35 text-white/25"
                    }`}>
                      {isComplete ? <Check size={14} /> : `0${s.id}`}
                    </div>
                    <span className={`${conthrax} hidden max-w-full truncate text-[7px] uppercase tracking-[0.16em] sm:block md:text-[8px] ${
                      isActive ? "text-cyan-300" : isComplete ? "text-white/45" : "text-white/22"
                    }`}>
                      {s.label}
                    </span>
                    <span className={`h-1 w-1 rounded-full transition-all duration-300 sm:hidden ${
                      isActive ? "bg-cyan-300 shadow-[0_0_8px_rgba(0,247,255,0.8)]" : isComplete ? "bg-cyan-500/50" : "bg-white/15"
                    }`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── FORM ─── */}
      <div className="relative z-10 max-w-3xl mx-auto w-full px-4 pb-16 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease: "circOut" }}
          className="relative overflow-visible rounded-[28px] md:rounded-[40px] border border-white/10 bg-white/[0.028] backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.32)]"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(0,247,255,0.1),transparent_34%)] pointer-events-none" />
          <div className="relative z-10 p-5 sm:p-7 md:p-9">
            <div className="mb-7 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className={`${orbitron} text-[9px] tracking-[0.4em] uppercase text-cyan-300/60`}>
                  Step 0{step}/05
                </p>
                <h2 className={`${conthrax} mt-3 text-lg sm:text-2xl md:text-3xl uppercase tracking-tight text-white`}>
                  {currentStep.title}
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:w-[260px]">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  <p className={`${orbitron} text-[7px] uppercase tracking-[0.22em] text-white/25`}>Phase</p>
                  <p className={`${conthrax} mt-1.5 text-xs text-cyan-300`}>0{step}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  <p className={`${orbitron} text-[7px] uppercase tracking-[0.22em] text-white/25`}>Domains</p>
                  <p className={`${conthrax} mt-1.5 text-xs text-cyan-300`}>{selectedDomains.length}/3</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  <p className={`${orbitron} text-[7px] uppercase tracking-[0.22em] text-white/25`}>Year</p>
                  <p className={`${conthrax} mt-1.5 truncate text-[9px] text-cyan-300`}>{form.academic_year || "—"}</p>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06] sm:hidden">
                <motion.div
                  className="h-full rounded-full bg-cyan-400 shadow-[0_0_16px_rgba(0,247,255,0.55)]"
                  animate={{ width: `${(step / steps.length) * 100}%` }}
                  transition={{ duration: 0.35, ease: "circOut" }}
                />
              </div>
            </div>
            <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

                {/* STEP 1: Personal Information */}
                {step === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <Field label="Full Name" error={errors.full_name}><input type="text" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="e.g. John Doe" className={inputCls} /></Field>
                    <Field label="Gender" error={errors.gender}>
                      <CustomSelect
                        value={form.gender}
                        options={genderOptions}
                        placeholder="Select gender"
                        ariaLabel="Gender"
                        onChange={(value) => update("gender", value)}
                      />
                    </Field>
                    <Field label="Phone" error={errors.phone}><input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 9876543210" className={inputCls} /></Field>
                    <Field label="Email" error={errors.kiit_email} helper="Use your official KIIT account ending in @kiit.ac.in.">
                      <input type="email" value={form.kiit_email} onChange={(e) => update("kiit_email", e.target.value)} placeholder="john@kiit.ac.in" className={inputCls} />
                    </Field>
                  </div>
                )}

                {/* STEP 2: Academic Details */}
                {step === 2 && (
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
                )}

                {/* STEP 3: Experience & Motivation */}
                {step === 3 && (
                  <div>
                    <div className="mb-4 rounded-[24px] border border-white/10 bg-white/[0.02] p-4 md:p-5">
                      <label className={`${conthrax} block text-[9px] md:text-[10px] text-cyan-400/60 uppercase tracking-[0.2em] mb-3`}>
                        Technical Strengths
                      </label>
                      <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3">
                        {technicalSkillOptions.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill("technical_skills", skill)}
                            className={`px-3 py-2 rounded-xl text-[10px] md:text-[11px] border transition-all duration-300 cursor-pointer ${
                              form.technical_skills.includes(skill)
                                ? "bg-cyan-500/10 border-cyan-400/70 text-cyan-300 shadow-[0_0_18px_rgba(0,247,255,0.08)]"
                                : "bg-white/[0.025] border-white/10 text-white/50 hover:border-cyan-500/35 hover:text-white/80 hover:bg-white/[0.04]"
                            }`}
                          >
                            {form.technical_skills.includes(skill) && <Check size={10} className="inline mr-0.5 md:mr-1" />}
                            {skill}
                          </button>
                        ))}
                        {form.technical_skills.filter((skill) => !technicalSkillOptions.includes(skill)).map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill("technical_skills", skill)}
                            className="px-3 py-2 rounded-xl text-[10px] md:text-[11px] border bg-cyan-500/10 border-cyan-400/70 text-cyan-300 transition-all cursor-pointer"
                          >
                            <Check size={10} className="inline mr-0.5 md:mr-1" />
                            {skill}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customTechnicalSkill}
                          onChange={(e) => setCustomTechnicalSkill(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomSkill("technical_skills", customTechnicalSkill, () => setCustomTechnicalSkill(""));
                            }
                          }}
                          placeholder="Add a custom technical skill..."
                          className={inputCls}
                        />
                        <button
                          type="button"
                          onClick={() => addCustomSkill("technical_skills", customTechnicalSkill, () => setCustomTechnicalSkill(""))}
                          disabled={!customTechnicalSkill.trim()}
                          className="px-4 rounded-[18px] border border-cyan-400/50 text-cyan-300 text-[11px] hover:bg-cyan-400 hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          aria-label="Add custom technical skill"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="mb-4 rounded-[24px] border border-white/10 bg-white/[0.02] p-4 md:p-5">
                      <label className={`${conthrax} block text-[9px] md:text-[10px] text-cyan-400/60 uppercase tracking-[0.2em] mb-3`}>
                        Non-Technical Strengths
                      </label>
                      <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3">
                        {nonTechnicalSkillOptions.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill("non_technical_skills", skill)}
                            className={`px-3 py-2 rounded-xl text-[10px] md:text-[11px] border transition-all duration-300 cursor-pointer ${
                              form.non_technical_skills.includes(skill)
                                ? "bg-cyan-500/10 border-cyan-400/70 text-cyan-300 shadow-[0_0_18px_rgba(0,247,255,0.08)]"
                                : "bg-white/[0.025] border-white/10 text-white/50 hover:border-cyan-500/35 hover:text-white/80 hover:bg-white/[0.04]"
                            }`}
                          >
                            {form.non_technical_skills.includes(skill) && <Check size={10} className="inline mr-0.5 md:mr-1" />}
                            {skill}
                          </button>
                        ))}
                        {form.non_technical_skills.filter((skill) => !nonTechnicalSkillOptions.includes(skill)).map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill("non_technical_skills", skill)}
                            className="px-3 py-2 rounded-xl text-[10px] md:text-[11px] border bg-cyan-500/10 border-cyan-400/70 text-cyan-300 transition-all cursor-pointer"
                          >
                            <Check size={10} className="inline mr-0.5 md:mr-1" />
                            {skill}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customNonTechnicalSkill}
                          onChange={(e) => setCustomNonTechnicalSkill(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomSkill("non_technical_skills", customNonTechnicalSkill, () => setCustomNonTechnicalSkill(""));
                            }
                          }}
                          placeholder="Add a custom non-technical skill..."
                          className={inputCls}
                        />
                        <button
                          type="button"
                          onClick={() => addCustomSkill("non_technical_skills", customNonTechnicalSkill, () => setCustomNonTechnicalSkill(""))}
                          disabled={!customNonTechnicalSkill.trim()}
                          className="px-4 rounded-[18px] border border-cyan-400/50 text-cyan-300 text-[11px] hover:bg-cyan-400 hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          aria-label="Add custom non-technical skill"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className={`${conthrax} block text-[10px] text-white/45 uppercase tracking-[0.22em] mb-2`}>Previous Experience <span className="text-white/20 normal-case tracking-normal font-normal">(optional)</span></label>
                      <textarea value={form.experience} onChange={(e) => update("experience", e.target.value)} placeholder="Share any previous experience that is relevant to the branch or office you want to join..." className={`${inputCls} min-h-[120px] resize-y`} />
                    </div>
                    <Field label="Why join K-1000?" error={errors.motivation}>
                      <textarea value={form.motivation} onChange={(e) => update("motivation", e.target.value)} placeholder="Tell us about your motivation, goals, and how K-1000 fits into your journey..." className={`${inputCls} min-h-[120px] resize-y`} />
                    </Field>
                  </div>
                )}

                {/* STEP 4: Choose Your Domain */}
                {step === 4 && (
                  <div>
                    <p className="text-xs md:text-sm text-white/50 mb-4 md:mb-6 leading-relaxed">Select your preferred domain (select up to 3). Tap any branch or office to hear a message from its leadership.</p>
                    <h5 className={`${conthrax} text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-cyan-400/60 mb-3`}>Branches</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mb-6">
                      {branchDomains.map((d) => {
                        const key = d.key as string;
                        const label = getDomainLabel(key);
                        const selected = (form.domain_choice ? form.domain_choice.split(",") : []).includes(key);
                        return (
                          <button key={key} type="button" onClick={() => toggleDomainChoice(key, label)}
                            className={`text-left px-4 py-4 rounded-[20px] border text-xs md:text-sm transition-all duration-300 cursor-pointer ${
                              selected ? "bg-cyan-500/10 border-cyan-400/70 text-cyan-300 shadow-[0_0_18px_rgba(0,247,255,0.1)]" : "bg-white/[0.025] border-white/10 text-white/60 hover:border-cyan-500/35 hover:text-white/85 hover:bg-white/[0.04]"
                            }`}>
                            <div className={`${conthrax} text-[8px] md:text-[9px] tracking-wider mb-1 ${selected ? "text-cyan-400" : "text-white/30"}`}>BRANCH</div>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <h5 className={`${conthrax} text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-cyan-400/60 mb-3`}>Offices</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                      {officeChoices.map((o) => {
                        const selected = (form.domain_choice ? form.domain_choice.split(",") : []).includes(o.id);
                        return (
                          <button key={o.id} type="button" onClick={() => toggleDomainChoice(o.id, o.title)}
                            className={`text-left px-4 py-4 rounded-[20px] border text-xs md:text-sm transition-all duration-300 cursor-pointer ${
                              selected ? "bg-cyan-500/10 border-cyan-400/70 text-cyan-300 shadow-[0_0_18px_rgba(0,247,255,0.1)]" : "bg-white/[0.025] border-white/10 text-white/60 hover:border-cyan-500/35 hover:text-white/85 hover:bg-white/[0.04]"
                            }`}>
                            <div className={`${conthrax} text-[8px] md:text-[9px] tracking-wider mb-1 ${selected ? "text-cyan-400" : "text-white/30"}`}>OFFICE</div>
                            {o.title}
                          </button>
                        );
                      })}
                    </div>
                    {errors.domain_choice && <p className="text-red-400 text-xs mt-3">{errors.domain_choice}</p>}
                  </div>
                )}

                {/* STEP 5: Review & Submit */}
                {step === 5 && (
                  <div>
                    <Field label="How did you hear about K-1000?" required={false}>
                      <CustomSelect
                        value={form.referral_source}
                        options={referralOptions.map((source) => ({ value: source, label: source }))}
                        placeholder="Select source (optional)"
                        ariaLabel="Referral source"
                        inlineMenu
                        onChange={(value) => update("referral_source", value)}
                      />
                    </Field>
                    <div className="mt-6 p-5 md:p-6 rounded-[24px] bg-cyan-500/[0.018] border border-cyan-500/10">
                      <h5 className={`${conthrax} text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-cyan-400/60 mb-3`}>Application Summary</h5>
                      <div className="grid grid-cols-2 gap-2 text-[11px] md:text-xs text-white/50">
                        <span className="text-white/30">Name:</span><span className="text-white/70">{form.full_name || "—"}</span>
                        <span className="text-white/30">Email:</span><span className="text-white/70">{form.kiit_email || "—"}</span>
                        <span className="text-white/30">Branches / Offices:</span>
                        <span className="text-white/70 capitalize">{form.domain_choice ? form.domain_choice.split(",").map(getDomainLabel).join(", ") : "—"}</span>
                        <span className="text-white/30">Technical Skills:</span>
                        <span className="text-white/70">{form.technical_skills.length ? form.technical_skills.join(", ") : "—"}</span>
                        <span className="text-white/30">Non-Technical Skills:</span>
                        <span className="text-white/70">{form.non_technical_skills.length ? form.non_technical_skills.join(", ") : "—"}</span>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            {/* ─── NAVIGATION ─── */}
            <div className="flex justify-between items-center mt-6 md:mt-8 pt-5 md:pt-6 border-t border-white/10">
              <div>
                {step > 1 ? (
                  <button type="button" onClick={prev}
                    className={`${conthrax} flex items-center gap-1.5 px-4 md:px-6 py-2.5 md:py-3 rounded-full border border-white/10 text-white/40 text-[9px] md:text-[10px] tracking-[0.3em] uppercase hover:border-white/30 hover:text-white/70 transition-all cursor-pointer`}>
                    <ChevronLeft size={12} /> Back
                  </button>
                ) : (
                  <button type="button" onClick={resetForm}
                    className={`${conthrax} flex items-center gap-1.5 px-4 md:px-6 py-2.5 md:py-3 rounded-full border border-white/10 text-white/40 text-[9px] md:text-[10px] tracking-[0.3em] uppercase hover:border-white/30 hover:text-white/70 transition-all cursor-pointer`}>
                    <RotateCcw size={12} /> Reset
                  </button>
                )}
              </div>
              <div>
                {step < 5 ? (
                  <button
                    key="next-step"
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      next();
                    }}
                    className={`${conthrax} flex items-center gap-1.5 px-5 md:px-8 py-2.5 md:py-3 rounded-full border border-cyan-400 text-cyan-400 text-[9px] md:text-[10px] tracking-[0.3em] uppercase hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_20px_rgba(0,247,255,0.1)] cursor-pointer disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/20 disabled:shadow-none`}
                  >
                    Next <ChevronRight size={12} />
                  </button>
                ) : (
                  <button key="submit-registration" type="submit" disabled={submitting}
                    className={`${conthrax} flex items-center gap-1.5 px-5 md:px-8 py-2.5 md:py-3 rounded-full border border-cyan-400 text-cyan-400 text-[9px] md:text-[10px] tracking-[0.3em] uppercase hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_20px_rgba(0,247,255,0.1)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer`}>
                    {submitting ? "Submitting..." : <><Send size={12} /> Submit</>}
                  </button>
                )}
              </div>
            </div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* ─── FLASH MESSAGE ─── */}
      <AnimatePresence>
        {flashMsg && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 p-3 md:pointer-events-none md:bg-transparent md:p-6"
          >
            <div className="pointer-events-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-[24px] border border-cyan-400/30 bg-black/95 shadow-[0_0_40px_rgba(0,247,255,0.15)] backdrop-blur-xl md:max-h-[75vh]">
              <div
                data-lenis-prevent
                onWheel={(event) => event.stopPropagation()}
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 [scrollbar-color:rgba(0,247,255,0.35)_rgba(255,255,255,0.04)] [scrollbar-width:thin] md:p-5"
              >
                <div className="flex items-start gap-3">
                  <Quote size={21} className="mt-0.5 shrink-0 text-cyan-400/40 md:h-6 md:w-6" />
                  <div className="min-w-0">
                    <p className="break-words text-sm leading-relaxed text-white/70 italic md:text-lg">{flashMsg}</p>
                    <p className={`${conthrax} mt-3 break-words text-[9px] uppercase leading-relaxed tracking-wider text-cyan-400/60 md:text-xs`}>&mdash; {flashLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

function AlreadyRegistered({ receipt }: { receipt: RegistrationReceipt }) {
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
          className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-cyan-400/25 bg-black/65 p-6 text-center shadow-[0_0_70px_rgba(0,247,255,0.1)] backdrop-blur-2xl md:p-10"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] border border-cyan-400/35 bg-cyan-400/10 text-cyan-300">
            <Check size={24} />
          </div>
          <p className={`${orbitron} mt-6 text-[8px] uppercase tracking-[0.35em] text-cyan-300/55`}>
            Registration receipt found
          </p>
          <h1 className={`${conthrax} mt-3 text-xl uppercase text-white md:text-3xl`}>
            Already Registered
          </h1>
          <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-white/50 md:text-sm">
            This browser already contains a successful K-1000 registration receipt.
          </p>
          <div className="mt-7 rounded-[20px] border border-white/10 bg-white/[0.025] p-4 text-left">
            <div className="grid grid-cols-[90px_1fr] gap-2 text-[10px] md:grid-cols-[120px_1fr] md:text-xs">
              <span className="text-white/30">KIIT account</span>
              <span className="break-all text-white/70">{receipt.email}</span>
              <span className="text-white/30">Signal ID</span>
              <span className="text-cyan-300">{receipt.id ? `#${receipt.id}` : "Recorded"}</span>
              <span className="text-white/30">Submitted</span>
              <span className="text-white/70">{formattedDate}</span>
            </div>
          </div>
          <Link
            href="/"
            className={`${conthrax} mt-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/50 px-6 py-3 text-[9px] uppercase tracking-[0.2em] text-cyan-300 transition-all hover:bg-cyan-400 hover:text-black`}
          >
            Return Home <ChevronRight size={13} />
          </Link>
          <p className={`${conthrax} mt-7 text-[7px] uppercase tracking-[0.35em] text-cyan-400/35`}>
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
          <span className="text-cyan-400">*</span>
        ) : (
          <span className="text-white/25 normal-case tracking-normal">(optional)</span>
        )}
      </label>
      {children}
      {helper && !error && <p className="mt-1.5 text-[10px] leading-relaxed text-cyan-200/45 md:text-[11px]">{helper}</p>}
      {error && <p className="text-red-400 text-[10px] md:text-[11px] mt-1">{error}</p>}
    </div>
  );
}
