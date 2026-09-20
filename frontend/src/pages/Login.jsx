import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  Mic,
  Shield,
  Sparkles,
  Volume2,
  Zap,
} from "lucide-react";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingTransition from "../components/LoadingTransition";
import Snackbar from "../components/Snackbar";
import MusicToggle from "../components/MusicToggle";
import {
  AnimatedBackground,
  AnimatedBackgroundStyles,
} from "../components/AnimatedBackground";
import { useAmbientMusic } from "../hooks/useAmbientMusic";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const { enabled: musicOn, toggle: toggleMusic } = useAmbientMusic();

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const navigateTimerRef = useRef(null);

  const showToast = (message, type = "success", duration = 3000) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast({ message, type });
    if (type !== "loading" && duration > 0) {
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
        toastTimerRef.current = null;
      }, duration);
    }
  };

  const hideToast = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(null);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (navigateTimerRef.current) clearTimeout(navigateTimerRef.current);
    };
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (loading || transitioning) return;

    setLoading(true);

    try {
      const response = await loginUser(form);
      login(response);

      // Turn off the button spinner, show the success toast
      setLoading(false);

      // Turn on the splash animation
      setTransitioning(true);

      showToast("Signed in successfully", "success", 1400);

      /*
       * Wait for the browser to actually PAINT the splash before we
       * start the countdown to navigate. Two requestAnimationFrame
       * ticks guarantee the previous frame has been rendered.
       */
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          navigateTimerRef.current = setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 1400);
        });
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to login. Please check your email and password."
      );
      setLoading(false);
      setTransitioning(false);
    }
  };

  const features = [
    { icon: Mic, title: "Natural", subtitle: "Voices" },
    { icon: Zap, title: "Fast", subtitle: "Generation" },
    { icon: Shield, title: "Private", subtitle: "& Secure" },
  ];

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-950 transition-colors">
      <AnimatedBackgroundStyles />
      <MusicToggle enabled={musicOn} onToggle={toggleMusic} />

      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14">
        <AnimatedBackground intensity="full" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 tts-anim-fade-up">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg"
              style={{
                backgroundColor: "var(--accent-primary)",
                boxShadow:
                  "0 10px 30px -8px color-mix(in srgb, var(--accent-primary) 70%, transparent)",
              }}
            >
              <Volume2 size={22} strokeWidth={2.4} />
            </div>
            <div>
              <p className="text-base font-bold leading-tight text-white">
                Text-to-Speech
              </p>
              <p className="text-[11px] text-slate-400">
                Your words. Any voice. Anywhere.
              </p>
            </div>
          </div>

          <h2 className="tts-anim-fade-up delay-1 mt-14 max-w-md text-4xl font-bold leading-[1.15] tracking-tight text-white xl:text-5xl">
            Turn your words into{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, var(--accent-primary), color-mix(in srgb, var(--accent-primary) 40%, white))",
              }}
            >
              lifelike speech
            </span>{" "}
            in seconds.
          </h2>

          <p className="tts-anim-fade-up delay-2 mt-6 max-w-md text-sm leading-6 text-slate-300 xl:text-base">
            Generate natural-sounding audio in 30+ languages, choose from
            multiple premium voices, and download everything in one click —
            all in one place.
          </p>

          <div className="tts-anim-fade-up delay-3 mt-10 grid max-w-md grid-cols-3 gap-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm"
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--accent-primary) 20%, transparent)",
                      color: "var(--accent-primary)",
                    }}
                  >
                    <Icon size={16} strokeWidth={2.3} />
                  </div>
                  <p className="mt-3 text-sm font-bold text-white">
                    {feature.title}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {feature.subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        
      </div>

      <div className="relative flex w-full flex-col items-center justify-center px-4 py-10 sm:px-8 lg:w-1/2 lg:px-12">
        <div className="absolute inset-0 lg:hidden">
          <AnimatedBackground intensity="soft" />
        </div>
        <div className="absolute inset-0 hidden lg:block">
          <AnimatedBackground intensity="soft" />
        </div>

        <div className="relative z-10 w-full max-w-[420px]">
          <div className="tts-anim-fade-up mb-8 flex items-center gap-3 lg:hidden">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg"
              style={{
                backgroundColor: "var(--accent-primary)",
                boxShadow:
                  "0 10px 30px -8px color-mix(in srgb, var(--accent-primary) 70%, transparent)",
              }}
            >
              <Volume2 size={22} strokeWidth={2.4} />
            </div>
            <div>
              <p className="text-base font-bold leading-tight text-white">
                Text-to-Speech
              </p>
              <p className="text-[11px] text-slate-300/80">
                Your words. Any voice. Anywhere.
              </p>
            </div>
          </div>

          <div
            className="tts-anim-fade-up delay-1 relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl sm:p-8"
            style={{
              boxShadow:
                "0 30px 80px -30px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
              <div
                className="tts-anim-shimmer absolute -inset-y-8 w-1/3"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
                }}
              />
            </div>

            <div className="relative">
              <p
                className="text-[11px] font-bold uppercase tracking-[0.18em]"
                style={{ color: "var(--accent-primary)" }}
              >
                Welcome back
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-[34px]">
                Sign in to your account
              </h1>
              <p className="mt-2 text-sm text-slate-300/80">
                Access your speech history and continue where you left off.
              </p>

              {error && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                    strokeWidth={2.2}
                  />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-200"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400">
                      <Mail size={17} />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-12 pr-4 text-sm font-medium text-white outline-none transition placeholder:text-slate-400 focus:border-transparent focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-slate-200"
                    >
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400">
                      <Lock size={17} />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-12 pr-12 text-sm font-medium text-white outline-none transition placeholder:text-slate-400 focus:border-transparent focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || transitioning}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                  style={{
                    backgroundColor: "var(--accent-primary)",
                    boxShadow:
                      "0 12px 28px -12px color-mix(in srgb, var(--accent-primary) 75%, transparent)",
                  }}
                >
                  {loading || transitioning ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn size={18} strokeWidth={2.4} />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-slate-300/80">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="font-bold transition hover:opacity-80"
                  style={{ color: "var(--accent-primary)" }}
                >
                  Create account
                </Link>
              </p>

              <p className="mt-10 text-center text-[11px] font-medium text-slate-400">
                Text-to-Speech • Secure sign-in
              </p>
            </div>
          </div>
        </div>
      </div>

      <Snackbar toast={toast} onClose={hideToast} />

      <LoadingTransition
        visible={transitioning}
        message="Signing you in"
        subMessage="To Text-to-Speech"
      />
    </div>
  );
}

export default Login;