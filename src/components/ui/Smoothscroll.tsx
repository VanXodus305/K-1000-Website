"use client";

import { ReactLenis } from "lenis/react";
import { ReactNode } from "react";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis 
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