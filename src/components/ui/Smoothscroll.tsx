"use client";

import { ReactLenis } from "lenis/react";
import type { LenisRef } from "lenis/react";
import { ReactNode, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<LenisRef>(null);
  const previousPathname = useRef<string | null>(null);

  useEffect(() => {
    // Let the browser preserve its position on the initial page load, but always
    // begin a new route at the top—even when Lenis owns the scroll position.
    if (previousPathname.current === null) {
      previousPathname.current = pathname;
      return;
    }

    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;

    const frame = window.requestAnimationFrame(() => {
      lenisRef.current?.lenis?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <ReactLenis
      ref={lenisRef}
      root 
      options={{ 
        // Higher lerp (0.15) makes it feel more responsive to your actual scroll
        lerp: 0.15,      
        // Shortened duration for a snappier "stop"
        duration: 0.8,   
        smoothWheel: true,
        wheelMultiplier: 1,
        // Reduced touch multiplier to prevent "slippery" mobile scrolling
        touchMultiplier: 1.5, 
        infinite: false,
        // Use 'easings' to make the start/stop feel more natural
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      }}
    >
      {children}
    </ReactLenis>
  );
}
