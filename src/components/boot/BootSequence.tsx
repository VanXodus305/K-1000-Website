"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SystemCanvas from "../../app/home/page";

const conthrax = "font-['Conthrax',_sans-serif]";

export default function BootSequence() {
  // Use "initializing" as a middle ground to prevent UI jumps
  const [stage, setStage] = useState<"charging" | "ready" | "initializing">("initializing");
  const [status, setStatus] = useState("CORE_STANDBY");

  useEffect(() => {
    // Check if we've already booted in this session
    const hasBooted = sessionStorage.getItem("k1000_system_booted");

    if (hasBooted) {
      setStage("ready");
    } else {
      setStage("charging");
    }
  }, []);

  useEffect(() => {
    if (stage === "charging") {
      const statusSequence = [
        { t: 400, msg: "CORE POWER STABLE" },
        { t: 1500, msg: "INTERFACE SYNC" },
        { t: 2800, msg: "HANDSHAKE COMPLETE" },
      ];
      statusSequence.forEach(step => {
        const timeout = setTimeout(() => setStatus(step.msg), step.t);
        return () => clearTimeout(timeout);
      });
    }
  }, [stage]);

  const completeBoot = () => {
    sessionStorage.setItem("k1000_system_booted", "true");
    setTimeout(() => setStage("ready"), 800);
  };

  // Prevent rendering anything until we know the session state to avoid laggy flashes
  if (stage === "initializing") return <div className="bg-black min-h-screen" />;

  return (
    <div className="bg-black min-h-screen">
      <AnimatePresence mode="wait">
        {stage === "charging" ? (
          <motion.div
            key="boot-loader"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              scale: 1.05,
              filter: "blur(20px)"
            }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className={`fixed inset-0 flex flex-col items-center justify-center bg-[#020202] z-[9999] overflow-hidden ${conthrax} select-none`}
          >
            {/* 1. ARCHITECTURAL BACKGROUND */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f7ff05_1px,transparent_1px),linear-gradient(to_bottom,#00f7ff05_1px,transparent_1px)] bg-[size:100px_100px]" />
              <motion.div 
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,247,255,0.03)_0%,transparent_80%)]" 
              />
            </div>

            {/* 2. THE SQUARE PRECISION MODULE */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative flex items-center justify-center">
                <motion.div 
                  initial={{ width: 320, height: 320, opacity: 0 }}
                  animate={{ width: 240, height: 240, opacity: 1 }}
                  transition={{ duration: 2, ease: "circOut" }}
                  className="absolute flex items-center justify-center border border-[#00f7ff]/10"
                >
                  <div className="absolute -top-[1px] -left-[1px] w-5 h-5 border-t-[2px] border-l-[2px] border-[#00f7ff]/40" />
                  <div className="absolute -top-[1px] -right-[1px] w-5 h-5 border-t-[2px] border-r-[2px] border-[#00f7ff]/40" />
                  <div className="absolute -bottom-[1px] -left-[1px] w-5 h-5 border-b-[2px] border-l-[2px] border-[#00f7ff]/40" />
                  <div className="absolute -bottom-[1px] -right-[1px] w-5 h-5 border-b-[2px] border-r-[2px] border-[#00f7ff]/40" />
                </motion.div>

                <motion.img
                  src="/k1000-small.png"
                  alt="K-1000"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="w-40 h-auto brightness-110 drop-shadow-[0_0_20px_rgba(0,247,255,0.2)]"
                />

                <motion.div 
                   animate={{ opacity: [0.1, 0.2, 0.1] }}
                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute inset-0 bg-[#00f7ff] filter blur-[60px] -z-10"
                />
              </div>

              {/* 3. SMOOTH PROGRESS INTERFACE */}
              <div className="mt-36 flex flex-col items-center">
                <div className="w-64 h-[2px] bg-white/5 relative">
                  <motion.div
                    className="absolute left-0 top-0 h-full bg-[#00f7ff] shadow-[0_0_15px_#00f7ff]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3.5, ease: [0.4, 0, 0.2, 1] }}
                    onAnimationComplete={completeBoot}
                  />
                </div>

                <div className="mt-12 flex flex-col items-center gap-4">
                    <motion.div 
                        key={status}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] text-white/90 font-bold tracking-[0.5em]"
                    >
                        {status}
                    </motion.div>
                    
                    <div className="flex gap-2">
                       {[...Array(4)].map((_, i) => (
                         <motion.div 
                           key={i}
                           animate={{ opacity: [0.1, 0.5, 0.1] }}
                           transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                           className="w-3 h-[2px] bg-[#00f7ff]/60" 
                         />
                       ))}
                    </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="system-interface"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          >
            <SystemCanvas />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}