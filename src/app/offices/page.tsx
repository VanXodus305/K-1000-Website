"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Building2, Cpu, Palette, Handshake, Globe, FileText } from "lucide-react";
import SharedHeader from "../../components/ui/SharedHeader";
import Footer from "../../components/footer/Footer";
import CubeBackground from "../../components/ui/CubeBackground";

const conthrax = "font-['Conthrax',_sans-serif]";
const orbitron = "font-['Orbitron',_sans-serif]";

const iconMap: Record<string, React.ReactNode> = {
  osg: <Building2 size={14} />,
  oti: <Cpu size={14} />,
  ocd: <Palette size={14} />,
  opcr: <Handshake size={14} />,
  oca: <Globe size={14} />,
  occ: <FileText size={14} />,
};

const officeImages = [
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1600",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600",
  "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1600",
  "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=1600",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1600",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1600",
];

const offices = [
  {
    key: "osg",
    short: "OSG",
    title: "Office of Strategy & Growth",
    tag: "Strategic Operations & Planning",
    description: "Office of Strategy and Growth is the Driving Force that transforms K-1000's vision into measurable results. As the core unit overseeing key organizational functions, we manage operations, coordinate major projects, and ensure consistent excellence across all initiatives. Acting as the central link between teams, we translate strategic goals into actionable outcomes.",
  },
  {
    key: "oti",
    short: "OTI",
    title: "Office of Technology & Innovation",
    tag: "Technical Finance & Development",
    description: "The Office of Technology and Innovation is the hub for Technical Finance and Development, the pivotal point where cash and technology intersect. OTI makes strategic use of funds for both central and collaborative projects to achieve maximum technical effect. We offer practical exposure during all stages of projects, from development through debugging and system upgrades.",
  },
  {
    key: "ocd",
    short: "OCD",
    title: "Office of Creativity & Design",
    tag: "Visual Identity & Brand Design",
    description: "Office of Creativity and Design is the Creative Architect of the K-1000 brand. OCD is the central visual unit, responsible for managing all aesthetic standards, visual identity, and design activities across every digital and physical platform. Our mission is to ensure K-1000's message is not just seen, but felt.",
  },
  {
    key: "opcr",
    short: "OPCR",
    title: "Office of Public & Corporate Relations",
    tag: "Sponsorships & External Relations",
    description: "OPCR is the organization's primary external interface, responsible for securing high-value sponsorships and strategically enriching the K-1000 alumni network. The team acts as the architects of K-1000's external reputation and financial support system.",
  },
  {
    key: "oca",
    short: "OCA",
    title: "Office of Campus Ambassadors",
    tag: "Outreach & Grassroots Engagement",
    description: "Campus Ambassadors are the Frontline Evangelists for K-1000, responsible for generating enthusiasm and organizational awareness in schools across the entire region. This role provides essential training in high-impact communication and grassroots relationship management.",
  },
  {
    key: "occ",
    short: "OCC",
    title: "Office of Content & Communication",
    tag: "Documentation & Internal Comms",
    description: "The Office of Communication & Content is the central communication and documentation hub of K-1000. It is responsible for maintaining the voice, tone, and consistency of all official communications. The branch manages documentation, MoUs, event agendas, result reports, social media content, and formal correspondence, while ensuring that all communication aligns with K-1000's objectives and standards.",
  },
].map((o, i) => ({ ...o, image: officeImages[i] || officeImages[0], icon: iconMap[o.key] || <Building2 size={14} /> }));

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
              <img src={activeOffice.image} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="Hero" />
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
              <div ref={navRef} className="flex lg:sticky lg:top-24 lg:flex-col overflow-x-auto overscroll-x-contain lg:overflow-visible bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[32px] p-2 pr-5 lg:pr-2 gap-1 mobile-nav-scroll lg:self-start">
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
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                      {activeOffice.icon}
                    </div>
                    <span className={`${orbitron} text-[10px] tracking-[0.3em] text-cyan-400/60 uppercase font-black`}>{activeOffice.short}</span>
                  </div>
                  <p className="text-white/60 leading-relaxed text-sm md:text-base mb-10">{activeOffice.description}</p>

                  <h4 className={`${conthrax} text-[10px] text-white/30 uppercase mb-6`}>Office Leadership</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {["Director", "Deputy Director"].map((title, i) => (
                      <div key={i} className="flex flex-col gap-4">
                        <p className="text-[10px] uppercase text-white/40">{title}</p>
                        <div className="w-full aspect-square md:aspect-auto md:h-72 rounded-2xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center text-white/10">
                          <span className={`${conthrax} text-xs`}>TBD</span>
                        </div>
                        <p className={`${conthrax} text-sm text-white/40`}>TBD</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
        <Footer />
      </div>
      <style jsx global>{`
        .mobile-nav-scroll::-webkit-scrollbar { display: none; }
        .mobile-nav-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
