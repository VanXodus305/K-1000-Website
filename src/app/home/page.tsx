"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ShieldCheck, Binary, Cpu, GraduationCap, Boxes, Zap,
  Activity, Cpu as CpuIcon, ChevronRight,
  Rocket, FileText, BookOpen, Star, Award, Globe, Lightbulb, Users, LucideIcon
} from "lucide-react";
import gsap from "gsap";
import Link from "next/link";

import SharedHeader from "../../components/ui/SharedHeader"; 
import Footer from "../../components/footer/Footer"; 
import { domains } from "../../data/domain";
import DomainHoloPanel from "../../components/ui/DomainHoloPanel";
import data from "@/data/data.json"; 

const conthrax = "font-['Conthrax',_sans-serif]";

const iconMap: Record<string, LucideIcon> = {
  Rocket, FileText, BookOpen, Star, Award, Globe, Lightbulb, Users,
};

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

const LEFT_NODES = [
    { key: "internship", label: "Internship & Placement", y: 25, x: 34, icon: <ShieldCheck size={24} /> },
    { key: "projects", label: "Projects Wing",      y: 45, x: 30, icon: <Boxes size={24} /> },
    { key: "training", label: "Training Program", y: 65, x: 34, icon: <Cpu size={24} /> },
];
  
const RIGHT_NODES = [
    { key: "higher", label: "Higher Studies",     y: 25, x: 66, icon: <GraduationCap size={24} /> },
    { key: "research", label: "Research & Publication", y: 45, x: 68, icon: <Binary size={24} /> },
    { key: "events",   label: "Event Organisation", y: 65, x: 66, icon: <Zap size={24} /> },
];

export default function UnifiedPortal() {
  const { benefits } = data;
  const [activeDomainKey, setActiveDomainKey] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isCoreHovered, setIsCoreHovered] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      const baseRatio = 1440 / 900;
      let newScale = window.innerWidth / 1440;
      if ((window.innerWidth / window.innerHeight) > baseRatio) newScale = window.innerHeight / 900;
      setScale(Math.max(0.65, Math.min(newScale, 1.05)));
    };
    handleResize(); window.addEventListener("resize", handleResize);
    return () => { clearInterval(timer); window.removeEventListener("resize", handleResize); };
  }, []);

  const mouseX = useMotionValue(0), mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 }), springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const moveX = useTransform(springX, [-500, 500], [-12, 12]), moveY = useTransform(springY, [-500, 500], [-12, 12]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => { mouseX.set(e.clientX - window.innerWidth / 2); mouseY.set(e.clientY - window.innerHeight / 2); };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  const allNodes = useMemo(() => [...LEFT_NODES, ...RIGHT_NODES], []);
  const activeDomain = domains.find(d => d.key === activeDomainKey);

  const handlePanelClose = () => {
    setActiveDomainKey(null);
    setHoveredNode(null);
  };

  const stats = [
    { number: "100+", label: "Projects" }, { number: "50+", label: "Publications" },
    { number: "20+", label: "Patents Filed" }, { number: "20+", label: "Collaborations" },
  ];

  return (
    <div className={`relative w-full bg-[#010103] text-white overflow-x-hidden selection:bg-cyan-500/30`}>
      <CubeBackground />

      {/* ─── SYSTEM CANVAS HERO ─── */}
      <section className="relative w-full h-screen lg:h-screen flex flex-col items-center justify-center overflow-hidden border-b border-white/5">
        <SharedHeader />
        
        <motion.div style={{ x: moveX, y: moveY, scale: 1.05 }} className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f7ff06_1px,transparent_1px),linear-gradient(to_bottom,#00f7ff06_1px,transparent_1px)] bg-[size:40px_40px] lg:bg-[size:60px_60px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#010103_85%)]" />
        </motion.div>

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4">
          <AnimatePresence>
            {!activeDomainKey && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center w-full h-full">
                {isMobile ? (
                  /* REFINED MOBILE LAYOUT - PREVENT OVERLAP */
                  <div className="flex flex-col items-center w-full h-full pt-20 pb-24">
                    {/* TOP SECTION: LOGO */}
                    <div className="flex-none py-6">
                        <div className="relative">
                           <div className="absolute inset-0 bg-cyan-500/10 blur-3xl rounded-full scale-150 animate-pulse" />
                           <img src="/k1000-small.png" className="w-28 brightness-110 drop-shadow-[0_0_15px_#00f7ff] relative z-10" alt="Core" />
                        </div>
                    </div>

                    {/* MIDDLE SECTION: NODES (Scrollable if needed, but flex-1 to occupy space) */}
                    <div className="flex-1 w-full flex flex-col justify-center space-y-2.5 px-2 max-w-sm overflow-y-auto no-scrollbar pb-10">
                      {allNodes.map((node) => (
                      <button key={node.key} onClick={() => setActiveDomainKey(node.key)} className="w-full bg-black/60 backdrop-blur-md border border-cyan-400/30 p-3.5 flex justify-between items-center shadow-[0_0_15px_rgba(0,247,255,0.1)] active:scale-[0.98] transition-all rounded-lg group">
                          <div className={`flex items-center gap-4 text-cyan-400 ${conthrax}`}>
                              <div className="group-active:text-white transition-colors">{node.icon}</div>
                              <span className="text-[10px] tracking-[0.1em] text-white uppercase font-bold">{node.label}</span>
                          </div>
                          <ChevronRight size={16} className="text-cyan-400/50 group-active:text-cyan-400" />
                      </button>
                      ))}
                    </div>
                    
                    {/* BOTTOM SECTION: SLOGAN (Higher z-index than background) */}
                    <div className="flex-none pt-4 pb-12">
                        <div className={`text-[8px] tracking-[0.5em] text-cyan-400/70 font-black uppercase text-center drop-shadow-[0_0_8px_#00f7ff] brightness-110 ${conthrax}`}>
                            Train • Transform • Transcend
                        </div>
                    </div>
                  </div>
                ) : (
                  <motion.div style={{ transform: `scale(${scale})` }} className="relative w-[1440px] h-[900px] flex items-center justify-center">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                      {allNodes.map((node) => (
                        <motion.line key={node.key} x1="50" y1="50" x2={node.x} y2={node.y} stroke={hoveredNode === node.key ? "#ffffff" : "#00f7ff"} strokeWidth={hoveredNode === node.key ? "0.8" : "0.6"} strokeOpacity={hoveredNode === node.key ? "1" : "0.8"} />
                      ))}
                    </svg>
                    <div className="flex flex-col items-center relative z-20">
                      <motion.div onMouseEnter={() => setIsCoreHovered(true)} onMouseLeave={() => setIsCoreHovered(false)} className={`relative w-[320px] h-[440px] bg-[#020205] rounded-[40px] border-2 flex flex-col cursor-pointer transition-all duration-700 ${isCoreHovered ? 'border-cyan-400 shadow-[0_0_80px_rgba(0,247,255,0.4)]' : 'border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.05)]'}`}>
                        <div className="flex justify-between items-center px-8 py-4 border-b border-white/20"><Activity size={12} className="text-cyan-400 animate-pulse drop-shadow-[0_0_5px_#00f7ff]" /><span className={`text-[7px] tracking-[0.6em] text-cyan-300 font-black ${conthrax}`}>VERS.2026</span></div>
                        <div className="flex-1 flex items-center justify-center relative"><div className="absolute w-40 h-40 bg-cyan-500/20 blur-[80px] rounded-full" /><img src="/k1000-small.png" className={`w-44 z-10 transition-transform duration-500 ${isCoreHovered ? 'scale-110 brightness-110' : 'brightness-105'} drop-shadow-[0_0_20px_#00f7ff]`} alt="Core" /></div>
                      </motion.div>
                      <div className={`mt-16 text-[12px] tracking-[1.4em] text-cyan-400 font-black uppercase text-center drop-shadow-[0_0_12px_#00f7ff] brightness-110 ${conthrax}`}>Train • Transform • Transcend</div>
                    </div>
                    {allNodes.map((node) => (
                      <motion.button key={node.key} onMouseEnter={() => setHoveredNode(node.key)} onMouseLeave={() => setHoveredNode(null)} 
                        onClick={() => {
                          setActiveDomainKey(node.key);
                          setHoveredNode(null); 
                        }} 
                        className={`absolute -translate-y-1/2 flex items-center cursor-pointer group z-30 ${LEFT_NODES.includes(node) ? "-translate-x-full flex-row" : "flex-row-reverse"}`} style={{ top: `${node.y}%`, left: `${node.x}%` }}>
                        <div className={`w-2 h-10 border-y-2 ${LEFT_NODES.includes(node) ? 'border-l-2' : 'border-r-2'} ${hoveredNode === node.key ? 'border-white' : 'border-cyan-400'}`} />
                        <div className={`relative px-8 py-4 min-w-[340px] backdrop-blur-2xl border-2 transition-all duration-300 ${hoveredNode === node.key ? 'bg-white text-black border-white shadow-[0_0_40px_#fff]' : 'bg-black/90 text-white border-cyan-400 shadow-[0_0_30px_rgba(0,247,255,0.4)]'}`}><div className="flex items-center gap-6"><div className={`p-2 border-2 ${hoveredNode === node.key ? 'border-black text-black' : 'border-cyan-400 text-cyan-400 brightness-110 drop-shadow-[0_0_5px_#00f7ff]'}`}>{node.icon}</div><span className={`text-[12px] font-black tracking-widest uppercase ${conthrax} ${hoveredNode === node.key ? 'text-black' : 'text-white brightness-110'}`}>{node.label}</span></div></div>
                        <div className={`w-10 h-[2px] ${hoveredNode === node.key ? 'bg-white shadow-[0_0_20px_#fff]' : 'bg-cyan-400 shadow-[0_0_15px_#00f7ff]'}`} /><div className={`w-4 h-4 rotate-45 border-2 ${hoveredNode === node.key ? 'bg-white border-white' : 'bg-[#010103] border-cyan-400 shadow-[0_0_15px_#00f7ff]'}`} />
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* HUD FOOTER - REFINED SPACING */}
        <div className="absolute bottom-0 left-0 w-full px-6 lg:px-12 py-5 flex items-end justify-between pointer-events-none z-[110]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_5px_#00f7ff]" />
                <span className={`text-[8px] lg:text-[10px] tracking-widest text-cyan-400 font-black uppercase ${conthrax}`}>SYS_LINK: ON</span>
            </div>
            <div className="hidden lg:flex items-center gap-3">
                <CpuIcon size={14} className="text-cyan-400/60" />
                <span className="text-[9px] tracking-widest text-white/50">CPU_L: 12.4%</span>
            </div>
          </div>
          
          <div className="hidden lg:flex flex-col items-center">
            <div className={`text-[8px] tracking-[1.2em] font-mono text-cyan-300 uppercase font-black opacity-40 ${conthrax}`}>K-1000 TERMINAL</div>
          </div>

          <div className="flex flex-col items-end gap-0">
            <span className="text-[7px] lg:text-[9px] tracking-widest text-white/40 font-normal uppercase">TIMESTAMP</span>
            <span className="text-xl lg:text-3xl font-mono text-cyan-400 brightness-110 drop-shadow-[0_0_10px_#00f7ff]">
                {currentTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </section>

      {/* ─── SCROLLABLE CONTENT ─── */}
      <div className="relative z-[50] bg-black">
        
        {/* HERO BANNER SECTION */}
        <section className="w-full px-4 lg:px-20 pt-10 lg:pt-32">
          <div className="relative w-full aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9] max-h-[700px] rounded-[24px] lg:rounded-[40px] overflow-hidden border border-white/10 bg-black">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-[5]" />
            <img src="/hero/hero-2.jpg" className="absolute inset-0 w-full h-full object-cover opacity-50 lg:opacity-80" alt="Hero" />
            
            <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 h-full">
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={`${conthrax} text-cyan-400 tracking-[0.3em] lg:tracking-[0.6em] text-[8px] lg:text-[11px] mb-4 uppercase font-black`}>KIIT Elite's R&D Program</motion.p>
              <motion.h1 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} className={`${conthrax} text-2xl lg:text-8xl tracking-widest text-white mb-6 uppercase font-black`}>Join <span className="text-cyan-400 text-glow">K-1000</span></motion.h1>
              <motion.p className="text-white/70 max-w-xl text-[10px] lg:text-xl mb-8 font-normal leading-relaxed">Innovation • Research • Engineering <br className="hidden lg:block"/> The Official R&D Guild of KIIT University.</motion.p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-6">
                <Link href="/apply" className={`px-8 py-3.5 bg-cyan-400 text-black uppercase text-[10px] tracking-widest rounded-full shadow-[0_0_15px_rgba(0,247,255,0.3)] font-black text-center ${conthrax}`}>Apply Now</Link>
                <Link href="/about" className={`px-8 py-3.5 border border-cyan-400/50 text-cyan-400 uppercase text-[10px] tracking-widest rounded-full font-black text-center ${conthrax}`}>Learn More</Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-8 mt-8 lg:mt-24 w-full max-w-7xl mx-auto pb-10">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center space-y-1 lg:space-y-4 bg-white/[0.02] p-5 lg:p-8 rounded-xl border border-white/5">
                <span className={`${conthrax} text-2xl lg:text-6xl text-cyan-400 font-black`}>{stat.number}</span>
                <span className={`text-[7px] lg:text-[11px] uppercase tracking-widest text-white/40 font-black text-center ${conthrax}`}>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

  {/* SECTION: ABOUT K-1000 */}
        <section className="w-full px-6 md:px-20 py-32 border-t border-white/10">
          <div className="w-full max-w-[1500px] mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-24 w-full text-center"
            >
              <h2 className={`${conthrax} text-5xl md:text-8xl text-white uppercase tracking-tighter leading-none font-black`}>
                About <span className="text-cyan-400 brightness-110 drop-shadow-[0_0_15px_rgba(0,247,255,0.5)]">K-1000</span>
              </h2>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="relative rounded-[40px] overflow-hidden border border-white/10 shadow-2xl group aspect-video"
              >
                <img 
                  src="/hero/hero-1.jpg" 
                  className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-1000" 
                  alt="About K-1000" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <p className="text-xl text-white/70 leading-relaxed font-normal text-justify">
                  K-1000 is the official Research and Development (R&D) organization/program of KIIT, established to foster a culture of innovation, research, and real-world problem-solving. Its mission is to support 1000 exceptional students in pursuing cutting-edge research, while simultaneously training and enhancing their skills in a competitive and collaborative environment.
                </p>
                <p className="text-lg text-white/50 leading-relaxed font-normal text-justify">
                  The program encourages students to develop impactful projects that address real-world challenges across both technical and non-technical domains, thereby contributing to scientific, technological, and societal advancement.
                </p>
                
                <div className="grid grid-cols-2 gap-4 pt-6">
                  {["Hands-on projects", "Research & Patents", "Industry Pipelines", "Technical Mastery"].map((text, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/[0.03] p-4 rounded-xl border border-white/10">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#00f7ff]" />
                      <span className={`text-[9px] text-white uppercase tracking-widest font-black ${conthrax}`}>{text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="w-full max-w-7xl mx-auto py-20 px-6 lg:px-10">
          <h2 className={`${conthrax} text-xl lg:text-5xl text-center tracking-widest text-cyan-400 mb-12 lg:mb-24 uppercase font-black`}>Benefits & Perks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b: any, i: number) => {
              const Icon = iconMap[b.icon] || Lightbulb;
              return (
                <div key={i} className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-400/20 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className={`${conthrax} text-lg text-white tracking-widest uppercase font-black mb-3`}>{b.title}</h3>
                  <p className="text-xs text-white/50 leading-relaxed">{b.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <Footer />
      </div>

      <AnimatePresence mode="wait">
        {activeDomain && (
          <DomainHoloPanel 
            domain={activeDomain as any} 
            onClose={handlePanelClose} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}