"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Cpu, Globe, Zap } from "lucide-react";

export const ROUTES = {
  home: "/",
  about: "/about",
  benefits: "/benefits",
  branches: "/branches",
  departments: "/departments",
  events: "/events",
  apply: "/apply",
  contact: "/contact",
} as const;

export type NavKey = keyof typeof ROUTES;

const NAV_ITEMS: NavKey[] = ["home", "about", "benefits", "branches", "departments", "events", "apply", "contact"];

const NAV_LABELS: Record<NavKey, string> = {
  home: "Home", 
  about: "About", 
  benefits: "Benefits", 
  branches: "Branches",
  departments: "Departments", 
  events: "Events", 
  apply: "Apply", 
  contact: "Contact",
};

const conthrax = "font-['Conthrax',_sans-serif]";

export default function SharedHeader() {
  const router = useRouter();
  const pathname = usePathname(); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync route prefetching
  useEffect(() => {
    NAV_ITEMS.forEach((key) => {
      const route = ROUTES[key];
      if (pathname !== route) {
        router.prefetch(route);
      }
    });
  }, [router, pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const getIsActive = (key: NavKey) => pathname === ROUTES[key];

  const goTo = (key: NavKey) => {
    setIsMobileMenuOpen(false);
    router.push(ROUTES[key]);
  };

  const handleLogoClick = () => {
    setIsMobileMenuOpen(false);
    router.push(ROUTES.home);
  };

  return (
    <>
      {/* ─── MAIN HEADER ─── */}
      <header className={`fixed top-0 left-0 w-full px-5 md:px-12 py-4 md:py-8 flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between z-[110] ${conthrax} bg-black/40 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border-b border-white/5 lg:border-none`}>
        
        {/* Left: Logo */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <button onClick={handleLogoClick} className="hover:opacity-80 transition-opacity outline-none">
            <img
              src="/k1000-logo.png"
              className="h-7 md:h-10 w-auto drop-shadow-[0_0_10px_#00f7ff]"
              alt="K-1000"
            />
          </button>
          <div className="h-4 w-[1px] bg-cyan-500/30 hidden xl:block" />
          <span className="text-[8px] tracking-[0.5em] text-cyan-500/50 hidden xl:block uppercase">EST. 2025</span>
        </motion.div>

        {/* Center: Desktop Nav (Hidden on Mobile) */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex gap-1 bg-black/40 border border-white/5 p-1 rounded-full backdrop-blur-md"
        >
          {NAV_ITEMS.map((key) => (
            <button
              key={key}
              onClick={() => goTo(key)}
              className={`px-3 lg:px-4 py-2 text-[7px] lg:text-[8px] uppercase tracking-[0.2em] font-bold rounded-full transition-all duration-300 outline-none
                ${getIsActive(key) 
                  ? "text-[#00f7ff] bg-cyan-500/10 shadow-[inset_0_0_10px_rgba(0,247,255,0.1)]" 
                  : "text-white/40 hover:text-[#00f7ff] hover:bg-white/5"
                }`}
            >
              {NAV_LABELS[key]}
            </button>
          ))}
        </motion.nav>

        {/* Right Section: Mobile Toggle & KIIT Logo */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="flex items-center justify-end gap-3 md:gap-6"
        >
          <img src="/kiit-logo.png" className="h-8 md:h-14 w-auto object-contain opacity-80 md:opacity-100" alt="KIIT" />
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden text-[#00f7ff] p-2 bg-cyan-500/5 border border-cyan-500/20 rounded-lg transition-all active:scale-90 outline-none"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </motion.div>
      </header>

      {/* ─── MOBILE NAVIGATION OVERLAY ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed inset-0 z-[120] bg-[#010103] flex flex-col md:hidden ${conthrax}`}
          >
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#00f7ff_1px,transparent_1px),linear-gradient(to_bottom,#00f7ff_1px,transparent_1px)] bg-[size:30px_30px]" />
            
            {/* Header in Overlay */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-white/5 relative z-10 bg-black/20 backdrop-blur-md">
              <img src="/k1000-logo.png" className="h-7 w-auto" alt="Logo" />
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="p-2 bg-white/5 border border-white/10 rounded-full"
              >
                <X size={22} className="text-white" />
              </button>
            </div>

            {/* Nav Links Container */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-10 px-8 relative z-10">
              <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map((key, index) => (
                  <motion.button
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    key={key}
                    onClick={() => goTo(key)}
                    className="group flex items-center justify-between py-5 border-b border-white/5 outline-none"
                  >
                    <div className="flex flex-col text-left">
                      <span className={`text-[10px] tracking-[0.3em] mb-1 ${getIsActive(key) ? "text-cyan-400" : "text-white/20"}`}>
                        0{index + 1}
                      </span>
                      <span className={`text-2xl uppercase tracking-tighter font-black transition-all ${getIsActive(key) ? "text-cyan-400 translate-x-2" : "text-white hover:text-cyan-400"}`}>
                        {NAV_LABELS[key]}
                      </span>
                    </div>
                    {getIsActive(key) && (
                      <motion.div layoutId="activeArrow" className="text-cyan-400">
                        <Zap size={20} fill="currentColor" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </nav>
            </div>

            {/* Footer in Overlay (The Terminal Feel) */}
            <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-xl flex flex-col gap-4">
              <div className="flex justify-between items-center text-[8px] tracking-[0.2em] text-white/30 uppercase">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  <span>UPLINK: ACTIVE</span>
                </div>
                <span>V2.6.0-STABLE</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-white/[0.03] rounded-lg border border-white/5 flex items-center gap-3">
                  <Cpu size={14} className="text-cyan-500/50" />
                  <div className="flex flex-col">
                    <span className="text-[6px] text-white/20 uppercase">Core</span>
                    <span className="text-[8px] text-white/60">HEAL-01</span>
                  </div>
                </div>
                <div className="p-3 bg-white/[0.03] rounded-lg border border-white/5 flex items-center gap-3">
                  <Globe size={14} className="text-cyan-500/50" />
                  <div className="flex flex-col">
                    <span className="text-[6px] text-white/20 uppercase">Region</span>
                    <span className="text-[8px] text-white/60">BBS-IN</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}