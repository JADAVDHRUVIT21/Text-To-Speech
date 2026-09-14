import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Key,
  Lock,
  LogOut,
  Mail,
  Moon,
  Palette,
  Pencil,
  Sun,
  User,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { updateProfile, updatePassword } from "../services/api";

/* ------------------------------------------------------------------ */
/*  Logout confirm alert                                               */
/* ------------------------------------------------------------------ */

function IOSLogoutAlert({ open, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/30 p-3 backdrop-blur-[2px] sm:items-center sm:p-5">
      <div className="w-full max-w-[390px] overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95">
        <div className="px-6 pb-5 pt-6 text-center">
          <h3 className="text-[17px] font-bold text-slate-900 dark:text-white">
            Log out?
          </h3>

          <p className="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-400">
            Are you sure you want to log out of your account?
          </p>
        </div>

        <div className="border-t border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={onConfirm}
            className="flex min-h-12 w-full items-center justify-center border-b border-slate-200/80 bg-red-600 text-[16px] font-bold text-white transition hover:bg-red-700 active:scale-[0.99] dark:border-slate-800 dark:bg-red-600 dark:hover:bg-red-500"
          >
            Log Out
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="flex min-h-12 w-full items-center justify-center text-[16px] font-semibold text-[var(--accent-primary)] transition active:bg-slate-100 dark:active:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Password change confirm alert                                      */
/* ------------------------------------------------------------------ */

function IOSPasswordConfirmAlert({ open, loading, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/30 p-3 backdrop-blur-[2px] sm:items-center sm:p-5">
      <div className="w-full max-w-[390px] overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95">
        <div className="px-6 pb-5 pt-6 text-center">
          <h3 className="text-[17px] font-bold text-slate-900 dark:text-white">
            Update password?
          </h3>

          <p className="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-400">
            Your account password will be changed. You will use the new
            password the next time you sign in.
          </p>
        </div>

        <div className="border-t border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="flex min-h-12 w-full items-center justify-center gap-2 border-b border-slate-200/80 text-[16px] font-bold transition active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:active:bg-slate-800"
            style={{ color: "var(--accent-primary)" }}
          >
            {loading ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
                  style={{
                    borderColor: "var(--accent-primary)",
                    borderTopColor: "transparent",
                  }}
                />
                Updating…
              </>
            ) : (
              "Update Password"
            )}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="flex min-h-12 w-full items-center justify-center text-[16px] font-semibold text-slate-500 transition active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:active:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Snackbar (top-right)                                               */
/* ------------------------------------------------------------------ */

function Snackbar({ toast, onClose }) {
  if (!toast?.message) return null;

  const isLoading = toast.type === "loading";
  const isError = toast.type === "error";

  return (
    <div className="pointer-events-none fixed right-3 top-3 z-[300] w-[calc(100%-24px)] max-w-[390px] sm:right-5 sm:top-5 sm:w-[390px]">
      <div
        className={`pointer-events-auto flex items-center gap-3 rounded-[22px] border px-4 py-3.5 shadow-[0_18px_50px_rgba(15,23,42,0.16)] backdrop-blur-xl ${
          isError
            ? "border-red-200/80 bg-white/95 dark:border-red-900/60 dark:bg-slate-900/95"
            : isLoading
              ? "border-[color-mix(in_srgb,var(--accent-primary)_30%,transparent)] bg-white/95 dark:bg-slate-900/95"
              : "border-emerald-200/80 bg-white/95 dark:border-emerald-900/60 dark:bg-slate-900/95"
        }`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            isError
              ? "bg-red-50 text-red-500 dark:bg-red-950/40"
              : isLoading
                ? ""
                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"
          }`}
          style={
            isLoading
              ? {
                  color: "var(--accent-primary)",
                  backgroundColor: "var(--accent-soft)",
                }
              : undefined
          }
        >
          {isLoading ? (
            <span
              className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
              style={{
                borderColor: "var(--accent-primary)",
                borderTopColor: "transparent",
              }}
            />
          ) : isError ? (
            <AlertCircle size={19} strokeWidth={2.5} />
          ) : (
            <CheckCircle2 size={19} strokeWidth={2.5} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-bold ${
              isError
                ? "text-red-700 dark:text-red-400"
                : isLoading
                  ? "text-slate-900 dark:text-white"
                  : "text-emerald-700 dark:text-emerald-400"
            }`}
          >
            {toast.message}
          </p>
          {isLoading && (
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              Please wait a moment…
            </p>
          )}
        </div>

        {!isLoading && (
          <button
            type="button"
            onClick={onClose}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
              isError
                ? "text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Account                                                            */
/* ------------------------------------------------------------------ */

export default function Account() {
  const navigate = useNavigate();
  const { user, logout, token, updateUser } = useAuth();

  const {
    settings,
    setAppearance,
    setAccentColor,
    accentColors,
  } = useSettings();

  /* -------------------------- name edit state -------------------------- */
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState("");

  const nameInputRef = useRef(null);

  /* -------------------------- password state --------------------------- */
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordAlert, setPasswordAlert] = useState(false);

  const currentPasswordRef = useRef(null);

  /* -------------------------- snackbar --------------------------------- */
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  /* -------------------------- logout alert ----------------------------- */
  const [logoutAlert, setLogoutAlert] = useState(false);

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
        nameInputRef.current?.select();
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [editingName]);

  useEffect(() => {
    if (changingPassword && currentPasswordRef.current) {
      const timer = setTimeout(() => {
        currentPasswordRef.current?.focus();
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [changingPassword]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

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

  const appearanceOptions = [
    {
      id: "light",
      name: "Light",
      description: "Use the light interface",
      icon: Sun,
    },
    {
      id: "dark",
      name: "Dark",
      description: "Use the dark interface",
      icon: Moon,
    },
  ];

  const accentOptions = [
    { id: "blue", name: "Blue" },
    { id: "purple", name: "Purple" },
    { id: "green", name: "Green" },
    { id: "orange", name: "Orange" },
    { id: "pink", name: "Pink" },
  ];

  /* -------------------------- name handlers ---------------------------- */
  const handleEditNameStart = () => {
    setNameValue(user?.full_name || "");
    setNameError("");
    setNameSuccess("");
    setEditingName(true);
  };

  const handleEditNameCancel = () => {
    setEditingName(false);
    setNameValue("");
    setNameError("");
  };

  const handleEditNameSave = async () => {
    const cleanName = String(nameValue || "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanName) {
      setNameError("Name cannot be empty.");
      return;
    }

    if (cleanName.length > 120) {
      setNameError("Name is too long.");
      return;
    }

    if (cleanName === (user?.full_name || "").trim()) {
      setEditingName(false);
      return;
    }

    if (!token) {
      setNameError("Your session has expired. Please log in again.");
      return;
    }

    setSavingName(true);
    setNameError("");
    setNameSuccess("");

    try {
      const updated = await updateProfile({ full_name: cleanName }, token);

      updateUser({
        id: updated?.id ?? user?.id,
        full_name: updated?.full_name ?? cleanName,
        email: updated?.email ?? user?.email,
      });

      setEditingName(false);
      setNameValue("");
      setNameSuccess("Name updated successfully.");

      setTimeout(() => setNameSuccess(""), 3000);
    } catch (err) {
      console.error("UPDATE PROFILE ERROR:", err);

      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to update your name. Please try again.";

      setNameError(message);
    } finally {
      setSavingName(false);
    }
  };

  const handleNameKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleEditNameSave();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      handleEditNameCancel();
    }
  };

  /* -------------------------- password handlers ------------------------ */
  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handleChangePasswordStart = () => {
    resetPasswordForm();
    setChangingPassword(true);
  };

  const handleChangePasswordCancel = () => {
    if (savingPassword) return;
    setChangingPassword(false);
    resetPasswordForm();
  };

  const validatePasswordInputs = () => {
    if (!currentPassword) {
      return "Please enter your current password.";
    }
    if (!newPassword) {
      return "Please enter a new password.";
    }
    if (newPassword.length < 6) {
      return "New password must be at least 6 characters.";
    }
    if (newPassword === currentPassword) {
      return "New password must be different from the current password.";
    }
    if (newPassword !== confirmPassword) {
      return "New passwords do not match.";
    }
    if (!token) {
      return "Your session has expired. Please log in again.";
    }
    return null;
  };

  /* Called by the "Update password" button — validates, then opens the
     confirmation alert. */
  const handleChangePasswordRequest = () => {
    setPasswordError("");
    setPasswordSuccess("");

    const validationError = validatePasswordInputs();

    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    setPasswordAlert(true);
  };

  /* Called when the user confirms inside the alert. */
  const handleChangePasswordConfirm = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    setSavingPassword(true);

    /* Show a top-right snackbar in "loading" mode for the whole request */
    showToast("Updating password, please wait…", "loading");

    try {
      await updatePassword(
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        token
      );

      setPasswordAlert(false);
      setPasswordSuccess("Password updated successfully.");
      resetPasswordForm();
      setChangingPassword(false);

      /* Success snackbar replaces the loading one */
      showToast("Password updated successfully.", "success", 3200);

      /* Clear the inline success banner after a while too */
      setTimeout(() => setPasswordSuccess(""), 3500);
    } catch (err) {
      console.error("UPDATE PASSWORD ERROR:", err);

      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to update your password. Please try again.";

      setPasswordAlert(false);
      setPasswordError(message);

      /* Error snackbar replaces the loading one */
      showToast(message, "error", 5000);
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePasswordKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleChangePasswordRequest();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      handleChangePasswordCancel();
    }
  };

  /* -------------------------- logout handler --------------------------- */
  const handleLogoutConfirm = () => {
    setLogoutAlert(false);
    hideToast();
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 transition-colors sm:p-6 lg:p-8 dark:bg-slate-950">
      {/* Top-right snackbar (loading / success / error) */}
      <Snackbar toast={toast} onClose={hideToast} />

      <div className="mx-auto max-w-3xl">
        {/* Header with back button */}
        <div className="mb-6 flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Account
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage your account and application settings
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col items-center border-b border-slate-200 px-6 py-8 dark:border-slate-800">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full"
              style={{
                backgroundColor: "var(--accent-light)",
                color: "var(--accent-primary)",
              }}
            >
              <User className="h-12 w-12" />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
              {user?.full_name || "User"}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {user?.email || "No email available"}
            </p>
          </div>

          <div className="space-y-8 p-6">
            <section>
              <div className="mb-4 flex items-center gap-2">
                <User
                  className="h-5 w-5"
                  style={{ color: "var(--accent-primary)" }}
                />

                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Account Information
                </h3>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: "var(--accent-light)",
                        color: "var(--accent-primary)",
                      }}
                    >
                      <User className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        Full Name
                      </p>

                      {editingName ? (
                        <div className="mt-1.5 flex flex-col gap-3">
                          <input
                            ref={nameInputRef}
                            value={nameValue}
                            onChange={(event) =>
                              setNameValue(event.target.value)
                            }
                            onKeyDown={handleNameKeyDown}
                            maxLength={120}
                            disabled={savingName}
                            placeholder="Enter your name"
                            className="h-10 w-full flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--accent-soft)] disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                          />

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleEditNameSave}
                              disabled={savingName}
                              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-bold text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                              style={{
                                backgroundColor: "var(--accent-primary)",
                              }}
                            >
                              {savingName ? (
                                <>
                                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Check size={15} strokeWidth={3} />
                                  Save
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={handleEditNameCancel}
                              disabled={savingName}
                              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:flex-none"
                            >
                              <X size={15} strokeWidth={2.5} />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {user?.full_name || "Not available"}
                          </p>

                          <button
                            type="button"
                            onClick={handleEditNameStart}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                            aria-label="Edit name"
                            title="Edit name"
                          >
                            <Pencil size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {nameError && (
                    <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
                      {nameError}
                    </div>
                  )}

                  {nameSuccess && (
                    <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
                      {nameSuccess}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: "var(--accent-light)",
                      color: "var(--accent-primary)",
                    }}
                  >
                    <Mail className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                      Email Address
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {user?.email || "Not available"}
                    </p>
                  </div>
                </div>

                {/* Change Password */}
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: "var(--accent-light)",
                        color: "var(--accent-primary)",
                      }}
                    >
                      <Key className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        Password
                      </p>

                      {!changingPassword ? (
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                            ••••••••••••
                          </p>

                          <button
                            type="button"
                            onClick={handleChangePasswordStart}
                            className="flex h-8 shrink-0 items-center justify-center rounded-lg px-2.5 text-xs font-bold transition hover:bg-slate-200 active:scale-95 dark:hover:bg-slate-700"
                            style={{ color: "var(--accent-primary)" }}
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                          Update your account password
                        </p>
                      )}
                    </div>
                  </div>

                  {changingPassword && (
                    <div className="mt-4 space-y-3">
                      {/* Current password */}
                      <div>
                        <label
                          htmlFor="current_password"
                          className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                        >
                          Current password
                        </label>

                        <div className="relative">
                          <div className="pointer-events-none absolute left-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 dark:text-slate-500">
                            <Lock size={15} />
                          </div>

                          <input
                            ref={currentPasswordRef}
                            id="current_password"
                            type={showCurrent ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => {
                              setCurrentPassword(e.target.value);
                              setPasswordError("");
                            }}
                            onKeyDown={handlePasswordKeyDown}
                            disabled={savingPassword}
                            autoComplete="current-password"
                            placeholder="Enter current password"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:shadow-[0_0_0_3px_var(--accent-soft)] disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                          />

                          <button
                            type="button"
                            onClick={() => setShowCurrent((s) => !s)}
                            tabIndex={-1}
                            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                            aria-label={showCurrent ? "Hide password" : "Show password"}
                          >
                            {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      {/* New password */}
                      <div>
                        <label
                          htmlFor="new_password"
                          className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                        >
                          New password
                        </label>

                        <div className="relative">
                          <div className="pointer-events-none absolute left-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 dark:text-slate-500">
                            <Key size={15} />
                          </div>

                          <input
                            id="new_password"
                            type={showNew ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              setPasswordError("");
                            }}
                            onKeyDown={handlePasswordKeyDown}
                            disabled={savingPassword}
                            autoComplete="new-password"
                            placeholder="Enter new password"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:shadow-[0_0_0_3px_var(--accent-soft)] disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                          />

                          <button
                            type="button"
                            onClick={() => setShowNew((s) => !s)}
                            tabIndex={-1}
                            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                            aria-label={showNew ? "Hide password" : "Show password"}
                          >
                            {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>

                        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                          Minimum 6 characters
                        </p>
                      </div>

                      {/* Confirm new password */}
                      <div>
                        <label
                          htmlFor="confirm_password"
                          className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                        >
                          Confirm new password
                        </label>

                        <div className="relative">
                          <div className="pointer-events-none absolute left-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 dark:text-slate-500">
                            <Key size={15} />
                          </div>

                          <input
                            id="confirm_password"
                            type={showConfirm ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              setPasswordError("");
                            }}
                            onKeyDown={handlePasswordKeyDown}
                            disabled={savingPassword}
                            autoComplete="new-password"
                            placeholder="Re-enter new password"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:shadow-[0_0_0_3px_var(--accent-soft)] disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                          />

                          <button
                            type="button"
                            onClick={() => setShowConfirm((s) => !s)}
                            tabIndex={-1}
                            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                            aria-label={showConfirm ? "Hide password" : "Show password"}
                          >
                            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-end">
                        <button
                          type="button"
                          onClick={handleChangePasswordCancel}
                          disabled={savingPassword}
                          className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
                        >
                          <X size={15} strokeWidth={2.5} />
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={handleChangePasswordRequest}
                          disabled={savingPassword}
                          className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-bold text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                          style={{ backgroundColor: "var(--accent-primary)" }}
                        >
                          <Check size={15} strokeWidth={3} />
                          Update password
                        </button>
                      </div>
                    </div>
                  )}

                  {passwordError && (
                    <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
                      {passwordSuccess}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-2">
                <Sun
                  className="h-5 w-5"
                  style={{ color: "var(--accent-primary)" }}
                />

                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Appearance
                </h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {appearanceOptions.map((option) => {
                  const Icon = option.icon;

                  const selected =
                    settings.appearance === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setAppearance(option.id)}
                      className={`relative flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-[var(--accent-primary)] bg-slate-50 dark:bg-slate-800"
                          : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          selected
                            ? ""
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                        style={
                          selected
                            ? {
                                backgroundColor: "var(--accent-light)",
                                color: "var(--accent-primary)",
                              }
                            : undefined
                        }
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {option.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {option.description}
                        </p>
                      </div>

                      {selected && (
                        <Check
                          className="h-5 w-5 shrink-0"
                          style={{ color: "var(--accent-primary)" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-2">
                <Palette
                  className="h-5 w-5"
                  style={{ color: "var(--accent-primary)" }}
                />

                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Accent Color
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {accentOptions.map((option) => {
                  const selected =
                    settings.accentColor === option.id;

                  const accent = accentColors[option.id];

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setAccentColor(option.id)}
                      className={`flex items-center gap-3 rounded-2xl border p-3 transition sm:flex-col sm:justify-center ${
                        selected
                          ? "border-slate-400 bg-slate-50 dark:border-slate-500 dark:bg-slate-800"
                          : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: accent.primary }}
                      >
                        {selected && (
                          <Check
                            className="h-5 w-5 text-white"
                            strokeWidth={3}
                          />
                        )}
                      </div>

                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {option.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <button
              type="button"
              onClick={() => setLogoutAlert(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.99] dark:bg-red-600 dark:hover:bg-red-500"
            >
              <LogOut className="h-5 w-5" strokeWidth={2.4} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <IOSPasswordConfirmAlert
        open={passwordAlert}
        loading={savingPassword}
        onCancel={() => {
          if (savingPassword) return;
          setPasswordAlert(false);
        }}
        onConfirm={handleChangePasswordConfirm}
      />

      <IOSLogoutAlert
        open={logoutAlert}
        onCancel={() => setLogoutAlert(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
}