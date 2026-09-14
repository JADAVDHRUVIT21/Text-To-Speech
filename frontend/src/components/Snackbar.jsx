import { AlertCircle, CheckCircle2, X } from "lucide-react";

export default function Snackbar({ toast, onClose }) {
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
            aria-label="Close"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}