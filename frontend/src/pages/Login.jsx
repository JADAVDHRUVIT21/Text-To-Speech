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

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  /* -------------------------- snackbar --------------------------------- */
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

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
    };
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser(form);

      login(response);

      /* Success snackbar on the login page */
      showToast("Signed in successfully", "success", 1800);

      /* Then show the animated transition before navigating */
      setTransitioning(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1600);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to login. Please check your email and password."
      );

      setLoading(false);
    }
  };

  const features = [
    {
      icon: Mic,
      title: "Natural",
      subtitle: "Voices",
    },
    {
      icon: Zap,
      title: "Fast",
      subtitle: "Generation",
    },
    {
      icon: Shield,
      title: "Private",
      subtitle: "& Secure",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      {/* ------------------------------------------------------------- */}
      {/* Left panel — marketing                                         */}
      {/* ------------------------------------------------------------- */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-10 lg:flex xl:p-14">
        {/* gradient layers */}
        <div
          className="pointer-events-none absolute -top-40 -left-32 h-[500px] w-[500px] rounded-full opacity-25 blur-3xl"
          style={{ backgroundColor: "var(--accent-primary)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: "var(--accent-primary)" }}
          aria-hidden="true"
        />

        <div className="relative z-10">
          {/* Brand */}
          <div className="flex items-center gap-3">
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

          {/* Headline */}
          <h2 className="mt-14 max-w-md text-4xl font-bold leading-[1.15] tracking-tight text-white xl:text-5xl">
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

          <p className="mt-6 max-w-md text-sm leading-6 text-slate-300 xl:text-base">
            Generate natural-sounding audio in 30+ languages, choose from
            multiple premium voices, and download everything in one click —
            all in one place.
          </p>

          {/* Feature pills */}
          <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
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

        {/* Bottom caption */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400">
          <Sparkles size={14} />
          Powered by Puter AI
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Right panel — form                                             */}
      {/* ------------------------------------------------------------- */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-10 sm:px-8 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-[420px]">
          {/* Mobile-only brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
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
              <p className="text-base font-bold leading-tight text-slate-900 dark:text-white">
                Text-to-Speech
              </p>
              <p className="text-[11px] text-slate-400">
                Your words. Any voice. Anywhere.
              </p>
            </div>
          </div>

          {/* Eyebrow + heading */}
          <p
            className="text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ color: "var(--accent-primary)" }}
          >
            Welcome back
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-[34px]">
            Sign in to your account
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Access your speech history and continue where you left off.
          </p>

          {/* Error banner */}
          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
                strokeWidth={2.2}
              />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Email address
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute left-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 dark:text-slate-500">
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
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:bg-white focus:shadow-[0_0_0_3px_var(--accent-soft)] dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-[11px] font-semibold text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute left-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 dark:text-slate-500">
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
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:bg-white focus:shadow-[0_0_0_3px_var(--accent-soft)] dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}
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

          {/* Switch link */}
          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-bold transition hover:opacity-80"
              style={{ color: "var(--accent-primary)" }}
            >
              Create account
            </Link>
          </p>

          {/* Footer */}
          <p className="mt-10 text-center text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Text-to-Speech • Secure sign-in
          </p>
        </div>
      </div>

      {/* Top-right success snackbar (visible before the loading transition) */}
      <Snackbar toast={toast} onClose={hideToast} />

      {/* Full-screen loading transition after successful login */}
      <LoadingTransition
        visible={transitioning}
        message="Signing you in"
        subMessage="Loading your speech workspace"
      />
    </div>
  );
}

export default Login;