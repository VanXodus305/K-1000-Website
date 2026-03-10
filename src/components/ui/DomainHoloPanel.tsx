"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Target, ChevronRight, X, Cpu, Layers } from "lucide-react";
import { leadership } from "../../data/leadership";

/* ─────────── TYPES ─────────── */
type Domain = {
  key: string;
  title: string;
  overview: string;
  description: string;
  focusAreas?: string[];
  outcomes: string[];
  yearOfFormation: number;
  baseColor: string;
  accentColor: string;
  applyLink?: string;
  icon?: React.ReactNode;
};

type Leader = {
  name: string;
  position: string;
  branch: string;
  image: string;
};

const conthrax = "font-['Conthrax',_sans-serif]";
const orbitron = "font-['Orbitron',_sans-serif]";

/* ─────────── HELPERS ─────────── */
const cleanString = (s: string) => 
  s.toLowerCase()
   .replace(/&/g, "and")
   .replace(/management/g, "organization") 
   .replace(/internship and placement/g, "academic and internship guidance")
   .replace(/\s+/g, "")
   .trim();

function useDecryptText(text: string, speed = 25) {
  const [out, setOut] = useState("");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  useEffect(() => {
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      setOut(text.split("").map((c, i) => i < frame / 2 ? c : chars[Math.floor(Math.random() * chars.length)]).join(""));
      if (frame > text.length * 2) { setOut(text); clearInterval(id); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return out;
}

export default function DomainHoloPanel({ domain, onClose }: { domain: Domain; onClose: () => void }) {
  const titleDecrypted = useDecryptText(domain.title);

  // Mute shining nodes on close by resetting virtual mouse position
  const handleClose = () => {
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: -5000,
      clientY: -5000
    });
    window.dispatchEvent(mouseEvent);
    onClose();
  };

  const { director, deputy } = useMemo(() => {
    const hierarchy = leadership.hierarchy ?? [];
    const directors = hierarchy.find(h => h.level === 3)?.members ?? [];
    const deputies = hierarchy.find(h => h.level === 4)?.members ?? [];
    const targetKey = cleanString(domain.title);

    return {
      director: directors.find((m: Leader) => cleanString(m.branch) === targetKey),
      deputy: deputies.find((m: Leader) => cleanString(m.branch) === targetKey),
    };
  }, [domain.title]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center md:p-8 p-0"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={handleClose} />

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative w-full max-w-6xl h-full md:h-[85vh] bg-[#050505] border-t md:border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col md:flex-row"
      >
        {/* Close Button */}
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 md:top-6 md:right-8 p-3 group flex items-center gap-3 border border-white/10 hover:border-white/20 transition-all z-[210] bg-black/50 backdrop-blur-md rounded-full"
        >
          <X className="text-white/60 group-hover:text-white" size={18} />
        </button>

        {/* LEFT Sidebar - Personnel */}
        <div className="w-full md:w-[350px] border-b md:border-b-0 md:border-r border-white/5 bg-black flex flex-col shrink-0">
          <div className="p-6 md:p-8 border-b border-white/5 pr-16 md:pr-8">
             <div className="flex items-center gap-2 mb-3 md:mb-4">
                <Shield size={12} className="text-cyan-500" />
                <span className={`${conthrax} text-[8px] md:text-[9px] text-cyan-500 tracking-[0.3em] font-black uppercase`}>Leadership</span>
             </div>
             <h1 className={`${conthrax} text-xl md:text-2xl text-white uppercase leading-tight tracking-tighter font-black`}>
                {titleDecrypted}
             </h1>
          </div>

          <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto p-4 md:p-6 gap-4 md:space-y-8 custom-scroll scrollbar-hide">
             <div className="min-w-[260px] md:min-w-full">
                <h3 className={`${conthrax} text-[8px] md:text-[9px] text-white/30 tracking-[0.2em] uppercase mb-3 md:mb-4 font-black`}>Director</h3>
                {director ? <LeaderCard leader={director} /> : <div className="h-40 md:h-44 border border-dashed border-white/10 rounded-lg" />}
             </div>
             <div className="min-w-[260px] md:min-w-full">
                <h3 className={`${conthrax} text-[8px] md:text-[9px] text-white/30 tracking-[0.2em] uppercase mb-3 md:mb-4 font-black`}>Deputy Director</h3>
                {deputy ? <LeaderCard leader={deputy} /> : <div className="h-40 md:h-44 border border-dashed border-white/10 rounded-lg" />}
             </div>
          </div>
        </div>

        {/* RIGHT - Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-14 bg-[#020202] relative custom-scroll">
          <div className="max-w-3xl space-y-10 md:space-y-16 pb-12 md:pb-0">
            {/* Overview */}
            <section className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-4">
                <Cpu size={16} className="text-cyan-500" />
                <h2 className={`${conthrax} text-[9px] md:text-[10px] tracking-[0.4em] text-cyan-500 uppercase font-black`}>Domain Overview</h2>
              </div>
              <p className="text-white/80 text-sm md:text-lg leading-relaxed font-light pl-4 md:pl-6 border-l border-cyan-500/20">
                {domain.overview}
              </p>
            </section>

            {/* Strategic Focus */}
            {domain.focusAreas && (
              <section>
                <h2 className={`${conthrax} text-[9px] md:text-[10px] tracking-[0.4em] text-white/30 uppercase mb-6 md:mb-8 font-black`}>Focus Areas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {domain.focusAreas.map((area, i) => (
                    <div 
                      key={i} 
                      className="p-4 md:p-5 bg-white/[0.02] border border-white/5 flex items-center gap-4 md:gap-5 hover:border-cyan-500/30 transition-all"
                    >
                      <Layers size={12} className="text-cyan-500/40" />
                      <span className={`${conthrax} text-[9px] md:text-[11px] text-white/70 uppercase tracking-[0.15em] font-black`}>{area}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Details */}
            <section className="p-6 md:p-8 bg-white/[0.01] border border-white/5 rounded-2xl relative">
               <h2 className={`${conthrax} text-[8px] md:text-[9px] text-white/20 tracking-[0.3em] uppercase mb-4 md:mb-6 font-black`}>Operational Description</h2>
               <p className="text-white/60 text-xs md:text-base leading-relaxed whitespace-pre-line font-light">
                 {domain.description}
               </p>
            </section>

            {/* Apply Button */}
            {domain.applyLink && (
              <div className="pt-4 md:pt-6 flex justify-center md:justify-start">
                <motion.a 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={domain.applyLink} target="_blank"
                  className="w-full md:w-auto inline-flex items-center justify-between md:justify-start gap-8 px-8 md:px-10 py-4 md:py-5 bg-cyan-500 text-black rounded-full shadow-[0_0_30px_rgba(0,247,255,0.2)]"
                >
                  <span className={`${conthrax} text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.4em] font-black uppercase`}>Apply for Membership</span>
                  <ChevronRight size={18} />
                </motion.a>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function LeaderCard({ leader }: { leader: Leader }) {
  return (
    <div className="group relative w-full h-40 md:h-52 overflow-hidden border border-white/10 rounded-2xl bg-black transition-all duration-500 hover:border-cyan-500/40">
      <img 
        src={leader.image} 
        alt={leader.name} 
        className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
        style={{ objectPosition: 'center 15%' }} 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full p-4 md:p-5">
        <h4 className={`${conthrax} text-white text-[10px] md:text-xs tracking-wider uppercase mb-1 font-black`}>{leader.name}</h4>
        <p className={`${conthrax} text-[7px] md:text-[8px] text-white/40 uppercase tracking-widest font-black`}>{leader.position}</p>
      </div>
    </div>
  );
}