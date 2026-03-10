"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import SharedHeader from "../../components/ui/SharedHeader";
import Footer from "../../components/footer/Footer";

const images = [
  "https://cdn.prod.website-files.com/67aa2520eb413205a7dac909/67aa3147b53442d24541b355_KIIT-University-Bhubaneswar.jpeg",
  "https://cdn.prod.website-files.com/67aa2520eb413205a7dac909/67aa32340b3a8697b5760399_KIIT-Campus-Front-Library-1200x416.jpg",
];

const conthrax = "font-['Conthrax',_sans-serif]";

const benefits = [
  {
    title: "Early Research Exposure",
    desc: "Get involved in research from the first year, fostering an inquisitive mindset.",
    detail: "Phase 1: Fundamental Methodology & Logic"
  },
  {
    title: "Mentorship & Guidance",
    desc: "Work closely with experienced faculty mentors who guide your research journey.",
    detail: "Direct 1-on-1 Faculty-Student mapping"
  },
  {
    title: "Skill Development",
    desc: "Gain hands-on experience in research methodologies, data analysis, and problem-solving.",
    detail: "Technical Stack: AI/ML, Data Science, Core Eng."
  },
  {
    title: "Publication & Patents",
    desc: "Opportunity to publish research papers and file patents through university support.",
    detail: "IPR Support & Indexed Journal Drafting"
  },
  {
    title: "Networking & Collaborations",
    desc: "Connect with like-minded peers, researchers, and industry experts.",
    detail: "Access to Global Tech Forums & Alumnus Network"
  },
  {
    title: "International Exposure",
    desc: "Participate in research collaborations with top institutions worldwide.",
    detail: "Exchange Programs & Global Internships"
  },
  {
    title: "Competitive Training",
    desc: "Develop skills and knowledge through rigorous training in a growth-oriented setting.",
    detail: "Real-world Project Stress-Testing"
  },
  {
    title: "Seed Funding Access",
    desc: "Eligible projects receive initial capital to transform research into prototypes.",
    detail: "Incubation at KIIT-TBI (Technology Business Incubator)"
  },
  {
    title: "Placement Advantage",
    desc: "Research-backed profiles receive priority in high-end R&D corporate recruitment.",
    detail: "Tier-1 Tech Placements & R&D Roles"
  },
];

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

export default function BenefitsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col items-center w-full bg-black text-white selection:bg-cyan-500/30 overflow-x-hidden relative">
      <SharedHeader />

      {/* ─── BACKGROUND LAYERS ─── */}
      <CubeBackground />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,#0ea5e90a_0%,transparent_70%)] pointer-events-none z-[2]" />

      <main className="flex-grow flex flex-col items-center w-full relative z-10">
        {/* ─── HERO SECTION ─── */}
        <section className="w-full flex flex-col items-center px-0 md:px-6 pt-24 md:pt-32 lg:pt-40">
          <div className="relative w-[92%] md:w-full h-[40vh] md:aspect-[21/7] md:max-h-[500px] md:rounded-[40px] overflow-hidden border border-cyan-500/20 bg-black shadow-2xl">
            <img src={images[0]} className="absolute inset-0 w-full h-full object-cover brightness-[0.3]" alt="KIIT Campus" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 h-full">
              <motion.h1 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className={`${conthrax} text-3xl sm:text-5xl md:text-7xl tracking-widest text-white uppercase font-black`}
              >
                JOIN <span className="text-cyan-400 drop-shadow-[0_0_15px_#00f7ff]">K-1000</span>
              </motion.h1>
              <p className={`${conthrax} text-cyan-400/50 mt-4 tracking-[0.3em] md:tracking-[0.5em] text-[10px] md:text-sm uppercase font-bold`}>
                Train • Compete • Publish
              </p>
            </div>
          </div>
        </section>

        {/* ─── DESCRIPTION BLOCK ─── */}
        <section className="w-full max-w-4xl text-center px-6 py-12 md:py-16 space-y-4">
          <h2 className={`${conthrax} text-2xl md:text-4xl text-white uppercase tracking-widest font-black`}>
            The <span className="text-cyan-400">Ecosystem</span>
          </h2>
          <p className="text-sm md:text-lg text-white/50 leading-relaxed font-light tracking-wide mx-auto max-w-2xl">
            The K-1000 initiative is more than a program; it's a launchpad. By integrating technical rigor with research excellence, we prepare students for the highest tiers of global industry and academia.
          </p>
        </section>

        {/* ─── BENEFITS GRID ─── */}
        <section className="w-full max-w-7xl px-6 md:px-10 py-6 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {benefits.map((benefit, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 15 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: index * 0.05 }} 
                className="p-8 md:p-10 rounded-[32px] bg-white/[0.02] backdrop-blur-md border border-white/5 hover:border-cyan-400/40 transition-all duration-300 group flex flex-col items-start relative overflow-hidden shadow-2xl"
              >
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/5 blur-3xl group-hover:bg-cyan-500/10 transition-all" />
                <h3 className={`${conthrax} text-base md:text-xl text-white mb-3 tracking-widest group-hover:text-cyan-400 transition-colors uppercase font-black`}>
                  {benefit.title}
                </h3>
                <p className="text-white/40 text-xs md:text-sm leading-relaxed font-light mb-8">{benefit.desc}</p>
                <div className="mt-auto pt-6 border-t border-white/5 w-full">
                  <p className={`${conthrax} text-[9px] md:text-[10px] text-cyan-400/60 uppercase tracking-widest font-bold`}>
                    {benefit.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── CALL TO ACTION SECTION ─── */}
        <section className="w-full max-w-7xl px-6 py-12 md:py-20">
          <div className="relative h-[30vh] md:h-[40vh] rounded-[32px] md:rounded-[40px] overflow-hidden border border-white/10 group shadow-2xl">
            <img src={images[1]} alt="Research Development" className="absolute inset-0 size-full object-cover brightness-[0.3] group-hover:scale-105 transition-transform duration-[3s]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 md:space-y-8 bg-black/30 backdrop-blur-md">
              <h2 className={`${conthrax} text-lg md:text-3xl text-white tracking-[0.2em] md:tracking-[0.4em] text-center uppercase font-black`}>
                EMBARK ON THE <span className="text-cyan-400">MISSION</span>
              </h2>
              <motion.a 
                href="https://kiit.ac.in/research" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`${conthrax} px-10 md:px-14 py-4 bg-transparent border border-cyan-400 text-cyan-400 uppercase text-[9px] md:text-[11px] tracking-[0.4em] rounded-full hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_30px_rgba(0,247,255,0.2)] text-center font-black`} 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                Access Portal
              </motion.a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}