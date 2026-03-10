"use client";

import React, { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image"; 
import { useRouter } from "next/navigation";
import { EVENTS, K1000Event } from "@/data/event";
import { Calendar, ExternalLink, Activity, ShieldCheck } from "lucide-react";
import SharedHeader from "../../components/ui/SharedHeader";

const conthrax = "font-['Conthrax',_sans-serif]";
const orbitron = "font-['Orbitron',_sans-serif]";

const Events = () => {
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<K1000Event>(EVENTS[0]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Sorting logic restored for Mobile
  const mobileSortedEvents = [...EVENTS].sort((a, b) => {
    const months: Record<string, number> = { "December": 12, "October": 10, "September": 9 };
    const getMonthValue = (dateStr: string) => {
      const month = Object.keys(months).find(m => dateStr.includes(m));
      return month ? months[month] : 0;
    };
    return getMonthValue(b.date) - getMonthValue(a.date);
  });

  const handleEventSelect = (event: K1000Event) => {
    startTransition(() => {
      setSelectedEvent(event);
    });
  };

  return (
    <div className="relative w-full min-h-screen bg-black text-white selection:bg-cyan-500/30 overflow-x-hidden">
      
      <SharedHeader />

      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:flex relative z-10 w-full h-screen overflow-hidden pt-20 will-change-transform">
        {/* LEFT SIDEBAR */}
        <div className="w-[400px] h-full border-r border-white/5 bg-black flex flex-col z-20">
          <div className="p-10 pt-12 border-b border-white/5">
            <div className="flex items-center space-x-3 mb-4">
              <Activity size={18} className="text-cyan-400" />
              <span className={`${conthrax} text-[10px] text-cyan-500/60 tracking-[0.4em] uppercase font-black`}>Archives</span>
            </div>
            <h1 className={`${conthrax} text-3xl text-white uppercase leading-tight tracking-widest font-black`}>
              Event <br />
              <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(0,247,255,0.3)]">Registry</span>
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {EVENTS.map((event) => (
              <button
                key={event.id}
                onClick={() => handleEventSelect(event)}
                className={`w-full text-left p-6 rounded-[24px] border transition-all duration-300 relative group ${
                  selectedEvent.id === event.id 
                  ? "bg-cyan-500/10 border-cyan-400/40 shadow-[0_0_30px_rgba(0,247,255,0.05)]" 
                  : "bg-transparent border-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex flex-col gap-2">
                  <span className={`${orbitron} text-[9px] tracking-[0.2em] font-bold ${selectedEvent.id === event.id ? "text-cyan-400" : "text-white/20"}`}>
                    {event.date}
                  </span>
                  <span className={`${conthrax} text-xs text-white uppercase tracking-wider font-black`}>{event.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT CONTENT PANEL */}
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar bg-[#020202]">
          <div className="relative h-[50vh] w-full overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedEvent.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={selectedEvent.gallery[0]}
                  alt={selectedEvent.title}
                  fill
                  priority
                  className="object-cover object-top brightness-[0.4]"
                  sizes="(max-width: 1024px) 100vw, 80vw"
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-transparent z-10" />
            <div className="absolute bottom-12 left-16 right-16 flex items-end justify-between z-20">
              <div className="max-w-2xl">
                <span className={`${conthrax} px-4 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/40 text-[9px] text-cyan-400 uppercase font-black tracking-widest mb-6 inline-block`}>
                  {selectedEvent.category}
                </span>
                <h2 className={`${conthrax} text-6xl text-white uppercase leading-none tracking-widest font-black`}>
                  {selectedEvent.title}
                </h2>
              </div>
              <motion.a 
                whileHover={{ scale: 1.05 }} 
                href={selectedEvent.link} 
                target="_blank" 
                className={`${conthrax} flex items-center space-x-4 px-10 py-5 bg-cyan-500 text-black rounded-full font-black text-[11px] uppercase tracking-widest shadow-[0_0_20px_rgba(0,247,255,0.3)]`}
              >
                <span>Uplink Report</span>
                <ExternalLink size={16} />
              </motion.a>
            </div>
          </div>

          <div className="px-16 pt-12 pb-32 grid grid-cols-12 gap-20">
            <div className="col-span-7 space-y-12">
              <p className="text-white/50 text-xl leading-relaxed font-light italic border-l-2 border-cyan-500/20 pl-8">
                "{selectedEvent.description}"
              </p>
              <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 flex items-center space-x-6">
                <Calendar className="text-cyan-400" size={24} />
                <p className={`${orbitron} text-white text-sm font-bold uppercase tracking-widest`}>{selectedEvent.date}</p>
              </div>
            </div>
            <div className="col-span-5">
              <div className="p-10 rounded-[40px] bg-cyan-400/[0.02] border border-cyan-400/10">
                <h4 className={`${conthrax} text-[10px] text-cyan-400 uppercase tracking-[0.5em] mb-10 font-black`}>Critical Highlights</h4>
                <div className="space-y-8">
                  {selectedEvent.highlights.map((point, i) => (
                    <div key={i} className="flex space-x-6">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0 shadow-[0_0_10px_#00f7ff]" />
                      <p className="text-white/60 text-base leading-snug font-light">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="lg:hidden flex flex-col w-full relative z-10 pt-24">
        {mobileSortedEvents.map((event, index) => (
          <section key={event.id} className="w-full flex flex-col border-b border-white/10">
            <div className="relative h-[45vh] w-full overflow-hidden">
               <Image 
                src={event.gallery[0]} 
                alt={event.title} 
                fill
                priority={index === 0}
                className="object-cover object-top brightness-[0.35]" 
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-8 left-6 right-6">
                <span className={`${conthrax} px-3 py-1 bg-cyan-500/10 border border-cyan-500/40 text-[8px] text-cyan-400 uppercase font-black tracking-widest mb-3 inline-block`}>
                  {event.category}
                </span>
                <h2 className={`${conthrax} text-3xl text-white uppercase leading-tight mb-6 font-black tracking-widest`}>{event.title}</h2>
                <a href={event.link} target="_blank" className={`${conthrax} inline-flex items-center space-x-3 bg-cyan-500 px-7 py-4 rounded-full text-black font-black text-[9px] uppercase tracking-widest`}>
                  <span>Uplink Report</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            <div className="p-8 pb-16 space-y-10 bg-black">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-cyan-500/40">
                  <ShieldCheck size={18} />
                  <span className={`${conthrax} text-[9px] uppercase tracking-widest font-black`}>Mission Briefing</span>
                </div>
                <p className="text-white/50 text-base italic leading-relaxed font-light pl-5 border-l border-cyan-500/20">"{event.description}"</p>
              </div>

              <div className="p-8 rounded-[32px] bg-cyan-400/[0.03] border border-cyan-400/10">
                <h4 className={`${conthrax} text-[9px] text-cyan-400 uppercase tracking-widest mb-8 font-black`}>Critical Highlights</h4>
                <div className="space-y-6">
                  {event.highlights.map((point, i) => (
                    <div key={i} className="flex space-x-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <p className="text-white/60 text-sm font-light leading-snug">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3 opacity-30">
                <Calendar size={14} />
                <span className={`${orbitron} text-[9px] uppercase tracking-widest font-bold`}>{event.date}</span>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Events;