"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import Image from "next/image";
import { EVENTS, K1000Event } from "@/data/event";
import { Calendar, ExternalLink, ShieldCheck, ChevronRight, Zap } from "lucide-react";
import SharedHeader from "../../components/ui/SharedHeader";
import Footer from "../../components/footer/Footer";
import CubeBackground from "../../components/ui/CubeBackground";

const conthrax = "font-['Conthrax',_sans-serif]";
const orbitron = "font-['Orbitron',_sans-serif]";

const Events = () => {
  const sortedEvents = useMemo(() => [...EVENTS].reverse(), []);
  const [selectedEvent, setSelectedEvent] = useState<K1000Event>(sortedEvents[0]);
  const navRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Auto-scroll logic for mobile/desktop nav
  useEffect(() => {
    if (navRef.current) {
      const activeBtn = navRef.current.querySelector(
        `[data-id="${selectedEvent.id}"]`
      ) as HTMLElement;
      if (activeBtn) {
        // Mobile: horizontal scroll; Desktop: vertical scroll
        const isMobile = window.innerWidth < 1024;
        if (isMobile) {
          navRef.current.scrollTo({
            left: activeBtn.offsetLeft - navRef.current.clientWidth / 2 + activeBtn.clientWidth / 2,
            behavior: "smooth",
          });
        } else {
          navRef.current.scrollTo({
            top: activeBtn.offsetTop - 20,
            behavior: "smooth",
          });
        }
      }
    }
  }, [selectedEvent.id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#020202] text-white selection:bg-cyan-500/30 overflow-x-hidden cursor-default">
      <CubeBackground zIndex={0} disableLinesOnMobile />
      <SharedHeader />

      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-cyan-500 z-[100] origin-left"
        style={{ scaleX }}
      />

      <main className="relative z-10 max-w-[1600px] mx-auto pt-24 md:pt-32 pb-16 md:pb-24 px-4 md:px-10">

        {/* ── PAGE HEADER ── */}
        <div className="mb-10 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-3">
            <h1
              className={`${conthrax} text-3xl sm:text-5xl md:text-7xl text-white uppercase leading-none tracking-tighter font-black`}
            >
              Event{" "}
              <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(0,247,255,0.4)]">
                Registry
              </span>
            </h1>
          </div>
          <div className="hidden lg:block text-right">
            <p className={`${orbitron} text-[10px] text-white/30 tracking-widest uppercase`}>
              Last Synchronized: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 lg:items-start">

          {/* ── NAVIGATION ── */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 z-30">
            <div
              ref={navRef}
              className="flex lg:flex-col overflow-x-auto overscroll-x-contain lg:overflow-y-auto lg:max-h-[calc(100vh-8rem)] bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[24px] lg:rounded-[32px] p-2 pr-5 lg:pr-2 gap-1 custom-scrollbar"
            >
              {sortedEvents.map((event) => (
                <button
                  key={event.id}
                  data-id={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`
                    flex-shrink-0 last:mr-1
                    /* Mobile: fixed width horizontal card */
                    w-[180px] sm:w-[210px]
                    /* Desktop: full width */
                    lg:w-full
                    text-left px-4 sm:px-6 py-4 sm:py-5 rounded-[18px] lg:rounded-[24px] 
                    transition-all duration-500 group relative overflow-hidden cursor-pointer
                    ${selectedEvent.id === event.id
                      ? "bg-cyan-500/10 border border-cyan-500/40"
                      : "hover:bg-white/5 border border-transparent"
                    }
                  `}
                >
                  {selectedEvent.id === event.id && (
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute inset-0 bg-cyan-500/5 blur-xl"
                    />
                  )}
                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span
                        className={`${orbitron} text-[8px] tracking-widest font-black truncate ${
                          selectedEvent.id === event.id ? "text-cyan-400" : "text-white/20"
                        }`}
                      >
                        {event.date.toUpperCase()}
                      </span>
                      <span
                        className={`${conthrax} text-[10px] sm:text-[11px] text-white uppercase tracking-wider font-black truncate`}
                      >
                        {event.title}
                      </span>
                    </div>
                    <ChevronRight
                      size={14}
                      className={`hidden lg:block flex-shrink-0 transition-transform duration-300 ${
                        selectedEvent.id === event.id ? "text-cyan-400" : "text-white/10"
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── DETAIL PANEL ── */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedEvent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="space-y-6 lg:space-y-8"
              >
                {/* ── HERO IMAGE ── */}
                <div className="relative w-full rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] overflow-hidden border border-white/10 shadow-2xl"
                  style={{ aspectRatio: "16/10" }}
                >
                  <Image
                    src={selectedEvent.gallery[0]}
                    alt={selectedEvent.title}
                    fill
                    priority
                    className="object-cover object-top brightness-[0.5] scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/30 to-transparent" />

                  {/* Overlay content — stacks vertically on mobile, side-by-side on md+ */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 lg:p-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2">
                        <Zap size={12} className="text-cyan-400 fill-cyan-400 flex-shrink-0" />
                        <span
                          className={`${conthrax} text-[9px] sm:text-[10px] text-cyan-400 uppercase font-black tracking-[0.25em] sm:tracking-[0.3em] truncate`}
                        >
                          {selectedEvent.category}
                        </span>
                      </div>
                      <h2
                        className={`${conthrax} text-xl sm:text-3xl md:text-4xl lg:text-5xl text-white uppercase leading-none font-black`}
                      >
                        {selectedEvent.title}
                      </h2>
                    </div>

                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      href={selectedEvent.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${conthrax} self-start sm:self-auto flex-shrink-0 flex items-center gap-2 sm:gap-3 px-5 sm:px-7 lg:px-8 py-3 sm:py-4 bg-cyan-500 text-black rounded-full font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-[0_0_30px_rgba(0,247,255,0.4)] cursor-pointer whitespace-nowrap`}
                    >
                      <span>Launch Report</span>
                      <ExternalLink size={12} />
                    </motion.a>
                  </div>
                </div>

                {/* ── INFO + HIGHLIGHTS ── */}
                <div className="rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] bg-white/[0.025] backdrop-blur-md border border-white/10 p-6 sm:p-8 lg:p-10 shadow-[0_0_30px_rgba(0,0,0,0.18)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

                    {/* Mission Briefing */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-cyan-500/60">
                        <ShieldCheck size={18} />
                        <span className={`${conthrax} text-[9px] sm:text-[10px] uppercase font-black tracking-widest`}>
                          Mission Briefing
                        </span>
                      </div>
                      <p className="text-white/60 text-base sm:text-lg md:text-xl leading-relaxed font-light italic border-l-2 border-cyan-500/20 pl-5 whitespace-pre-line">
                        {selectedEvent.description}
                      </p>
                      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-black/20 border border-white/5 flex items-center gap-4">
                        <Calendar className="text-cyan-400 flex-shrink-0" size={18} />
                        <span className={`${orbitron} text-[10px] sm:text-xs font-black uppercase tracking-widest`}>
                          Recorded: {selectedEvent.date}
                        </span>
                      </div>
                    </div>

                    {/* Critical Highlights */}
                    <div className="bg-cyan-500/[0.015] border border-cyan-500/10 rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] p-6 sm:p-8 lg:p-10">
                      <h4
                        className={`${conthrax} text-[9px] sm:text-[10px] text-cyan-400 uppercase tracking-[0.4em] sm:tracking-[0.5em] mb-6 lg:mb-8 font-black`}
                      >
                        Critical Highlights
                      </h4>
                      <div className="space-y-4 sm:space-y-6">
                        {selectedEvent.highlights.map((point, i) => (
                          <div key={i} className="flex gap-3 sm:gap-4 group">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-[5px] shrink-0 shadow-[0_0_10px_#00f7ff] group-hover:scale-150 transition-transform" />
                            <p className="text-white/50 text-sm sm:text-sm md:text-base leading-snug font-light group-hover:text-white transition-colors whitespace-pre-line">
                              {point}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </main>

      <Footer />

      <style jsx global>{`
        .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default Events;
