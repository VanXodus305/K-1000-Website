"use client";

type LeadershipProfileCardProps = {
  name: string;
  position: string;
  image: string;
  branch?: string;
  variant?: "executive" | "standard";
};

const conthrax = "font-['Conthrax',_Arial]";

export default function LeadershipProfileCard({
  name,
  position,
  image,
  branch,
  variant = "standard",
}: LeadershipProfileCardProps) {
  const isExecutive = variant === "executive";
  const isPlaceholder = image === "/k1000-small.png";

  return (
    <div
      className={`group relative overflow-hidden border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] shadow-[0_0_40px_rgba(0,0,0,0.28)] transition-all duration-500 hover:border-cyan-400/50 hover:shadow-[0_0_40px_rgba(0,247,255,0.08)] ${
        isExecutive ? "rounded-[30px] md:rounded-[40px]" : "rounded-[26px] md:rounded-[34px]"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent opacity-80" />

      <div
        className={`relative overflow-hidden ${
          isExecutive ? "aspect-[4/5.05] sm:aspect-[4/4.95]" : "aspect-[4/5.15] sm:aspect-[4/5.05]"
        }`}
      >
        <img
          src={image}
          className={`absolute inset-0 size-full brightness-95 transition-all duration-700 will-change-transform group-hover:scale-105 ${
            isPlaceholder
              ? "object-contain p-8 bg-black/80"
              : `object-cover ${isExecutive ? "object-[center_24%]" : "object-[center_24%]"}`
          }`}
          alt={name}
          loading="lazy"
          decoding="async"
        />

        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

        <div
          className={`absolute inset-x-0 bottom-0 z-20 flex flex-col items-center justify-center border-t border-white/8 text-center ${
            isExecutive
              ? "min-h-[148px] p-5 sm:min-h-[156px] sm:p-6 md:min-h-[168px] md:p-6"
              : "min-h-[168px] p-5 sm:min-h-[176px] sm:p-6 md:min-h-[184px] md:p-7"
          }`}
        >
          <div className="absolute inset-0 bg-black/58" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,16,0.22),rgba(8,12,16,0.78))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,247,255,0.08),transparent_74%)] opacity-95" />

          <div className="relative z-10 flex w-full max-w-[18rem] flex-col items-center justify-center">
            <h4 className={`${conthrax} text-[15px] text-white uppercase leading-tight font-black tracking-[0.06em] transition-colors group-hover:text-cyan-300 sm:text-base md:text-xl`}>
              {name}
            </h4>
            <p className={`${conthrax} mt-2 text-cyan-400 text-[8px] tracking-[0.14em] uppercase font-black sm:text-[9px] sm:tracking-[0.16em] md:text-[11px]`}>
              {position}
            </p>
            {branch ? (
              <p className={`${conthrax} mt-3 max-w-[18rem] text-white/42 text-[8px] uppercase tracking-[0.14em] font-bold md:text-[9px] md:tracking-[0.16em]`}>
                {branch}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
