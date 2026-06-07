"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaLaptopCode,
  FaUniversity,
  FaMicroscope,
  FaHeartbeat,
  FaGavel,
  FaDumbbell,
} from "react-icons/fa";
import SharedHeader from "../../components/ui/SharedHeader";
import Footer from "../../components/footer/Footer";
import CubeBackground from "../../components/ui/CubeBackground";

const conthrax = "font-['Conthrax',_sans-serif]";

const categories = [
  { title: "Engineering & Tech", id: "DEPT-ENG-01", icon: <FaLaptopCode />, schools: ["School of Computer Applications", "School of Computer Engineering", "School of Civil Engineering", "School of Electronics Engineering", "School of Mechanical Engineering", "School of Electrical Engineering", "School of Chemical Engineering"] },
  { title: "Sciences & Applied", id: "DEPT-SCI-02", icon: <FaMicroscope />, schools: ["School of Biotechnology", "School of Applied Sciences", "School of Architecture & Planning"] },
  { title: "Management & Social", id: "DEPT-MGMT-03", icon: <FaUniversity />, schools: ["School of Management", "School of Rural Management", "School of Economics & Commerce", "Department of Psychology", "Department of Sociology", "Department of Library and Info Science", "Department of Humanities (English)", "Department of Language & Literature"] },
  { title: "Medical & Health", id: "DEPT-MED-04", icon: <FaHeartbeat />, schools: ["School of Medical Sciences", "School of Dental Sciences", "School of Nursing Sciences", "School of Public Health", "School of Pharmacy", "School of Physiotherapy", "School of Yoga & Naturopathy"] },
  { title: "Law & Public Policy", id: "DEPT-LAW-05", icon: <FaGavel />, schools: ["School of Law", "School of Public Policy"] },
  { title: "Sports & Tourism", id: "DEPT-SPR-06", icon: <FaDumbbell />, schools: ["School of Sports and Yogic Sciences", "School of Hospitality and Tourism"] },
];

export default function DepartmentsPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="flex flex-col w-full bg-black text-white selection:bg-cyan-500/30 overflow-x-hidden relative min-h-screen">
      <SharedHeader />
      <CubeBackground zIndex={0} disableLinesOnMobile />

      <main className="relative z-10 flex flex-col items-center w-full px-4 sm:px-6 lg:px-8">
        
        {/* ─── HERO SECTION (FLUID HEIGHT) ─── */}
        <section className="w-full max-w-7xl pt-28 md:pt-40">
          <div className="relative w-full h-[280px] md:h-[450px] rounded-3xl md:rounded-[40px] overflow-hidden border border-cyan-500/20 shadow-[0_0_50px_rgba(0,0,0,1)]">
            <img 
              src="https://cdn.prod.website-files.com/67aa2520eb413205a7dac909/67aa3147b53442d24541b355_KIIT-University-Bhubaneswar.jpeg" 
              className="absolute inset-0 size-full object-cover brightness-[0.25] scale-105" 
              alt="KIIT Departments" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-2"
              >
                <h1 className={`${conthrax} text-2xl xs:text-3xl sm:text-5xl md:text-7xl tracking-[0.2em] text-white uppercase font-black leading-tight`}>
                  KIIT <span className="text-cyan-400 block sm:inline drop-shadow-[0_0_15px_#00f7ff]">DEPARTMENTS</span>
                </h1>
                <div className="flex items-center justify-center gap-2 md:gap-4 overflow-hidden">
                  <div className="h-[1px] w-8 md:w-20 bg-gradient-to-r from-transparent to-cyan-500/50" />
                  <p className={`${conthrax} text-cyan-400/70 tracking-[0.2em] md:tracking-[0.5em] text-[7px] md:text-xs uppercase font-bold whitespace-nowrap`}>
                    Academic Infrastructure Protocol
                  </p>
                  <div className="h-[1px] w-8 md:w-20 bg-gradient-to-l from-transparent to-cyan-500/50" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── CATEGORIES GRID ─── */}
        <section className="w-full max-w-7xl py-12 md:py-24 space-y-16 md:space-y-32">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              id={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative group scroll-mt-24"
            >
              {/* Desktop Side Line - Hidden on Mobile */}
              <div className="absolute top-0 -left-6 md:-left-12 w-[1px] h-full bg-gradient-to-b from-cyan-400/40 via-cyan-400/5 to-transparent hidden md:block" />

              {/* Category Header */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mb-8 md:mb-12">
                <div className="w-14 h-14 md:w-20 md:h-20 flex items-center justify-center text-2xl md:text-4xl text-cyan-400 bg-cyan-500/5 backdrop-blur-xl rounded-2xl border border-cyan-500/20 shadow-[0_0_20px_rgba(0,247,255,0.1)]">
                  {category.icon}
                </div>
                <div className="space-y-1">
                  <span className={`${conthrax} text-[9px] md:text-[11px] text-cyan-500/40 tracking-[0.4em] uppercase font-black`}>
                    {category.id}
                  </span>
                  <h3 className={`${conthrax} text-xl md:text-4xl text-white tracking-widest uppercase font-black group-hover:text-cyan-400 transition-colors duration-500`}>
                    {category.title}
                  </h3>
                </div>
              </div>

              {/* Responsive Sub-grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {category.schools.map((school, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 md:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/5 flex items-center group/item transition-all duration-300 hover:border-cyan-500/30 hover:bg-cyan-500/[0.02]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-cyan-500/30 group-hover/item:bg-cyan-400 group-hover/item:shadow-[0_0_8px_#00f7ff] transition-all" />
                      <span className={`${conthrax} text-[10px] md:text-[12px] text-white/40 group-hover/item:text-white transition-colors font-bold tracking-wider uppercase leading-snug`}>
                        {school}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </section>

        <div className="h-20 md:h-40" />
      </main>

      <Footer />
    </div>
  );
}
