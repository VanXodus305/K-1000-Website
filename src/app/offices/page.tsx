"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Layers, Target } from "lucide-react";
import SharedHeader from "../../components/ui/SharedHeader";
import Footer from "../../components/footer/Footer";
import CubeBackground from "../../components/ui/CubeBackground";
import { offices } from "../../data/offices";

const conthrax = "font-['Conthrax',_sans-serif]";
const orbitron = "font-['Orbitron',_sans-serif]";

export default function OfficesPage() {
  const [activeTab, setActiveTab] = useState(offices[0].key);
  const navRef = useRef<HTMLDivElement>(null);
  const activeOffice = offices.find((o) => o.key === activeTab)!;

  useEffect(() => {
    if (navRef.current) {
      const activeBtn = navRef.current.querySelector(`[data-key="${activeTab}"]`) as HTMLElement;
      if (activeBtn) {
        navRef.current.scrollTo({
          left: activeBtn.offsetLeft - navRef.current.clientWidth / 2 + activeBtn.clientWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col w-full bg-[#020202] text-white min-h-screen relative cursor-default">
      <CubeBackground zIndex={0} disableLinesOnMobile />
      <div className="relative z-10">
        <SharedHeader />

        <main className="max-w-[1600px] mx-auto pt-32 pb-20 px-4 md:px-10">
          <section className="w-full mb-12 md:mb-20">
            <div className="relative w-full h-64 md:h-[350px] rounded-[40px] overflow-hidden border border-white/10 bg-black">
              <img
                src={activeOffice.image}
                className="absolute inset-0 h-full w-full object-cover opacity-40"
                alt=""
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 opacity-35"
                style={{
                  background: `radial-gradient(circle at 78% 22%, ${activeOffice.accentColor}55, transparent 34%), linear-gradient(135deg, ${activeOffice.baseColor}55, transparent 62%)`,
                }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,247,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,247,255,0.04)_1px,transparent_1px)] bg-[size:42px_42px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-transparent" />
              <div className="relative z-10 flex flex-col justify-end p-6 md:p-12 h-full">
                <span className="text-cyan-400 text-[10px] tracking-[0.3em] uppercase mb-2 font-bold">{activeOffice.tag}</span>
                <h1 className={`${conthrax} text-2xl sm:text-4xl md:text-6xl tracking-tighter uppercase font-black leading-tight`}>
                  {activeOffice.title}
                </h1>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
            <div className="lg:col-span-4 z-30">
              <div ref={navRef} className="flex lg:sticky lg:top-24 lg:flex-col overflow-x-auto overscroll-x-contain lg:overflow-visible bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[32px] p-2 pr-5 lg:pr-2 gap-1 lg:self-start [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {offices.map((o) => (
                  <button
                    key={o.key}
                    data-key={o.key}
                    onClick={() => setActiveTab(o.key)}
                    className={`flex-shrink-0 last:mr-1 lg:w-full w-[220px] text-left px-6 py-5 rounded-[24px] transition-all duration-500 group relative overflow-hidden cursor-pointer ${
                      activeTab === o.key ? "bg-cyan-500/10 border border-cyan-500/40" : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    {activeTab === o.key && <motion.div layoutId="activeGlow" className="absolute inset-0 bg-cyan-500/5 blur-xl" />}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className={`${orbitron} text-[8px] tracking-widest font-black ${activeTab === o.key ? "text-cyan-400" : "text-white/20"}`}>{o.short}</span>
                        <span className={`${conthrax} text-[11px] md:text-xs text-white uppercase tracking-wider font-black group-hover:text-cyan-300 transition-colors`}>{o.title}</span>
                      </div>
                      <ChevronRight size={14} className={`hidden lg:block transition-transform duration-300 ${activeTab === o.key ? "text-cyan-400" : "text-white/10"}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "circOut" }}
                  className="p-8 md:p-10 rounded-[32px] bg-white/[0.03] backdrop-blur-xl border border-white/10"
                >
                  <p className="text-lg md:text-xl text-white/90 italic mb-8 border-l-2 border-cyan-500 pl-4">&quot;{activeOffice.overview}&quot;</p>
                  <p className="text-white/60 leading-relaxed mb-10 text-sm md:text-base">{activeOffice.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-y border-white/10 py-8">
                    <div>
                      <h4 className={`${conthrax} text-[10px] text-white/30 uppercase mb-4`}>Focus Areas</h4>
                      {activeOffice.focusAreas.map((area) => (
                        <div key={area} className="text-sm mb-2 text-white/70 flex items-center gap-2">
                          <Layers size={14} className="text-cyan-500" /> {area}
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className={`${conthrax} text-[10px] text-white/30 uppercase mb-4`}>Core Outcomes</h4>
                      {activeOffice.outcomes.map((outcome) => (
                        <div key={outcome} className="text-sm mb-2 text-white/70 flex items-center gap-2">
                          <Target size={14} className="text-emerald-500" /> {outcome}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
