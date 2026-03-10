"use client";

type Props = {
  children: React.ReactNode;
  accent?: string;
  width?: string;
  className?: string; // ⭐ ADDED
};

export default function GlassPanel({
  children,
  accent = "#22e2ff",
  width = "80vw",
  className = "",
}: Props) {
  return (
    <div
      className={`
        relative rounded-3xl p-10 border backdrop-blur-xl
        bg-white/5 border-white/10
        shadow-[0_0_50px_rgba(34,226,255,0.2)]
        ${className}
      `}
      style={{
        width,
        borderColor: accent,
        boxShadow: `0 0 120px ${accent}22`,
      }}
    >
      {children}
    </div>
  );
}
