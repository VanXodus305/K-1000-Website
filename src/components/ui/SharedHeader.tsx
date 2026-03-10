"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

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

  // PRODUCTION OPTIMIZATION: Background Module Sync
  // This fetches the code for all other pages as soon as the system initializes.
  useEffect(() => {
    NAV_ITEMS.forEach((key) => {
      const route = ROUTES[key];
      // Skip prefetching the current page
      if (pathname !== route) {
        router.prefetch(route);
      }
    });
  }, [router, pathname]);

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
      <header className={`fixed top-0 left-0 w-full px-6 md:px-12 py-6 md:py-8 flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between z-[110] ${conthrax} bg-black/10 backdrop-blur-sm md:bg-transparent`}>
        
        {/* Left Section: Logo & EST. Tag */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <button onClick={handleLogoClick} className="hover:opacity-80 transition-opacity outline-none">
            <img
              src="/k1000-logo.png"
              className="h-8 md:h-10 w-auto drop-shadow-[0_0_15px_#00f7ff]"
              alt="K-1000"
            />
          </button>
          
          <div className="h-4 w-[1px] bg-cyan-500/30 hidden xl:block" />
          <span className="text-[8px] tracking-[0.5em] text-cyan-500/50 hidden xl:block uppercase">EST. 2025</span>
        </motion.div>

        {/* Center: Desktop Nav */}
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

        {/* Right Section: System Status & KIIT Logo */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="flex items-center justify-end gap-4 md:gap-6"
        >
          <div className="text-right hidden xl:block">
            <p className="text-[8px] text-cyan-500/40 tracking-widest leading-none mb-1 uppercase">UPLINK</p>
            <p className="text-[10px] text-cyan-400 uppercase leading-none font-bold">HEALTHY</p>
          </div>
          <img src="/kiit-logo.png" className="h-10 md:h-14 w-auto object-contain" alt="KIIT" />
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden text-[#00f7ff] p-2 hover:bg-white/5 rounded-lg transition-colors outline-none"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </motion.div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[120] bg-black flex flex-col md:hidden ${conthrax}`}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#00f7ff03_1px,transparent_1px),linear-gradient(to_bottom,#00f7ff03_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="relative z-10 flex flex-col h-full p-8">
              <div className="flex justify-between items-center mb-12">
                <button onClick={handleLogoClick} className="outline-none">
                  <img src="/k1000-logo.png" className="h-8 w-auto" alt="Logo" />
                </button>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 border border-cyan-500/20 rounded-full">
                  <X size={28} className="text-[#00f7ff]" />
                </button>
              </div>
              <nav className="flex flex-col gap-6 overflow-y-auto">
                {NAV_ITEMS.map((key, index) => (
                  <motion.button
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.04 }}
                    key={key}
                    onClick={() => goTo(key)}
                    className={`text-2xl xs:text-3xl uppercase tracking-tighter font-black text-left outline-none py-2
                      ${getIsActive(key) 
                        ? "text-[#00f7ff] translate-x-4 drop-shadow-[0_0_10px_rgba(0,247,255,0.5)]" 
                        : "text-white/20 hover:text-white/40"
                      }`}
                  >
                    {NAV_LABELS[key]}
                  </motion.button>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}