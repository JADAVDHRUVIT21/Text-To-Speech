import { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext(null);

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_SETTINGS = {
  appearance: "light",
  accentColor: "blue",
};

/* ------------------------------------------------------------------ */
/*  Appearance themes                                                  */
/* ------------------------------------------------------------------ */
/**
 * Each theme describes the background + surface + text colors.
 * The `dark` boolean tells the app whether to also add the `dark`
 * class to <html> and <body> (so Tailwind `dark:` variants work).
 *
 * CSS variables exposed for every theme:
 *   --bg-base      → page background
 *   --bg-surface   → card / panel background
 *   --bg-elevated  → slightly lighter panel (hover, inputs)
 *   --text-primary → main text color
 *   --text-muted   → secondary text
 *   --border-soft  → subtle border color
 */
const APPEARANCE_THEMES = {
  light: {
    label: "Light",
    description: "Use the light interface",
    dark: false,
    vars: {
      "--bg-base": "#f8fafc",
      "--bg-surface": "#ffffff",
      "--bg-elevated": "#f1f5f9",
      "--text-primary": "#0f172a",
      "--text-muted": "#64748b",
      "--border-soft": "#e2e8f0",
    },
  },
  dark: {
    label: "Dark",
    description: "Use the dark interface",
    dark: true,
    vars: {
      "--bg-base": "#020617",
      "--bg-surface": "#0f172a",
      "--bg-elevated": "#1e293b",
      "--text-primary": "#f8fafc",
      "--text-muted": "#94a3b8",
      "--border-soft": "#1e293b",
    },
  },
  system: {
    label: "System",
    description: "Match your device preference",
    dark: null, // resolved at runtime
    vars: null, // resolved at runtime by picking light or dark
  },
  midnight: {
    label: "Midnight",
    description: "Deep blue-black night theme",
    dark: true,
    vars: {
      "--bg-base": "#050a1c",
      "--bg-surface": "#0a1330",
      "--bg-elevated": "#122046",
      "--text-primary": "#e2e8f0",
      "--text-muted": "#7c8db5",
      "--border-soft": "#1a2a5c",
    },
  },
  sepia: {
    label: "Sepia",
    description: "Warm paper-like reading mode",
    dark: false,
    vars: {
      "--bg-base": "#f5ecd9",
      "--bg-surface": "#fbf5e6",
      "--bg-elevated": "#f0e4c8",
      "--text-primary": "#3b2a14",
      "--text-muted": "#7c6a4a",
      "--border-soft": "#e0cfa8",
    },
  },
  nord: {
    label: "Nord",
    description: "Cool arctic blue palette",
    dark: true,
    vars: {
      "--bg-base": "#2e3440",
      "--bg-surface": "#3b4252",
      "--bg-elevated": "#434c5e",
      "--text-primary": "#eceff4",
      "--text-muted": "#a4b1c8",
      "--border-soft": "#4c566a",
    },
  },
  forest: {
    label: "Forest",
    description: "Deep green nature theme",
    dark: true,
    vars: {
      "--bg-base": "#0a1f16",
      "--bg-surface": "#0f2b1e",
      "--bg-elevated": "#153826",
      "--text-primary": "#d1fae5",
      "--text-muted": "#6ee7b7",
      "--border-soft": "#1d4a35",
    },
  },
  rose: {
    label: "Rose",
    description: "Soft pink light theme",
    dark: false,
    vars: {
      "--bg-base": "#fff1f2",
      "--bg-surface": "#ffffff",
      "--bg-elevated": "#ffe4e6",
      "--text-primary": "#4c0519",
      "--text-muted": "#9f1239",
      "--border-soft": "#fecdd3",
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Accent colors                                                      */
/* ------------------------------------------------------------------ */

const ACCENT_COLORS = {
  blue: {
    label: "Blue",
    primary: "#2563eb",
    light: "#dbeafe",
    soft: "#eff6ff",
    text: "#2563eb",
  },
  purple: {
    label: "Purple",
    primary: "#7c3aed",
    light: "#ede9fe",
    soft: "#f5f3ff",
    text: "#7c3aed",
  },
  green: {
    label: "Green",
    primary: "#16a34a",
    light: "#dcfce7",
    soft: "#f0fdf4",
    text: "#16a34a",
  },
  orange: {
    label: "Orange",
    primary: "#ea580c",
    light: "#ffedd5",
    soft: "#fff7ed",
    text: "#ea580c",
  },
  pink: {
    label: "Pink",
    primary: "#db2777",
    light: "#fce7f3",
    soft: "#fdf2f8",
    text: "#db2777",
  },
  red: {
    label: "Red",
    primary: "#dc2626",
    light: "#fee2e2",
    soft: "#fef2f2",
    text: "#dc2626",
  },
  teal: {
    label: "Teal",
    primary: "#0d9488",
    light: "#ccfbf1",
    soft: "#f0fdfa",
    text: "#0d9488",
  },
  amber: {
    label: "Amber",
    primary: "#d97706",
    light: "#fef3c7",
    soft: "#fffbeb",
    text: "#d97706",
  },
  cyan: {
    label: "Cyan",
    primary: "#0891b2",
    light: "#cffafe",
    soft: "#ecfeff",
    text: "#0891b2",
  },
  indigo: {
    label: "Indigo",
    primary: "#4f46e5",
    light: "#e0e7ff",
    soft: "#eef2ff",
    text: "#4f46e5",
  },
  rose: {
    label: "Rose",
    primary: "#e11d48",
    light: "#ffe4e6",
    soft: "#fff1f2",
    text: "#e11d48",
  },
  emerald: {
    label: "Emerald",
    primary: "#059669",
    light: "#d1fae5",
    soft: "#ecfdf5",
    text: "#059669",
  },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function resolveAppearance(themeKey, prefersDark) {
  if (themeKey === "system") {
    return prefersDark ? "dark" : "light";
  }
  return themeKey;
}

function applyTheme(themeKey) {
  const root = document.documentElement;
  const body = document.body;

  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const resolvedKey = resolveAppearance(themeKey, prefersDark);
  const theme =
    APPEARANCE_THEMES[resolvedKey] || APPEARANCE_THEMES.light;

  const isDark = theme.dark === true;

  /* ---- toggle `dark` class so Tailwind dark: variants work ---- */
  root.classList.remove("dark");
  body.classList.remove("dark");

  if (isDark) {
    root.classList.add("dark");
    body.classList.add("dark");
  }

  root.style.colorScheme = isDark ? "dark" : "light";

  /* ---- apply theme CSS variables ---- */
  const vars = theme.vars || {};

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  /* ---- keep the raw page background in sync for no white flash ---- */
  const bg = vars["--bg-base"];
  if (bg) {
    root.style.backgroundColor = bg;
    body.style.backgroundColor = bg;
  } else {
    root.style.backgroundColor = "";
    body.style.backgroundColor = "";
  }

  /* ---- expose the resolved + raw theme keys for CSS selectors ---- */
  root.dataset.theme = themeKey;             // raw: light | dark | system | midnight | ...
  root.dataset.themeResolved = resolvedKey;  // resolved: light | dark
}

function applyAccent(accentKey) {
  const root = document.documentElement;
  const accent = ACCENT_COLORS[accentKey] || ACCENT_COLORS.blue;

  root.dataset.accent = accentKey;

  root.style.setProperty("--accent-primary", accent.primary);
  root.style.setProperty("--accent-light", accent.light);
  root.style.setProperty("--accent-soft", accent.soft);
  root.style.setProperty("--accent-text", accent.text);
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("tts_settings");

      if (!saved) {
        return DEFAULT_SETTINGS;
      }

      const parsed = JSON.parse(saved);

      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  /* Keep the DOM in sync with the current settings */
  useEffect(() => {
    try {
      localStorage.setItem("tts_settings", JSON.stringify(settings));
    } catch {
      /* ignore */
    }

    applyTheme(settings.appearance);
    applyAccent(settings.accentColor);
  }, [settings]);

  /* When "system" is selected, follow OS changes live */
  useEffect(() => {
    if (settings.appearance !== "system") return;
    if (typeof window === "undefined" || !window.matchMedia) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");

    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }
    // Safari < 14
    media.addListener(handler);
    return () => media.removeListener(handler);
  }, [settings.appearance]);

  const updateSettings = (updates) => {
    setSettings((previous) => ({
      ...previous,
      ...updates,
    }));
  };

  const setAppearance = (appearance) => {
    if (!APPEARANCE_THEMES[appearance]) return;
    updateSettings({ appearance });
  };

  const setAccentColor = (accentColor) => {
    if (!ACCENT_COLORS[accentColor]) return;
    updateSettings({ accentColor });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        setAppearance,
        setAccentColor,
        resetSettings,
        accentColors: ACCENT_COLORS,
        appearanceThemes: APPEARANCE_THEMES,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}