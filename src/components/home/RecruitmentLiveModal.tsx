"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";

const conthrax = "font-['Conthrax',_sans-serif]";
const orbitron = "font-['Orbitron',_sans-serif]";
export default function RecruitmentLiveModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setIsVisible(true));
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
            className="relative w-full max-w-[600px] overflow-hidden rounded-[28px] border border-amber-300/25 bg-[#020707]/95 p-5 text-left text-white shadow-[0_0_80px_rgba(245, 174, 55,0.16)] sm:rounded-[32px] sm:p-8"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.45, ease: "circOut" }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245, 174, 55,0.16),transparent_42%),linear-gradient(90deg,rgba(245, 174, 55,0.05)_1px,transparent_1px),linear-gradient(rgba(245, 174, 55,0.05)_1px,transparent_1px)] bg-[size:auto,54px_54px,54px_54px] pointer-events-none" />
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
            <motion.div
              className="absolute inset-x-8 top-8 h-24 rounded-full bg-amber-400/10 blur-3xl"
              animate={{ opacity: [0.35, 0.7, 0.35] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />

            <button
              type="button"
              onClick={dismissNotice}
              aria-label="Close recruitment notice"
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white transition-all hover:border-amber-300/35 hover:text-amber-200"
            >
              <X size={16} />
            </button>

            <div className="relative z-10">
              <div className="flex items-start gap-4 pr-10">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[24px] border border-amber-300/20 bg-black/45 shadow-[inset_0_0_26px_rgba(245, 174, 55,0.08),0_0_36px_rgba(245, 174, 55,0.12)] sm:h-28 sm:w-28 sm:rounded-[28px]">
                <img
                  src="/k1000-small.png"
                  alt="K-1000"
                  className="h-16 w-auto brightness-110 drop-shadow-[0_0_16px_rgba(245, 174, 55,0.35)] sm:h-20"
                />
                </div>
                <div className="min-w-0 pt-1">
                  <h2 id="recruitment-live-title" className={`${conthrax} mt-3 max-w-[420px] text-xl uppercase leading-[1.12] tracking-tight text-white sm:text-3xl`}>
                    Ignithon 2.0 registration is live
                  </h2>
                </div>
              </div>

              <p className="mt-6 max-w-[500px] text-sm leading-relaxed text-white sm:text-base">
                Register your team, receive your Team ID, and manage your participant roster from the Ignithon 2.0 portal.
              </p>

              <div className="mt-6 rounded-[20px] border border-amber-300/18 bg-amber-400/[0.045] px-4 py-4 sm:px-5">
                <p className={`${orbitron} text-[9px] uppercase tracking-[0.28em] text-white`}>Event date</p>
                <p className={`${conthrax} mt-2 text-lg uppercase tracking-[0.08em] text-amber-200 sm:text-xl`}>
                  26th September 2026
                </p>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/events/ignithon2.0"
                  onClick={dismissNotice}
                  className={`${conthrax} inline-flex min-h-12 items-center justify-center rounded-full border border-amber-300 bg-amber-300 px-6 py-3 text-[10px] uppercase tracking-[0.22em] text-black transition-all hover:border-white hover:bg-white`}
                >
                  Register Now
                </Link>
                <button type="button" onClick={dismissNotice} className={`${conthrax} min-h-12 rounded-full border border-white/10 px-6 py-3 text-[10px] uppercase tracking-[0.22em] text-white transition-all hover:border-amber-300/35 hover:text-amber-100`}>
                  Continue browsing
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
