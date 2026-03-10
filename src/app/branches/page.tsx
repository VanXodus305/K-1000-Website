"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import SharedHeader from "../../components/ui/SharedHeader";
import Footer from "../../components/footer/Footer";

const images = [
  "https://cdn.prod.website-files.com/67aa2520eb413205a7dac909/67aa32340b3a8697b5760399_KIIT-Campus-Front-Library-1200x416.jpg",
];

const conthrax = "font-['Conthrax',_sans-serif]";

// ─── OPTIMIZED GSAP BACKGROUND (BUTTERY SMOOTH) ───
const CubeBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
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
          this.x = Math.random() * width; this.y = Math.random() * height;
          this.baseSize = Math.random() * 2 + 1.5; this.size = this.baseSize;
          this.vx = (Math.random() - 0.5) * 0.4; this.vy = (Math.random() - 0.5) * 0.4;
        }
        update() {
          this.x += this.vx; this.y += this.vy;
          if (this.x < 0 || this.x > width) this.vx *= -1; 
          if (this.y < 0 || this.y > height) this.vy *= -1;
          
          const dx = mouse.x - this.x, dy = mouse.y - this.y;
          const distSq = dx * dx + dy * dy;
          
          if (distSq < 22500) { // 150 squared
            this.size = gsap.utils.interpolate(this.size, this.baseSize * 3, 0.1);
          } else {
            this.size = gsap.utils.interpolate(this.size, this.baseSize, 0.05);
          }
        }
        draw() {
          if (!ctx) return; 
          ctx.fillStyle = "rgba(0, 247, 255, 0.8)"; 
          ctx.fillRect(this.x, this.y, this.size, this.size);
        }
      }

      const init = () => { 
        particles = []; 
        const count = Math.floor((width * height) / 9500); 
        for (let i = 0; i < count; i++) particles.push(new Particle()); 
      };

      const animate = () => {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.update(); p.draw();
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x, dy = p.y - p2.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < 14400) { // 120 squared
              ctx.beginPath(); 
              ctx.strokeStyle = `rgba(0, 247, 255, ${0.25 * (1 - Math.sqrt(distSq) / 120)})`; 
              ctx.lineWidth = 0.8; 
              ctx.moveTo(p.x, p.y); 
              ctx.lineTo(p2.x, p2.y); 
              ctx.stroke(); 
            }
          }
        }
        requestAnimationFrame(animate);
      };

      const handleMouseMove = (e: MouseEvent) => { 
        gsap.to(mouse, { x: e.clientX, y: e.clientY, duration: 0.6, ease: "power2.out" }); 
      };

      window.addEventListener("resize", resize); 
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      resize(); animate();
    });
    return () => ctxGSAP.revert();
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 1, transform: 'translateZ(0)' }} />;
};

const branches = [
  {
    title: "Training Program",
    tag: "Unit: Skill Acquisition",
    desc: "A peer-to-peer learning initiative focused on both technical and non-technical mastery. Students engage in workshops and real-world projects to build high-level practical knowledge.",
    focus: "Hands-on Workshops • Peer Mentoring • Professional Growth"
  },
  {
    title: "Research and Publications",
    tag: "Unit: Academic Innovation",
    desc: "Supports students in the end-to-end process of academic research. From selecting high-impact topics to final submissions in reputed journals and global conferences.",
    focus: "Journal Drafting • Faculty Collaboration • IPR Support"
  },
  {
    title: "Project Wing",
    tag: "Unit: Product Development",
    desc: "Enables skilled members to build real-world solutions in a team-driven environment. We provide the resources and mentorship required to turn ideas into impactful prototypes.",
    focus: "Agile Development • Resource Allocation • Industry Prototypes"
  },
  {
    title: "Event Organization",
    tag: "Unit: Operations & Management",
    desc: "The logistics backbone of K-1000. This wing plans and executes hackathons, webinars, and speaker sessions, building leadership and communication excellence.",
    focus: "Hackathon Management • Speaker Relations • Global Webinars"
  },
  {
    title: "Internship and Placement",
    tag: "Unit: Career Bridge",
    desc: "Bridges the gap between campus and industry. We provide industry connections, resume reviews, and mock interview sessions to secure high-tier recruitment.",
    focus: "Corporate Relations • Resume Optimization • Mock Drills"
  },
  {
    title: "Higher Studies",
    tag: "Unit: Global Advancement",
    desc: "Guidance for students aiming for post-graduate excellence in India or abroad. We streamline SOP writing, scholarship applications, and entrance exam prep.",
    focus: "SOP/LOR Drafting • Scholarship Tracking • University Mapping"
  },
];

export default function BranchesPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col w-full bg-black text-white selection:bg-cyan-500/30 overflow-x-hidden relative min-h-screen">
      <SharedHeader />
      <CubeBackground />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,#0ea5e90a_0%,transparent_70%)] pointer-events-none z-[2]" />

      <main className="relative z-10 flex flex-col items-center w-full">
        {/* HERO SECTION */}
        <section className="w-full flex flex-col items-center px-0 md:px-6 pt-24 md:pt-32 lg:pt-40">
          <div className="relative w-[92%] md:w-full h-[40vh] md:aspect-[21/7] md:max-h-[500px] md:rounded-[40px] overflow-hidden border border-cyan-500/20 bg-black shadow-2xl">
            <motion.img 
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              src={images[0]} 
              className="absolute inset-0 size-full object-cover brightness-[0.25]" 
              alt="KIIT Library" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            
            <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 h-full">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`${conthrax} text-3xl sm:text-5xl md:text-7xl tracking-widest text-white uppercase font-black`}
              >
                Our <span className="text-cyan-400 drop-shadow-[0_0_15px_#00f7ff]">Branches</span>
              </motion.h1>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "120px" }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="h-1 bg-cyan-500 mt-6 shadow-[0_0_10px_#00f7ff] md:w-[200px]"
              />
            </div>
          </div>
        </section>

        {/* INTRO DESCRIPTION */}
        <section className="w-full max-w-4xl text-center px-6 py-12 md:py-16 space-y-4">
          <p className="text-sm md:text-lg text-white/50 leading-relaxed font-light tracking-wide mx-auto max-w-2xl">
            Explore the strategic divisions of <span className={`${conthrax} text-white text-[12px] md:text-base font-black uppercase`}>K-1000</span>. Each wing is a specialized ecosystem designed to accelerate your growth across specific domains.
          </p>
        </section>

        {/* BRANCHES GRID */}
        <section className="w-full max-w-7xl px-6 md:px-10 py-6 md:py-12">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {branches.map((branch, index) => (
              <motion.div
                key={index}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                whileHover={{ y: -8 }}
                className="group relative p-8 md:p-10 rounded-[32px] bg-white/[0.02] backdrop-blur-md border border-white/5 hover:border-cyan-400/40 transition-all duration-300 flex flex-col h-full shadow-2xl overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/5 blur-3xl group-hover:bg-cyan-500/10 transition-all" />
                
                <span className={`${conthrax} text-[9px] md:text-[10px] text-cyan-400/60 tracking-[0.2em] uppercase mb-4 block font-black`}>
                  {branch.tag}
                </span>
                
                <h3 className={`${conthrax} text-lg md:text-xl text-white mb-4 group-hover:text-cyan-400 transition-colors uppercase font-black`}>
                  {branch.title}
                </h3>
                
                <p className="text-white/60 text-xs md:text-xl leading-relaxed mb-8 flex-grow font-light">
                  {branch.desc}
                </p>

                <div className="pt-6 border-t border-white/5">
                  <p className={`${conthrax} text-[8px] md:text-[9px] text-white/30 group-hover:text-white/60 tracking-widest uppercase font-bold transition-colors`}>
                    {branch.focus}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
        
        <div className="w-full py-16 md:py-24" />
      </main>

      <Footer />
    </div>
  );
}