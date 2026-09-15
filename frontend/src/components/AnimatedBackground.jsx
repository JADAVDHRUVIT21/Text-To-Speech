export const AnimatedBackgroundStyles = () => (
  <style>{`

    @keyframes tts-float-orb-1 {
      0%   { transform: translate3d(0, 0, 0) scale(1); }
      50%  { transform: translate3d(40px, -30px, 0) scale(1.15); }
      100% { transform: translate3d(0, 0, 0) scale(1); }
    }
    @keyframes tts-float-orb-2 {
      0%   { transform: translate3d(0, 0, 0) scale(1); }
      50%  { transform: translate3d(-50px, 40px, 0) scale(1.2); }
      100% { transform: translate3d(0, 0, 0) scale(1); }
    }
    @keyframes tts-float-orb-3 {
      0%   { transform: translate3d(0, 0, 0) scale(1); }
      50%  { transform: translate3d(30px, 50px, 0) scale(0.9); }
      100% { transform: translate3d(0, 0, 0) scale(1); }
    }
    @keyframes tts-bar {
      0%, 100% { transform: scaleY(0.35); opacity: 0.55; }
      50%      { transform: scaleY(1);    opacity: 1; }
    }
    @keyframes tts-wave {
      0%   { transform: scale(0.6); opacity: 0.7; }
      100% { transform: scale(2.4); opacity: 0; }
    }
    @keyframes tts-particle {
      0%   { transform: translateY(0) scale(0.6); opacity: 0; }
      20%  { opacity: 0.8; }
      100% { transform: translateY(-140px) scale(1); opacity: 0; }
    }
    @keyframes tts-shimmer {
      0%   { transform: translateX(-120%); }
      100% { transform: translateX(120%); }
    }
    @keyframes tts-fade-up {
      0%   { opacity: 0; transform: translateY(14px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes tts-spin-slow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes tts-eq {
      0%, 100% { transform: scaleY(0.4); }
      50%      { transform: scaleY(1); }
    }

    .tts-anim-orb-1 { animation: tts-float-orb-1 14s ease-in-out infinite; }
    .tts-anim-orb-2 { animation: tts-float-orb-2 18s ease-in-out infinite; }
    .tts-anim-orb-3 { animation: tts-float-orb-3 22s ease-in-out infinite; }

    .tts-anim-bar { animation: tts-bar 1.6s ease-in-out infinite; transform-origin: bottom center; }
    .tts-anim-bar:nth-child(2) { animation-delay: 0.12s; }
    .tts-anim-bar:nth-child(3) { animation-delay: 0.24s; }
    .tts-anim-bar:nth-child(4) { animation-delay: 0.36s; }
    .tts-anim-bar:nth-child(5) { animation-delay: 0.48s; }
    .tts-anim-bar:nth-child(6) { animation-delay: 0.60s; }
    .tts-anim-bar:nth-child(7) { animation-delay: 0.72s; }
    .tts-anim-bar:nth-child(8) { animation-delay: 0.84s; }
    .tts-anim-bar:nth-child(9) { animation-delay: 0.96s; }

    .tts-anim-wave { animation: tts-wave 3.6s ease-out infinite; }
    .tts-anim-wave:nth-child(2) { animation-delay: 1.2s; }
    .tts-anim-wave:nth-child(3) { animation-delay: 2.4s; }

    .tts-anim-particle { animation: tts-particle 5s linear infinite; }
    .tts-anim-particle:nth-child(2) { animation-delay: 1s; }
    .tts-anim-particle:nth-child(3) { animation-delay: 2s; }
    .tts-anim-particle:nth-child(4) { animation-delay: 3s; }
    .tts-anim-particle:nth-child(5) { animation-delay: 4s; }

    .tts-anim-shimmer { animation: tts-shimmer 3.8s ease-in-out infinite; }

    .tts-anim-fade-up {
      opacity: 0;
      animation: tts-fade-up 0.7s ease-out forwards;
    }
    .tts-anim-fade-up.delay-1 { animation-delay: 0.10s; }
    .tts-anim-fade-up.delay-2 { animation-delay: 0.22s; }
    .tts-anim-fade-up.delay-3 { animation-delay: 0.34s; }
    .tts-anim-fade-up.delay-4 { animation-delay: 0.46s; }
    .tts-anim-fade-up.delay-5 { animation-delay: 0.58s; }
    .tts-anim-fade-up.delay-6 { animation-delay: 0.70s; }

    .tts-anim-spin-slow { animation: tts-spin-slow 28s linear infinite; }

    .tts-eq-bar {
      animation: tts-eq 1s ease-in-out infinite;
      transform-origin: center bottom;
    }
    .tts-eq-bar:nth-child(2) { animation-delay: 0.15s; }
    .tts-eq-bar:nth-child(3) { animation-delay: 0.3s; }

    @media (prefers-reduced-motion: reduce) {
      .tts-anim-orb-1,
      .tts-anim-orb-2,
      .tts-anim-orb-3,
      .tts-anim-bar,
      .tts-anim-wave,
      .tts-anim-particle,
      .tts-anim-shimmer,
      .tts-anim-spin-slow,
      .tts-eq-bar {
        animation: none !important;
      }
      .tts-anim-fade-up {
        opacity: 1;
        animation: none !important;
        
      }
    }
  `}</style>
);

export function AnimatedBackground({ intensity = "full" }) {
  const isFull = intensity === "full";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 800px at 10% 0%, color-mix(in srgb, var(--accent-primary) 22%, transparent), transparent 60%)," +
            "radial-gradient(900px 700px at 100% 100%, color-mix(in srgb, var(--accent-primary) 18%, transparent), transparent 60%)," +
            "linear-gradient(180deg, #0b1020 0%, #070912 100%)",
        }}
      />

      <div
        className={`absolute rounded-full blur-3xl opacity-40 tts-anim-orb-1 ${
          isFull ? "h-[420px] w-[420px]" : "h-[280px] w-[280px]"
        }`}
        style={{ top: "-10%", left: "-8%", backgroundColor: "var(--accent-primary)" }}
      />
      <div
        className={`absolute rounded-full blur-3xl opacity-30 tts-anim-orb-2 ${
          isFull ? "h-[460px] w-[460px]" : "h-[300px] w-[300px]"
        }`}
        style={{ bottom: "-15%", right: "-10%", backgroundColor: "var(--accent-primary)" }}
      />
      <div
        className={`absolute rounded-full blur-3xl opacity-25 tts-anim-orb-3 ${
          isFull ? "h-[340px] w-[340px]" : "h-[220px] w-[220px]"
        }`}
        style={{
          top: "40%",
          left: "55%",
          backgroundColor: "color-mix(in srgb, var(--accent-primary) 60%, white)",
        }}
      />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:left-[75%]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border tts-anim-wave"
            style={{
              height: 180,
              width: 180,
              borderColor: "color-mix(in srgb, var(--accent-primary) 55%, transparent)",
              animationDelay: `${i * 1.2}s`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex h-40 items-end justify-center gap-1.5 px-6 opacity-60">
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className="tts-anim-bar w-1.5 rounded-full sm:w-2"
            style={{
              height: `${40 + ((i * 13) % 60)}%`,
              backgroundColor: "color-mix(in srgb, var(--accent-primary) 70%, white)",
              opacity: 0.65,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0">
        {[
          { left: "12%", bottom: "10%", size: 6, delay: 0 },
          { left: "28%", bottom: "20%", size: 4, delay: 1 },
          { left: "47%", bottom: "8%",  size: 5, delay: 2 },
          { left: "68%", bottom: "18%", size: 4, delay: 3 },
          { left: "85%", bottom: "12%", size: 6, delay: 4 },
        ].map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full tts-anim-particle"
            style={{
              left: p.left,
              bottom: p.bottom,
              width: p.size,
              height: p.size,
              backgroundColor: "color-mix(in srgb, var(--accent-primary) 80%, white)",
              boxShadow: "0 0 12px color-mix(in srgb, var(--accent-primary) 70%, transparent)",
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}