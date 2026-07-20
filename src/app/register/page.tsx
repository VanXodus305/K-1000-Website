"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Check, Send, RotateCcw } from "lucide-react";
import SharedHeader from "../../components/ui/SharedHeader";
import Footer from "../../components/footer/Footer";
import CubeBackground from "../../components/ui/CubeBackground";
import { domains } from "../../data/domain";
import { leadership } from "../../data/leadership";

const conthrax = "font-['Conthrax',_sans-serif]";
const orbitron = "font-['Orbitron',_sans-serif]";

const departments = [
  "Computer Science & Engineering", "Information Technology",
  "Electronics & Communication", "Electrical Engineering",
  "Mechanical Engineering", "Civil Engineering", "Biotechnology",
  "Chemical Engineering", "Mathematics", "Physics", "Chemistry",
  "Economics", "Management", "Law", "Film & Media", "Sports Science", "Other",
];

const academicYears = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];

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
  "Cybersecurity", "Mobile Dev", "Robotics",
];

const branchMapping: Record<string, string> = {
  internship: "academicinternshipandplacementguidance",
  eventorganization: "eventorganization",
  researchandpublications: "researchandpublications",
  projectwing: "projectwing",
  trainingprogram: "trainingprogram",
  higherstudies: "higherstudies",
};

const cleanString = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/management/g, "organization").replace(/\s+/g, "").trim();

const offices = [
  {
    id: "strategy",
    title: "Office of Strategy & Growth",
    leader: {
      name: "Priyansh Srivastava",
      position: "Chief Strategy Officer",
      image: "https://res.cloudinary.com/vanxodus305/image/upload/w_1024,ar_1:1,c_auto,g_auto/v1754423646/K-1000/Priyansh_Srivastava_bkigit.jpg",
    },
    deputy: {
      name: "Tvisha Tiwary",
      position: "Deputy Chief Strategy Officer",
      image: "https://res.cloudinary.com/vanxodus305/image/upload/w_1024,ar_1:1,c_auto,g_auto/v1754423648/K-1000/Tvisha_Tiwary_txlog0.jpg",
    },
    message: "We chart the long-term vision for K-1000 — identifying emerging opportunities, forging institutional partnerships, and ensuring every initiative aligns with our mission of research excellence.",
  },
  {
    id: "tech",
    title: "Office of Technology & Innovation",
    leader: {
      name: "Prasun Payne",
      position: "Chief Technical Officer",
      image: "https://res.cloudinary.com/vanxodus305/image/upload/w_1024,ar_1:1,c_auto,g_auto/v1754423645/K-1000/Prasun_Payne_h62i5j.jpg",
    },
    deputy: {
      name: "Ishika Jaiswal",
      position: "Deputy Chief Technical Officer",
      image: "https://res.cloudinary.com/e-labs-members/image/upload/w_1024,ar_3:4,c_fill,g_face,f_auto/v1741880378/snqcicj3nkzfqur9clsh.jpg",
    },
    message: "We drive the technical backbone of K-1000 — building platforms, managing infrastructure, and empowering every domain with the tools they need to create impact.",
  },
  {
    id: "relations",
    title: "Office of Public & Corporate Relations",
    leader: {
      name: "Owaish Jawed",
      position: "Director",
      image: "https://res.cloudinary.com/vanxodus305/image/upload/w_1024,ar_1:1,c_auto,g_auto/v1754424184/K-1000/1000140444_t1ggli.jpg",
    },
    deputy: null,
    message: "We bridge K-1000 with the external world — building relationships with industry partners, managing public communications, and creating opportunities for students to engage with leading organizations.",
  },
  {
    id: "creative",
    title: "Office of Creativity & Design",
    leader: null,
    deputy: {
      name: "Sourav Basak",
      position: "Deputy Chief Creative Officer",
      image: "https://res.cloudinary.com/vanxodus305/image/upload/w_1024,ar_1:1,c_auto,g_auto,f_auto/v1754856115/K-1000/IMG_0309_rbu35s.jpg",
    },
    message: "Creativity is at the heart of innovation. We shape K-1000's visual identity, build compelling narratives, and ensure our brand reflects the caliber of our research community.",
  },
  {
    id: "comms",
    title: "Office of Communications & Content",
    leader: null,
    deputy: {
      name: "Brhadyuti Bhattacharjee",
      position: "Deputy Chief Communications Officer",
      image: "https://res.cloudinary.com/vanxodus305/image/upload/w_1024,ar_1:1,c_auto,g_auto,f_auto/v1776323181/K-1000/vkss4mxwgs5xvxq5likd.jpg",
    },
    message: "Every great research program has a great story. We amplify K-1000's impact through strategic storytelling, social media, and content that inspires the next generation of innovators.",
  },
];

type FormData = {
  full_name: string; email: string; phone: string; kiit_email: string;
  gender: string; date_of_birth: string; kiit_reg_no: string;
  academic_year: string; department: string; branch: string; cgpa: string;
  domain_choice: string; motivation: string; experience: string;
  skills: string[]; referral_source: string;
};

const initialForm: FormData = {
  full_name: "", email: "", phone: "", kiit_email: "", gender: "",
  date_of_birth: "", kiit_reg_no: "", academic_year: "", department: "",
  branch: "", cgpa: "", domain_choice: "", motivation: "", experience: "",
  skills: [], referral_source: "",
};

export default function RegisterPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [activeOffice, setActiveOffice] = useState(offices[0].id);
  const [activeBranch, setActiveBranch] = useState("training");
  const [hoveredOffice, setHoveredOffice] = useState<string | null>(null);
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);
  const [officePopoverPos, setOfficePopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [branchPopoverPos, setBranchPopoverPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const currentOffice = offices.find((o) => o.id === (hoveredOffice ?? activeOffice)) ?? offices[0];
  const currentDomain = domains.find((d) => d.key === (hoveredBranch ?? activeBranch)) ?? domains[0];

  const { director, deputy } = useMemo(() => {
    const directors = leadership.hierarchy.find((l) => l.level === 3)?.members ?? [];
    const deputies = leadership.hierarchy.find((l) => l.level === 4)?.members ?? [];
    const targetKey = branchMapping[currentDomain.key] || cleanString(currentDomain.title);
    return {
      director: directors.find((m) => cleanString(m.branch) === targetKey),
      deputy: deputies.find((m) => cleanString(m.branch) === targetKey),
    };
  }, [currentDomain]);

  const officeLeaders = [currentOffice.leader, currentOffice.deputy].filter(Boolean);

  const update = (field: keyof FormData, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    setMessage(null);
  };

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
    }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.full_name.trim() || form.full_name.trim().length < 3) errs.full_name = "Full name must be at least 3 characters";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email address";
    if (!form.phone.trim() || !/^\+?[1-9]\d{9,14}$/.test(form.phone)) errs.phone = "Invalid phone number (10-15 digits)";
    if (!form.kiit_email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.kiit_email)) errs.kiit_email = "Invalid email address";
    else if (!form.kiit_email.toLowerCase().endsWith("@kiit.ac.in") && !form.kiit_email.toLowerCase().endsWith("@kgpian.ac.in")) errs.kiit_email = "Must be a @kiit.ac.in email";
    if (!form.gender) errs.gender = "Select your gender";
    if (!form.date_of_birth) errs.date_of_birth = "Select your date of birth";
    if (!form.kiit_reg_no.trim() || !/^\d{6,10}$/.test(form.kiit_reg_no.trim())) errs.kiit_reg_no = "Invalid registration number (6-10 digits)";
    if (!form.academic_year) errs.academic_year = "Select your academic year";
    if (!form.department) errs.department = "Select your department";
    if (!form.branch.trim() || form.branch.trim().length < 2) errs.branch = "Enter your branch/specialization";
    if (!form.cgpa.trim() || isNaN(parseFloat(form.cgpa))) errs.cgpa = "Enter a valid CGPA";
    if (!form.domain_choice) errs.domain_choice = "Select a domain";
    if (!form.motivation.trim() || form.motivation.trim().length < 20) errs.motivation = "Motivation must be at least 20 characters";
    if (!form.referral_source) errs.referral_source = "Select how you heard about K-1000";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { setMessage({ type: "error", text: "Please fix the highlighted errors." }); return; }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/registration`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (result.success) { setSubmitted(true); setMessage({ type: "success", text: "Registration submitted successfully!" }); setForm(initialForm); setTimeout(() => setSubmitted(false), 5000); }
      else if (result.errors) { const fe: Record<string, string> = {}; result.errors.forEach((e: { field: string; message: string }) => { fe[e.field] = e.message; }); setErrors(fe); setMessage({ type: "error", text: "Please fix the highlighted errors." }); }
      else { setMessage({ type: "error", text: result.message || "Submission failed." }); }
    } catch { setMessage({ type: "error", text: "Cannot reach server. Ensure the backend is running on port 8080." }); }
    finally { setSubmitting(false); }
  };

  const resetForm = () => { setForm(initialForm); setErrors({}); setMessage(null); };

  return (
    <div className="relative w-full min-h-screen bg-black text-white selection:bg-cyan-500/30 flex flex-col overflow-x-hidden">
      <SharedHeader />
      <CubeBackground disableLinesOnMobile />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,#0ea5e90a_0%,transparent_70%)] pointer-events-none z-[2]" />

      {message && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl backdrop-blur-xl text-sm text-center max-w-[90vw] ${
            message.type === "success" ? "bg-green-500/10 border border-green-500/30 text-green-300" : "bg-red-500/10 border border-red-500/30 text-red-300"
          }`}>{message.text}</motion.div>
      )}

      {submitted && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="p-10 rounded-[32px] bg-white/[0.03] backdrop-blur-xl border border-cyan-500/30 text-center max-w-md mx-4">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-6"><Check size={32} className="text-cyan-400" /></div>
            <h2 className={`${conthrax} text-xl mb-3 text-cyan-400 uppercase tracking-wider`}>Application Received</h2>
            <p className="text-white/60 text-sm leading-relaxed">Your registration has been submitted successfully. The team will reach out via email.</p>
            <button onClick={() => setSubmitted(false)}
              className={`${conthrax} mt-6 px-8 py-3 border border-cyan-400 text-cyan-400 rounded-full text-[10px] tracking-[0.3em] uppercase hover:bg-cyan-400 hover:text-black transition-all cursor-pointer`}>Close</button>
          </div>
        </motion.div>
      )}

      <section className="relative z-10 pt-28 md:pt-36 pb-8 md:pb-12 text-center px-4">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={`${conthrax} text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight leading-tight`}>
          Recruitment <br className="md:hidden" />
          <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(0,247,255,0.4)]">Registration</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-white/40 text-sm md:text-lg max-w-3xl mx-auto mt-4 leading-relaxed">
          Submit your application to join K-1000, KIIT&apos;s flagship research program.
        </motion.p>
      </section>

      <div className="relative z-10 max-w-[1400px] mx-auto w-full px-4 md:px-8 pb-20 grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6 lg:gap-8 items-start">
        {/* ─── LEFT: OFFICES (hover to reveal message) ─── */}
        <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:sticky lg:top-24" id="offices-sidebar">
          <div className="p-5 md:p-6 rounded-[24px] bg-white/[0.03] backdrop-blur-xl border border-white/10 transition-all duration-500">
            <h3 className={`${conthrax} text-[10px] tracking-[0.25em] uppercase text-white/30 mb-4`}>Offices</h3>
            <div className="flex flex-col gap-1">
              {offices.map((office) => {
                const isActive = activeOffice === office.id;
                return (
                  <div key={office.id}
                    onMouseEnter={(e) => { setHoveredOffice(office.id); const r = e.currentTarget.getBoundingClientRect(); setOfficePopoverPos({ top: r.top, left: r.right + 12 }); }}
                    onMouseLeave={() => setHoveredOffice(null)}
                    onClick={() => setActiveOffice(office.id)}
                  >
                    <button
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all duration-300 cursor-pointer ${
                        isActive && hoveredOffice !== office.id
                          ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
                          : "border border-transparent text-white/50 hover:bg-white/[0.03] hover:border-white/10"
                      }`}
                    >
                      <span className={`${orbitron} text-[8px] tracking-widest text-white/20 mr-2`}>
                        {String(offices.indexOf(office) + 1).padStart(2, "0")}
                      </span>
                      {office.title}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.aside>

        {/* ─── CENTER: FORM ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="p-6 md:p-10 rounded-[32px] bg-white/[0.03] backdrop-blur-xl border border-white/10 transition-all duration-500">
            <h2 className={`${conthrax} text-xs md:text-sm tracking-[0.25em] uppercase text-white/30 mb-8`}>Application Form</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-8">
                <h4 className={`${conthrax} text-[10px] tracking-[0.2em] uppercase text-cyan-400/60 mb-4`}>Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Full Name" error={errors.full_name}><input type="text" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="e.g. John Doe" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-400 focus:shadow-[0_0_0_3px_rgba(0,247,255,0.1)] transition-all" /></Field>
                  <Field label="Gender" error={errors.gender}><select value={form.gender} onChange={(e) => update("gender", e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 focus:shadow-[0_0_0_3px_rgba(0,247,255,0.1)] transition-all appearance-none cursor-pointer"><option value="" className="bg-black">Select gender</option>{genderOptions.map((o) => <option key={o.value} value={o.value} className="bg-black">{o.label}</option>)}</select></Field>
                  <Field label="Date of Birth" error={errors.date_of_birth}><input type="date" value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 focus:shadow-[0_0_0_3px_rgba(0,247,255,0.1)] transition-all" /></Field>
                  <Field label="Phone" error={errors.phone}><input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 9876543210" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-400 focus:shadow-[0_0_0_3px_rgba(0,247,255,0.1)] transition-all" /></Field>
                  <Field label="Email" error={errors.email}><input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="john@example.com" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-400 focus:shadow-[0_0_0_3px_rgba(0,247,255,0.1)] transition-all" /></Field>
                  <Field label="KIIT Email" error={errors.kiit_email}><input type="email" value={form.kiit_email} onChange={(e) => update("kiit_email", e.target.value)} placeholder="john@kiit.ac.in" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-400 focus:shadow-[0_0_0_3px_rgba(0,247,255,0.1)] transition-all" /></Field>
                </div>
              </div>
              <div className="mb-8">
                <h4 className={`${conthrax} text-[10px] tracking-[0.2em] uppercase text-cyan-400/60 mb-4`}>Academic Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="KIIT Reg. No." error={errors.kiit_reg_no}><input type="text" value={form.kiit_reg_no} onChange={(e) => update("kiit_reg_no", e.target.value)} placeholder="e.g. 21051234" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-400 focus:shadow-[0_0_0_3px_rgba(0,247,255,0.1)] transition-all" /></Field>
                  <Field label="Academic Year" error={errors.academic_year}><select value={form.academic_year} onChange={(e) => update("academic_year", e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 focus:shadow-[0_0_0_3px rgba(0,247,255,0.1)] transition-all appearance-none cursor-pointer"><option value="" className="bg-black">Select year</option>{academicYears.map((y) => <option key={y} value={y} className="bg-black">{y}</option>)}</select></Field>
                  <Field label="Department" error={errors.department}><select value={form.department} onChange={(e) => update("department", e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 focus:shadow-[0_0_0_3px rgba(0,247,255,0.1)] transition-all appearance-none cursor-pointer"><option value="" className="bg-black">Select department</option>{departments.map((d) => <option key={d} value={d} className="bg-black">{d}</option>)}</select></Field>
                  <Field label="Branch / Specialization" error={errors.branch}><input type="text" value={form.branch} onChange={(e) => update("branch", e.target.value)} placeholder="e.g. CSE, ECE" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-400 focus:shadow-[0_0_0_3px rgba(0,247,255,0.1)] transition-all" /></Field>
                  <Field label="CGPA" error={errors.cgpa}><input type="text" value={form.cgpa} onChange={(e) => update("cgpa", e.target.value)} placeholder="e.g. 8.5" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-400 focus:shadow-[0_0_0_3px rgba(0,247,255,0.1)] transition-all" /></Field>
                  <Field label="Domain Preference" error={errors.domain_choice}><select value={form.domain_choice} onChange={(e) => { update("domain_choice", e.target.value); if (e.target.value) { setActiveBranch(e.target.value); setHoveredBranch(e.target.value); } }} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 focus:shadow-[0_0_0_3px rgba(0,247,255,0.1)] transition-all appearance-none cursor-pointer"><option value="" className="bg-black">Select domain</option>{domains.map((d) => <option key={d.key} value={d.key} className="bg-black">{d.key === "events" ? "Event Management" : d.title}</option>)}</select></Field>
                </div>
              </div>
              <div className="mb-8">
                <h4 className={`${conthrax} text-[10px] tracking-[0.2em] uppercase text-cyan-400/60 mb-4`}>Skills &amp; Experience</h4>
                <div className="mb-4">
                  <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-3">Skills / Areas</label>
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map((skill) => (
                      <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] border transition-all cursor-pointer ${
                          form.skills.includes(skill) ? "bg-cyan-500/10 border-cyan-400 text-cyan-400" : "bg-white/[0.03] border-white/10 text-white/50 hover:border-cyan-500/30 hover:text-white/70"
                        }`}>
                        {form.skills.includes(skill) && <Check size={10} className="inline mr-1" />}{skill}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2">Previous Experience <span className="text-white/20 normal-case tracking-normal font-normal">(optional)</span></label>
                  <textarea value={form.experience} onChange={(e) => update("experience", e.target.value)} placeholder="Describe any prior research, projects, internships, publications..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-400 focus:shadow-[0_0_0_3px rgba(0,247,255,0.1)] transition-all min-h-[80px] resize-y" />
                </div>
                <Field label="Why join K-1000?" error={errors.motivation}>
                  <textarea value={form.motivation} onChange={(e) => update("motivation", e.target.value)} placeholder="Tell us about your motivation, goals, and how K-1000 fits into your journey..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-400 focus:shadow-[0_0_0_3px rgba(0,247,255,0.1)] transition-all min-h-[100px] resize-y" />
                </Field>
              </div>
              <div className="mb-8">
                <h4 className={`${conthrax} text-[10px] tracking-[0.2em] uppercase text-cyan-400/60 mb-4`}>Referral</h4>
                <Field label="How did you hear about K-1000?" error={errors.referral_source}>
                  <select value={form.referral_source} onChange={(e) => update("referral_source", e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 focus:shadow-[0_0_0_3px rgba(0,247,255,0.1)] transition-all appearance-none cursor-pointer"><option value="" className="bg-black">Select source</option>{referralOptions.map((o) => <option key={o} value={o} className="bg-black">{o}</option>)}</select>
                </Field>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <button type="button" onClick={resetForm} className={`${conthrax} flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 text-white/40 text-[10px] tracking-[0.3em] uppercase hover:border-white/30 hover:text-white/70 transition-all cursor-pointer`}><RotateCcw size={12} /> Clear</button>
                <button type="submit" disabled={submitting} className={`${conthrax} flex items-center gap-2 px-8 py-3 rounded-full border border-cyan-400 text-cyan-400 text-[10px] tracking-[0.3em] uppercase hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_20px_rgba(0,247,255,0.1)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer`}>
                  {submitting ? "Submitting..." : <><Send size={12} /> Submit Application</>}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* ─── RIGHT: BRANCHES (hover to reveal director/deputy + message) ─── */}
        <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:sticky lg:top-24" id="branches-sidebar">
          <div className="p-5 md:p-6 rounded-[24px] bg-white/[0.03] backdrop-blur-xl border border-white/10 transition-all duration-500">
            <h3 className={`${conthrax} text-[10px] tracking-[0.25em] uppercase text-white/30 mb-4`}>Branches</h3>
            <div className="flex flex-col gap-1">
              {domains.map((d) => {
                const isActive = activeBranch === d.key;
                return (
                  <div key={d.key}
                    onMouseEnter={(e) => { setHoveredBranch(d.key); const r = e.currentTarget.getBoundingClientRect(); setBranchPopoverPos({ top: r.top, right: window.innerWidth - r.left + 12 }); }}
                    onMouseLeave={() => setHoveredBranch(null)}
                    onClick={() => setActiveBranch(d.key)}
                  >
                    <button
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all duration-300 cursor-pointer ${
                        isActive && hoveredBranch !== d.key
                          ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
                          : "border border-transparent text-white/50 hover:bg-white/[0.03] hover:border-white/10"
                      }`}
                    >
                      <span className={`${orbitron} text-[8px] tracking-widest text-white/20 mr-2`}>
                        {String(domains.indexOf(d) + 1).padStart(2, "0")}
                      </span>
                      {d.key === "events" ? "Event Management" : d.title}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.aside>
      </div>

      {hoveredOffice && (
        <motion.div
          key={hoveredOffice}
          initial={{ opacity: 0, x: -8, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -8, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[100] w-[280px] p-4 rounded-xl bg-black/90 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(0,247,255,0.15)] pointer-events-none"
          style={{ top: officePopoverPos.top, left: officePopoverPos.left }}
        >
          {(() => {
            const o = offices.find(x => x.id === hoveredOffice)!;
            return <>
              {[o.leader, o.deputy].filter(Boolean).map((l, i) => l && (
                <div key={i} className={`flex items-center gap-3 ${i === 0 ? "mb-3" : ""}`}>
                  <img src={l.image} alt={l.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <div className={`${conthrax} text-[11px] font-black text-white truncate`}>{l.name}</div>
                    <div className="text-[8px] text-cyan-400/70 uppercase tracking-wider">{l.position}</div>
                  </div>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-[11px] text-white/60 leading-relaxed italic">&ldquo;{o.message}&rdquo;</p>
                <p className={`${conthrax} text-[8px] text-cyan-400/50 mt-2 uppercase tracking-wider`}>&mdash; {o.title}</p>
              </div>
            </>;
          })()}
        </motion.div>
      )}

      {hoveredBranch && (
        <motion.div
          key={hoveredBranch}
          initial={{ opacity: 0, x: 8, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 8, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[100] w-[280px] p-4 rounded-xl bg-black/90 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(0,247,255,0.15)] pointer-events-none"
          style={{ top: branchPopoverPos.top, right: branchPopoverPos.right }}
        >
          {(() => {
            const d = domains.find(x => x.key === hoveredBranch)!;
            const targetKey = branchMapping[d.key] || cleanString(d.key === "events" ? "Event Management" : d.title);
            const dirs = leadership.hierarchy.find((l) => l.level === 3)?.members ?? [];
            const deps = leadership.hierarchy.find((l) => l.level === 4)?.members ?? [];
            const brDir = dirs.find((m) => cleanString(m.branch) === targetKey);
            const brDep = deps.find((m) => cleanString(m.branch) === targetKey);
            return <>
              {[brDir, brDep].map((l, i) => (
                <div key={i} className={`flex items-center gap-3 ${i === 0 ? "mb-3" : ""}`}>
                  {l ? (
                    <img src={l.image} alt={l.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/20 text-[9px] flex-shrink-0">TBD</div>
                  )}
                  <div className="min-w-0">
                    <div className={`${conthrax} text-[11px] font-black text-white truncate`}>{l?.name || "TBD"}</div>
                    <div className="text-[8px] text-cyan-400/70 uppercase tracking-wider">{i === 0 ? "Director" : "Deputy Director"}</div>
                  </div>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-[11px] text-white/60 leading-relaxed italic mb-3">&ldquo;{d.overview.split(".")[0]}.&rdquo;</p>
                <div className="flex flex-wrap gap-1.5">
                  {d.focusAreas.slice(0, 2).map((a, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400/80">{a}</span>
                  ))}
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/30">+{d.focusAreas.length - 2}</span>
                </div>
              </div>
            </>;
          })()}
        </motion.div>
      )}

      <Footer />
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2">{label} <span className="text-cyan-400">*</span></label>
      {children}
      {error && <p className="text-red-400 text-[11px] mt-1.5">{error}</p>}
    </div>
  );
}
