"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Target, Layers, BookOpen, Briefcase, GraduationCap, Users } from "lucide-react";
import SharedHeader from "../../components/ui/SharedHeader";
import Footer from "../../components/footer/Footer";
import { leadership } from "../../data/leadership";
import { domains } from "../../data/domain";
import CubeBackground from "../../components/ui/CubeBackground";
import { findLeadershipPair } from "../../lib/leadership-utils";

/* ─────────── DATA & MAPPING ─────────── */
const conthrax = "font-['Conthrax',_sans-serif]";

const iconMap: Record<string, React.ReactNode> = {
  training: <Cpu size={20} />,
  research: <BookOpen size={20} />,
  projects: <Layers size={20} />,
  events: <Users size={20} />,
  internship: <Briefcase size={20} />,
  higher: <GraduationCap size={20} />,
  finance: <Briefcase size={20} />,
  content: <BookOpen size={20} />,
  campus: <Users size={20} />,
};

const domainImages = [
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600",
  "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1600",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1600",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1600",
  "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1600",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600",
];

const branches = domains.map((domain, index) => ({
  key: domain.key,
  title: domain.title,
  tag: `Unit: ${domain.title}`,
  overview: domain.overview,
  description: domain.description,
  focusAreas: domain.focusAreas,
  outcomes: domain.outcomes,
  yearOfFormation: domain.yearOfFormation,
  icon: iconMap[domain.key] || <Layers size={20} />,
  image: domainImages[index] || domainImages[0],
  missionStatement: domain.overview.split(".")[0] + ".",
}));

export default function BranchesPage() {
  const [activeTab, setActiveTab] = useState(branches[0].key);
  const activeDomain = branches.find((b) => b.key === activeTab)!;

  const { primaryLeader, secondaryLeader } = useMemo(() => {
    return findLeadershipPair(leadership.hierarchy, activeDomain.title);
  }, [activeDomain]);

  return (
    <div className="flex flex-col w-full bg-black text-white min-h-screen relative">
      <CubeBackground zIndex={0} disableLinesOnMobile />
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
                  <p className="text-lg md:text-xl text-white/90 italic mb-8 border-l-2 border-cyan-500 pl-4 text-left">&quot;{activeDomain.missionStatement}&quot;</p>
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
                    {[primaryLeader, secondaryLeader].map((leader, i) => {
                      const isPlaceholder = leader?.image === "/k1000-small.png";
                      return (
                        <div key={i} className="flex flex-col gap-4">
                        <p className="text-[10px] uppercase text-white/40">
                          {leader?.position || (i === 0 ? "Senior Executive Lead" : "Junior Executive Lead")}
                        </p>
                        <div className="w-full h-72 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                          {leader ? <img src={leader.image} alt={leader.name} className={`w-full h-full ${isPlaceholder ? "object-contain p-8 bg-black/80" : "object-cover object-[center_20%]"}`} /> : <div className="h-full flex items-center justify-center text-white/10">TBD</div>}
                        </div>
                        <div className="space-y-1">
                          <p className={`${conthrax} text-sm`}>{leader?.name || "TBD"}</p>
                          {leader?.branch ? (
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                              {leader.branch}
                            </p>
                          ) : null}
                        </div>
                        </div>
                      );
                    })}
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
