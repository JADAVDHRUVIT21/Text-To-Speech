import { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  appearance: "light",
  accentColor: "blue",
};

const ACCENT_COLORS = {
  blue: {
    primary: "#2563eb",
    light: "#dbeafe",
    soft: "#eff6ff",
    text: "#2563eb",
  },
  purple: {
    primary: "#7c3aed",
    light: "#ede9fe",
    soft: "#f5f3ff",
    text: "#7c3aed",
  },
  green: {
    primary: "#16a34a",
    light: "#dcfce7",
    soft: "#f0fdf4",
    text: "#16a34a",
  },
  orange: {
    primary: "#ea580c",
    light: "#ffedd5",
    soft: "#fff7ed",
    text: "#ea580c",
  },
  pink: {
    primary: "#db2777",
    light: "#fce7f3",
    soft: "#fdf2f8",
    text: "#db2777",
  },
};

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

  useEffect(() => {
    try {
      localStorage.setItem(
        "tts_settings",
        JSON.stringify(settings)
      );
    } catch {
      // ignore
    }

    const root = document.documentElement;
    const body = document.body;

    // ---- appearance (light / dark) ----
    const isDark = settings.appearance === "dark";

    // Remove first so we never end up with both states applied
    root.classList.remove("dark");
    body.classList.remove("dark");

    if (isDark) {
      root.classList.add("dark");
      body.classList.add("dark");
    }

    // Force Tailwind `dark:` variants to re-evaluate by toggling
    // the color-scheme property too.
    root.style.colorScheme = isDark ? "dark" : "light";

    // Clear any leftover inline background we may have set earlier
    root.style.backgroundColor = "";
    body.style.backgroundColor = "";

    // Set the default background explicitly so there's no white flash
    if (isDark) {
      root.style.backgroundColor = "#020617"; // slate-950
      body.style.backgroundColor = "#020617";
    }

    // Also expose a data attribute for any CSS that might rely on it
    root.dataset.theme = settings.appearance;

    // ---- accent color ----
    const accent =
      ACCENT_COLORS[settings.accentColor] ||
      ACCENT_COLORS.blue;

    root.dataset.accent = settings.accentColor;

    root.style.setProperty(
      "--accent-primary",
      accent.primary
    );

    root.style.setProperty(
      "--accent-light",
      accent.light
    );

    root.style.setProperty(
      "--accent-soft",
      accent.soft
    );

    root.style.setProperty(
      "--accent-text",
      accent.text
    );
  }, [settings]);

  const updateSettings = (updates) => {
    setSettings((previous) => ({
      ...previous,
      ...updates,
    }));
  };

  const setAppearance = (appearance) => {
    updateSettings({ appearance });
  };

  const setAccentColor = (accentColor) => {
    if (!ACCENT_COLORS[accentColor]) {
      return;
    }

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
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}