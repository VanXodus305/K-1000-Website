"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import Image from "next/image"; 
import { EVENTS, K1000Event } from "@/data/event";
import { Calendar, ExternalLink, Activity, ShieldCheck, Terminal, ChevronRight, Zap } from "lucide-react";
import SharedHeader from "../../components/ui/SharedHeader";
import Footer from "../../components/footer/Footer";

const conthrax = "font-['Conthrax',_sans-serif]";
const orbitron = "font-['Orbitron',_sans-serif]";

const Events = () => {
  const [selectedEvent, setSelectedEvent] = useState<K1000Event>(EVENTS[0]);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  

  return (
    <div className="relative w-full min-h-screen bg-[#020202] text-white selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Dynamic Background Grid */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f7ff0a_1px,transparent_1px),linear-gradient(to_bottom,#00f7ff0a_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_90%)]" />
      </div>

      <SharedHeader />

      {/* Progress Line */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[2px] bg-cyan-500 z-[100] origin-left"
        style={{ scaleX }}
      />

      <main className="relative z-10 max-w-[1600px] mx-auto pt-24 pb-20 px-4 md:px-10">
        
        {/* HEADER BLOCK */}
        <div className="mb-12 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
            </div>
            <h1 className={`${conthrax} text-4xl md:text-7xl text-white uppercase leading-none tracking-tighter font-black`}>
              Event <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(0,247,255,0.4)]">Registry</span>
            </h1>
          </div>
          <div className="hidden lg:block text-right">
            <p className={`${orbitron} text-[10px] text-white/30 tracking-widest uppercase`}>
              Last Synchronized: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
          
          {/* NAVIGATION DECK (Sticky) */}
          <div className="lg:col-span-4 sticky top-28 z-30">
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[32px] p-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                {EVENTS.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`w-full text-left px-6 py-5 rounded-[24px] transition-all duration-500 group relative overflow-hidden ${
                      selectedEvent.id === event.id 
                      ? "bg-cyan-500/10 border border-cyan-500/40" 
                      : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    {selectedEvent.id === event.id && (
                      <motion.div layoutId="activeGlow" className="absolute inset-0 bg-cyan-500/5 blur-xl" />
                    )}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className={`${orbitron} text-[8px] tracking-widest font-black ${selectedEvent.id === event.id ? "text-cyan-400" : "text-white/20"}`}>
                          {event.date.toUpperCase()}
                        </span>
                        <span className={`${conthrax} text-[11px] md:text-xs text-white uppercase tracking-wider font-black group-hover:text-cyan-300 transition-colors`}>
                          {event.title}
                        </span>
                      </div>
                      <ChevronRight size={14} className={`transition-transform duration-300 ${selectedEvent.id === event.id ? "text-cyan-400 translate-x-0" : "text-white/10 -translate-x-2"}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DISPLAY CORE */}
          <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedEvent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="space-y-8"
              >
                {/* HERO ASSET */}
                <div className="relative aspect-video w-full rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
                  <Image
                    src={selectedEvent.gallery[0]}
                    alt={selectedEvent.title}
                    fill
                    priority
                    className="object-cover object-top brightness-[0.5] scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-transparent" />
                  
                  <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                         <Zap size={14} className="text-cyan-400 fill-cyan-400" />
                         <span className={`${conthrax} text-[10px] text-cyan-400 uppercase font-black tracking-[0.3em]`}>
                           {selectedEvent.category}
                         </span>
                      </div>
                      <h2 className={`${conthrax} text-3xl md:text-5xl text-white uppercase leading-none font-black`}>
                        {selectedEvent.title}
                      </h2>
                    </div>
                    <motion.a 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}
                      href={selectedEvent.link} 
                      target="_blank" 
                      className={`${conthrax} flex items-center gap-3 px-8 py-4 bg-cyan-500 text-black rounded-full font-black text-[10px] uppercase tracking-widest shadow-[0_0_30px_rgba(0,247,255,0.4)]`}
                    >
                      <span>Launch Report</span>
                      <ExternalLink size={14} />
                    </motion.a>
                  </div>
                </div>

                {/* DATA GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-cyan-500/60">
                      <ShieldCheck size={20} />
                      <span className={`${conthrax} text-[10px] uppercase font-black tracking-widest`}>Mission Briefing</span>
                    </div>
                    <p className="text-white/60 text-lg md:text-xl leading-relaxed font-light italic border-l-2 border-cyan-500/20 pl-6">
                      {selectedEvent.description}
                    </p>
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
                      <Calendar className="text-cyan-400" size={20} />
                      <span className={`${orbitron} text-xs font-black uppercase tracking-widest`}>Recorded: {selectedEvent.date}</span>
                    </div>
                  </div>

                  <div className="bg-cyan-500/[0.02] border border-cyan-500/10 rounded-[40px] p-8 md:p-10">
                    <h4 className={`${conthrax} text-[10px] text-cyan-400 uppercase tracking-[0.5em] mb-8 font-black`}>Critical Highlights</h4>
                    <div className="space-y-6">
                      {selectedEvent.highlights.map((point, i) => (
                        <div key={i} className="flex gap-4 group">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0 shadow-[0_0_10px_#00f7ff] group-hover:scale-150 transition-transform" />
                          <p className="text-white/50 text-sm md:text-base leading-snug font-light group-hover:text-white transition-colors">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile Feed remains similar but uses the same card aesthetic */}
      <footer className="py-20 flex flex-col items-center justify-center opacity-10">
           <Activity size={40} className="text-cyan-400 mb-4" />
           <p className={`${conthrax} text-[8px] uppercase tracking-[1.5em] font-black`}>End of Registry</p>
      </footer>
      <Footer />
    </div>
  );
};

export default Events;