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

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-8 transition-colors dark:bg-slate-950 sm:px-6 sm:py-12">
      {/* Decorative gradient blobs */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: "var(--accent-primary)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: "var(--accent-primary)" }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md">
        {/* Brand mark */}
        <div className="mb-6 flex flex-col items-center text-center">
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

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Create your account
          </h1>

          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Start converting text into natural speech
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[28px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_18px_60px_-20px_rgba(15,23,42,0.25)] backdrop-blur-xl transition-colors dark:border-slate-800 dark:bg-slate-900/80 sm:p-8">
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
                strokeWidth={2.2}
              />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
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
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Full name
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute left-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 dark:text-slate-500">
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
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:bg-white focus:shadow-[0_0_0_3px_var(--accent-soft)] dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
                />
              </div>
            </div>

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
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Password
              </label>

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
                  placeholder="Create a password"
                  minLength={6}
                  maxLength={100}
                  required
                  autoComplete="new-password"
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

              <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
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
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              or
            </span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Sign in link */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
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

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

      {/* Full-screen loading transition after successful registration */}
      <LoadingTransition
        visible={transitioning}
        message="Creating your account"
        subMessage="Preparing your speech workspace"
      />
    </div>
  );
}

export default Register;