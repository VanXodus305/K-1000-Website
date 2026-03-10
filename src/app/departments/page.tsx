"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import {
  FaLaptopCode,
  FaUniversity,
  FaMicroscope,
  FaHeartbeat,
  FaGavel,
  FaDumbbell,
  FaChevronRight
} from "react-icons/fa";
import SharedHeader from "../../components/ui/SharedHeader";
import Footer from "../../components/footer/Footer";

const conthrax = "font-['Conthrax',_sans-serif]";

// ─── OPTIMIZED GSAP BACKGROUND ───
const CubeBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let ctxGSAP = gsap.context(() => {
      let particles: any[] = [];
      let width = window.innerWidth, height = window.innerHeight;
      const mouse = { x: width / 2, y: height / 2 };

      const resize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        init();
      };

      class Particle {
        x: number; y: number; size: number; baseSize: number; vx: number; vy: number;
        constructor() {
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          // Smaller particles for mobile to maintain "Premium" feel
          this.baseSize = Math.random() * (width < 768 ? 1 : 2) + 1;
          this.size = this.baseSize;
          this.vx = (Math.random() - 0.5) * 0.3;
          this.vy = (Math.random() - 0.5) * 0.3;
        }
        update() {
          this.x += this.vx; this.y += this.vy;
          if (this.x < 0 || this.x > width) this.vx *= -1;
          if (this.y < 0 || this.y > height) this.vy *= -1;
          const dx = mouse.x - this.x, dy = mouse.y - this.y, dist = Math.sqrt(dx * dx + dy * dy);
          // Reduced hover radius on mobile
          const radius = width < 768 ? 80 : 150;
          this.size = dist < radius ? gsap.utils.interpolate(this.size, this.baseSize * 2.5, 0.1) : gsap.utils.interpolate(this.size, this.baseSize, 0.05);
        }
        draw() {
          if (!ctx) return;
          ctx.fillStyle = "rgba(0, 247, 255, 0.6)";
          ctx.shadowBlur = width < 768 ? 5 : 12; // Performance: Lower blur on mobile
          ctx.shadowColor = "#00f7ff";
          ctx.fillRect(this.x, this.y, this.size, this.size);
          ctx.shadowBlur = 0;
        }
      }

      const init = () => {
        particles = [];
        // Performance: Significantly fewer particles on mobile devices
        const density = width < 768 ? 15000 : 9000;
        const count = Math.floor((width * height) / density);
        for (let i = 0; i < count; i++) particles.push(new Particle());
      };

      const animate = () => {
        ctx.clearRect(0, 0, width, height);
        particles.forEach((p, i) => {
          p.update(); p.draw();
          // Optimized connection lines (only draw for nearby particles)
          const connectionDist = width < 768 ? 70 : 120;
          for (let j = i + 1; j < particles.length; j++) {
            const dx = p.x - particles[j].x, dy = p.y - particles[j].y, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < connectionDist) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(0, 247, 255, ${0.15 * (1 - dist / connectionDist)})`;
              ctx.lineWidth = 0.5;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        });
        requestAnimationFrame(animate);
      };

      const handleMouseMove = (e: MouseEvent) => { gsap.to(mouse, { x: e.clientX, y: e.clientY, duration: 0.8 }); };
      const handleTouchMove = (e: TouchEvent) => { 
        mouse.x = e.touches[0].clientX; 
        mouse.y = e.touches[0].clientY; 
      };

      window.addEventListener("resize", resize);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchmove", handleTouchMove);
      resize(); animate();
    });
    return () => ctxGSAP.revert();
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-60" style={{ zIndex: 1 }} />;
};

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
      <CubeBackground />

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
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative group"
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
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 md:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/5 flex items-center justify-between group/item cursor-pointer transition-all duration-300 hover:border-cyan-500/30 hover:bg-cyan-500/[0.02]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-cyan-500/30 group-hover/item:bg-cyan-400 group-hover/item:shadow-[0_0_8px_#00f7ff] transition-all" />
                      <span className={`${conthrax} text-[10px] md:text-[12px] text-white/40 group-hover/item:text-white transition-colors font-bold tracking-wider uppercase leading-snug`}>
                        {school}
                      </span>
                    </div>
                    <FaChevronRight className="text-cyan-500/0 group-hover/item:text-cyan-500/50 text-[10px] transition-all" />
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