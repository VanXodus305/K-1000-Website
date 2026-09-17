"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ShieldCheck,
  Binary,
  Cpu,
  GraduationCap,
  Boxes,
  Zap,
  Activity,
  Cpu as CpuIcon,
  Rocket,
  FileText,
  BookOpen,
  Star,
  Award,
  Globe,
  Lightbulb,
  Users,
  LucideIcon,
} from "lucide-react";
import gsap from "gsap";
import Link from "next/link";
import Image from "next/image";

import SharedHeader from "../ui/SharedHeader";
import Footer from "../footer/Footer";
import data from "@/data/data.json";

const conthrax = "font-['Conthrax',_sans-serif]";

const iconMap: Record<string, LucideIcon> = {
  Rocket,
  FileText,
  BookOpen,
  Star,
  Award,
  Globe,
  Lightbulb,
  Users,
};

type BenefitItem = (typeof data)["benefits"][number];
type Particle = {
  x: number;
  y: number;
  size: number;
  baseSize: number;
  vx: number;
  vy: number;
};

type StatItem = {
  value: number;
  suffix: string;
  label: string;
};

const AnimatedStat = ({
  value,
  suffix,
  label,
}: StatItem) => {
  const statRef = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = statRef.current;
    if (!element || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setHasAnimated(true);
        const duration = 1200;
        const start = performance.now();

        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplayValue(Math.round(value * eased));

          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        };

        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.35 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasAnimated, value]);

  return (
    <div
      ref={statRef}
      className="flex flex-col items-center py-4 lg:py-8 bg-white/[0.02] rounded-xl border border-white/5 group"
    >
      <span
        className={`${conthrax} text-xl lg:text-6xl text-amber-400 font-black tabular-nums`}
      >
        {displayValue}
        {suffix}
      </span>
      <span
        className={`text-[6px] lg:text-[11px] uppercase tracking-widest text-white font-black text-center ${conthrax}`}
      >
        {label}
      </span>
    </div>
  );
};

const CubeBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationFrameId = 0;
    let disposed = false;
    let removeWindowListeners = () => {};
    const ctxGSAP = gsap.context(() => {
      let particles: Particle[] = [];
      let width = window.innerWidth,
        height = window.innerHeight;
      const mouse = { x: width / 2, y: height / 2 };
      const resize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        init();
      };
      const createParticle = (): Particle => ({
        x: Math.random() * width,
        y: Math.random() * height,
        baseSize: Math.random() * 2 + 1.5,
        size: 0,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      });
      const init = () => {
        const count = Math.min(Math.floor((width * height) / 9000), width < 1024 ? 50 : 90);
        particles = Array.from({ length: count }, () => {
          const particle = createParticle();
          return { ...particle, size: particle.baseSize };
        });
      };
      const animate = () => {
        ctx.clearRect(0, 0, width, height);
        particles.forEach((p, i) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
          const dx = mouse.x - p.x,
            dy = mouse.y - p.y,
            dist = Math.sqrt(dx * dx + dy * dy);
          p.size =
            dist < 150
              ? gsap.utils.interpolate(p.size, p.baseSize * 3, 0.1)
              : gsap.utils.interpolate(p.size, p.baseSize, 0.05);
          ctx.fillStyle = "rgba(245, 174, 55, 0.85)";
          ctx.shadowBlur = 12;
          ctx.shadowColor = "#f5ae37";
          ctx.fillRect(p.x, p.y, p.size, p.size);
          ctx.shadowBlur = 0;
          for (let j = i + 1; j < particles.length; j++) {
            const dx = p.x - particles[j].x,
              dy = p.y - particles[j].y,
              dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(245, 174, 55, ${0.3 * (1 - dist / 120)})`;
              ctx.lineWidth = 0.8;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        });
        if (!disposed) animationFrameId = requestAnimationFrame(animate);
      };
      const handleMouseMove = (e: MouseEvent) => {
        gsap.to(mouse, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.6,
          ease: "power2.out",
        });
      };
      window.addEventListener("resize", resize);
      window.addEventListener("mousemove", handleMouseMove);
      removeWindowListeners = () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", handleMouseMove);
      };
      resize();
      animationFrameId = requestAnimationFrame(animate);
    });
    return () => {
      disposed = true;
      removeWindowListeners();
      window.cancelAnimationFrame(animationFrameId);
      ctxGSAP.revert();
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

const LEFT_NODES = [
  {
    key: "internship",
    label: "Internship & Placement",
    y: 25,
    x: 34,
    icon: <ShieldCheck size={24} />,
  },
  {
    key: "projects",
    label: "Project Wing",
    y: 45,
    x: 30,
    icon: <Boxes size={24} />,
  },
  {
    key: "training",
    label: "Training Program",
    y: 65,
    x: 34,
    icon: <Cpu size={24} />,
  },
];

const RIGHT_NODES = [
  {
    key: "higher",
    label: "Higher Studies",
    y: 25,
    x: 66,
    icon: <GraduationCap size={24} />,
  },
  {
    key: "research",
    label: "Research & Publication",
    y: 45,
    x: 68,
    icon: <Binary size={24} />,
  },
  {
    key: "events",
    label: "Event Management",
    y: 65,
    x: 66,
    icon: <Zap size={24} />,
  },
];

export default function UnifiedPortal() {
  const { benefits } = data;
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
      if (window.innerWidth / window.innerHeight > baseRatio)
        newScale = window.innerHeight / 900;
      setScale(Math.max(0.65, Math.min(newScale, 1.05)));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      clearInterval(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const mouseX = useMotionValue(0),
    mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 }),
    springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const moveX = useTransform(springX, [-500, 500], [-12, 12]),
    moveY = useTransform(springY, [-500, 500], [-12, 12]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  const allNodes = useMemo(() => [...LEFT_NODES, ...RIGHT_NODES], []);
  const stats: StatItem[] = [
    { value: 100, suffix: "+", label: "Projects" },
    { value: 50, suffix: "+", label: "Publications" },
    { value: 20, suffix: "+", label: "Patents Filed" },
    { value: 20, suffix: "+", label: "Collaborations" },
  ];

  return (
    <div className="relative w-full bg-[#010103] text-white overflow-x-hidden selection:bg-amber-500/30">
      <CubeBackground />

      {/* ─── SYSTEM CANVAS HERO ─── */}
      <section className="relative isolate w-full h-[100svh] min-h-[600px] md:h-[100dvh] flex flex-col items-center justify-center overflow-hidden border-b border-amber-100/15">
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <picture className="absolute inset-0 block">
            <source media="(max-width: 767px)" srcSet="/events/generated/ignithon2-registration-mobile.webp" />
            <Image src="/events/generated/ignithon2-registration-desktop.webp" alt="" fill priority sizes="100vw" className="object-cover object-[50%_42%] opacity-100 md:object-center" />
          </picture>
          <div className="absolute inset-0 bg-[#020202]/5" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020202]/8 to-[#020202]/38" />
        </div>
        <SharedHeader />

        <motion.div
          style={{ x: moveX, y: moveY, scale: 1.05 }}
          className="absolute inset-0 z-0 opacity-30 pointer-events-none"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f5ae3706_1px,transparent_1px),linear-gradient(to_bottom,#f5ae3706_1px,transparent_1px)] bg-[size:30px_30px] lg:bg-[size:60px_60px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#010103_85%)]" />
        </motion.div>

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center w-full h-full"
          >
                {isMobile ? (
                  <div className="flex flex-col items-center w-full h-full justify-between pt-24 pb-20">
                    <div className="flex-none">
                      <div className="relative">
                        <div className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-full scale-125 animate-pulse" />
                        <img
                          src="/k1000-small.png"
                          className="w-24 brightness-110 drop-shadow-[0_0_10px_#f5ae37] relative z-10"
                          alt="Core"
                        />
                      </div>
                    </div>

                    <div className="flex-1 w-full max-w-[340px] flex flex-col justify-center space-y-2 px-2">
                      {allNodes.map((node) => (
                        <div
                          key={node.key}
                          aria-disabled="true"
                          className="w-full bg-black/40 backdrop-blur-xl border border-amber-400/30 p-3 flex justify-between items-center shadow-[0_0_10px_rgba(245, 174, 55,0.05)] rounded-lg"
                        >
                          <div
                            className={`flex items-center gap-3 text-amber-400 ${conthrax}`}
                          >
                            <div className="scale-75">
                              {node.icon}
                            </div>
                            <span className="text-[9px] tracking-[0.05em] text-white uppercase font-bold">
                              {node.label}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex-none mt-4">
                      <div
                        className={`text-[7px] tracking-[0.4em] text-amber-400/70 font-black uppercase text-center drop-shadow-[0_0_5px_#f5ae37] ${conthrax}`}
                      >
                        Train • Transform • Transcend
                      </div>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    style={{ transform: `scale(${scale})` }}
                    className="relative w-[1440px] h-[900px] flex items-center justify-center"
                  >

                    <svg
                      viewBox="0 0 1440 900"
                      preserveAspectRatio="none"
                      className="absolute inset-0 w-full h-full z-0 pointer-events-none"
                    >
                      {allNodes.map((node) => (
                        <motion.line
                          key={node.key}
                          x1={720}
                          y1={450}
                          x2={node.x * 14.4}
                          y2={node.y * 9}
                          stroke="#f5ae37"
                          strokeWidth="0.9"
                          strokeOpacity="0.8"
                        />
                      ))}
                    </svg>

                    <div className="flex flex-col items-center relative z-20">
                      <motion.div
                        onMouseEnter={() => setIsCoreHovered(true)}
                        onMouseLeave={() => setIsCoreHovered(false)}
                        className={`relative w-[320px] h-[440px] overflow-hidden rounded-[40px] border-2 border-amber-300 bg-[#090602] flex flex-col cursor-pointer shadow-[0_0_92px_rgba(245,174,55,0.72),0_0_36px_rgba(239,78,61,0.25),inset_0_0_64px_rgba(245,174,55,0.2)] transition-colors duration-500 ${isCoreHovered ? "border-amber-100" : ""}`}
                      >
                        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_55%,rgba(245,174,55,0.46)_0%,rgba(239,78,61,0.16)_42%,transparent_74%)]" />
                        <div className="relative z-10 flex justify-between items-center px-8 py-4 border-b border-amber-200/35">
                          <Activity
                            size={12}
                            className="text-amber-400 animate-pulse drop-shadow-[0_0_5px_#f5ae37]"
                          />
                          <span
                            className={`text-[7px] tracking-[0.6em] text-amber-300 font-black ${conthrax}`}
                          >
                            VERS.2026
                          </span>
                        </div>
                        <div className="relative z-10 flex-1 flex items-center justify-center">
                          <div className="absolute w-52 h-52 bg-amber-400/55 blur-[90px] rounded-full" />
                          <img
                            src="/k1000-small.png"
                            className={`w-44 z-10 transition-transform duration-500 ${isCoreHovered ? "scale-110 brightness-110" : "brightness-105"} drop-shadow-[0_0_20px_#f5ae37]`}
                            alt="Core"
                          />
                        </div>
                      </motion.div>
                      <div
                        className={`mt-20 translate-x-10 translate-y-8 text-[18px] tracking-[1.4em] text-amber-400 font-black uppercase text-center drop-shadow-[0_0_12px_#f5ae37] brightness-110 ${conthrax}`}
                      >
                        Train • Transform • Transcend
                      </div>
                    </div>

                    {allNodes.map((node) => {
                      const isLeft = LEFT_NODES.includes(node);
                      return (
                        <motion.div
                          key={node.key}
                          aria-disabled="true"
                          className={`absolute flex items-center z-30 ${isLeft ? "flex-row-reverse" : "flex-row"}`}
                          style={{
                            top: `${node.y}%`,
                            left: `${node.x}%`,
                            // Right nodes (flex-row): diamond is first child = left edge = at anchor. Just center vertically.
                            // Left nodes (flex-row-reverse): diamond is first child but visually last (rightmost).
                            //   Shift entire button left by 100% so diamond's right edge lands at anchor.
                            transform: isLeft
                              ? "translate(-100%, -50%)"
                              : "translate(0%, -50%)",
                          }}
                        >
                          {/* diamond — center sits exactly at node.x/node.y = SVG line endpoint */}
                          <div
                            className="w-4 h-4 rotate-45 border-2 flex-shrink-0 bg-[#010103] border-amber-400 shadow-[0_0_15px_#f5ae37]"
                          />
                          {/* horizontal stub */}
                          <div
                            className="w-10 h-[2px] flex-shrink-0 bg-amber-400 shadow-[0_0_15px_#f5ae37]"
                          />
                          {/* card */}
                          <div
                            className="relative px-8 py-4 min-w-[340px] backdrop-blur-2xl border-2 bg-black/90 text-white border-amber-400 shadow-[0_0_30px_rgba(245, 174, 55,0.4)]"
                          >
                            <div className="flex items-center gap-6">
                              <div
                                className="p-2 border-2 border-amber-400 text-amber-400 brightness-110 drop-shadow-[0_0_5px_#f5ae37]"
                              >
                                {node.icon}
                              </div>
                              <span
                                className={`text-[12px] font-black tracking-widest uppercase text-white brightness-110 ${conthrax}`}
                              >
                                {node.label}
                              </span>
                            </div>
                          </div>
                          {/* bracket notch on far card edge */}
                          <div
                            className={`w-2 h-10 border-y-2 flex-shrink-0 border-amber-400 ${isLeft ? "border-l-2" : "border-r-2"}`}
                          />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 w-full px-5 lg:px-12 py-4 flex items-end justify-between pointer-events-none z-[110]">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
              <span
                className={`text-[8px] tracking-[0.1em] text-amber-400 font-bold uppercase ${conthrax}`}
              >
                SYS: ON
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <CpuIcon size={14} className="text-amber-400/60" />
              <span className="text-[9px] tracking-widest text-white">
                CPU: 12.4%
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-0">
            <span className="text-[6px] lg:text-[9px] tracking-widest text-white uppercase">
              TIMESTAMP
            </span>
            <span className="text-sm lg:text-3xl font-mono text-amber-400 brightness-110">
              {currentTime.toLocaleTimeString([], {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </section>

      {/* ─── SCROLLABLE CONTENT ─── */}
      <div className="relative z-[50] bg-black">
        <section className="w-full px-4 lg:px-20 pt-10 lg:pt-32">
          <div className="relative w-full min-h-[450px] aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9] rounded-[24px] lg:rounded-[40px] overflow-hidden border border-white/10 bg-black">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-[5]" />
            <img
              src="/hero/hero-2.jpg"
              className="absolute inset-0 w-full h-full object-cover brightness-[0.35]"
              alt="Hero"
            />

            <div className="relative z-10 flex flex-col items-center justify-center text-center p-4 h-full">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className={`${conthrax} text-amber-400 tracking-[0.2em] text-[7px] lg:text-[11px] mb-2 uppercase font-black`}
              >
                KIIT Elite&apos;s R&amp;D Program
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className={`${conthrax} text-3xl lg:text-8xl tracking-tight text-white mb-4 uppercase font-black leading-tight`}
              >
                Join{" "}
                <span className="text-amber-400 drop-shadow-[0_0_10px_rgba(245, 174, 55,0.4)]">
                  K-1000
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-white max-w-md text-[10px] lg:text-xl mb-6 font-normal"
              >
                Innovation • Research • Engineering <br /> The Official R&D
                Guild of KIIT University.
              </motion.p>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[280px] sm:max-w-none justify-center">
                <Link
                  href="/apply"
                  className={`px-6 py-3 bg-amber-400 text-black uppercase text-[9px] tracking-widest rounded-full font-black text-center ${conthrax}`}
                >
                  Apply Now
                </Link>
                <Link
                  href="/about"
                  className={`px-6 py-3 border border-amber-400/50 text-amber-400 uppercase text-[9px] tracking-widest rounded-full font-black text-center ${conthrax}`}
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 lg:mt-24 w-full max-w-7xl mx-auto pb-10 px-2">
            {stats.map((stat) => (
              <AnimatedStat
                key={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
              />
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
              <h2
                className={`${conthrax} text-5xl md:text-8xl text-white uppercase tracking-tight leading-none font-black`}
              >
                About{" "}
                <span className="text-amber-400 brightness-110 drop-shadow-[0_0_18px_rgba(245, 174, 55,0.55)]">
                  K-1000
                </span>
              </h2>
              <div className="mx-auto mt-5 h-px w-28 bg-gradient-to-r from-transparent via-amber-400/90 to-transparent shadow-[0_0_14px_rgba(245, 174, 55,0.45)]" />
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-16 items-start mb-16">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
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
                viewport={{ once: true }}
                className="space-y-8 text-left"
              >
                <p className="text-xl text-white leading-relaxed font-normal">
                  K-1000 is the official Research and Development (R&D)
                  organization program of KIIT, established to foster a culture
                  of innovation, research, and real-world problem-solving. Its
                  mission is to support 1000 exceptional students in pursuing
                  cutting-edge research, while simultaneously training and
                  enhancing their skills in a competitive and collaborative
                  environment.
                </p>
                <p className="text-lg text-white leading-relaxed font-normal">
                  The program encourages students to develop impactful projects
                  that address real-world challenges across both technical and
                  non-technical domains, thereby contributing to scientific,
                  technological, and societal advancement.
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {[
                "Hands-on projects",
                "Research & Patents",
                "Industry Pipelines",
                "Technical Mastery",
              ].map((text, i) => (
                <div
                  key={i}
                  className="flex items-center justify-start gap-4 bg-white/[0.04] p-5 rounded-2xl border-2 border-white/20 hover:border-amber-400/50 hover:bg-white/[0.06] transition-all duration-300 group"
                >
                  <div className="w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_12px_#f5ae37] group-hover:scale-110 transition-transform" />
                  <span
                    className={`text-[10px] text-white uppercase tracking-widest font-black ${conthrax} group-hover:text-amber-400 transition-colors text-left`}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full max-w-7xl mx-auto py-16 px-6">
          <h2
            className={`${conthrax} text-xl lg:text-5xl text-center tracking-widest text-amber-400 mb-10 lg:mb-24 uppercase font-black`}
          >
            Benefits & Perks
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {benefits.map((b: BenefitItem, i: number) => {
              const Icon = iconMap[b.icon] || Lightbulb;
              return (
                <div
                  key={i}
                  className="p-6 lg:p-8 rounded-xl bg-white/[0.02] border border-white/10 hover:border-amber-400/50 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 lg:w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4 lg:mb-6 border border-amber-400/20">
                    <Icon className="w-5 h-5 lg:w-6 h-6 text-amber-400" />
                  </div>
                  <h3
                    className={`${conthrax} text-sm lg:text-lg text-white tracking-widest uppercase font-black mb-2`}
                  >
                    {b.title}
                  </h3>
                  <p className="text-xs lg:text-md text-white leading-relaxed">
                    {b.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <Footer />
      </div>

    </div>
  );
}
