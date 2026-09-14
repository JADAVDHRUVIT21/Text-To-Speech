import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";

export default function LoadingTransition({
  visible = false,
  message = "Signing you in…",
  subMessage = "Setting up your workspace",
}) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-white/80 backdrop-blur-xl transition-opacity duration-500 dark:bg-slate-950/85"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Accent gradient blobs */}
      <div
        className="pointer-events-none absolute -top-40 -left-32 h-[500px] w-[500px] rounded-full opacity-30 blur-3xl animate-[pulseGlow_4s_ease-in-out_infinite]"
        style={{ backgroundColor: "var(--accent-primary)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-32 h-[500px] w-[500px] rounded-full opacity-25 blur-3xl animate-[pulseGlow_4s_ease-in-out_infinite_1s]"
        style={{ backgroundColor: "var(--accent-primary)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Animated logo */}
        <div className="relative flex h-20 w-20 items-center justify-center">
          {/* Outer rotating ring */}
          <span
            className="absolute inset-0 rounded-full border-2 border-transparent animate-[spinRing_1.4s_linear_infinite]"
            style={{
              borderTopColor: "var(--accent-primary)",
              borderRightColor: "var(--accent-primary)",
              opacity: 0.85,
            }}
            aria-hidden="true"
          />

          {/* Middle dashed ring */}
          <span
            className="absolute inset-2 rounded-full border-2 border-dashed animate-[spinRingReverse_3s_linear_infinite]"
            style={{
              borderColor:
                "color-mix(in srgb, var(--accent-primary) 35%, transparent)",
            }}
            aria-hidden="true"
          />

          {/* Inner icon */}
          <span
            className="relative flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg animate-[iconBeat_1.6s_ease-in-out_infinite]"
            style={{
              backgroundColor: "var(--accent-primary)",
              boxShadow:
                "0 12px 30px -10px color-mix(in srgb, var(--accent-primary) 80%, transparent)",
            }}
          >
            <Volume2 size={22} strokeWidth={2.4} />
          </span>
        </div>

        {/* Title */}
        <h2 className="mt-8 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          {message}
          <span
            className="ml-0.5 inline-block w-6 text-left"
            style={{ color: "var(--accent-primary)" }}
          >
            {dots}
          </span>
        </h2>

        {subMessage && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {subMessage}
          </p>
        )}

        {/* Progress bar */}
        <div className="mt-8 h-1 w-56 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full w-1/3 rounded-full animate-[progressSlide_1.3s_ease-in-out_infinite]"
            style={{ backgroundColor: "var(--accent-primary)" }}
          />
        </div>
      </div>

      {/* Inline keyframes — this file is self-contained */}
      <style>{`
        @keyframes spinRing {
          to { transform: rotate(360deg); }
        }
        @keyframes spinRingReverse {
          to { transform: rotate(-360deg); }
        }
        @keyframes iconBeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes progressSlide {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(320%); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.45; }
        }
      `}</style>
    </div>
  );
}