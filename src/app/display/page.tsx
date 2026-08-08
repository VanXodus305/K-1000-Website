"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, MapPin, User } from "lucide-react";
import { useSSEStream } from "../../hooks/useSSEStream";
import CubeBackground from "../../components/ui/CubeBackground";
import { PanelUpdatedPayload } from "../../types/admin";

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export default function DisplayPage() {
  const { status: sseStatus, lastPanelUpdate } = useSSEStream({
    apiUrl: API,
    authToken: "", // Public endpoint doesn't need token
  });

  const [activeCall, setActiveCall] = useState<PanelUpdatedPayload | null>(null);
  const [recentCalls, setRecentCalls] = useState<PanelUpdatedPayload[]>([]);
  const lastProcessedUpdate = React.useRef<string | null>(null);

  const fetchPanels = async () => {
    try {
      const res = await fetch(`${API}/api/panels`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const panels = data.data;
        const ongoing = panels.filter((p: any) => p.status === 'ongoing' && p.current_candidate_id);
        
        // Sort newest first
        ongoing.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        
        setRecentCalls(ongoing.slice(0, 10));

        if (ongoing.length > 0) {
          const newest = ongoing[0];
          const updateId = `${newest.id}-${newest.updated_at}`;
          
          if (lastProcessedUpdate.current === null) {
            // Initial load - don't trigger the active call popup, just set the initial state
            lastProcessedUpdate.current = updateId;
          } else if (lastProcessedUpdate.current !== updateId) {
            // A truly new update has arrived while the page is open!
            lastProcessedUpdate.current = updateId;
            setActiveCall(newest);
            
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
               try {
                 const candidateStr = newest.candidate_name ? `Candidate ${newest.candidate_name}` : `Candidate number ${newest.current_candidate_id}`;
                 const panelStr = newest.name.replace(/[^a-zA-Z0-9 ]/g, " ");
                 const msg = new SpeechSynthesisUtterance(`${candidateStr}, please report to ${panelStr}.`);
                 msg.rate = 0.85;
                 window.speechSynthesis.speak(msg);
               } catch (e) {
                 console.error("Failed to play audio chime", e);
               }
            }
            
            setTimeout(() => {
              setActiveCall(null);
            }, 12000);
          }
        }
      }
    } catch (e) {
      console.error("Display poll failed", e);
    }
  };

  useEffect(() => {
    fetchPanels();
    const interval = setInterval(fetchPanels, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (lastPanelUpdate && lastPanelUpdate.status === "ongoing" && lastPanelUpdate.current_candidate_id) {
      const updateId = `${lastPanelUpdate.id}-${lastPanelUpdate.updated_at}`;
      if (lastProcessedUpdate.current === updateId) return; // Already processed via poll
      
      lastProcessedUpdate.current = updateId;
      setActiveCall(lastPanelUpdate);
      setRecentCalls((prev) => {
        const filtered = prev.filter(c => c.current_candidate_id !== lastPanelUpdate.current_candidate_id);
        return [lastPanelUpdate, ...filtered].slice(0, 10);
      });
      
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
         try {
           const candidateStr = lastPanelUpdate.candidate_name ? `Candidate ${lastPanelUpdate.candidate_name}` : `Candidate number ${lastPanelUpdate.current_candidate_id}`;
           const panelStr = lastPanelUpdate.name.replace(/[^a-zA-Z0-9 ]/g, " ");
           const msg = new SpeechSynthesisUtterance(`${candidateStr}, please report to ${panelStr}.`);
           msg.rate = 0.85;
           window.speechSynthesis.speak(msg);
         } catch (e) {
           console.error("Failed to play audio chime", e);
         }
      }
      
      const timer = setTimeout(() => {
        setActiveCall(null);
      }, 12000);
      
      return () => clearTimeout(timer);
    }
  }, [lastPanelUpdate]);

  return (
    <div className="relative w-full min-h-screen bg-[#020202] text-white overflow-hidden flex flex-col cursor-default">
      <CubeBackground zIndex={0} disableLinesOnMobile={false} />
      
      {/* Header */}
      <header className="relative z-10 w-full px-8 py-6 md:px-12 md:py-8 flex justify-between items-center border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-4">
           <h1 className="font-['Conthrax',_sans-serif] text-xl md:text-3xl tracking-widest text-amber-400">K-1000 RECRUITMENT</h1>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full">
           <div className={`h-2.5 w-2.5 rounded-full ${sseStatus === 'Connected' ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} />
           <span className="font-['Orbitron',_sans-serif] text-xs tracking-widest text-white/70 uppercase">
             {sseStatus === 'Connected' ? 'System Online' : 'Connecting...'}
           </span>
        </div>
      </header>
      
      <main className="relative z-10 flex-1 flex flex-col p-8 md:p-12 gap-10">
        <AnimatePresence mode="wait">
          {activeCall ? (
            <motion.div
              key="active-call"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -50 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="flex-1 flex flex-col items-center justify-center text-center rounded-[40px] border border-amber-400/30 bg-amber-500/10 shadow-[0_0_100px_rgba(255,191,0,0.15)] backdrop-blur-2xl p-10"
            >
               <motion.div 
                 animate={{ rotate: [0, 15, -15, 0] }}
                 transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                 className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-400/50 mb-8 md:mb-10 shadow-[0_0_40px_rgba(255,191,0,0.4)]"
               >
                 <Megaphone size={48} className="text-amber-400 md:hidden" />
                 <Megaphone size={64} className="text-amber-400 hidden md:block" />
               </motion.div>
               
               <h2 className="font-['Orbitron',_sans-serif] text-2xl md:text-3xl tracking-[0.4em] uppercase text-amber-400/80 mb-6">Now Calling</h2>
               
               <h3 className="font-['Conthrax',_sans-serif] text-5xl md:text-7xl lg:text-8xl tracking-tight text-white mb-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] px-4">
                 {activeCall.candidate_name || `ID #${activeCall.current_candidate_id}`}
               </h3>
               
               <div className="flex items-center gap-4 md:gap-6 px-6 py-4 md:px-12 md:py-6 bg-black/50 border border-white/10 rounded-full">
                 <MapPin size={32} className="text-emerald-400" />
                 <span className="font-['Conthrax',_sans-serif] text-xl md:text-4xl tracking-wide text-emerald-400">
                   Proceed to {activeCall.name}
                 </span>
               </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
               <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                 <h2 className="font-['Conthrax',_sans-serif] text-3xl md:text-5xl text-white">Recently Called</h2>
                 <p className="font-['Orbitron',_sans-serif] text-sm md:text-base text-amber-400/80 tracking-widest uppercase">Please listen for your name</p>
               </div>
               
               {recentCalls.length === 0 ? (
                 <div className="flex-1 flex items-center justify-center border border-dashed border-white/10 rounded-[32px] bg-white/[0.02]">
                   <p className="font-['Orbitron',_sans-serif] text-xl text-white/30 uppercase tracking-widest text-center px-4">Waiting for candidates to be assigned...</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
                   {recentCalls.map((call, idx) => (
                     <motion.div 
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: idx * 0.1 }}
                       key={call.current_candidate_id} 
                       className="flex items-center justify-between p-6 md:p-8 rounded-[24px] border border-white/10 bg-white/[0.03] backdrop-blur-md"
                     >
                       <div className="flex items-center gap-5">
                         <div className="h-14 w-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                           <User size={24} className="text-white/60" />
                         </div>
                         <div className="overflow-hidden pr-4">
                           <p className="font-['Conthrax',_sans-serif] text-xl md:text-2xl text-white mb-1 truncate">
                             {call.candidate_name || `ID #${call.current_candidate_id}`}
                           </p>
                           <p className="font-['Orbitron',_sans-serif] text-[10px] md:text-xs text-white/40 tracking-widest uppercase truncate">
                             Assigned candidate
                           </p>
                         </div>
                       </div>
                       
                       <div className="flex flex-col items-end shrink-0">
                         <span className="font-['Conthrax',_sans-serif] text-lg md:text-xl text-emerald-400 mb-1 text-right">{call.name}</span>
                         <p className="font-['Orbitron',_sans-serif] text-[9px] md:text-[10px] text-white/30 uppercase tracking-widest text-right">
                           Proceed to panel
                         </p>
                       </div>
                     </motion.div>
                   ))}
                 </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
