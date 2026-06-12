"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Shield, ChevronRight, X, Cpu, Layers } from "lucide-react";
import { leadership, type LeadershipMember } from "../../data/leadership";
import type { K1000DomainWithApplyLink } from "../../data/domain";
import { findLeadershipPair } from "../../lib/leadership-utils";

const conthrax = "font-['Conthrax',_sans-serif]";

export default function DomainHoloPanel({
  domain,
  onClose,
}: {
  domain: K1000DomainWithApplyLink;
  onClose: () => void;
}) {
  const isInternshipPanel = domain.key === "internship";

  useEffect(() => {
    const scrollY = window.scrollY;
    const isMobile = window.innerWidth < 1024;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;
    const previousBodyTouchAction = document.body.style.touchAction;

    if (isMobile) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.touchAction = "none";
    }

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      document.body.style.touchAction = previousBodyTouchAction;
      if (isMobile) {
        window.scrollTo(0, scrollY);
      }
    };
  }, []);

  const handleClose = () => {
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: -5000,
      clientY: -5000,
    });
    window.dispatchEvent(mouseEvent);
    onClose();
  };
  const { primaryLeader, secondaryLeader } = useMemo(() => {
    return findLeadershipPair(leadership.hierarchy, domain.title);
  }, [domain.title]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center md:p-8 p-0 overscroll-none touch-none"
    >
      <div
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
        onClick={handleClose}
      />

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`relative w-full max-w-6xl h-full bg-[#050505] border-t md:border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col md:flex-row overscroll-contain ${
          isInternshipPanel ? "md:h-[86vh]" : "md:h-[82vh]"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 md:top-6 md:right-8 p-2 md:p-3 group flex items-center gap-3 border border-white/10 hover:border-white/20 transition-all z-[210] bg-black/50 backdrop-blur-md rounded-full"
        >
          <X className="text-white/60 group-hover:text-white" size={16} />
        </button>

        {/* LEFT Sidebar */}
        <div className="w-full md:w-[280px] lg:w-[320px] border-b md:border-b-0 md:border-r border-white/5 bg-black flex flex-col shrink-0">
          <div className={`border-b border-white/5 pr-14 md:pr-6 ${isInternshipPanel ? "p-4 md:p-5" : "p-5 md:p-6"}`}>
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <Shield size={10} className="text-cyan-500" />
              <span className={`${conthrax} text-[7px] md:text-[9px] text-cyan-500 tracking-[0.3em] font-black uppercase`}>
                Leadership
              </span>
            </div>
            <h1 className={`${conthrax} text-white uppercase leading-tight tracking-tighter font-black ${
              isInternshipPanel
                ? "text-base md:text-[1.05rem] min-h-[2.9rem] md:min-h-[3.2rem]"
                : "text-lg md:text-xl min-h-[3.1rem] md:min-h-[3.6rem]"
            }`}>
              {domain.title}
            </h1>
          </div>

          <div
            data-lenis-prevent
            className="flex md:flex-col overflow-x-auto md:overflow-y-auto p-4 md:p-5 gap-3 md:gap-6 custom-scroll scrollbar-hide"
          >
            <div className="min-w-[140px] flex-1 md:min-w-full">
              <h3 className={`${conthrax} text-[7px] md:text-[9px] text-white/30 tracking-[0.2em] uppercase mb-2 font-black`}>
                {primaryLeader?.position || "Senior Executive Lead"}
              </h3>
              {primaryLeader ? <LeaderCard leader={primaryLeader} /> : <EmptySlot label="TBD" />}
            </div>
            <div className="min-w-[140px] flex-1 md:min-w-full">
              <h3 className={`${conthrax} text-[7px] md:text-[9px] text-white/30 tracking-[0.2em] uppercase mb-2 font-black`}>
                {secondaryLeader?.position || "Junior Executive Lead"}
              </h3>
              {secondaryLeader ? <LeaderCard leader={secondaryLeader} /> : <EmptySlot label="TBD" />}
            </div>
          </div>
        </div>

        {/* RIGHT - Content Area */}
        <div
          data-lenis-prevent
          className={`flex-1 overflow-y-auto bg-[#020202] relative custom-scroll ${
            isInternshipPanel ? "p-5 md:p-9 lg:p-10" : "p-6 md:p-12 lg:p-14"
          }`}
        >
          <div className={`max-w-3xl pb-12 md:pb-0 ${isInternshipPanel ? "space-y-6 md:space-y-8" : "space-y-8 md:space-y-12"}`}>
            <section className={isInternshipPanel ? "space-y-3 md:space-y-4" : "space-y-4 md:space-y-6"}>
              <div className="flex items-center gap-4">
                <Cpu size={14} className="text-cyan-500" />
                <h2 className={`${conthrax} text-[8px] md:text-[10px] tracking-[0.4em] text-cyan-500 uppercase font-black`}>
                  Domain Overview
                </h2>
              </div>
              <p className={`text-white/80 font-light border-l border-cyan-500/20 ${
                isInternshipPanel
                  ? "text-xs md:text-base leading-relaxed pl-4 md:pl-5"
                  : "text-xs md:text-lg leading-relaxed pl-4 md:pl-6"
              }`}>
                {domain.overview}
              </p>
            </section>

            {domain.focusAreas && (
              <section>
                <h2 className={`${conthrax} text-[8px] md:text-[10px] tracking-[0.4em] text-white/30 uppercase mb-4 font-black`}>
                  Focus Areas
                </h2>
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${isInternshipPanel ? "gap-2" : "gap-2 md:gap-3"}`}>
                  {domain.focusAreas.map((area, i) => (
                    <div
                      key={i}
                      className={`bg-white/[0.02] border border-white/5 flex items-center hover:border-cyan-500/30 transition-all group ${
                        isInternshipPanel ? "p-3 gap-3" : "p-3 md:p-4 gap-3 md:gap-4"
                      }`}
                    >
                      <Layers size={10} className="text-cyan-500/40 group-hover:text-cyan-500 transition-colors" />
                      <span className={`${conthrax} text-[8px] md:text-[10px] text-white/70 uppercase tracking-[0.15em] font-black`}>
                        {area}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className={`bg-white/[0.01] border border-white/5 rounded-2xl relative ${isInternshipPanel ? "p-4 md:p-5" : "p-5 md:p-6"}`}>
              <h2 className={`${conthrax} text-[7px] md:text-[9px] text-white/20 tracking-[0.3em] uppercase mb-3 font-black`}>
                Operational Description
              </h2>
              <p className={`text-white/60 whitespace-pre-line font-light text-justify ${
                isInternshipPanel ? "text-[11px] md:text-[15px] leading-relaxed" : "text-[11px] md:text-base leading-relaxed"
              }`}>
                {domain.description}
              </p>
            </section>

            {domain.applyLink && (
              <div className="pt-2 md:pt-4 flex justify-center md:justify-start">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={domain.applyLink}
                  target="_blank"
                  className="w-full md:w-auto inline-flex items-center justify-between md:justify-start gap-6 md:gap-8 px-6 md:px-10 py-4 bg-cyan-500 text-black rounded-full shadow-[0_0_30px_rgba(0,247,255,0.2)]"
                >
                  <span className={`${conthrax} text-[9px] md:text-xs tracking-[0.2em] md:tracking-[0.4em] font-black uppercase`}>
                    Apply for Membership
                  </span>
                  <ChevronRight size={16} />
                </motion.a>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function LeaderCard({ leader }: { leader: LeadershipMember }) {
  const isPlaceholder = leader.image === "/k1000-small.png";

  return (
    <div className="group relative w-full h-24 sm:h-32 md:h-48 overflow-hidden border border-white/10 rounded-xl md:rounded-2xl bg-[#080808] transition-all duration-500 hover:border-cyan-500/40 will-change-transform">
      <div className="absolute inset-0 bg-cyan-950/5" />

      {leader.image && (
        <img
          src={leader.image}
          alt={leader.name}
          className={`absolute inset-0 w-full h-full opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105 ${
            isPlaceholder ? "object-contain p-4 bg-black/80" : "object-cover"
          }`}
          style={isPlaceholder ? undefined : { objectPosition: "center 15%" }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full p-2.5 md:p-4">
        <h4 className={`${conthrax} text-white text-[8px] md:text-[10px] tracking-wider uppercase mb-0.5 font-black group-hover:text-cyan-400 transition-colors truncate`}>
          {leader.name}
        </h4>
        <p className={`${conthrax} text-[6px] md:text-[7.5px] text-white/40 uppercase tracking-widest font-black`}>
          {leader.position}
        </p>
      </div>
    </div>
  );
}

function EmptySlot({ label }: { label: string }) {
  return (
    <div className="h-24 sm:h-32 md:h-48 border border-dashed border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center bg-white/[0.02]">
      <span className={`${conthrax} text-[7px] text-white/10 uppercase tracking-widest font-black`}>
        {label}
      </span>
    </div>
  );
}
