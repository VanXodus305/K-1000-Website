"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Send, RotateCcw, Plus, ChevronRight, ChevronLeft, Quote } from "lucide-react";
import SharedHeader from "../../components/ui/SharedHeader";
import Footer from "../../components/footer/Footer";
import CubeBackground from "../../components/ui/CubeBackground";
import { domains } from "../../data/domain";

const conthrax = "font-['Conthrax',_sans-serif]";
const orbitron = "font-['Orbitron',_sans-serif]";

const academicYears = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const referralOptions = [
  "Social Media (Instagram/LinkedIn)", "Friend or Senior", "Faculty Member",
  "College Notice Board", "KIIT Website", "WhatsApp Group", "Campus Event", "Other",
];

const skillOptions = [
  "Python", "JavaScript", "Java", "C++", "Go", "React", "AI/ML",
  "Data Science", "UI/UX", "DevOps", "Blockchain", "IoT", "Cloud",
  "Cybersecurity", "Mobile Dev",
];

const allDomains = [...domains, { key: "finance" as const, title: "Finance & Entrepreneurship" }];

const branchMessages: Record<string, string> = {
  events: `"We look for individuals who plan with precision, execute with passion, and bring every event to life for the K-1000 community."`,
  higher: `"We are here to guide you through every step with mentorship, workshops, and a supportive community. If you're curious, eager to learn, and ready to grow, we'd love to have you with us. We look forward to welcoming you to the Higher Study Domain!"`,
  research: `"Welcome to the Research & Publications Wing of Team K-1000! Research is a journey of asking meaningful questions, embracing challenges, and growing through collaboration. We encourage you to approach this recruitment process with honesty and confidence. There are no perfect answers, only opportunities to demonstrate how you think."`,
  projects: `"At Project Wing, we build ideas into real-world projects. If you have a basic foundation in your domain and are passionate about building, we'd love to have you on board. We're also looking for AI/ML and Data Analytics Mentors with strong domain knowledge to guide our teams. Ready to build? Join Project Wing!"`,
  training: `"Every expert starts as a beginner. Whether you're new to a domain or looking to sharpen your skills, the K-1000 Training Program welcomes curious minds ready to learn, build, and grow. Join us and take the next step in your learning journey."`,
};

const officeMessages: Record<string, string> = {
  relations: `"We look for individuals who communicate with purpose, build relationships with intent, bring in the support that powers every event, and represent K-1000 with pride in every room they walk into."`,
  creative: `"The Office of Creativity & Design seeks individuals who lead with creativity, design with purpose, and leave a lasting visual impact across the KIIT community."`,
};

const designations: Record<string, string> = {
  events: "~Director & Deputy Director | Event Management",
  higher: "~Deputy Director | Higher Studies",
  research: "~Director & Deputy Director | Research & Publications Wing",
  projects: "~Director & Deputy Director | Project Wing",
  training: "~Deputy Director | Training Program",
  relations: "~Director | OPCR",
  creative: "~Deputy Director, OCD",
};

const offices = [
  { id: "relations", title: "Office of Public & Corporate Relations", message: "We bridge K-1000 with the external world — building relationships with industry partners, managing public communications, and creating opportunities for students to engage with leading organizations." },
  { id: "creative", title: "Office of Creativity & Design", message: "Creativity is at the heart of innovation. We shape K-1000's visual identity, build compelling narratives, and ensure our brand reflects the caliber of our research community." },
  { id: "comms", title: "Office of Communications & Content", message: "Every great research program has a great story. We amplify K-1000's impact through strategic storytelling, social media, and content that inspires the next generation of innovators." },
];

const steps = [
  { id: 1, label: "Personal", title: "Personal Information" },
  { id: 2, label: "Academic", title: "Academic Details" },
  { id: 3, label: "Skills", title: "Skills & Experience" },
  { id: 4, label: "Domain", title: "Choose Your Domain" },
  { id: 5, label: "Review", title: "Referral & Submit" },
];

type FormData = {
  full_name: string; email: string; phone: string; kiit_email: string;
  gender: string; roll_number: string;
  academic_year: string; course: string; branch: string;
  domain_choice: string; motivation: string; experience: string;
  skills: string[]; referral_source: string;
};

const initialForm: FormData = {
  full_name: "", email: "", phone: "", kiit_email: "", gender: "",
  roll_number: "", academic_year: "", course: "",
  branch: "", domain_choice: "", motivation: "", experience: "",
  skills: [], referral_source: "",
};

const inputCls = "w-full bg-black/40 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-400 focus:shadow-[0_0_0_3px_rgba(0,247,255,0.1)] transition-all";
const selectCls = "w-full bg-black/40 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm text-white outline-none focus:border-cyan-400 focus:shadow-[0_0_0_3px_rgba(0,247,255,0.1)] transition-all appearance-none cursor-pointer";

function getDomainLabel(key: string) {
  if (key === "events") return "Event Management";
  if (key === "finance") return "Finance & Entrepreneurship";
  return domains.find(d => d.key === key)?.title ?? key;
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
  const [toast, setToast] = useState<{ type: string; text: string } | null>(null);
  const [customSkill, setCustomSkill] = useState("");
  const [flashMsg, setFlashMsg] = useState<string | null>(null);
  const [flashLabel, setFlashLabel] = useState("");
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, [step]);
  useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);

  const update = (field: keyof FormData, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    setToast(null);
  };

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
    }));
  };

  const addCustomSkill = () => {
    const s = customSkill.trim();
    if (s && !form.skills.includes(s)) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, s] }));
    }
    setCustomSkill("");
  };

  const showFlash = (key: string, label: string) => {
    const msg = getDomainMsg(key) || officeMessages[key] || offices.find(o => o.id === key)?.message || "";
    if (!msg) return;
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setFlashLabel(designations[key] || label);
    setFlashMsg(msg);
    flashTimer.current = setTimeout(() => setFlashMsg(null), 12000);
  };

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!form.full_name.trim() || form.full_name.trim().length < 3) errs.full_name = "Full name must be at least 3 characters";
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email address";
      if (!form.phone.trim() || !/^\+?[1-9]\d{9,14}$/.test(form.phone)) errs.phone = "Invalid phone number (10-15 digits)";
      if (!form.kiit_email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.kiit_email)) errs.kiit_email = "Invalid email address";
      else if (!form.kiit_email.toLowerCase().endsWith("@kiit.ac.in") && !form.kiit_email.toLowerCase().endsWith("@kgpian.ac.in")) errs.kiit_email = "Must be a @kiit.ac.in email";
      if (!form.gender) errs.gender = "Select your gender";
    } else if (step === 2) {
      if (!form.roll_number.trim() || !/^\d{6,10}$/.test(form.roll_number.trim())) errs.roll_number = "Invalid roll number (6-10 digits)";
      if (!form.academic_year) errs.academic_year = "Select your academic year";
      if (!form.course.trim() || form.course.trim().length < 2) errs.course = "Enter your course name";
      if (!form.branch.trim() || form.branch.trim().length < 2) errs.branch = "Enter your branch/specialization";
    } else if (step === 3) {
      if (!form.motivation.trim() || form.motivation.trim().length < 20) errs.motivation = "Motivation must be at least 20 characters";
    } else if (step === 4) {
      if (!form.domain_choice) errs.domain_choice = "Select a domain";
    } else if (step === 5) {
      if (!form.referral_source) errs.referral_source = "Select how you heard about K-1000";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (validateStep()) { setStep(s => Math.min(s + 1, 5)); } };
  const prev = () => { setStep(s => Math.max(s - 1, 1)); setErrors({}); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) { setToast({ type: "error", text: "Please fix the highlighted errors." }); return; }
    setSubmitting(true);
    setToast(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/registration`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (result.success) { setSubmitted(true); setToast({ type: "success", text: "Registration submitted successfully!" }); setForm(initialForm); setStep(1); setTimeout(() => setSubmitted(false), 5000); }
      else if (result.errors) { const fe: Record<string, string> = {}; result.errors.forEach((e: { field: string; message: string }) => { fe[e.field] = e.message; }); setErrors(fe); setToast({ type: "error", text: "Please fix the highlighted errors." }); }
      else { setToast({ type: "error", text: result.message || "Submission failed." }); }
    } catch { setToast({ type: "error", text: "Cannot reach server. Ensure the backend is running on port 8080." }); }
    finally { setSubmitting(false); }
  };

  const resetForm = () => { setForm(initialForm); setErrors({}); setToast(null); setStep(1); };

  return (
    <div className="relative w-full min-h-screen bg-black text-white selection:bg-cyan-500/30 flex flex-col overflow-x-hidden">
      <SharedHeader />
      <CubeBackground disableLinesOnMobile />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,#0ea5e90a_0%,transparent_70%)] pointer-events-none z-[2]" />

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
            <p className="text-white/60 text-xs md:text-sm leading-relaxed">Your registration has been submitted successfully. The team will reach out via email.</p>
            <button onClick={() => setSubmitted(false)}
              className={`${conthrax} mt-5 md:mt-6 px-6 md:px-8 py-2.5 md:py-3 border border-cyan-400 text-cyan-400 rounded-full text-[9px] md:text-[10px] tracking-[0.3em] uppercase hover:bg-cyan-400 hover:text-black transition-all cursor-pointer`}>Close</button>
          </div>
        </motion.div>
      )}

      <section className="relative z-10 pt-24 md:pt-32 pb-4 md:pb-6 text-center px-4">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={`${conthrax} text-xl sm:text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight`}>
          Recruitment <br className="md:hidden" />
          <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(0,247,255,0.4)]">Registration</span>
        </motion.h1>
      </section>

      {/* ─── STEP INDICATOR ─── */}
      <div className="relative z-10 max-w-2xl mx-auto w-full px-4 mb-6 md:mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold transition-all duration-300 ${
                  step === s.id ? "bg-cyan-400 text-black shadow-[0_0_12px_rgba(0,247,255,0.4)]" :
                  step > s.id ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/50" :
                  "bg-white/[0.03] text-white/30 border border-white/10"
                }`}>{step > s.id ? <Check size={14} /> : s.id}</div>
                <span className={`mt-1.5 text-[7px] md:text-[9px] uppercase tracking-wider hidden md:block ${
                  step === s.id ? "text-cyan-400" : "text-white/30"
                }`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px flex-1 mx-2 md:mx-3 ${
                  step > s.id ? "bg-cyan-400/50" : "bg-white/10"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── FORM ─── */}
      <div className="relative z-10 max-w-2xl mx-auto w-full px-4 pb-16 md:pb-20">
        <div className="p-4 md:p-8 rounded-[24px] md:rounded-[32px] bg-white/[0.03] backdrop-blur-xl border border-white/10 transition-all duration-500">
          <h2 className={`${conthrax} text-[10px] md:text-sm tracking-[0.25em] uppercase text-white/30 mb-5 md:mb-6`}>Step {step} &mdash; {steps[step - 1].title}</h2>
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

                {/* STEP 1: Personal Information */}
                {step === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <Field label="Full Name" error={errors.full_name}><input type="text" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="e.g. John Doe" className={inputCls} /></Field>
                    <Field label="Gender" error={errors.gender}><select value={form.gender} onChange={(e) => update("gender", e.target.value)} className={selectCls}><option value="" className="bg-black">Select gender</option>{genderOptions.map((o) => <option key={o.value} value={o.value} className="bg-black">{o.label}</option>)}</select></Field>
                    <Field label="Phone" error={errors.phone}><input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 9876543210" className={inputCls} /></Field>
                    <Field label="Email" error={errors.email}><input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="john@example.com" className={inputCls} /></Field>
                    <Field label="KIIT Email" error={errors.kiit_email}><input type="email" value={form.kiit_email} onChange={(e) => update("kiit_email", e.target.value)} placeholder="john@kiit.ac.in" className={inputCls} /></Field>
                  </div>
                )}

                {/* STEP 2: Academic Details */}
                {step === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <Field label="Roll Number" error={errors.roll_number}><input type="text" value={form.roll_number} onChange={(e) => update("roll_number", e.target.value)} placeholder="e.g. 21051234" className={inputCls} /></Field>
                    <Field label="Academic Year" error={errors.academic_year}><select value={form.academic_year} onChange={(e) => update("academic_year", e.target.value)} className={selectCls}><option value="" className="bg-black">Select year</option>{academicYears.map((y) => <option key={y} value={y} className="bg-black">{y}</option>)}</select></Field>
                    <Field label="Course" error={errors.course}><input type="text" value={form.course} onChange={(e) => update("course", e.target.value)} placeholder="e.g. B.Tech CSE" className={inputCls} /></Field>
                    <Field label="Branch / Specialization" error={errors.branch}><input type="text" value={form.branch} onChange={(e) => update("branch", e.target.value)} placeholder="e.g. CSE, ECE" className={inputCls} /></Field>
                  </div>
                )}

                {/* STEP 3: Skills & Experience */}
                {step === 3 && (
                  <div>
                    <div className="mb-4">
                      <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-3">Skills / Areas</label>
                      <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3">
                        {skillOptions.map((skill) => (
                          <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                            className={`px-2.5 md:px-3 py-1.5 rounded-lg text-[10px] md:text-[11px] border transition-all cursor-pointer ${
                              form.skills.includes(skill) ? "bg-cyan-500/10 border-cyan-400 text-cyan-400" : "bg-white/[0.03] border-white/10 text-white/50 hover:border-cyan-500/30 hover:text-white/70"
                            }`}>
                            {form.skills.includes(skill) && <Check size={10} className="inline mr-0.5 md:mr-1" />}{skill}
                          </button>
                        ))}
                        {form.skills.filter((s) => !skillOptions.includes(s)).map((skill) => (
                          <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                            className="px-2.5 md:px-3 py-1.5 rounded-lg text-[10px] md:text-[11px] border bg-cyan-500/10 border-cyan-400 text-cyan-400 transition-all cursor-pointer">
                            <Check size={10} className="inline mr-0.5 md:mr-1" />{skill}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input type="text" value={customSkill} onChange={(e) => setCustomSkill(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSkill(); } }}
                          placeholder="Add a custom skill..." className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-400 transition-all" />
                        <button type="button" onClick={addCustomSkill} disabled={!customSkill.trim()}
                          className="px-3 md:px-4 py-2 md:py-2.5 rounded-xl border border-cyan-400/50 text-cyan-400 text-[11px] hover:bg-cyan-400 hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2">Previous Experience <span className="text-white/20 normal-case tracking-normal font-normal">(optional)</span></label>
                      <textarea value={form.experience} onChange={(e) => update("experience", e.target.value)} placeholder="Describe any prior research, projects, internships, publications..." className="w-full bg-black/40 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-400 focus:shadow-[0_0_0_3px rgba(0,247,255,0.1)] transition-all min-h-[70px] md:min-h-[80px] resize-y" />
                    </div>
                    <Field label="Why join K-1000?" error={errors.motivation}>
                      <textarea value={form.motivation} onChange={(e) => update("motivation", e.target.value)} placeholder="Tell us about your motivation, goals, and how K-1000 fits into your journey..." className="w-full bg-black/40 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-400 focus:shadow-[0_0_0_3px rgba(0,247,255,0.1)] transition-all min-h-[90px] md:min-h-[100px] resize-y" />
                    </Field>
                  </div>
                )}

                {/* STEP 4: Choose Your Domain */}
                {step === 4 && (
                  <div>
                    <p className="text-xs md:text-sm text-white/50 mb-4 md:mb-6 leading-relaxed">Select your preferred domain. Tap any branch or office to hear a message from its leadership.</p>
                    <h5 className={`${conthrax} text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-cyan-400/60 mb-3`}>Branches</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mb-6">
                      {allDomains.map((d) => {
                        const key = d.key as string;
                        const label = getDomainLabel(key);
                        const selected = form.domain_choice === key;
                        return (
                          <button key={key} type="button" onClick={() => { update("domain_choice", key); showFlash(key, label); }}
                            className={`text-left px-3 md:px-4 py-3 md:py-3.5 rounded-xl border text-xs md:text-sm transition-all duration-200 cursor-pointer ${
                              selected ? "bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(0,247,255,0.1)]" : "bg-white/[0.03] border-white/10 text-white/60 hover:border-cyan-500/30 hover:text-white/80"
                            }`}>
                            <div className={`${conthrax} text-[8px] md:text-[9px] tracking-wider mb-1 ${selected ? "text-cyan-400" : "text-white/30"}`}>BRANCH</div>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <h5 className={`${conthrax} text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-cyan-400/60 mb-3`}>Offices</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                      {offices.map((o) => (
                        <button key={o.id} type="button" onClick={() => { update("domain_choice", o.id); showFlash(o.id, o.title); }}
                          className={`text-left px-3 md:px-4 py-3 md:py-3.5 rounded-xl border text-xs md:text-sm transition-all duration-200 cursor-pointer ${
                            form.domain_choice === o.id ? "bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(0,247,255,0.1)]" : "bg-white/[0.03] border-white/10 text-white/60 hover:border-cyan-500/30 hover:text-white/80"
                          }`}>
                          <div className={`${conthrax} text-[8px] md:text-[9px] tracking-wider mb-1 text-white/30`}>OFFICE</div>
                          {o.title}
                        </button>
                      ))}
                    </div>
                    {errors.domain_choice && <p className="text-red-400 text-xs mt-3">{errors.domain_choice}</p>}
                  </div>
                )}

                {/* STEP 5: Referral & Submit */}
                {step === 5 && (
                  <div>
                    <Field label="How did you hear about K-1000?" error={errors.referral_source}>
                      <select value={form.referral_source} onChange={(e) => update("referral_source", e.target.value)} className={selectCls}><option value="" className="bg-black">Select source</option>{referralOptions.map((o) => <option key={o} value={o} className="bg-black">{o}</option>)}</select>
                    </Field>
                    <div className="mt-6 p-4 md:p-5 rounded-xl bg-white/[0.02] border border-white/10">
                      <h5 className={`${conthrax} text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-cyan-400/60 mb-3`}>Application Summary</h5>
                      <div className="grid grid-cols-2 gap-2 text-[11px] md:text-xs text-white/50">
                        <span className="text-white/30">Name:</span><span className="text-white/70">{form.full_name || "—"}</span>
                        <span className="text-white/30">Roll:</span><span className="text-white/70">{form.roll_number || "—"}</span>
                        <span className="text-white/30">Domain:</span><span className="text-white/70">{form.domain_choice ? getDomainLabel(form.domain_choice) : "—"}</span>
                        <span className="text-white/30">Skills:</span><span className="text-white/70">{form.skills.length || "—"}</span>
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
                  <button type="button" onClick={next}
                    className={`${conthrax} flex items-center gap-1.5 px-5 md:px-8 py-2.5 md:py-3 rounded-full border border-cyan-400 text-cyan-400 text-[9px] md:text-[10px] tracking-[0.3em] uppercase hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_20px_rgba(0,247,255,0.1)] cursor-pointer`}>
                    Next <ChevronRight size={12} />
                  </button>
                ) : (
                  <button type="submit" disabled={submitting}
                    className={`${conthrax} flex items-center gap-1.5 px-5 md:px-8 py-2.5 md:py-3 rounded-full border border-cyan-400 text-cyan-400 text-[9px] md:text-[10px] tracking-[0.3em] uppercase hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_20px_rgba(0,247,255,0.1)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer`}>
                    {submitting ? "Submitting..." : <><Send size={12} /> Submit</>}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ─── FLASH MESSAGE ─── */}
      <AnimatePresence>
        {flashMsg && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[calc(100vw-32px)] max-w-lg"
          >
            <div className="relative p-4 md:p-5 rounded-2xl bg-black/90 backdrop-blur-xl border border-cyan-400/30 shadow-[0_0_40px_rgba(0,247,255,0.15)]">
              <button onClick={() => { if (flashTimer.current) clearTimeout(flashTimer.current); setFlashMsg(null); }}
                className="absolute top-2 right-2 text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
              <div className="flex gap-3">
                <Quote size={24} className="text-cyan-400/40 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-base md:text-lg text-white/70 leading-relaxed italic">{flashMsg}</p>
                  <p className={`${conthrax} text-xs md:text-sm text-cyan-400/60 mt-2 uppercase tracking-wider`}>&mdash; {flashLabel}</p>
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

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 md:mb-4">
      <label className="block text-[10px] md:text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5 md:mb-2">{label} <span className="text-cyan-400">*</span></label>
      {children}
      {error && <p className="text-red-400 text-[10px] md:text-[11px] mt-1">{error}</p>}
    </div>
  );
}
