import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import puter from "@heyputer/puter.js";
import {
    Check,
    ChevronDown,
    Download,
    FileAudio,
    Globe2,
    LogOut,
    Menu,
    Pause,
    Play,
    RotateCcw,
    RotateCw,
    Settings,
    User,
    Volume2,
    X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

import {
    getHistory,
    getLanguages,
    createHistory,
    updateHistory,
} from "../services/api";

import Sidebar from "../components/Sidebar";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MAX_CHARACTERS = 2999;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function getLanguageFlag(languageCode) {
    const flags = {
        en: "🇬🇧", hi: "🇮🇳", gu: "🇮🇳", mr: "🇮🇳", ta: "🇮🇳",
        es: "🇪🇸", fr: "🇫🇷", de: "🇩🇪", ja: "🇯🇵", zh: "🇨🇳",
        ko: "🇰🇷", ar: "🇸🇦", pt: "🇵🇹", it: "🇮🇹", ru: "🇷🇺",
        nl: "🇳🇱", tr: "🇹🇷", pl: "🇵🇱", sv: "🇸🇪", bg: "🇧🇬",
        ro: "🇷🇴", cs: "🇨🇿", el: "🇬🇷", fi: "🇫🇮", hr: "🇭🇷",
        ms: "🇲🇾", sk: "🇸🇰", da: "🇩🇰", uk: "🇺🇦", fil: "🇵🇭",
        id: "🇮🇩", bn: "🇧🇩", vi: "🇻🇳",
    };
    const code = String(languageCode || "").toLowerCase();
    return flags[code] || flags[code.split("-")[0]] || "🌐";
}

function normalizeLanguageCode(language) {
    if (!language) return "";
    if (typeof language === "string") return language.toLowerCase();
    if (typeof language === "object") {
        return String(
            language.code || language.language_code || language.locale || ""
        ).toLowerCase();
    }
    return "";
}

function getVoiceLanguageCode(voice) {
    if (!voice) return "";
    if (voice.language && typeof voice.language === "object") {
        return normalizeLanguageCode(
            voice.language.code ||
            voice.language.language_code ||
            voice.language.locale || ""
        );
    }
    if (typeof voice.language === "string") return normalizeLanguageCode(voice.language);
    if (voice.language_code) return normalizeLanguageCode(voice.language_code);
    if (voice.locale) return normalizeLanguageCode(voice.locale);
    return "";
}

function voiceMatchesLanguage(voiceItem, selectedLanguage) {
    const selected = normalizeLanguageCode(selectedLanguage);
    if (!selected) return true;
    const voiceLanguage = getVoiceLanguageCode(voiceItem);
    if (!voiceLanguage) return false;
    if (voiceLanguage === selected) return true;
    return voiceLanguage.startsWith(`${selected}-`);
}

function getLanguageLocale(language) {
    const code = normalizeLanguageCode(language);
    const locales = {
        en: "en-US", hi: "hi-IN", gu: "gu-IN", mr: "mr-IN", ta: "ta-IN",
        es: "es-ES", fr: "fr-FR", de: "de-DE", ja: "ja-JP", zh: "zh-CN",
        ko: "ko-KR", ar: "ar-SA", pt: "pt-PT", it: "it-IT", ru: "ru-RU",
        nl: "nl-NL", tr: "tr-TR", pl: "pl-PL", sv: "sv-SE", bg: "bg-BG",
        ro: "ro-RO", cs: "cs-CZ", el: "el-GR", fi: "fi-FI", hr: "hr-HR",
        ms: "ms-MY", sk: "sk-SK", da: "da-DK", uk: "uk-UA", fil: "fil-PH",
        id: "id-ID", bn: "bn-BD", vi: "vi-VN",
    };
    return locales[code] || code;
}

function getXaiLanguageCode(language) {
    const code = normalizeLanguageCode(language);
    const xaiLanguages = {
        en: "en", ar: "ar-SA", bn: "bn", zh: "zh", fr: "fr", de: "de",
        hi: "hi", id: "id", it: "it", ja: "ja", ko: "ko", pt: "pt-PT",
        ru: "ru", es: "es-ES", tr: "tr", vi: "vi",
    };
    return xaiLanguages[code] || null;
}

function getCompatibleEngines(voice) {
    const supported = Array.isArray(voice?.supported_engines)
        ? voice.supported_engines
        : Array.isArray(voice?.supportedEngines)
            ? voice.supportedEngines
            : [];
    if (supported.length === 0) {
        return ["neural", "standard", "generative", "long-form"];
    }
    const preferredOrder = ["neural", "generative", "long-form", "standard"];
    const engines = [];
    preferredOrder.forEach((engine) => {
        if (supported.includes(engine)) engines.push(engine);
    });
    supported.forEach((engine) => {
        if (!engines.includes(engine)) engines.push(engine);
    });
    return engines;
}

function getProviderName(provider) {
    const names = {
        "aws-polly": "AWS Polly", openai: "OpenAI", gemini: "Gemini",
        xai: "xAI", speechify: "Speechify", system: "System Voice",
        universal: "Universal Voice",
    };
    return names[provider] || provider || "Puter";
}

function createUniversalVoice(languageCode) {
    const code = normalizeLanguageCode(languageCode);
    const xaiLanguage = getXaiLanguageCode(code);
    return {
        id: `universal:${code || "auto"}`,
        originalId: "eve",
        name: "Universal Voice",
        provider: "xai",
        language: xaiLanguage || code || "auto",
        languageCode: xaiLanguage || code || "auto",
        description: xaiLanguage
            ? "Multilingual fallback • selected language"
            : "Universal fallback • automatic language",
        supportedEngines: [],
        fallback: true,
        universal: true,
    };
}

function createSystemVoice(languageCode) {
    const code = normalizeLanguageCode(languageCode);
    return {
        id: `system:${code || "auto"}`,
        originalId: "",
        name: "System Voice",
        provider: "system",
        language: code || "auto",
        languageCode: code || "auto",
        description: "Browser/device speech voice (no download)",
        supportedEngines: [],
        fallback: true,
        system: true,
    };
}

function createXaiFallbackVoices(languageCode) {
    const code = normalizeLanguageCode(languageCode);
    const xaiLanguage = getXaiLanguageCode(code);
    if (!xaiLanguage) return [];
    return [
        { id: `xai:${xaiLanguage}:eve`, originalId: "eve", name: "Eve" },
        { id: `xai:${xaiLanguage}:ara`, originalId: "ara", name: "Ara" },
        { id: `xai:${xaiLanguage}:rex`, originalId: "rex", name: "Rex" },
        { id: `xai:${xaiLanguage}:sal`, originalId: "sal", name: "Sal" },
        { id: `xai:${xaiLanguage}:leo`, originalId: "leo", name: "Leo" },
    ].map((v) => ({
        ...v,
        provider: "xai",
        language: xaiLanguage,
        languageCode: xaiLanguage,
        description: "xAI multilingual voice",
        supportedEngines: [],
        fallback: true,
    }));
}

/* ------------------------------------------------------------------ */
/*  Dropdown                                                           */
/* ------------------------------------------------------------------ */

function IOSDropdown({ label, value, options = [], onChange, placeholder, icon: Icon, disabled = false, renderOption }) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const safeOptions = Array.isArray(options) ? options : [];

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const selectedOption = safeOptions.find((item) => item.value === value);

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {label}
            </label>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((c) => !c)}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all ${
                    disabled
                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
                        : open
                            ? "border-transparent bg-white shadow-[0_0_0_3px_var(--accent-soft)] dark:bg-slate-800"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                }`}
            >
                <div className="flex min-w-0 items-center gap-3">
                    {Icon && (
                        <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                            style={{
                                color: "var(--accent-primary)",
                                backgroundColor: "var(--accent-soft)",
                            }}
                        >
                            <Icon size={18} />
                        </div>
                    )}
                    <div className="min-w-0">
                        {selectedOption ? (
                            renderOption ? renderOption(selectedOption) : (
                                <>
                                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                                        {selectedOption.label}
                                    </p>
                                    {selectedOption.description && (
                                        <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                                            {selectedOption.description}
                                        </p>
                                    )}
                                </>
                            )
                        ) : (
                            <p className="text-sm text-slate-400 dark:text-slate-500">{placeholder}</p>
                        )}
                    </div>
                </div>
                <ChevronDown size={19} className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && !disabled && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px] sm:hidden" onClick={() => setOpen(false)} />
                    <div className="fixed inset-x-3 bottom-3 z-50 max-h-[70vh] overflow-hidden rounded-[28px] border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:absolute sm:inset-x-0 sm:bottom-auto sm:top-[calc(100%+8px)] sm:max-h-80 sm:rounded-2xl">
                        <div className="flex items-center justify-between px-3 py-3 sm:hidden">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
                            <button type="button" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="max-h-[55vh] overflow-y-auto overscroll-contain sm:max-h-72">
                            {safeOptions.length === 0 ? (
                                <div className="px-4 py-6 text-center">
                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No options available</p>
                                </div>
                            ) : (
                                safeOptions.map((option) => {
                                    const isSelected = option.value === value;
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => { onChange(option.value); setOpen(false); }}
                                            className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left transition sm:rounded-xl ${isSelected ? "" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                                            style={isSelected ? { backgroundColor: "var(--accent-soft)" } : undefined}
                                        >
                                            <div className="min-w-0 flex-1">
                                                {renderOption ? renderOption(option) : (
                                                    <>
                                                        <p className={`truncate text-sm font-medium ${isSelected ? "" : "text-slate-700 dark:text-slate-300"}`}
                                                            style={isSelected ? { color: "var(--accent-primary)" } : undefined}>
                                                            {option.label}
                                                        </p>
                                                        {option.description && (
                                                            <p className="truncate text-xs text-slate-400 dark:text-slate-500">{option.description}</p>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            {isSelected && (
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: "var(--accent-primary)" }}>
                                                    <Check size={15} strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Account Menu (Portal-based, anchored BELOW button)                 */
/* ------------------------------------------------------------------ */

function AccountMenu({ user, onSettings, onLogout }) {
    const [open, setOpen] = useState(false);
    const [menuPos, setMenuPos] = useState(null);
    const buttonRef = useRef(null);
    const menuRef = useRef(null);

    const computePosition = () => {
        if (!buttonRef.current) return null;

        const rect = buttonRef.current.getBoundingClientRect();
        const menuWidth = 288; // w-72 = 18rem = 288px
        const margin = 10;

        let left = rect.right - menuWidth;
        if (left < margin) left = margin;
        if (left + menuWidth > window.innerWidth - margin) {
            left = window.innerWidth - menuWidth - margin;
        }

        // Anchor BELOW the button
        const top = rect.bottom + 10;

        return { left, top };
    };

    const toggleMenu = () => {
        if (open) {
            setOpen(false);
            setMenuPos(null);
            return;
        }
        const pos = computePosition();
        if (pos) {
            setMenuPos(pos);
            setOpen(true);
        }
    };

    useEffect(() => {
        if (!open) return;

        const handleOutsideClick = (event) => {
            const clickedButton = buttonRef.current?.contains(event.target);
            const clickedMenu = menuRef.current?.contains(event.target);
            if (!clickedButton && !clickedMenu) {
                setOpen(false);
                setMenuPos(null);
            }
        };

        const handleScrollOrResize = () => {
            setOpen(false);
            setMenuPos(null);
        };

        document.addEventListener("mousedown", handleOutsideClick);
        window.addEventListener("resize", handleScrollOrResize);
        window.addEventListener("scroll", handleScrollOrResize, true);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            window.removeEventListener("resize", handleScrollOrResize);
            window.removeEventListener("scroll", handleScrollOrResize, true);
        };
    }, [open]);

    const initials = (user?.full_name || user?.email || "U")
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const menuContent = open && menuPos
        ? createPortal(
            <>
                {/* Backdrop — closes on tap anywhere outside */}
                <div
                    className="fixed inset-0 z-[140] bg-black/20 backdrop-blur-[1px] sm:bg-transparent sm:backdrop-blur-0"
                    onClick={() => {
                        setOpen(false);
                        setMenuPos(null);
                    }}
                />

                {/* Dropdown panel — anchored below the button */}
                <div
                    ref={menuRef}
                    className="fixed z-[150] w-72 max-w-[calc(100vw-20px)] overflow-visible rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
                    style={{ left: menuPos.left, top: menuPos.top }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3 dark:bg-slate-800">
                        <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                            style={{ backgroundColor: "var(--accent-primary)" }}
                        >
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                {user?.full_name || "User"}
                            </p>
                            <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                                {user?.email || "Signed in"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-2 space-y-1">
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                setMenuPos(null);
                                onSettings();
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <Settings size={18} className="text-slate-400" />
                            Settings
                        </button>

                        <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />

                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                setMenuPos(null);
                                onLogout();
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/40"
                        >
                            <LogOut size={18} />
                            Log Out
                        </button>
                    </div>
                </div>
            </>,
            document.body
        )
        : null;

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={toggleMenu}
                className="flex items-center gap-2 rounded-full bg-slate-100 px-2 py-1.5 transition hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 sm:px-3 sm:py-2"
            >
                <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: "var(--accent-primary)" }}
                >
                    {initials}
                </div>
                <span className="hidden max-w-32 truncate text-sm font-semibold text-slate-700 dark:text-slate-200 sm:block">
                    {user?.full_name || "User"}
                </span>
                <ChevronDown
                    size={16}
                    className={`hidden shrink-0 text-slate-400 transition-transform sm:block ${open ? "rotate-180" : ""}`}
                />
            </button>

            {menuContent}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Alerts                                                             */
/* ------------------------------------------------------------------ */

function IOSLogoutAlert({ open, onCancel, onConfirm }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/30 p-3 backdrop-blur-[2px] sm:items-center sm:p-5">
            <div className="w-full max-w-[390px] overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95">
                <div className="px-6 pb-5 pt-6 text-center">
                    <h3 className="text-[17px] font-bold text-slate-900 dark:text-white">Log out?</h3>
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
                        className="flex min-h-12 w-full items-center justify-center text-[16px] font-semibold transition active:bg-slate-100 dark:active:bg-slate-800"
                        style={{ color: "var(--accent-primary)" }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

function IOSDownloadConfirmAlert({ open, onCancel, onConfirm }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/30 p-3 backdrop-blur-[2px] sm:items-center sm:p-5">
            <div className="w-full max-w-[390px] overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95">
                <div className="px-6 pb-5 pt-6 text-center">
                    <h3 className="text-[17px] font-bold text-slate-900 dark:text-white">
                        Download audio?
                    </h3>
                    <p className="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-400">
                        The audio file will be saved to your device.
                    </p>
                </div>
                <div className="border-t border-slate-200/80 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex min-h-12 w-full items-center justify-center border-b border-slate-200/80 text-[16px] font-bold transition active:bg-slate-100 dark:border-slate-800 dark:active:bg-slate-800"
                        style={{ color: "var(--accent-primary)" }}
                    >
                        Download
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex min-h-12 w-full items-center justify-center text-[16px] font-semibold text-slate-500 transition active:bg-slate-100 dark:text-slate-400 dark:active:bg-slate-800"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Download Progress Card                                             */
/* ------------------------------------------------------------------ */

function DownloadProgressCard({ state, progress, onCancel, onClose }) {
    if (!state) return null;

    const isDownloading = state === "downloading";
    const isSuccess = state === "success";
    const isError = state === "error";
    const isCancelled = state === "cancelled";

    const percent = Math.max(0, Math.min(100, Math.round(progress || 0)));

    let barColor = "var(--accent-primary)";
    if (isSuccess) barColor = "#10b981";
    if (isError) barColor = "#ef4444";
    if (isCancelled) barColor = "#94a3b8";

    return (
        <div className="pointer-events-none fixed bottom-3 right-3 z-[150] w-[calc(100%-24px)] max-w-[360px] sm:bottom-5 sm:right-5 sm:w-[360px]">
            <div className="pointer-events-auto overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95">
                <div className="flex items-center gap-3 px-4 py-3">
                    <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                        style={{ backgroundColor: barColor }}
                    >
                        {isSuccess ? (
                            <Check size={18} strokeWidth={3} />
                        ) : isError || isCancelled ? (
                            <X size={18} strokeWidth={3} />
                        ) : (
                            <Download size={17} strokeWidth={2.6} />
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                            {isDownloading && "Downloading audio…"}
                            {isSuccess && "Download complete"}
                            {isError && "Download failed"}
                            {isCancelled && "Download cancelled"}
                        </p>

                        <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
                            {isDownloading && `${percent}% · text-to-speech.mp3`}
                            {isSuccess && "Saved to your device"}
                            {isError && "Please try again"}
                            {isCancelled && "The file was not saved"}
                        </p>
                    </div>

                    {isDownloading ? (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex h-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                            Cancel
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                            aria-label="Dismiss"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
                    <div
                        className="h-full transition-[width] duration-200 ease-out"
                        style={{
                            width: `${isSuccess ? 100 : percent}%`,
                            backgroundColor: barColor,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Toast                                                              */
/* ------------------------------------------------------------------ */

function IOSToast({ toast, onClose }) {
    if (!toast?.message) return null;
    const isLoading = toast.type === "loading";
    const isError = toast.type === "error";

    return (
        <div className="pointer-events-none fixed right-3 top-3 z-[9999] w-[calc(100%-24px)] max-w-[390px] sm:right-5 sm:top-5 sm:w-[390px]">
            <div className={`pointer-events-auto flex items-center gap-3 rounded-[22px] border px-4 py-3.5 shadow-[0_18px_50px_rgba(15,23,42,0.16)] backdrop-blur-xl ${
                isError
                    ? "border-red-200/80 bg-white/95 dark:border-red-900/60 dark:bg-slate-900/95"
                    : isLoading
                        ? "border-[color-mix(in_srgb,var(--accent-primary)_30%,transparent)] bg-white/95 dark:bg-slate-900/95"
                        : "border-emerald-200/80 bg-white/95 dark:border-emerald-900/60 dark:bg-slate-900/95"
            }`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    isError
                        ? "bg-red-50 text-red-500 dark:bg-red-950/40"
                        : isLoading
                            ? ""
                            : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"
                }`}
                    style={isLoading ? { color: "var(--accent-primary)", backgroundColor: "var(--accent-soft)" } : undefined}
                >
                    {isLoading ? (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
                            style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }} />
                    ) : isError ? <X size={19} strokeWidth={2.5} />
                        : <Check size={19} strokeWidth={2.8} />}
                </div>
                <div className="min-w-0 flex-1">
                    <p className={`text-sm font-bold ${isError ? "text-red-700 dark:text-red-400" : isLoading ? "text-slate-900 dark:text-white" : "text-emerald-700 dark:text-emerald-400"}`}>
                        {toast.message}
                    </p>
                    {isLoading && <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Please wait a moment...</p>}
                </div>
                {!isLoading && (
                    <button type="button" onClick={onClose}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
                            isError
                                ? "text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                                : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}>
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Dashboard                                                          */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const { token, user, logout } = useAuth();

    const [text, setText] = useState("");
    const [language, setLanguage] = useState("en");
    const [voice, setVoice] = useState("");
    const [languages, setLanguages] = useState([]);
    const [voices, setVoices] = useState([]);
    const [history, setHistory] = useState([]);
    const [audioUrl, setAudioUrl] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [loading, setLoading] = useState(false);
    const [languagesLoading, setLanguagesLoading] = useState(true);
    const [voicesLoading, setVoicesLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [toast, setToast] = useState(null);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [activeChatId, setActiveChatId] = useState(null);
    const [logoutAlert, setLogoutAlert] = useState(false);
    const [systemAudioReady, setSystemAudioReady] = useState(false);

    const [downloadConfirmOpen, setDownloadConfirmOpen] = useState(false);
    const [downloadState, setDownloadState] = useState(null);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const downloadAbortRef = useRef(null);
    const downloadResetTimerRef = useRef(null);

    const audioRef = useRef(null);
    const toastTimerRef = useRef(null);
    const systemSpeechRef = useRef(null);

    /* Register Puter on window + silence its demo notification */
    useEffect(() => {
        window.puter = puter;
        puter.quiet = true;

        return () => { if (window.puter === puter) delete window.puter; };
    }, []);

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            if (downloadAbortRef.current) {
                try { downloadAbortRef.current.abort(); } catch { /* ignore */ }
            }
            if (downloadResetTimerRef.current) {
                clearTimeout(downloadResetTimerRef.current);
            }
        };
    }, []);

    const showToast = (message, type = "success", duration = 3000) => {
        if (toastTimerRef.current) { clearTimeout(toastTimerRef.current); toastTimerRef.current = null; }
        setToast({ message, type });
        if (type !== "loading" && duration > 0) {
            toastTimerRef.current = setTimeout(() => { setToast(null); toastTimerRef.current = null; }, duration);
        }
    };

    const hideToast = () => {
        if (toastTimerRef.current) { clearTimeout(toastTimerRef.current); toastTimerRef.current = null; }
        setToast(null);
    };

    /* Welcome toast — driven by a custom event from AuthContext. */
    useEffect(() => {
        const handleWelcome = (event) => {
            const fullName =
                event?.detail?.full_name ||
                user?.full_name ||
                "";

            const firstName =
                String(fullName).trim().split(/\s+/)[0] || "there";

            console.log("Dashboard received tts:welcome for:", fullName);

            showToast(`Welcome back, ${firstName} 👋`, "success", 3200);
        };

        window.addEventListener("tts:welcome", handleWelcome);

        return () => {
            window.removeEventListener("tts:welcome", handleWelcome);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* Load languages */
    useEffect(() => {
        const loadLanguages = async () => {
            try {
                const data = await getLanguages();
                let list = [];
                if (Array.isArray(data)) list = data;
                else if (Array.isArray(data?.languages)) list = data.languages;
                else if (Array.isArray(data?.data)) list = data.data;

                const validLanguages = list
                    .filter((item) => item && (item.code || item.value))
                    .map((item) => ({
                        code: String(item.code || item.value).toLowerCase(),
                        name: item.name || item.label || item.code,
                        flag: item.flag || getLanguageFlag(item.code || item.value),
                    }));

                setLanguages(validLanguages);

                if (validLanguages.length > 0) {
                    const englishExists = validLanguages.some((item) => item.code === "en");
                    if (!englishExists) setLanguage(validLanguages[0].code);
                }
            } catch {
                setLanguages([
                    { code: "en", name: "English", flag: "🇬🇧" },
                    { code: "hi", name: "Hindi", flag: "🇮🇳" },
                    { code: "gu", name: "Gujarati", flag: "🇮🇳" },
                    { code: "mr", name: "Marathi", flag: "🇮🇳" },
                    { code: "ta", name: "Tamil", flag: "🇮🇳" },
                    { code: "ja", name: "Japanese", flag: "🇯🇵" },
                    { code: "zh", name: "Chinese", flag: "🇨🇳" },
                    { code: "fr", name: "French", flag: "🇫🇷" },
                    { code: "de", name: "German", flag: "🇩🇪" },
                    { code: "es", name: "Spanish", flag: "🇪🇸" },
                    { code: "ar", name: "Arabic", flag: "🇸🇦" },
                    { code: "pt", name: "Portuguese", flag: "🇵🇹" },
                    { code: "it", name: "Italian", flag: "🇮🇹" },
                    { code: "ru", name: "Russian", flag: "🇷🇺" },
                    { code: "nl", name: "Dutch", flag: "🇳🇱" },
                    { code: "tr", name: "Turkish", flag: "🇹🇷" },
                    { code: "pl", name: "Polish", flag: "🇵🇱" },
                    { code: "sv", name: "Swedish", flag: "🇸🇪" },
                    { code: "bg", name: "Bulgarian", flag: "🇧🇬" },
                    { code: "ro", name: "Romanian", flag: "🇷🇴" },
                    { code: "cs", name: "Czech", flag: "🇨🇿" },
                    { code: "el", name: "Greek", flag: "🇬🇷" },
                    { code: "fi", name: "Finnish", flag: "🇫🇮" },
                    { code: "hr", name: "Croatian", flag: "🇭🇷" },
                    { code: "ms", name: "Malay", flag: "🇲🇾" },
                    { code: "sk", name: "Slovak", flag: "🇸🇰" },
                    { code: "da", name: "Danish", flag: "🇩🇰" },
                    { code: "uk", name: "Ukrainian", flag: "🇺🇦" },
                    { code: "fil", name: "Filipino", flag: "🇵🇭" },
                    { code: "id", name: "Indonesian", flag: "🇮🇩" },
                ]);
            } finally {
                setLanguagesLoading(false);
            }
        };
        loadLanguages();
    }, []);

    /* Load voices */
    useEffect(() => {
        const loadVoices = async () => {
            setVoicesLoading(true);
            try {
                let allVoices = [];
                try {
                    const response = await puter.ai.txt2speech.listVoices({ provider: "all" });
                    if (Array.isArray(response)) allVoices = response;
                    else if (Array.isArray(response?.voices)) allVoices = response.voices;
                    else if (Array.isArray(response?.data)) allVoices = response.data;
                } catch {
                    try {
                        const response = await puter.ai.txt2speech.listVoices({ provider: "aws-polly" });
                        if (Array.isArray(response)) allVoices = response;
                        else if (Array.isArray(response?.voices)) allVoices = response.voices;
                        else if (Array.isArray(response?.data)) allVoices = response.data;
                    } catch { allVoices = []; }
                }

                const validVoices = allVoices
                    .filter((item) => item && item.id)
                    .map((item) => {
                        const provider = item.provider || "aws-polly";
                        const languageCode = getVoiceLanguageCode(item);
                        const engines = Array.isArray(item.supported_engines)
                            ? item.supported_engines
                            : Array.isArray(item.supportedEngines)
                                ? item.supportedEngines
                                : [];
                        return {
                            id: `${provider}:${item.id}`,
                            originalId: item.id,
                            name: item.name || item.id,
                            provider,
                            language: item.language || languageCode || "",
                            languageCode,
                            description: item.description || "",
                            supportedEngines: engines,
                            fallback: false,
                        };
                    });

                setVoices(validVoices);
            } catch (err) {
                console.error("PUTER VOICES ERROR:", err);
                setVoices([]);
            } finally {
                setVoicesLoading(false);
            }
        };
        loadVoices();
    }, []);

    /* Load history */
    useEffect(() => {
        const loadHistory = async () => {
            if (!token) { setHistoryLoading(false); return; }
            try {
                const data = await getHistory(token);
                let historyList = [];
                if (Array.isArray(data)) historyList = data;
                else if (Array.isArray(data?.history)) historyList = data.history;
                else if (Array.isArray(data?.data)) historyList = data.data;
                setHistory(Array.isArray(historyList) ? historyList : []);
            } catch {
                setHistory([]);
            } finally {
                setHistoryLoading(false);
            }
        };
        loadHistory();
    }, [token]);

    /* Cleanup audio blob */
    useEffect(() => {
        return () => {
            if (audioUrl && audioUrl.startsWith("blob:")) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const safeLanguages = Array.isArray(languages) ? languages : [];
    const safeVoices = Array.isArray(voices) ? voices : [];
    const safeHistory = Array.isArray(history) ? history : [];

    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characterCount = text.length;
    const remainingCharacters = MAX_CHARACTERS - characterCount;

    const selectedLanguage = safeLanguages.find((item) => item.code === language) || safeLanguages[0];

    const languageOptions = safeLanguages.map((item) => ({
        value: item.code,
        label: item.name,
        flag: item.flag || getLanguageFlag(item.code),
    }));

    const realLanguageVoices = safeVoices.filter((item) => voiceMatchesLanguage(item, language));
    const xaiFallbackVoices = createXaiFallbackVoices(language);
    const universalVoice = createUniversalVoice(language);
    const systemVoice = createSystemVoice(language);

    // Order: real voices first (downloadable), then xai fallbacks (downloadable),
    // then universal (downloadable), then system (NOT downloadable) last.
    const languageVoices = [...realLanguageVoices, ...xaiFallbackVoices, universalVoice, systemVoice];

    const uniqueLanguageVoices = languageVoices.filter(
        (item, index, array) => array.findIndex((v) => v.id === item.id) === index
    );

    const voiceOptions = uniqueLanguageVoices.map((item) => {
        let description = "";
        if (item.provider === "system") {
            description = `${getProviderName(item.provider)} • Browser/device (no download)`;
        } else if (item.provider === "xai") {
            description = item.universal
                ? `${getProviderName(item.provider)} • ${item.languageCode || language} • Automatic fallback (downloadable)`
                : `${getProviderName(item.provider)} • ${item.languageCode || language} • Multilingual (downloadable)`;
        } else {
            const engines = getCompatibleEngines(item);
            const engineText = engines.length > 0 ? engines.join(" / ") : "auto";
            description = `${getProviderName(item.provider)} • ${item.languageCode || language} • ${engineText} (downloadable)`;
        }
        return {
            value: item.id,
            label: item.name,
            description,
            provider: item.provider,
            fallback: item.fallback,
            universal: item.universal,
            system: item.system,
        };
    });

    useEffect(() => {
        const currentVoiceStillValid = uniqueLanguageVoices.some((item) => item.id === voice);
        if (uniqueLanguageVoices.length === 0) { setVoice(""); return; }
        if (!currentVoiceStillValid) {
            // Prefer a downloadable (non-system) voice as default
            const downloadable = uniqueLanguageVoices.find((item) => item.provider !== "system");
            setVoice(downloadable ? downloadable.id : uniqueLanguageVoices[0].id);
        }
    }, [language, voices, voice]);

    const selectedVoice =
        safeVoices.find((item) => item.id === voice) ||
        uniqueLanguageVoices.find((item) => item.id === voice);

    const showError = (message) => {
        setSuccess(""); setError(message);
        showToast(message, "error", 4500);
    };

    /* Translate */
    const translateText = async (textValue) => {
        const targetLanguage = selectedLanguage?.name || language;
        const prompt = `
Translate the following text into ${targetLanguage}.

Rules:
- Return ONLY the translated text.
- Do not explain anything.
- Do not add quotation marks.
- Preserve the original meaning.
- Do not summarize.
- Do not remove information.
- Keep numbers, names, URLs and important formatting when possible.
- The output must be natural ${targetLanguage}.

Text:
${textValue}
      `.trim();

        const response = await puter.ai.chat(prompt, { model: "openai/gpt-5.6-luna" });
        let translated = "";
        if (typeof response === "string") translated = response;
        else if (response?.message?.content) {
            if (typeof response.message.content === "string") translated = response.message.content;
            else if (Array.isArray(response.message.content)) {
                translated = response.message.content.map((item) => item?.text || "").join("");
            }
        } else if (response?.content) {
            translated = typeof response.content === "string" ? response.content : "";
        } else if (response?.text) translated = response.text;

        translated = String(translated || "").trim().replace(/^["']|["']$/g, "");
        if (!translated) throw new Error(`Unable to translate the text into ${targetLanguage}.`);
        return translated;
    };

    /* System voice (browser speechSynthesis — NOT downloadable) */
    const speakWithSystemVoice = async (textValue) => {
        if (!window.speechSynthesis) throw new Error("Your browser does not support system speech synthesis.");
        window.speechSynthesis.cancel();

        let voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
            await new Promise((resolve) => {
                const timeout = setTimeout(resolve, 500);
                window.speechSynthesis.onvoiceschanged = () => { clearTimeout(timeout); resolve(); };
            });
            voices = window.speechSynthesis.getVoices();
        }

        const targetLocale = getLanguageLocale(language).toLowerCase();
        const targetBase = targetLocale.split("-")[0];

        const matchingVoice =
            voices.find((item) => item.lang?.toLowerCase() === targetLocale) ||
            voices.find((item) => item.lang?.toLowerCase().startsWith(targetLocale)) ||
            voices.find((item) => item.lang?.toLowerCase().startsWith(targetBase));

        if (!matchingVoice) {
            throw new Error(`No system voice is installed for ${selectedLanguage?.name || language}.`);
        }

        return new Promise((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(textValue);
            utterance.lang = matchingVoice.lang || targetLocale;
            utterance.voice = matchingVoice;
            utterance.rate = 1; utterance.pitch = 1; utterance.volume = 1;
            utterance.onstart = () => setIsPlaying(true);
            utterance.onend = () => { setIsPlaying(false); resolve({ system: true }); };
            utterance.onerror = (event) => {
                setIsPlaying(false);
                reject(new Error(event?.error || "System voice playback failed."));
            };
            systemSpeechRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        });
    };

    /* Generate with voice */
    const generateWithVoice = async (textValue, voiceData) => {
        const provider = voiceData.provider;
        const originalVoiceId = voiceData.originalId;

        if (provider === "system") return speakWithSystemVoice(textValue);

        if (provider === "aws-polly") {
            const engines = getCompatibleEngines(voiceData);
            let lastError = null;
            const languageCode = getLanguageLocale(language);
            for (const engine of engines) {
                try {
                    return await puter.ai.txt2speech(textValue, {
                        provider: "aws-polly", voice: originalVoiceId, engine, language: languageCode || "en-US",
                    });
                } catch (engineError) {
                    lastError = engineError;
                    console.warn(`AWS Polly voice ${originalVoiceId} failed with ${engine}:`, engineError);
                }
            }
            throw lastError || new Error("No compatible AWS Polly engine was found.");
        }

        if (provider === "xai") {
            const xaiLanguage = getXaiLanguageCode(language);
            return await puter.ai.txt2speech(textValue, {
                provider: "xai", voice: originalVoiceId || "eve",
                language: xaiLanguage || "auto", output_format: "mp3",
            });
        }

        if (provider === "openai") {
            return await puter.ai.txt2speech(textValue, {
                provider: "openai", voice: originalVoiceId, model: "gpt-4o-mini-tts",
                response_format: "mp3",
                instructions: `Speak naturally and fluently in ${getLanguageLocale(language)}.`,
            });
        }

        if (provider === "gemini") {
            return await puter.ai.txt2speech(textValue, {
                provider: "gemini", voice: originalVoiceId, model: "gemini-2.5-flash-preview-tts",
                instructions: `Speak naturally and fluently in ${getLanguageLocale(language)}.`,
            });
        }

        if (provider === "speechify") {
            return await puter.ai.txt2speech(textValue, {
                provider: "speechify", voice: originalVoiceId, model: "simba-multilingual", output_format: "mp3",
            });
        }

        return await puter.ai.txt2speech(textValue, { provider, voice: originalVoiceId });
    };

    /* Fallback: always prefer a downloadable provider before falling back to system voice */
    const generateFallbackSpeech = async (translatedText) => {
        const xaiLanguage = getXaiLanguageCode(language);
        if (xaiLanguage) {
            try {
                return await puter.ai.txt2speech(translatedText, {
                    provider: "xai", voice: "eve", language: xaiLanguage, output_format: "mp3",
                });
            } catch (err) {
                console.warn("xAI fallback failed:", err);
            }
        }

        // Last resort: system voice (not downloadable)
        return await speakWithSystemVoice(translatedText);
    };

    /* Save history helper */
    const saveHistoryEntry = async (historyPayload) => {
        const isEditingExistingChat =
            activeChatId !== null &&
            activeChatId !== undefined &&
            activeChatId !== "";

        try {
            if (isEditingExistingChat) {
                const updatedHistory = await updateHistory(
                    activeChatId,
                    historyPayload,
                    token
                );

                setHistory((prev) =>
                    prev.map((item) =>
                        String(item.id) === String(activeChatId)
                            ? { ...item, ...updatedHistory }
                            : item
                    )
                );

                setActiveChatId(activeChatId);
            } else {
                const newHistory = await createHistory(historyPayload, token);

                const newId =
                    newHistory?.id ??
                    newHistory?.data?.id ??
                    newHistory?.history?.id ??
                    null;

                const normalizedNewHistory =
                    newId !== null
                        ? { ...newHistory, id: newId }
                        : newHistory;

                setHistory((prev) => [normalizedNewHistory, ...prev]);
                if (newId !== null) setActiveChatId(newId);
            }
        } catch (err) {
            console.error("SAVE HISTORY ERROR:", err);
            showToast("Speech generated but history could not be saved.", "error", 3500);
        }
    };

    /* Generate handler */
    const handleGenerate = async () => {
        if (!text.trim()) { showError("Please enter some text before generating speech."); return; }
        if (characterCount > MAX_CHARACTERS) {
            showError(`Text cannot exceed ${MAX_CHARACTERS.toLocaleString()} characters because Puter TTS supports less than 3,000 characters per request.`);
            return;
        }
        if (!language) { showError("Please select a language."); return; }
        if (!voice) { showError("Please select a voice."); return; }
        if (!selectedVoice) { showError("The selected voice is no longer available. Please select another voice."); return; }
        if (!token) { showError("Your session has expired. Please log in again."); return; }

        setError(""); setSuccess(""); setLoading(true);
        showToast("Preparing your selected language", "loading");

        try {
            const translatedText = await translateText(text.trim());
            if (translatedText.length > MAX_CHARACTERS) {
                throw new Error(`The translated text is too long for the TTS provider. Please keep it under ${MAX_CHARACTERS.toLocaleString()} characters.`);
            }

            showToast(`Generating ${selectedLanguage?.name || language} speech`, "loading");

            let audio = null;
            let systemAudio = false;

            try {
                audio = await generateWithVoice(translatedText, selectedVoice);
                if (audio?.system) systemAudio = true;
            } catch (primaryError) {
                console.warn("PRIMARY TTS FAILED:", primaryError);
                if (selectedVoice.provider !== "system") {
                    try {
                        audio = await generateFallbackSpeech(translatedText);
                        if (audio?.system) systemAudio = true;
                    } catch (fallbackError) {
                        console.warn("FALLBACK TTS FAILED:", fallbackError);
                        throw fallbackError || primaryError;
                    }
                } else throw primaryError;
            }

            const historyPayload = {
                text: text.trim(),
                language: language,
                voice: selectedVoice.originalId || selectedVoice.id,
            };

            if (systemAudio) {
                setAudioUrl("");
                setCurrentTime(0);
                setDuration(0);
                setIsPlaying(false);
                setSystemAudioReady(true);

                await saveHistoryEntry(historyPayload);

                setSuccess(`Speech generated in ${selectedLanguage?.name || language}.`);
                setError("");
                showToast(`Speech generated in ${selectedLanguage?.name || language}.`, "success", 3000);
                return;
            }

            if (!audio) throw new Error("Puter did not return an audio object.");
            if (!audio.src) throw new Error("Puter returned audio without a playable source.");

            if (audioUrl && audioUrl.startsWith("blob:")) URL.revokeObjectURL(audioUrl);
            setAudioUrl(audio.src);
            setSystemAudioReady(false);
            setCurrentTime(0); setDuration(0); setIsPlaying(false);

            await saveHistoryEntry(historyPayload);

            const successMessage = `Speech generated successfully in ${selectedLanguage?.name || language}.`;
            setSuccess(successMessage); setError("");
            showToast(successMessage, "success", 3000);

            setTimeout(() => {
                if (audioRef.current) audioRef.current.play().catch(() => { });
            }, 150);
        } catch (err) {
            console.error("PUTER TTS ERROR:", err);
            let errorMessage = err?.message || err?.error || err?.response?.data?.message || "Unable to generate speech. Please try again.";

            if (typeof errorMessage === "string") {
                const lower = errorMessage.toLowerCase();
                if (lower.includes("unauthorized") || lower.includes("authentication") || lower.includes("login")) {
                    errorMessage = "Puter authentication is required. Please sign in to Puter and try again.";
                } else if (lower.includes("quota") || lower.includes("allowance") || lower.includes("credits")) {
                    errorMessage = "Puter TTS usage allowance has been reached. Please try again later.";
                } else if (lower.includes("does not support") && lower.includes("engine")) {
                    errorMessage = "The selected voice does not support the available engine. Please choose another voice.";
                } else if (lower.includes("unsupported") && lower.includes("language")) {
                    errorMessage = `${selectedLanguage?.name || "The selected language"} is not directly supported by this provider. Trying another available voice may work.`;
                } else if (lower.includes("system voice")) {
                    errorMessage = `No installed browser/device voice was found for ${selectedLanguage?.name || language}.`;
                } else if (lower.includes("voice")) {
                    errorMessage = "The selected voice is not available. Please try another voice.";
                }
            }

            setError(errorMessage); setSuccess("");
            showToast(errorMessage, "error", 5000);
        } finally {
            setLoading(false);
        }
    };

    const toggleAudio = async () => {
        if (audioRef.current) {
            try {
                if (audioRef.current.paused) await audioRef.current.play();
                else audioRef.current.pause();
            } catch { showError("Unable to play the audio."); }
            return;
        }
        if (window.speechSynthesis && systemSpeechRef.current) {
            if (window.speechSynthesis.speaking) {
                if (window.speechSynthesis.paused) window.speechSynthesis.resume();
                else window.speechSynthesis.pause();
            } else {
                window.speechSynthesis.speak(systemSpeechRef.current);
            }
        }
    };

    const skipBackward = () => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    };

    const skipForward = () => {
        if (!audioRef.current) return;
        if (!Number.isFinite(audioRef.current.duration)) return;
        audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10);
    };

    const handleSeek = (event) => {
        if (!audioRef.current) return;
        const newTime = Number(event.target.value);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleClear = () => {
        setText(""); setError(""); setSuccess(""); setActiveChatId(null);
        setCurrentTime(0); setDuration(0); setIsPlaying(false);
        setSystemAudioReady(false);
        hideToast();
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        systemSpeechRef.current = null;
        if (audioUrl) {
            if (audioUrl.startsWith("blob:")) URL.revokeObjectURL(audioUrl);
            setAudioUrl("");
        }
    };

    /* Download handlers */
    const openDownloadConfirm = () => {
        if (!audioUrl) {
            showError("Download is available only for generated audio files. System voice cannot be downloaded — please choose a downloadable voice.");
            return;
        }
        setDownloadConfirmOpen(true);
    };

    const closeDownloadProgress = () => {
        if (downloadState === "downloading") return;
        setDownloadState(null);
        setDownloadProgress(0);
    };

    const cancelDownload = () => {
        if (downloadAbortRef.current) {
            try { downloadAbortRef.current.abort(); } catch { /* ignore */ }
            downloadAbortRef.current = null;
        }
        setDownloadState("cancelled");
        setDownloadProgress(0);

        if (downloadResetTimerRef.current) clearTimeout(downloadResetTimerRef.current);
        downloadResetTimerRef.current = setTimeout(() => {
            setDownloadState(null);
            setDownloadProgress(0);
        }, 2500);
    };

    const performDownload = async () => {
        setDownloadConfirmOpen(false);

        if (!audioUrl) return;

        if (downloadAbortRef.current) {
            try { downloadAbortRef.current.abort(); } catch { /* ignore */ }
        }

        const controller = new AbortController();
        downloadAbortRef.current = controller;

        setDownloadState("downloading");
        setDownloadProgress(0);

        try {
            const response = await fetch(audioUrl, { signal: controller.signal });

            if (!response.ok) throw new Error("Unable to fetch the audio file.");

            const contentLengthHeader = response.headers.get("Content-Length");
            const totalBytes = contentLengthHeader ? Number(contentLengthHeader) : 0;

            let blob;

            if (response.body && typeof response.body.getReader === "function") {
                const reader = response.body.getReader();
                const chunks = [];
                let receivedBytes = 0;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    chunks.push(value);
                    receivedBytes += value.length;

                    if (totalBytes > 0) {
                        const pct = Math.min(99, Math.round((receivedBytes / totalBytes) * 100));
                        setDownloadProgress(pct);
                    } else {
                        setDownloadProgress((prev) => (prev < 90 ? prev + 2 : prev));
                    }
                }

                blob = new Blob(chunks, {
                    type: response.headers.get("Content-Type") || "audio/mpeg",
                });
            } else {
                blob = await response.blob();
            }

            if (controller.signal.aborted) return;

            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = "text-to-speech.mp3";
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(downloadUrl);

            downloadAbortRef.current = null;
            setDownloadProgress(100);
            setDownloadState("success");

            if (downloadResetTimerRef.current) clearTimeout(downloadResetTimerRef.current);
            downloadResetTimerRef.current = setTimeout(() => {
                setDownloadState(null);
                setDownloadProgress(0);
            }, 2200);
        } catch (err) {
            downloadAbortRef.current = null;

            if (err?.name === "AbortError") {
                return;
            }

            console.error("AUDIO DOWNLOAD ERROR:", err);
            setDownloadState("error");
            setDownloadProgress(0);

            if (downloadResetTimerRef.current) clearTimeout(downloadResetTimerRef.current);
            downloadResetTimerRef.current = setTimeout(() => {
                setDownloadState(null);
                setDownloadProgress(0);
            }, 2600);
        }
    };

    const handleNewChat = () => { handleClear(); setMobileSidebarOpen(false); };

    const handleSelectChat = (item) => {
        if (!item) return;
        const selectedId = Number(item.id);
        if (!Number.isInteger(selectedId) || selectedId <= 0) return;

        setActiveChatId(selectedId);
        setText(item.text || "");
        if (item.language) setLanguage(item.language);
        if (item.voice) {
            const matchingVoice = safeVoices.find(
                (voiceItem) => voiceItem.originalId === item.voice || voiceItem.id === item.voice
            );
            if (matchingVoice) setVoice(matchingVoice.id);
        }
        setError(""); setSuccess(""); hideToast();
        setCurrentTime(0); setDuration(0); setIsPlaying(false);
        setSystemAudioReady(false);
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (audioUrl) {
            if (audioUrl.startsWith("blob:")) URL.revokeObjectURL(audioUrl);
            setAudioUrl("");
        }
        setMobileSidebarOpen(false);
    };

    const handleHistoryChange = (updatedHistory) => {
        setHistory(Array.isArray(updatedHistory) ? updatedHistory : []);
    };

    const handleLogout = () => { setLogoutAlert(false); hideToast(); logout(); };

    const showPlayer = Boolean(audioUrl) || systemAudioReady;
    const canDownload = Boolean(audioUrl);
    const isSystemVoiceActive = systemAudioReady && !audioUrl;
    const isSystemVoiceSelected = selectedVoice?.provider === "system";

    /* Suggestion: pick the first downloadable voice to switch to */
    const suggestedDownloadableVoice =
        uniqueLanguageVoices.find((item) => item.provider !== "system") || null;

    const handleSwitchToDownloadable = () => {
        if (!suggestedDownloadableVoice) return;
        setVoice(suggestedDownloadableVoice.id);
        setSystemAudioReady(false);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        systemSpeechRef.current = null;
        setSuccess("");
        setError("");
        showToast(
            `Switched to ${suggestedDownloadableVoice.name}. Press Generate Speech to create a downloadable audio file.`,
            "success",
            4200
        );
    };

    /* ------------------------------------------------------------------ */
    /*  Render                                                             */
    /* ------------------------------------------------------------------ */

    return (
        <div className="min-h-screen bg-[#f5f7fb] text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
            <IOSToast toast={toast} onClose={hideToast} />

            <Sidebar
                history={safeHistory}
                user={user}
                token={token}
                activeChatId={activeChatId}
                mobileOpen={mobileSidebarOpen}
                onMobileClose={() => setMobileSidebarOpen(false)}
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                onHistoryChange={handleHistoryChange}
                onLogout={() => setLogoutAlert(true)}
            />

            <div className="min-h-screen lg:pl-[285px]">
                <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl transition-colors dark:border-slate-800 dark:bg-slate-900/90">
                    <div className="flex min-h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex min-w-0 items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setMobileSidebarOpen(true)}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 lg:hidden"
                            >
                                <Menu size={19} />
                            </button>

                            <div
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-white"
                                style={{ backgroundColor: "var(--accent-primary)" }}
                            >
                                <Volume2 size={23} strokeWidth={2.3} />
                            </div>

                            <div className="min-w-0">
                                <h1 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                                    Text-to-Speech
                                </h1>
                                <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                                    Natural speech generation
                                </p>
                            </div>
                        </div>

                        <AccountMenu
                            user={user}
                            onSettings={() => navigate("/account")}
                            onLogout={() => setLogoutAlert(true)}
                        />
                    </div>
                </header>

                <main className="mx-auto max-w-5xl px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                            Create speech
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                            Turn your text into natural-sounding audio.
                        </p>
                    </div>

                    <section>
                        <div className="overflow-visible rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_8px_35px_rgba(15,23,42,0.05)] transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:p-7">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">Your text</h3>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                                        Write or paste the content you want to hear.
                                    </p>
                                </div>
                                <div
                                    className="hidden h-10 w-10 items-center justify-center rounded-xl sm:flex"
                                    style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent-primary)" }}
                                >
                                    <FileAudio size={20} />
                                </div>
                            </div>

                            <div className="relative">
                                <textarea
                                    value={text}
                                    onChange={(e) => {
                                        setText(e.target.value);
                                        setError(""); setSuccess(""); hideToast();
                                    }}
                                    maxLength={MAX_CHARACTERS}
                                    rows={12}
                                    placeholder="Type or paste your text here..."
                                    className="min-h-[270px] w-full resize-y rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-[15px] leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:bg-white focus:shadow-[0_0_0_3px_var(--accent-soft)] dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800 sm:min-h-[310px] sm:px-5 sm:py-5 sm:text-base"
                                />
                                <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-end justify-between sm:bottom-4 sm:left-4 sm:right-4">
                                    <span className="rounded-lg bg-white/90 px-2 py-1 text-[11px] font-medium text-slate-400 shadow-sm backdrop-blur dark:bg-slate-800/80 dark:text-slate-400">
                                        {wordCount} {wordCount === 1 ? "word" : "words"}
                                    </span>
                                    <span className={`rounded-lg bg-white/90 px-2 py-1 text-[11px] font-semibold shadow-sm backdrop-blur dark:bg-slate-800/80 ${remainingCharacters < 300 ? "text-orange-500" : "text-slate-400"}`}>
                                        {characterCount.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <IOSDropdown
                                    label="Language"
                                    value={language}
                                    options={languageOptions}
                                    onChange={(newLanguage) => {
                                        setLanguage(newLanguage);
                                        setError(""); setSuccess(""); hideToast();
                                    }}
                                    placeholder={languagesLoading ? "Loading languages..." : "Select language"}
                                    icon={Globe2}
                                    disabled={languagesLoading || languageOptions.length === 0}
                                    renderOption={(option) => (
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="text-xl">{option.flag}</span>
                                            <p
                                                className={`truncate text-sm font-semibold ${option.value === language ? "" : "text-slate-800 dark:text-slate-100"}`}
                                                style={option.value === language ? { color: "var(--accent-primary)" } : undefined}
                                            >
                                                {option.label}
                                            </p>
                                        </div>
                                    )}
                                />

                                <IOSDropdown
                                    label="Voice"
                                    value={voice}
                                    options={voiceOptions}
                                    onChange={(newVoice) => {
                                        setVoice(newVoice);
                                        setError(""); setSuccess(""); hideToast();
                                    }}
                                    placeholder={voicesLoading ? "Loading Puter voices..." : "Select voice"}
                                    disabled={voicesLoading || voiceOptions.length === 0}
                                    icon={Volume2}
                                    renderOption={(option) => (
                                        <div className="min-w-0">
                                            <p
                                                className={`truncate text-sm font-semibold ${option.value === voice ? "" : "text-slate-800 dark:text-slate-100"}`}
                                                style={option.value === voice ? { color: "var(--accent-primary)" } : undefined}
                                            >
                                                {option.label}
                                            </p>
                                            <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">{option.description}</p>
                                        </div>
                                    )}
                                />
                            </div>

                            {selectedLanguage && (
                                <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                            style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent-primary)" }}
                                        >
                                            <Globe2 size={15} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Selected language</p>
                                            <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                                                {selectedLanguage.flag || getLanguageFlag(selectedLanguage.code)}{" "}
                                                {selectedLanguage.name}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isSystemVoiceSelected && (
                                <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/60 dark:bg-amber-950/30 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-2">
                                        <span className="mt-0.5 text-amber-500">⚠</span>
                                        <p className="text-xs font-semibold leading-5 text-amber-800 dark:text-amber-300">
                                            System voice plays through your device and <strong>cannot be downloaded</strong>.
                                            Pick a Puter voice (AWS Polly, xAI, OpenAI) to get a downloadable MP3 and full seek bar.
                                        </p>
                                    </div>
                                    {suggestedDownloadableVoice && (
                                        <button
                                            type="button"
                                            onClick={handleSwitchToDownloadable}
                                            className="flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3 text-xs font-bold text-white transition hover:bg-amber-600 active:scale-95"
                                        >
                                            Use {suggestedDownloadableVoice.name}
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={handleGenerate}
                                    disabled={loading || voicesLoading || !voice}
                                    className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                                    style={{ backgroundColor: "var(--accent-primary)" }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            Generating speech...
                                        </>
                                    ) : (
                                        <>
                                            <Play size={18} fill="currentColor" />
                                            Generate Speech
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 active:scale-[0.99] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:text-base"
                                >
                                    <RotateCcw size={17} />
                                    Clear
                                </button>
                            </div>

                            {showPlayer && (
                                <div
                                    className="mt-5 overflow-hidden rounded-[24px] border p-4 sm:p-5"
                                    style={{
                                        borderColor: "var(--accent-light)",
                                        background: `linear-gradient(to bottom, var(--accent-soft), transparent)`,
                                    }}
                                >
                                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                                                style={{ backgroundColor: "var(--accent-primary)" }}
                                            >
                                                <Volume2 size={19} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                                                    {audioUrl ? "Generated audio" : "System voice playback"}
                                                </h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {selectedLanguage?.name || "Selected language"} speech
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                            {canDownload ? (
                                                <button
                                                    type="button"
                                                    onClick={openDownloadConfirm}
                                                    className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold shadow-sm transition hover:bg-slate-50 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700"
                                                    style={{ color: "var(--accent-primary)", border: "1px solid var(--accent-light)" }}
                                                >
                                                    <Download size={16} />
                                                    Download
                                                </button>
                                            ) : (
                                                <div
                                                    className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 py-2 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400"
                                                    title="System voice cannot be downloaded. Switch to a Puter voice."
                                                >
                                                    <Download size={14} />
                                                    Download unavailable for system voice
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {audioUrl && (
                                        <audio
                                            ref={audioRef}
                                            preload="metadata"
                                            src={audioUrl}
                                            onLoadedMetadata={(e) => {
                                                const nextDuration = e.currentTarget.duration;
                                                setDuration(Number.isFinite(nextDuration) ? nextDuration : 0);
                                            }}
                                            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                                            onPlay={() => setIsPlaying(true)}
                                            onPause={() => setIsPlaying(false)}
                                            onEnded={() => { setIsPlaying(false); setCurrentTime(duration); }}
                                            className="hidden"
                                        />
                                    )}

                                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
                                        <div className="flex items-center justify-center gap-3 sm:gap-5">
                                            <button
                                                type="button"
                                                onClick={skipBackward}
                                                disabled={!audioUrl}
                                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                                                title={audioUrl ? "Skip backward 10 seconds" : "Not available for system voice"}
                                            >
                                                <div className="relative flex items-center justify-center">
                                                    <RotateCcw size={22} />
                                                    <span className="absolute text-[8px] font-bold">10</span>
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={toggleAudio}
                                                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white transition hover:opacity-90 active:scale-90"
                                                style={{ backgroundColor: "var(--accent-primary)" }}
                                                title={isPlaying ? "Pause" : "Play"}
                                            >
                                                {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={skipForward}
                                                disabled={!audioUrl}
                                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                                                title={audioUrl ? "Skip forward 10 seconds" : "Not available for system voice"}
                                            >
                                                <div className="relative flex items-center justify-center">
                                                    <RotateCw size={22} />
                                                    <span className="absolute text-[8px] font-bold">10</span>
                                                </div>
                                            </button>
                                        </div>

                                        <div className="mt-4">
                                            {audioUrl ? (
                                                <>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max={duration || 0}
                                                        step="0.1"
                                                        value={Math.min(currentTime, duration || currentTime)}
                                                        onChange={handleSeek}
                                                        className="h-1.5 w-full cursor-pointer"
                                                        style={{ accentColor: "var(--accent-primary)" }}
                                                    />
                                                    <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                                                        <span>{formatTime(currentTime)}</span>
                                                        <span>{formatTime(duration)}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] font-semibold text-slate-400 dark:bg-slate-800/60 dark:text-slate-500">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="h-2 w-2 animate-pulse rounded-full"
                                                            style={{ backgroundColor: "var(--accent-primary)" }}
                                                        />
                                                        System voice — playback controlled by your device
                                                    </div>
                                                    <span className="text-[10px] font-medium text-slate-400/80 dark:text-slate-500/80">
                                                        No seek bar or duration available
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                                            <span>−10 sec</span>
                                            <span>Play / Pause</span>
                                            <span>+10 sec</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {success && (
                                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
                                    {success}
                                </div>
                            )}

                            {error && (
                                <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
                                    {error}
                                </div>
                            )}
                        </div>
                    </section>
                </main>

                <footer className="px-4 py-6 text-center">
                    <p className="text-xs text-slate-400 dark:text-slate-500">Text-to-Speech Application</p>
                </footer>
            </div>

            <IOSDownloadConfirmAlert
                open={downloadConfirmOpen}
                onCancel={() => setDownloadConfirmOpen(false)}
                onConfirm={performDownload}
            />

            <DownloadProgressCard
                state={downloadState}
                progress={downloadProgress}
                onCancel={cancelDownload}
                onClose={closeDownloadProgress}
            />

            <IOSLogoutAlert
                open={logoutAlert}
                onCancel={() => setLogoutAlert(false)}
                onConfirm={handleLogout}
            />
        </div>
    );
}