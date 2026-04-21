"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap } from "lucide-react";

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

  useEffect(() => {
    NAV_ITEMS.forEach((key) => {
      const route = ROUTES[key];
      if (pathname !== route) {
        router.prefetch(route);
      }
    });
  }, [router, pathname]);

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
      <header className={`fixed top-0 left-0 w-full px-6 md:px-12 py-4 flex md:grid md:grid-cols-[1.5fr_auto_1fr] items-center justify-between z-[110] ${conthrax} bg-black/5 backdrop-blur-[4px] md:bg-transparent`}>
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 cursor-pointer"
          onClick={handleLogoClick}
        >
          <button className="hover:opacity-80 transition-opacity outline-none cursor-pointer">
            <img
              src="/k1000-logo.png"
              className="h-8 md:h-9 w-auto drop-shadow-[0_0_15px_#00f7ff]"
              alt="K-1000"
            />
          </button>
          
          <div className="h-4 w-[1px] bg-cyan-500/30 hidden xl:block" />
          <span className="text-[8px] tracking-[0.5em] text-cyan-500/50 hidden xl:block uppercase">EST. 2025</span>
        </motion.div>

        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex gap-1 bg-black/30 border border-white/5 p-1 rounded-full backdrop-blur-sm ml-auto mr-4 lg:mr-6 cursor-pointer"
        >
          {NAV_ITEMS.map((key) => (
            <button
              key={key}
              onClick={() => goTo(key)}
              className={`px-3 lg:px-4 py-1.5 text-[7px] lg:text-[8px] uppercase tracking-[0.2em] font-bold rounded-full transition-all duration-300 outline-none cursor-pointer
                ${getIsActive(key) 
                  ? "text-[#00f7ff] bg-cyan-500/10 shadow-[inset_0_0_10px_rgba(0,247,255,0.1)]" 
                  : "text-white/40 hover:text-[#00f7ff] hover:bg-white/5"
                }`}
            >
              {NAV_LABELS[key]}
            </button>
          ))}
        </motion.nav>

        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="flex items-center justify-end gap-4 md:gap-6 cursor-pointer"
        >
          <div className="text-right hidden xl:block">
            <p className="text-[8px] text-cyan-500/40 tracking-widest leading-none mb-1 uppercase">UPLINK</p>
            <p className="text-[10px] text-cyan-400 uppercase leading-none font-bold">HEALTHY</p>
          </div>
          <img src="/kiit-logo.png" className="h-10 md:h-12 w-auto object-contain" alt="KIIT" />
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden text-[#00f7ff] p-2 hover:bg-white/5 rounded-lg transition-colors outline-none cursor-pointer"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </motion.div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 250 }}
            className={`fixed inset-0 z-[120] bg-[#010103] flex flex-col md:hidden ${conthrax}`}
          >
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#00f7ff_1px,transparent_1px),linear-gradient(to_bottom,#00f7ff_1px,transparent_1px)] bg-[size:30px_30px]" />
            
            <div className="flex justify-between items-center px-6 py-5 border-b border-white/5 relative z-10 bg-black/20 backdrop-blur-md">
              <img src="/k1000-logo.png" className="h-6 w-auto" alt="Logo" />
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="p-2 bg-white/5 border border-white/10 rounded-full cursor-pointer"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-4 px-6 relative z-10">
              <nav className="flex flex-col gap-0.5">
                {NAV_ITEMS.map((key, index) => (
                  <motion.button
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    key={key}
                    onClick={() => goTo(key)}
                    className="group flex items-center justify-between py-4 border-b border-white/5 outline-none cursor-pointer"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <span className={`text-[9px] tracking-[0.2em] font-bold ${getIsActive(key) ? "text-cyan-400" : "text-white/20"}`}>
                        0{index + 1}
                      </span>
                      <span className={`text-lg uppercase tracking-widest font-bold transition-all ${getIsActive(key) ? "text-cyan-400 translate-x-1" : "text-white/80 hover:text-cyan-400"}`}>
                        {NAV_LABELS[key]}
                      </span>
                    </div>
                    {getIsActive(key) && (
                      <motion.div layoutId="activeArrow" className="text-cyan-400">
                        <Zap size={14} fill="currentColor" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </nav>
            </div>

            <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-xl">
              <div className="flex justify-between items-center text-[7px] tracking-[0.2em] text-white/30 uppercase font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
                  <span>UPLINK: ACTIVE</span>
                </div>
                <span>VERSION 2.0.0</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}