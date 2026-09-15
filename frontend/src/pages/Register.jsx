import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  UserPlus,
  Volume2,
} from "lucide-react";
import { registerUser } from "../services/api";
import LoadingTransition from "../components/LoadingTransition";
import MusicToggle from "../components/MusicToggle";
import {
  AnimatedBackground,
  AnimatedBackgroundStyles,
} from "../components/AnimatedBackground";
import { useAmbientMusic } from "../hooks/useAmbientMusic";

/* ------------------------------------------------------------------ */
/*  Theme-aware utility classes                                        */
/* ------------------------------------------------------------------ */

const THEME = {
  // Card surface
  card: "bg-[var(--bg-surface)] border-[var(--border-soft)]",
  // Elevated surfaces (inputs, hovers, dividers)
  elevated: "bg-[var(--bg-elevated)]",
  // Text
  textPrimary: "text-[var(--text-primary)]",
  textMuted: "text-[var(--text-muted)]",
  // Borders
  border: "border-[var(--border-soft)]",
  // Hover
  hoverElevated: "hover:bg-[var(--bg-elevated)]",
};

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const { enabled: musicOn, toggle: toggleMusic } = useAmbientMusic();

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await registerUser(form);
      setSuccess("Account created successfully. Redirecting to login...");
      setTransitioning(true);
      setTimeout(() => {
        navigate("/login");
      }, 1400);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to create your account. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 transition-colors sm:px-6 sm:py-12"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <AnimatedBackgroundStyles />
      <AnimatedBackground intensity="soft" />
      <MusicToggle enabled={musicOn} onToggle={toggleMusic} />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand mark */}
        <div className="tts-anim-fade-up mb-6 flex flex-col items-center text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{
              backgroundColor: "var(--accent-primary)",
              boxShadow:
                "0 10px 25px -8px color-mix(in srgb, var(--accent-primary) 60%, transparent)",
            }}
          >
            <Volume2 size={26} strokeWidth={2.3} />
          </div>
          <h1
            className={`mt-4 text-2xl font-bold tracking-tight sm:text-3xl ${THEME.textPrimary}`}
          >
            Create your account
          </h1>
          <p className={`mt-1.5 text-sm ${THEME.textMuted}`}>
            Start converting text into natural speech
          </p>
        </div>

        {/* Card */}
        <div
          className={`tts-anim-fade-up delay-1 relative overflow-hidden rounded-[28px] border p-6 backdrop-blur-xl sm:p-8 ${THEME.card}`}
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
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                  strokeWidth={2.2}
                />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-200">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0"
                  strokeWidth={2.2}
                />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full name */}
              <div>
                <label
                  htmlFor="full_name"
                  className={`mb-2 block text-sm font-semibold ${THEME.textPrimary}`}
                >
                  Full name
                </label>
                <div className="relative">
                  <div
                    className={`pointer-events-none absolute left-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg ${THEME.textMuted}`}
                  >
                    <User size={17} />
                  </div>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    minLength={2}
                    maxLength={100}
                    required
                    autoComplete="name"
                    className={`h-12 w-full rounded-2xl border pl-12 pr-4 text-sm font-medium outline-none transition placeholder:text-[var(--text-muted)] focus:border-transparent focus:shadow-[0_0_0_3px_var(--accent-soft)] ${THEME.border} ${THEME.elevated} ${THEME.textPrimary}`}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className={`mb-2 block text-sm font-semibold ${THEME.textPrimary}`}
                >
                  Email address
                </label>
                <div className="relative">
                  <div
                    className={`pointer-events-none absolute left-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg ${THEME.textMuted}`}
                  >
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
                    className={`h-12 w-full rounded-2xl border pl-12 pr-4 text-sm font-medium outline-none transition placeholder:text-[var(--text-muted)] focus:border-transparent focus:shadow-[0_0_0_3px_var(--accent-soft)] ${THEME.border} ${THEME.elevated} ${THEME.textPrimary}`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className={`mb-2 block text-sm font-semibold ${THEME.textPrimary}`}
                >
                  Password
                </label>
                <div className="relative">
                  <div
                    className={`pointer-events-none absolute left-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg ${THEME.textMuted}`}
                  >
                    <Lock size={17} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    minLength={6}
                    maxLength={100}
                    required
                    autoComplete="new-password"
                    className={`h-12 w-full rounded-2xl border pl-12 pr-12 text-sm font-medium outline-none transition placeholder:text-[var(--text-muted)] focus:border-transparent focus:shadow-[0_0_0_3px_var(--accent-soft)] ${THEME.border} ${THEME.elevated} ${THEME.textPrimary}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className={`absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg transition ${THEME.textMuted} ${THEME.hoverElevated}`}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <p className={`mt-1.5 text-xs ${THEME.textMuted}`}>
                  Minimum 6 characters
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || transitioning}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                style={{
                  backgroundColor: "var(--accent-primary)",
                  boxShadow:
                    "0 10px 25px -10px color-mix(in srgb, var(--accent-primary) 70%, transparent)",
                }}
              >
                {loading || transitioning ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} strokeWidth={2.4} />
                    Create account
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className={`h-px flex-1 ${THEME.elevated}`} />
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider ${THEME.textMuted}`}
              >
                or
              </span>
              <div className={`h-px flex-1 ${THEME.elevated}`} />
            </div>

            {/* Sign in link */}
            <p className={`text-center text-sm ${THEME.textMuted}`}>
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold transition hover:opacity-80"
                style={{ color: "var(--accent-primary)" }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className={`mt-6 text-center text-xs ${THEME.textMuted}`}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

      <LoadingTransition
        visible={transitioning}
        message="Creating your account"
        subMessage="Preparing your speech workspace"
      />
    </div>
  );
}

export default Register;  