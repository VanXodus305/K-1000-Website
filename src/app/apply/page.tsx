"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";
import { ArrowRight, Sparkles } from "lucide-react";
import gsap from "gsap";
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
      const init = () => { 
        particles = []; 
        // Reduced density for mobile performance
        const densityMultiplier = width < 768 ? 15000 : 9000;
        const count = Math.floor((width * height) / densityMultiplier); 
        for (let i = 0; i < count; i++) particles.push(new Particle()); 
      };
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

// ─── INTERNAL CARD COMPONENT ───
const StatCard = ({ icon: Icon, title, description }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-white/[0.02] backdrop-blur-md border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/[0.02] transition-all duration-500 text-left group"
  >
    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center text-lg md:text-xl text-white/40 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-all duration-500 mb-4 md:mb-6">
      <Icon size={20} />
    </div>
    <h3 className={`${conthrax} text-white text-[10px] md:text-xs font-black uppercase tracking-wider mb-2`}>
      {title}
    </h3>
    <p className="text-white/30 text-[10px] md:text-xs font-light leading-snug">
      {description}
    </p>
  </motion.div>
);

const ApplicationForm = () => {
  const [mounted, setMounted] = useState(false);
  
  const GOOGLE_FORM_LINK = "https://forms.gle/irg7nzkhh3tWnpib8";
  const LINKED_IN = "https://www.linkedin.com/company/k1000-kiit";
  const INSTAGRAM = "https://www.instagram.com/k1000_kiit";

  const socialsData = [
    { 
      title: "LinkedIn", 
      icon: FaLinkedinIn, 
      link: LINKED_IN, 
      description: "Join our professional network for technical updates and news." 
    },
    { 
      title: "Instagram", 
      icon: FaInstagram, 
      link: INSTAGRAM, 
      description: "A glimpse into our campus life and innovation culture." 
    },
    { 
      title: "WhatsApp", 
      icon: FaWhatsapp, 
      link: "#", 
      description: "Direct channel for community discussions and quick alerts." 
    },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full min-h-screen bg-black text-white selection:bg-cyan-500/30 flex flex-col items-center overflow-x-hidden">
      <SharedHeader />

      {/* ─── BACKGROUND LAYERS ─── */}
      <CubeBackground />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,#0ea5e90a_0%,transparent_50%)] pointer-events-none z-[2]" />

      <main className="relative z-10 w-full max-w-5xl px-6 pt-32 md:pt-52 flex flex-col items-center text-center">
        
        {/* ─── MAIN CONTENT ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 md:space-y-8"
        >
          <div className="flex justify-center">
            <div className="flex items-center gap-2 px-3 py-1 md:px-4 md:py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
              <Sparkles size={10} className="text-cyan-400" />
              <span className={`${conthrax} text-[7px] md:text-[9px] tracking-[0.2em] md:tracking-[0.3em] uppercase font-black text-white/60`}>
                Enrollment Closed
              </span>
            </div>
          </div>

          <h1 className={`${conthrax} text-4xl sm:text-5xl md:text-8xl font-black uppercase tracking-tight leading-tight md:leading-none`}>
            Apply for <br />
            <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(0,247,255,0.4)]">K-1000</span>
          </h1>

          <p className="text-white/40 text-sm md:text-xl font-light max-w-2xl mx-auto leading-relaxed px-2">
            The K-1000 Program is an excellent opportunity for students to engage in research and academic excellence. If you have a passion for innovation, apply now to be part of this prestigious program.
          </p>

          <div className="flex justify-center pt-4">
            <motion.div
              initial={{ opacity: 0.8 }}
              className={`${conthrax} inline-flex items-center gap-3 md:gap-4 bg-white/5 border border-white/10 text-white/40 px-8 py-4 md:px-12 md:py-5 rounded-full font-black text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] cursor-not-allowed transition-all duration-500 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]`}
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-2 h-2 bg-white/20 rounded-full animate-ping" />
                <span className="relative w-1.5 h-1.5 md:w-2 md:h-2 bg-white/40 rounded-full" />
              </div>
              <span>Applications Open Soon</span>
              <ArrowRight size={14} className="opacity-50 md:block hidden" />
            </motion.div>
          </div>
        </motion.div>

        {/* ─── SOCIAL CONNECT GRID ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full mt-16 md:mt-24 mb-20 md:mb-32">
          {socialsData.map((social, index) => (
            <a 
              key={index} 
              href={social.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`block ${index === 2 ? 'sm:col-span-2 md:col-span-1' : ''}`}
            >
              <StatCard
                icon={social.icon}
                title={social.title}
                description={social.description}
              />
            </a>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ApplicationForm;