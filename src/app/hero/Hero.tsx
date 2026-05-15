"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  const stats = [
    { number: "100+", label: "Projects" },
    { number: "50+", label: "Publications" },
    { number: "20+", label: "Patents Filed" },
    { number: "20+", label: "Collaborations" },
  ];

  return (
    <section className="w-full flex justify-center py-16 px-4">
      <div
        className="
          relative w-full max-w-[900px] 
          rounded-[32px] overflow-hidden
          shadow-[0_0_60px_rgba(0,255,255,0.25)]
        "
      >
        {/* 🖼️ Background Image */}
        <img
          src="/hero/hero-2.jpg"
          className="
            w-full h-[520px] object-cover
            rounded-[32px]
            border border-cyan-300/20
          "
        />

        {/* 🧊 GLASS HUD PANEL */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9 }}
          className="
            absolute inset-0
            flex flex-col items-center justify-center text-center
            px-10 py-12
            bg-black/45 backdrop-blur-[14px]
            border border-white/10
          "
        >
          {/* Tag */}
          <p className="text-cyan-300 font-[Orbitron] tracking-[0.35em] text-[10px] mb-4">
            WELCOME TO KIIT'S ELITE ENGINEERING PROGRAM
          </p>

          {/* Title */}
          <h1 className="text-5xl font-[Orbitron] tracking-[0.22em] text-white">
            JOIN{" "}
            <span className="text-cyan-300 drop-shadow-[0_0_18px_rgba(0,255,255,0.45)]">
              K-1000
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/85 mt-4 text-[14px] leading-relaxed max-w-[600px]">
            Innovation • Research • Real-world Engineering • Collaboration — 
            Guided by KIIT’s advanced learning & development ecosystem.
          </p>

          {/* CTA Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Link
              href="/Sections/apply"
              className="px-8 py-3 text-sm font-bold rounded-lg bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,255,255,0.3)]"
            >
              Apply Now
            </Link>
            <Link
              href="/Sections/about"
              className="px-8 py-3 text-sm rounded-lg border text-cyan-300 border-cyan-300/50 hover:bg-white/10 transition font-semibold"
            >
              Learn More
            </Link>
          </div>

          {/* Divider */}
          <div className="w-[70%] h-[1px] bg-white/15 my-8" />

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 max-w-[600px] mx-auto">
            {stats.map(({ number, label }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.12 }}
                className="flex flex-col items-center"
              >
                <h3 className="text-2xl font-bold text-cyan-300">
                  {number}
                </h3>
                <p className="text-[9px] text-white/60 tracking-[0.2em] uppercase">
                  {label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Motto */}
          <p className="text-white/50 mt-6 text-[9px] font-[Orbitron] tracking-[0.3em]">
            TRAIN • TRANSFORM • TRANSCEND
          </p>
        </motion.div>
      </div>
    </section>
  );
}