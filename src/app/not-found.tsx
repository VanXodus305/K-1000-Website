"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import CubeBackground from "../components/ui/CubeBackground";

const conthrax = "font-['Conthrax',_sans-serif]";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      router.replace("/");
    }, 2600);

    return () => window.clearTimeout(timeout);
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#010103] text-white">
      <CubeBackground
        densityDesktop={9000}
        densityMobile={15000}
        maxParticles={150}
        enableGlow
        disableLinesOnMobile
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f7ff06_1px,transparent_1px),linear-gradient(to_bottom,#00f7ff06_1px,transparent_1px)] bg-[size:30px_30px] lg:bg-[size:60px_60px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#010103_85%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-4xl border border-cyan-400/15 bg-black/20 px-8 py-12 text-center backdrop-blur-md md:px-14 md:py-16">
          <div className={`text-[10px] uppercase tracking-[0.45em] text-cyan-400/70 ${conthrax}`}>
            Route Error
          </div>

          <h1
            className={`mt-6 text-4xl uppercase leading-none tracking-tight text-white md:text-7xl ${conthrax}`}
          >
            404
            <br />
            Signal Lost
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
            The requested path is outside the K-1000 system registry. Redirecting
            you back to the primary interface.
          </p>

          <Link
            href="/"
            className={`mt-10 inline-flex items-center justify-center rounded-full border border-cyan-400/40 px-7 py-3 text-[10px] uppercase tracking-[0.3em] text-cyan-300 transition-colors hover:border-cyan-300 hover:text-white ${conthrax}`}
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
