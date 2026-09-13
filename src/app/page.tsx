"use client";

import { useCallback, useState } from "react";
import BootSequence from "@/components/boot/BootSequence";
import RecruitmentLiveModal from "@/components/home/RecruitmentLiveModal";

export default function HomePage() {
  const [bootComplete, setBootComplete] = useState(false);
  const handleBootComplete = useCallback(() => setBootComplete(true), []);

  return (
    <main className="min-h-screen bg-black">
      {/* This master component now handles the terminal, 
          the logo charging, and the final hand-off 
          to SystemCanvas in one unified lifecycle.
      */}
      <BootSequence onReady={handleBootComplete} />
      {bootComplete && <RecruitmentLiveModal />}
    </main>
  );
}
