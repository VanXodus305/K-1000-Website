"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { Cpu, Target, Layers, BookOpen, Briefcase, GraduationCap, Users } from "lucide-react";
import SharedHeader from "../../components/ui/SharedHeader";
import Footer from "../../components/footer/Footer";
import { leadership } from "../../data/leadership";

/* ─────────── DATA & MAPPING ─────────── */
const branchMapping: Record<string, string> = {
  internshipandplacement: "academicinternshipandplacementguidance",
  eventorganization: "eventorganization",
  researchandpublications: "researchandpublications",
  projectwing: "projectwing",
  trainingprogram: "trainingprogram",
  higherstudies: "higherstudies",
};

type Domain = {
  key: string; title: string; tag: string; overview: string; description: string;
  focusAreas: string[]; outcomes: string[]; yearOfFormation: number;
  icon: React.ReactNode; image: string; missionStatement: string;
};

const branches: Domain[] = [
  {
    key: "trainingprogram", title: "Training Program", tag: "Unit: Skill Acquisition",
    overview: "A peer-to-peer learning initiative focused on technical mastery.",
    description: "Students engage in workshops and real-world projects to build high-level practical knowledge.",
    focusAreas: ["Hands-on Workshops", "Peer Mentoring", "Professional Growth"],
    outcomes: ["Technical Proficiency", "Leadership Development", "Project Readiness"],
    yearOfFormation: 2022, icon: <Cpu size={20} />, missionStatement: "Mastery through collaborative evolution.",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600"
  },
  {
    key: "researchandpublications", title: "Research and Publications", tag: "Unit: Academic Innovation",
    overview: "Supports students in the end-to-end research process.",
    description: "From topic selection to journal submission, we guide you through every step of the academic lifecycle.",
    focusAreas: ["Journal Drafting", "Faculty Collaboration", "IPR Support"],
    outcomes: ["Published Research", "Academic Networking", "Intellectual Property"],
    yearOfFormation: 2021, icon: <BookOpen size={20} />, missionStatement: "Advancing academic frontiers.",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1600"
  },
  {
    key: "projectwing", title: "Project Wing", tag: "Unit: Product Development",
    overview: "Enables members to build real-world solutions.",
    description: "Mentorship to turn ideas into prototypes with agile development cycles and industry-grade deployment.",
    focusAreas: ["Agile Development", "Resource Allocation", "Industry Prototypes"],
    outcomes: ["Shipped Products", "System Architecture", "Deployment"],
    yearOfFormation: 2023, icon: <Layers size={20} />, missionStatement: "Scaling technological solutions.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600"
  },
  {
    key: "eventorganization", title: "Event Organization", tag: "Unit: Operations & Management",
    overview: "Logistics backbone for major organizational events.",
    description: "Planning hackathons, webinars, and speaker sessions, building leadership and communication excellence.",
    focusAreas: ["Hackathon Management", "Speaker Relations", "Global Webinars"],
    outcomes: ["Event Management", "Communication Excellence", "Logistics"],
    yearOfFormation: 2020, icon: <Users size={20} />, missionStatement: "Orchestrating innovation.",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1600"
  },
  {
    key: "internshipandplacement", title: "Internship and Placement", tag: "Unit: Career Bridge",
    overview: "Bridges the gap between campus and industry.",
    description: "Industry connections, resume reviews, and mock interviews to secure high-tier recruitment.",
    focusAreas: ["Corporate Relations", "Resume Optimization", "Mock Drills"],
    outcomes: ["Placement Success", "Industry Ready Profiles", "Interview Mastery"],
    yearOfFormation: 2020, icon: <Briefcase size={20} />, missionStatement: "Strategic industry alignment.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600"
  },
  {
    key: "higherstudies", title: "Higher Studies", tag: "Unit: Global Advancement",
    overview: "Guidance for students aiming for post-graduate excellence.",
    description: "Streamlining SOP writing, scholarship applications, and entrance exam preparation.",
    focusAreas: ["SOP/LOR Drafting", "Scholarship Tracking", "University Mapping"],
    outcomes: ["University Admission", "Financial Aid Success", "Global Networking"],
    yearOfFormation: 2022, icon: <GraduationCap size={20} />, missionStatement: "Global education pathways.",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop"
  }
];

const conthrax = "font-['Conthrax',_sans-serif]";
const cleanString = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/management/g, "organization").replace(/\s+/g, "").trim();

const CubeBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    let ctxGSAP = gsap.context(() => {
      let particles: any[] = [];
      let width = window.innerWidth, height = window.innerHeight;
      const mouse = { x: width / 2, y: height / 2 };
      const resize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; init(); };
      class Particle {
        x: number; y: number; size: number; baseSize: number; vx: number; vy: number;
        constructor() { this.x = Math.random() * width; this.y = Math.random() * height; this.baseSize = Math.random() * 2 + 1.5; this.size = this.baseSize; this.vx = (Math.random() - 0.5) * 0.4; this.vy = (Math.random() - 0.5) * 0.4; }
        update() { this.x += this.vx; this.y += this.vy; if (this.x < 0 || this.x > width) this.vx *= -1; if (this.y < 0 || this.y > height) this.vy *= -1; const dx = mouse.x - this.x, dy = mouse.y - this.y; const distSq = dx * dx + dy * dy; this.size = distSq < 22500 ? gsap.utils.interpolate(this.size, this.baseSize * 3, 0.1) : gsap.utils.interpolate(this.size, this.baseSize, 0.05); }
        draw() { if (!ctx) return; ctx.fillStyle = "rgba(0, 247, 255, 0.8)"; ctx.fillRect(this.x, this.y, this.size, this.size); }
      }
      const init = () => { particles = []; const count = Math.floor((width * height) / 9500); for (let i = 0; i < count; i++) particles.push(new Particle()); };
      const animate = () => { ctx.clearRect(0, 0, width, height); for (let i = 0; i < particles.length; i++) { const p = particles[i]; p.update(); p.draw(); for (let j = i + 1; j < particles.length; j++) { const p2 = particles[j]; const dx = p.x - p2.x, dy = p.y - p2.y; const distSq = dx * dx + dy * dy; if (distSq < 14400) { ctx.beginPath(); ctx.strokeStyle = `rgba(0, 247, 255, ${0.25 * (1 - Math.sqrt(distSq) / 120)})`; ctx.lineWidth = 0.8; ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke(); } } } requestAnimationFrame(animate); };
      const handleMouseMove = (e: MouseEvent) => { gsap.to(mouse, { x: e.clientX, y: e.clientY, duration: 0.6, ease: "power2.out" }); };
      window.addEventListener("resize", resize); window.addEventListener("mousemove", handleMouseMove, { passive: true });
      resize(); animate();
    });
    return () => ctxGSAP.revert();
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, transform: 'translateZ(0)' }} />;
};

export default function BranchesPage() {
  const [activeTab, setActiveTab] = useState(branches[0].key);
  const activeDomain = branches.find((b) => b.key === activeTab)!;

  const { director, deputy } = useMemo(() => {
    const hierarchy = (leadership as any).hierarchy ?? [];
    const directors = hierarchy.find((h: any) => h.level === 3)?.members ?? [];
    const deputies = hierarchy.find((h: any) => h.level === 4)?.members ?? [];
    const targetKey = branchMapping[activeDomain.key] || cleanString(activeDomain.title);
    return {
      director: directors.find((m: any) => cleanString(m.branch) === targetKey),
      deputy: deputies.find((m: any) => cleanString(m.branch) === targetKey),
    };
  }, [activeDomain]);

  return (
    <div className="flex flex-col w-full bg-black text-white min-h-screen relative">
      <CubeBackground />
      <div className="relative z-10">
        <SharedHeader />
        <div className="pt-24 md:pt-32" />
        <main className="flex flex-col items-center w-full pb-24 px-6">
          <section className="w-full max-w-7xl">
            {/* Added h-64 md:h-[350px] for mobile hero optimization */}
            <div className="relative w-full h-64 md:h-[350px] rounded-[40px] overflow-hidden border border-white/10 bg-black">
              <img src={activeDomain.image} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="Hero" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="relative z-10 flex flex-col justify-end p-8 md:p-12 h-full">
                <span className="text-cyan-400 text-xs tracking-[0.3em] uppercase mb-2">{activeDomain.tag}</span>
                <h1 className={`${conthrax} text-3xl md:text-6xl tracking-widest uppercase font-black`}>{activeDomain.title}</h1>
              </div>
            </div>
          </section>

          <section className="w-full max-w-7xl py-12 md:py-16 flex flex-col md:flex-row gap-8 md:gap-12">
            {/* Added scrollable flex container for mobile navigation */}
            <aside className="w-full md:w-1/3 flex md:flex-col gap-4 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
              {branches.map((b) => (
                <button key={b.key} onClick={() => setActiveTab(b.key)} className={`whitespace-nowrap w-full text-left px-8 py-5 rounded-2xl border transition-all ${activeTab === b.key ? "bg-white/10 border-cyan-500" : "border-white/10 hover:border-white/30"}`}>
                  <span className={`${conthrax} text-xs uppercase ${activeTab === b.key ? "text-cyan-400" : "text-white/60"}`}>{b.title}</span>
                </button>
              ))}
            </aside>

            <div className="w-full md:w-2/3">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 md:p-10 rounded-[32px] bg-white/[0.03] border border-white/10">
                  <p className="text-lg md:text-xl text-white/90 italic mb-8 border-l-2 border-cyan-500 pl-4 text-left">"{activeDomain.missionStatement}"</p>
                  <p className="text-white/60 leading-relaxed mb-10 text-left">{activeDomain.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-y border-white/10 py-8 mb-10 text-left">
                    <div>
                      <h4 className={`${conthrax} text-[10px] text-white/30 uppercase mb-4`}>Focus Areas</h4>
                      {activeDomain.focusAreas.map((a, i) => <div key={i} className="text-sm mb-2 text-white/70 flex items-center gap-2"><Layers size={14} className="text-cyan-500"/> {a}</div>)}
                    </div>
                    <div>
                      <h4 className={`${conthrax} text-[10px] text-white/30 uppercase mb-4`}>Core Outcomes</h4>
                      {activeDomain.outcomes.map((o, i) => <div key={i} className="text-sm mb-2 text-white/70 flex items-center gap-2"><Target size={14} className="text-emerald-500"/> {o}</div>)}
                    </div>
                  </div>

                  <h4 className={`${conthrax} text-[10px] text-white/30 uppercase mb-6 text-left`}>Unit Leadership</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
                    {[director, deputy].map((leader, i) => (
                      <div key={i} className="flex flex-col gap-4">
                        <p className="text-[10px] uppercase text-white/40">{i === 0 ? "Director" : "Deputy Director"}</p>
                        <div className="w-full h-72 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                          {leader ? <img src={leader.image} alt={leader.name} className="w-full h-full object-cover object-[center_20%]" /> : <div className="h-full flex items-center justify-center text-white/10">TBD</div>}
                        </div>
                        <p className={`${conthrax} text-sm`}>{leader?.name || "TBD"}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </section>
        </main>
        <Footer />
      </div>
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}