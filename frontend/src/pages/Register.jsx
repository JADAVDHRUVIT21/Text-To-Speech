import { useEffect, useState } from "react";
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

function getThemeMode() {
  try {
    const root = document.documentElement;
    const styles = getComputedStyle(root);

    const bgBase = styles
      .getPropertyValue("--bg-base")
      .trim()
      .toLowerCase();

    return (
      root.classList.contains("dark") ||
      root.getAttribute("data-theme") === "dark" ||
      bgBase.includes("#0") ||
      bgBase.includes("#1") ||
      bgBase.includes("#2") ||
      bgBase.includes("rgb(0") ||
      bgBase.includes("rgb(1") ||
      bgBase.includes("rgb(2")
    )
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

const LIGHT_THEME = {
  primary: "#0f172a",
  secondary: "#475569",
  label: "#1e293b",
  inputText: "#0f172a",
  placeholder: "#64748b",
  card: "rgba(255, 255, 255, 0.97)",
  input: "#f1f5f9",
  border: "#dbe3ee",
  divider: "#e2e8f0",
  footer: "#64748b",
};

const DARK_THEME = {
  primary: "#ffffff",
  secondary: "#e2e8f0",
  label: "#ffffff",
  inputText: "#ffffff",
  placeholder: "#cbd5e1",
  card: "rgba(15, 23, 42, 0.96)",
  input: "#1e293b",
  border: "#475569",
  divider: "#475569",
  footer: "#e2e8f0",
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
  const [themeMode, setThemeMode] = useState(getThemeMode);

  const { enabled: musicOn, toggle: toggleMusic } =
    useAmbientMusic();

  const theme =
    themeMode === "dark" ? DARK_THEME : LIGHT_THEME;

  useEffect(() => {
    const updateTheme = () => {
      setThemeMode(getThemeMode());
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });

    const interval = window.setInterval(updateTheme, 500);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, []);

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (form.full_name.trim().length < 2) {
      setError("Full name must be at least 2 characters.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

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
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6 sm:py-12"
      style={{
        backgroundColor: "var(--bg-base)",
      }}
    >
      <AnimatedBackgroundStyles />
      <AnimatedBackground intensity="soft" />

      <MusicToggle
        enabled={musicOn}
        onToggle={toggleMusic}
      />

      <div className="relative z-50 w-full max-w-md">

        {/* Brand */}
        <div
          className="relative z-[100] mb-6 flex flex-col items-center text-center"
          style={{
            opacity: 1,
            visibility: "visible",
          }}
        >
          <div
            className="relative z-[100] flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{
              backgroundColor: "var(--accent-primary)",
              boxShadow:
                "0 10px 25px -8px color-mix(in srgb, var(--accent-primary) 60%, transparent)",
              opacity: 1,
              visibility: "visible",
            }}
          >
            <Volume2
              size={26}
              strokeWidth={2.3}
              color="#ffffff"
            />
          </div>

          <h1
            className="relative z-[100] mt-4 text-2xl font-bold tracking-tight sm:text-3xl"
            style={{
              color: "#ffffff",
              opacity: 1,
              visibility: "visible",
              display: "block",
              textShadow: "0 2px 12px rgba(0,0,0,0.9)",
            }}
          >
            Create your account
          </h1>

          <p
            className="relative z-[100] mt-1.5 text-sm"
            style={{
              color: "#ffffff",
              opacity: 1,
              visibility: "visible",
              display: "block",
              textShadow: "0 1px 8px rgba(0,0,0,0.9)",
            }}
          >
            Start converting text into natural speech
          </p>
        </div>

        {/* Card */}
        <div
          className="relative z-50 overflow-hidden rounded-[28px] border p-6 backdrop-blur-xl sm:p-8"
          style={{
            backgroundColor: theme.card,
            borderColor: theme.border,
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

          <div className="relative z-10">

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

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Full name */}
              <div>
                <label
                  htmlFor="full_name"
                  className="mb-2 block text-sm font-semibold"
                  style={{
                    color: theme.label,
                  }}
                >
                  Full name
                </label>

                <div className="relative">
                  <div
                    className="pointer-events-none absolute left-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg"
                    style={{
                      color: theme.secondary,
                    }}
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
                    className="h-12 w-full rounded-2xl border pl-12 pr-4 text-sm font-medium outline-none transition focus:border-transparent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                    style={{
                      backgroundColor: theme.input,
                      borderColor: theme.border,
                      color: theme.inputText,
                      caretColor: "var(--accent-primary)",
                    }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold"
                  style={{
                    color: theme.label,
                  }}
                >
                  Email address
                </label>

                <div className="relative">
                  <div
                    className="pointer-events-none absolute left-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg"
                    style={{
                      color: theme.secondary,
                    }}
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
                    className="h-12 w-full rounded-2xl border pl-12 pr-4 text-sm font-medium outline-none transition focus:border-transparent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                    style={{
                      backgroundColor: theme.input,
                      borderColor: theme.border,
                      color: theme.inputText,
                      caretColor: "var(--accent-primary)",
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold"
                  style={{
                    color: theme.label,
                  }}
                >
                  Password
                </label>

                <div className="relative">
                  <div
                    className="pointer-events-none absolute left-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg"
                    style={{
                      color: theme.secondary,
                    }}
                  >
                    <Lock size={17} />
                  </div>

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    minLength={6}
                    maxLength={100}
                    required
                    autoComplete="new-password"
                    className="h-12 w-full rounded-2xl border pl-12 pr-12 text-sm font-medium outline-none transition focus:border-transparent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                    style={{
                      backgroundColor: theme.input,
                      borderColor: theme.border,
                      color: theme.inputText,
                      caretColor: "var(--accent-primary)",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg transition hover:bg-black/5 dark:hover:bg-white/10"
                    style={{
                      color: theme.secondary,
                    }}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>

                <p
                  className="mt-1.5 text-xs"
                  style={{
                    color: theme.secondary,
                  }}
                >
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
                    <UserPlus
                      size={18}
                      strokeWidth={2.4}
                    />
                    Create account
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div
                className="h-px flex-1"
                style={{
                  backgroundColor: theme.divider,
                }}
              />

              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{
                  color: theme.secondary,
                }}
              >
                or
              </span>

              <div
                className="h-px flex-1"
                style={{
                  backgroundColor: theme.divider,
                }}
              />
            </div>

            {/* Sign in */}
            <p
              className="text-center text-sm"
              style={{
                color: theme.secondary,
              }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold transition hover:opacity-80"
                style={{
                  color: "var(--accent-primary)",
                }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p
          className="mt-6 text-center text-xs"
          style={{
            color: theme.footer,
          }}
        >
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