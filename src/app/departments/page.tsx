"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
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

const conthrax = "font-['Conthrax',_sans-serif]";

// ─── GSAP BACKGROUND (UNTOUCHED) ───
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
      const resize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; init(); };
      class Particle {
        x: number; y: number; size: number; baseSize: number; vx: number; vy: number;
        constructor() {
          this.x = Math.random() * width; this.y = Math.random() * height;
          this.baseSize = Math.random() * 2 + 1.5; this.size = this.baseSize;
          this.vx = (Math.random() - 0.5) * 0.4; this.vy = (Math.random() - 0.5) * 0.4;
        }
        update() {
          this.x += this.vx; this.y += this.vy;
          if (this.x < 0 || this.x > width) this.vx *= -1; if (this.y < 0 || this.y > height) this.vy *= -1;
          const dx = mouse.x - this.x, dy = mouse.y - this.y, dist = Math.sqrt(dx * dx + dy * dy);
          this.size = dist < 150 ? gsap.utils.interpolate(this.size, this.baseSize * 3, 0.1) : gsap.utils.interpolate(this.size, this.baseSize, 0.05);
        }
        draw() {
          if (!ctx) return; ctx.fillStyle = "rgba(0, 247, 255, 0.8)"; ctx.shadowBlur = 12; ctx.shadowColor = "#00f7ff";
          ctx.fillRect(this.x, this.y, this.size, this.size); ctx.shadowBlur = 0;
        }
      }
      const init = () => { particles = []; const count = Math.floor((width * height) / 9000); for (let i = 0; i < count; i++) particles.push(new Particle()); };
      const animate = () => {
        ctx.clearRect(0, 0, width, height);
        particles.forEach((p, i) => {
          p.update(); p.draw();
          for (let j = i + 1; j < particles.length; j++) {
            const dx = p.x - particles[j].x, dy = p.y - particles[j].y, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) { ctx.beginPath(); ctx.strokeStyle = `rgba(0, 247, 255, ${0.25 * (1 - dist / 120)})`; ctx.lineWidth = 0.8; ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke(); }
          }
        });
        requestAnimationFrame(animate);
      };
      const handleMouseMove = (e: MouseEvent) => { gsap.to(mouse, { x: e.clientX, y: e.clientY, duration: 0.6, ease: "power2.out" }); };
      window.addEventListener("resize", resize); window.addEventListener("mousemove", handleMouseMove);
      resize(); animate();
    });
    return () => ctxGSAP.revert();
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }} />;
};

const categories = [
  {
    title: "Engineering & Technology",
    id: "DEPT-ENG-01",
    icon: <FaLaptopCode />,
    schools: [
      "School of Computer Applications",
      "School of Computer Engineering",
      "School of Civil Engineering",
      "School of Electronics Engineering",
      "School of Mechanical Engineering",
      "School of Electrical Engineering",
      "School of Chemical Engineering",
    ],
  },
  {
    title: "Sciences & Applied Sciences",
    id: "DEPT-SCI-02",
    icon: <FaMicroscope />,
    schools: [
      "School of Biotechnology",
      "School of Applied Sciences",
      "School of Architecture & Planning",
    ],
  },
  {
    title: "Management & Social Sciences",
    id: "DEPT-MGMT-03",
    icon: <FaUniversity />,
    schools: [
      "School of Management",
      "School of Rural Management",
      "School of Economics & Commerce",
      "Department of Psychology",
      "Department of Sociology",
      "Department of Library and Info Science",
      "Department of Humanities (English)",
      "Department of Language & Literature",
    ],
  },
  {
    title: "Medical & Health Sciences",
    id: "DEPT-MED-04",
    icon: <FaHeartbeat />,
    schools: [
      "School of Medical Sciences",
      "School of Dental Sciences",
      "School of Nursing Sciences",
      "School of Public Health",
      "School of Pharmacy",
      "School of Physiotherapy",
      "School of Yoga & Naturopathy",
    ],
  },
  {
    title: "Law & Public Policy",
    id: "DEPT-LAW-05",
    icon: <FaGavel />,
    schools: ["School of Law", "School of Public Policy"],
  },
  {
    title: "Sports & Tourism",
    id: "DEPT-SPR-06",
    icon: <FaDumbbell />,
    schools: [
      "School of Sports and Yogic Sciences",
      "School of Hospitality and Tourism",
    ],
  },
];

export default function DepartmentsPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col w-full bg-black text-white selection:bg-cyan-500/30 overflow-x-hidden relative min-h-screen">
      <SharedHeader />

      {/* ─── BACKGROUND LAYERS ─── */}
      <CubeBackground />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,#0ea5e90a_0%,transparent_70%)] pointer-events-none z-[2]" />

      <main className="relative z-10 flex flex-col items-center w-full">
        {/* ─── HERO SECTION ─── */}
        <section className="w-full flex flex-col items-center px-0 md:px-6 pt-24 md:pt-32 lg:pt-40">
          <div className="relative w-[92%] md:w-full h-[35vh] md:aspect-[21/7] md:max-h-[500px] md:rounded-[40px] overflow-hidden border border-cyan-500/20 bg-black shadow-2xl">
            <img 
              src="https://cdn.prod.website-files.com/67aa2520eb413205a7dac909/67aa3147b53442d24541b355_KIIT-University-Bhubaneswar.jpeg" 
              className="absolute inset-0 size-full object-cover brightness-[0.3]" 
              alt="KIIT Departments" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 h-full">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${conthrax} text-3xl sm:text-5xl md:text-7xl tracking-widest text-white uppercase font-black`}
              >
                KIIT <span className="text-cyan-400 drop-shadow-[0_0_15px_#00f7ff]">DEPARTMENTS</span>
              </motion.h1>
              <p className={`${conthrax} text-cyan-400/50 mt-4 tracking-[0.3em] md:tracking-[0.5em] text-[8px] md:text-sm uppercase font-bold`}>
                Academic Infrastructure Protocol
              </p>
            </div>
          </div>
        </section>

        {/* ─── CATEGORIES GRID ─── */}
        <section className="w-full max-w-7xl px-6 md:px-10 py-12 md:py-20 space-y-16 md:space-y-24">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="relative border-l border-cyan-500/20 pl-6 md:pl-16"
            >
              {/* Header Section */}
              <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8 mb-10 md:mb-12">
                <div className="w-fit text-3xl md:text-4xl text-cyan-400 bg-cyan-500/5 backdrop-blur-sm p-4 rounded-2xl border border-cyan-500/10">
                  {category.icon}
                </div>
                <div className="space-y-1">
                  <span className={`${conthrax} text-[10px] md:text-[12px] text-cyan-500/40 tracking-[0.4em] uppercase font-black`}>
                    {category.id}
                  </span>
                  <h3 className={`${conthrax} text-xl md:text-4xl text-white tracking-widest uppercase font-black`}>
                    {category.title}
                  </h3>
                </div>
              </div>

              {/* Sub-grid of Schools */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {category.schools.map((school, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 8, backgroundColor: "rgba(0, 247, 255, 0.05)" }}
                    className="p-4 md:p-5 rounded-[20px] bg-white/[0.02] backdrop-blur-md border border-white/5 flex items-center gap-4 group cursor-default transition-all duration-300"
                  >
                    <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-cyan-500/50 group-hover:bg-cyan-400 group-hover:shadow-[0_0_10px_#00f7ff] transition-all" />
                    <span className={`${conthrax} text-[11px] md:text-[13px] text-white/50 group-hover:text-white transition-colors font-bold tracking-wide uppercase`}>
                      {school}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Gradient Line Glow */}
              <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-cyan-400/50 via-cyan-400/10 to-transparent" />
            </motion.div>
          ))}
        </section>

        <div className="w-full py-16 md:py-24" />
      </main>

      <Footer />
    </div>
  );
}