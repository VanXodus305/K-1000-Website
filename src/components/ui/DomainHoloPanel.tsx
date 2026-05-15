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

/* ─────────── HELPERS ─────────── */
const cleanString = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/management/g, "organization")
    .replace(/\s+/g, "")
    .trim();

function useDecryptText(text: string, speed = 25) {
  const [out, setOut] = useState("");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  useEffect(() => {
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      setOut(
        text
          .split("")
          .map((c, i) =>
            i < frame / 2 ? c : chars[Math.floor(Math.random() * chars.length)],
          )
          .join(""),
      );
      if (frame > text.length * 2) {
        setOut(text);
        clearInterval(id);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return out;
}

export default function DomainHoloPanel({
  domain,
  onClose,
}: {
  domain: Domain;
  onClose: () => void;
}) {
  const titleDecrypted = useDecryptText(domain.title);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleClose = () => {
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: -5000,
      clientY: -5000,
    });
    window.dispatchEvent(mouseEvent);
    onClose();
  };
const { director, deputy } = useMemo(() => {
    const hierarchy = (leadership as any).hierarchy ?? [];
    const directors = hierarchy.find((h: any) => h.level === 3)?.members ?? [];
    const deputies = hierarchy.find((h: any) => h.level === 4)?.members ?? [];
    const domainTitleCleaned = cleanString(domain.title);
  
    const branchMapping: Record<string, string> = {
      academicinternshipandplacement: "academicinternshipandplacementguidance",
      eventmanagement: "eventmanagement", 
      researchandpublications: "researchandpublications",
      projectwing: "projectwing",
      trainingprogram: "trainingprogram",
      higherstudies: "higherstudies",
    };

    const targetKey = branchMapping[domainTitleCleaned] || domainTitleCleaned;

    return {
      director: directors.find((m: any) => cleanString(m.branch) === targetKey),
      deputy: deputies.find((m: any) => cleanString(m.branch) === targetKey),
    };
  }, [domain.title]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center md:p-8 p-0"
    >
      <div
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
        onClick={handleClose}
      />

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative w-full max-w-6xl h-full md:h-[82vh] bg-[#050505] border-t md:border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col md:flex-row"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 md:top-6 md:right-8 p-2 md:p-3 group flex items-center gap-3 border border-white/10 hover:border-white/20 transition-all z-[210] bg-black/50 backdrop-blur-md rounded-full"
        >
          <X className="text-white/60 group-hover:text-white" size={16} />
        </button>

        {/* LEFT Sidebar */}
        <div className="w-full md:w-[280px] lg:w-[320px] border-b md:border-b-0 md:border-r border-white/5 bg-black flex flex-col shrink-0">
          <div className="p-5 md:p-6 border-b border-white/5 pr-14 md:pr-6">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <Shield size={10} className="text-cyan-500" />
              <span className={`${conthrax} text-[7px] md:text-[9px] text-cyan-500 tracking-[0.3em] font-black uppercase`}>
                Leadership
              </span>
            </div>
            <h1 className={`${conthrax} text-lg md:text-xl text-white uppercase leading-tight tracking-tighter font-black`}>
              {titleDecrypted}
            </h1>
          </div>

          <div
            data-lenis-prevent-wheel
            data-lenis-prevent-touch
            className="flex md:flex-col overflow-x-auto md:overflow-y-auto p-4 md:p-5 gap-3 md:gap-6 custom-scroll scrollbar-hide"
          >
            <div className="min-w-[140px] flex-1 md:min-w-full">
              <h3 className={`${conthrax} text-[7px] md:text-[9px] text-white/30 tracking-[0.2em] uppercase mb-2 font-black`}>
                Director
              </h3>
              {director ? <LeaderCard leader={director} /> : <EmptySlot label="TBD" />}
            </div>
            <div className="min-w-[140px] flex-1 md:min-w-full">
              <h3 className={`${conthrax} text-[7px] md:text-[9px] text-white/30 tracking-[0.2em] uppercase mb-2 font-black`}>
                Deputy Director
              </h3>
              {deputy ? <LeaderCard leader={deputy} /> : <EmptySlot label="TBD" />}
            </div>
          </div>
        </div>

        {/* RIGHT - Content Area */}
        <div
          data-lenis-prevent-wheel
          data-lenis-prevent-touch
          className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-14 bg-[#020202] relative custom-scroll"
        >
          <div className="max-w-3xl space-y-8 md:space-y-12 pb-12 md:pb-0">
            <section className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-4">
                <Cpu size={14} className="text-cyan-500" />
                <h2 className={`${conthrax} text-[8px] md:text-[10px] tracking-[0.4em] text-cyan-500 uppercase font-black`}>
                  Domain Overview
                </h2>
              </div>
              <p className="text-white/80 text-xs md:text-lg leading-relaxed font-light pl-4 md:pl-6 border-l border-cyan-500/20">
                {domain.overview}
              </p>
            </section>

            {domain.focusAreas && (
              <section>
                <h2 className={`${conthrax} text-[8px] md:text-[10px] tracking-[0.4em] text-white/30 uppercase mb-4 font-black`}>
                  Focus Areas
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  {domain.focusAreas.map((area, i) => (
                    <div
                      key={i}
                      className="p-3 md:p-4 bg-white/[0.02] border border-white/5 flex items-center gap-3 md:gap-4 hover:border-cyan-500/30 transition-all group"
                    >
                      <Layers size={10} className="text-cyan-500/40 group-hover:text-cyan-500 transition-colors" />
                      <span className={`${conthrax} text-[8px] md:text-[10px] text-white/70 uppercase tracking-[0.15em] font-black`}>
                        {area}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="p-5 md:p-6 bg-white/[0.01] border border-white/5 rounded-2xl relative">
              <h2 className={`${conthrax} text-[7px] md:text-[9px] text-white/20 tracking-[0.3em] uppercase mb-3 font-black`}>
                Operational Description
              </h2>
              <p className="text-white/60 text-[11px] md:text-base leading-relaxed whitespace-pre-line font-light text-justify">
                {domain.description}
              </p>
            </section>

            {domain.applyLink && (
              <div className="pt-2 md:pt-4 flex justify-center md:justify-start">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={domain.applyLink}
                  target="_blank"
                  className="w-full md:w-auto inline-flex items-center justify-between md:justify-start gap-6 md:gap-8 px-6 md:px-10 py-4 bg-cyan-500 text-black rounded-full shadow-[0_0_30px_rgba(0,247,255,0.2)]"
                >
                  <span className={`${conthrax} text-[9px] md:text-xs tracking-[0.2em] md:tracking-[0.4em] font-black uppercase`}>
                    Apply for Membership
                  </span>
                  <ChevronRight size={16} />
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
    <div className="group relative w-full h-24 sm:h-32 md:h-48 overflow-hidden border border-white/10 rounded-xl md:rounded-2xl bg-[#080808] transition-all duration-500 hover:border-cyan-500/40 will-change-transform">
      <div className="absolute inset-0 bg-cyan-950/5" />

      {leader.image && (
        <img
          src={leader.image}
          alt={leader.name}
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
          style={{ objectPosition: "center 15%" }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full p-2.5 md:p-4">
        <h4 className={`${conthrax} text-white text-[8px] md:text-[10px] tracking-wider uppercase mb-0.5 font-black group-hover:text-cyan-400 transition-colors truncate`}>
          {leader.name}
        </h4>
        <p className={`${conthrax} text-[6px] md:text-[7.5px] text-white/40 uppercase tracking-widest font-black`}>
          {leader.position}
        </p>
      </div>
    </div>
  );
}

function EmptySlot({ label }: { label: string }) {
  return (
    <div className="h-24 sm:h-32 md:h-48 border border-dashed border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center bg-white/[0.02]">
      <span className={`${conthrax} text-[7px] text-white/10 uppercase tracking-widest font-black`}>
        {label}
      </span>
    </div>
  );
}