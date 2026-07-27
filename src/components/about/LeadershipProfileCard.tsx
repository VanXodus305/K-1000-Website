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
        isExecutive ? "rounded-[28px] md:rounded-[34px]" : "rounded-[24px] md:rounded-[30px]"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent opacity-80" />

      <div
        className={`relative overflow-hidden ${
          isExecutive ? "aspect-[4/4.9] sm:aspect-[4/4.8]" : "aspect-[4/4.95] sm:aspect-[4/4.85]"
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
              ? "min-h-[132px] p-4 sm:min-h-[142px] sm:p-5 md:min-h-[150px] md:p-5"
              : "min-h-[146px] p-4 sm:min-h-[156px] sm:p-5 md:min-h-[164px] md:p-6"
          }`}
        >
          <div className="absolute inset-0 bg-black/58" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,16,0.22),rgba(8,12,16,0.78))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,247,255,0.08),transparent_74%)] opacity-95" />

          <div className="relative z-10 flex w-full max-w-[16rem] flex-col items-center justify-center">
            <h4 className={`${conthrax} text-[14px] text-white uppercase leading-tight font-black tracking-[0.06em] transition-colors group-hover:text-cyan-300 sm:text-[15px] md:text-[18px]`}>
              {name}
            </h4>
            <p className={`${conthrax} mt-1.5 text-cyan-400 text-[8px] tracking-[0.14em] uppercase font-black sm:text-[8px] sm:tracking-[0.15em] md:text-[10px]`}>
              {position}
            </p>
            {branch ? (
              <p className={`${conthrax} mt-2.5 max-w-[16rem] text-white/42 text-[8px] uppercase tracking-[0.14em] font-bold md:text-[8px] md:tracking-[0.15em]`}>
                {branch}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
