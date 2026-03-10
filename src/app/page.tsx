"use client";

import BootSequence from "@/components/boot/BootSequence";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      {/* This master component now handles the terminal, 
          the logo charging, and the final hand-off 
          to SystemCanvas in one unified lifecycle.
      */}
      <BootSequence />
    </main>
  );
}