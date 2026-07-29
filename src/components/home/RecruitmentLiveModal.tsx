"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";

const conthrax = "font-['Conthrax',_sans-serif]";
const orbitron = "font-['Orbitron',_sans-serif]";
const RECRUITMENT_NOTICE_KEY = "k1000-recruitment-live-notice-seen-2026";

export default function RecruitmentLiveModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(RECRUITMENT_NOTICE_KEY)) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isVisible]);

  const dismissNotice = () => {
    try {
      window.localStorage.setItem(RECRUITMENT_NOTICE_KEY, "true");
    } catch {
      // Storage can fail in private mode; closing should still work.
    }
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/72 px-4 py-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="recruitment-live-title"
            className="relative w-full max-w-[520px] overflow-hidden rounded-[30px] border border-cyan-300/25 bg-[#020707]/92 p-5 text-center text-white shadow-[0_0_80px_rgba(0,247,255,0.16)] sm:p-7"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.45, ease: "circOut" }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,247,255,0.16),transparent_42%),linear-gradient(90deg,rgba(0,247,255,0.05)_1px,transparent_1px),linear-gradient(rgba(0,247,255,0.05)_1px,transparent_1px)] bg-[size:auto,54px_54px,54px_54px] pointer-events-none" />
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
            <motion.div
              className="absolute inset-x-8 top-8 h-24 rounded-full bg-cyan-400/10 blur-3xl"
              animate={{ opacity: [0.35, 0.7, 0.35] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />

            <button
              type="button"
              onClick={dismissNotice}
              aria-label="Close recruitment notice"
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/45 transition-all hover:border-cyan-300/35 hover:text-cyan-200"
            >
              <X size={16} />
            </button>

            <div className="relative z-10">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[26px] border border-cyan-300/20 bg-black/45 shadow-[inset_0_0_26px_rgba(0,247,255,0.08),0_0_36px_rgba(0,247,255,0.12)]">
                <img
                  src="/k1000-small.png"
                  alt="K-1000"
                  className="h-16 w-auto brightness-110 drop-shadow-[0_0_16px_rgba(0,247,255,0.35)]"
                />
              </div>

              <h2 id="recruitment-live-title" className={`${conthrax} mt-6 text-2xl uppercase tracking-tight text-white sm:text-4xl`}>
                Recruitment Is Live
              </h2>

              <div className="mt-6 rounded-[22px] border border-cyan-300/18 bg-cyan-400/[0.045] px-4 py-4">
                <p className={`${orbitron} text-[9px] uppercase tracking-[0.28em] text-white/32`}>Recruitment Dates</p>
                <p className={`${conthrax} mt-2 text-lg uppercase tracking-[0.08em] text-cyan-200 sm:text-xl`}>
                  8th & 9th August 2026
                </p>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link
                  href="/register"
                  onClick={dismissNotice}
                  className={`${conthrax} rounded-full border border-cyan-300 bg-cyan-300 px-5 py-3 text-[10px] uppercase tracking-[0.26em] text-black transition-all hover:bg-white hover:border-white`}
                >
                  Register Now
                </Link>
                <button
                  type="button"
                  onClick={dismissNotice}
                  className={`${conthrax} rounded-full border border-white/12 bg-white/[0.025] px-5 py-3 text-[10px] uppercase tracking-[0.26em] text-white/55 transition-all hover:border-cyan-300/40 hover:text-cyan-100`}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
