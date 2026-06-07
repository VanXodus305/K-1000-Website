"use client";

import { useEffect, useRef } from "react";

type CubeBackgroundProps = {
  className?: string;
  zIndex?: number;
  densityDesktop?: number;
  densityMobile?: number;
  maxParticles?: number;
  lineDistance?: number;
  mouseRadius?: number;
  enableGlow?: boolean;
  disableLinesOnMobile?: boolean;
};

type Particle = {
  x: number;
  y: number;
  size: number;
  baseSize: number;
  vx: number;
  vy: number;
};

const MOBILE_BREAKPOINT = 768;

export default function CubeBackground({
  className = "",
  zIndex = 1,
  densityDesktop = 9500,
  densityMobile = 15000,
  maxParticles = 140,
  lineDistance = 120,
  mouseRadius = 150,
  enableGlow = false,
  disableLinesOnMobile = false,
}: CubeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let isMobile = false;
    let particles: Particle[] = [];
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      isMobile = width < MOBILE_BREAKPOINT;

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      mouse.x = width / 2;
      mouse.y = height / 2;
      mouse.targetX = mouse.x;
      mouse.targetY = mouse.y;

      const density = isMobile ? densityMobile : densityDesktop;
      const count = Math.min(Math.floor((width * height) / density), maxParticles);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        baseSize: Math.random() * 2 + 1.5,
        size: 0,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      })).map((particle) => ({ ...particle, size: particle.baseSize }));
    };

    const handlePointerMove = (event: PointerEvent) => {
      mouse.targetX = event.clientX;
      mouse.targetY = event.clientY;
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;

        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const targetSize = distance < mouseRadius ? particle.baseSize * 3 : particle.baseSize;

        particle.size += (targetSize - particle.size) * (distance < mouseRadius ? 0.1 : 0.05);

        ctx.fillStyle = "rgba(0, 247, 255, 0.8)";
        if (enableGlow) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = "#00f7ff";
        }
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        if (enableGlow) {
          ctx.shadowBlur = 0;
        }

        if (disableLinesOnMobile && isMobile) continue;

        for (let j = i + 1; j < particles.length; j++) {
          const neighbor = particles[j];
          const lineDx = particle.x - neighbor.x;
          const lineDy = particle.y - neighbor.y;
          const lineDistanceCurrent = Math.sqrt(lineDx * lineDx + lineDy * lineDy);

          if (lineDistanceCurrent < lineDistance) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 247, 255, ${0.25 * (1 - lineDistanceCurrent / lineDistance)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(neighbor.x, neighbor.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = window.requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [
    densityDesktop,
    densityMobile,
    disableLinesOnMobile,
    enableGlow,
    lineDistance,
    maxParticles,
    mouseRadius,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`.trim()}
      style={{ zIndex, transform: "translateZ(0)" }}
    />
  );
}
