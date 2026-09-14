import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  ChevronRight,
  Ellipsis,
  LogOut,
  MessageCircle,
  PanelLeft,
  Pencil,
  Pin,
  Plus,
  Search,
  Settings,
  Trash2,
  UserCircle,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { deleteHistoryItem } from "../services/api";

const SIDEBAR_COLLAPSED_KEY = "tts_sidebar_collapsed_v1";
const PINNED_CHATS_KEY = "tts_pinned_chats_v1";
const MAX_PINNED_CHATS = 5;
const PINNED_CHATS_STORAGE_V2 = "tts_pinned_chats_v2";

function getPinUserKey(user) {
  if (!user) return null;
  return String(user.id ?? user.email ?? "").trim().toLowerCase() || null;
}

function readPinnedChats(user) {
  const userKey = getPinUserKey(user);
  if (!userKey) return [];

  try {
    const savedV2 = localStorage.getItem(PINNED_CHATS_STORAGE_V2);

    if (savedV2) {
      const parsed = JSON.parse(savedV2);
      const userPins = parsed?.[userKey];
      return Array.isArray(userPins)
        ? userPins.map(String).slice(0, MAX_PINNED_CHATS)
        : [];
    }

    const legacy = localStorage.getItem(PINNED_CHATS_KEY);
    const legacyPins = legacy ? JSON.parse(legacy) : [];

    if (Array.isArray(legacyPins)) {
      const pins = legacyPins.map(String).slice(0, MAX_PINNED_CHATS);
      const migrated = { [userKey]: pins };
      localStorage.setItem(PINNED_CHATS_STORAGE_V2, JSON.stringify(migrated));
      return pins;
    }
  } catch {
    return [];
  }

  return [];
}

function savePinnedChats(user, pinnedIds) {
  const userKey = getPinUserKey(user);
  if (!userKey) return;

  try {
    const saved = localStorage.getItem(PINNED_CHATS_STORAGE_V2);
    const parsed = saved ? JSON.parse(saved) : {};
    const allPins = parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};

    allPins[userKey] = pinnedIds.map(String).slice(0, MAX_PINNED_CHATS);
    localStorage.setItem(PINNED_CHATS_STORAGE_V2, JSON.stringify(allPins));
  } catch {
    /* ignore */
  }
}

function getChatTitle(item) {
  if (!item?.text) return "New speech";

  const cleanText = String(item.text).replace(/\s+/g, " ").trim();

  if (!cleanText) return "New speech";

  return cleanText.length > 42
    ? `${cleanText.slice(0, 42)}...`
    : cleanText;
}

function getLanguageName(language) {
  const names = {
    en: "English", hi: "Hindi", gu: "Gujarati", mr: "Marathi", ta: "Tamil",
    es: "Spanish", fr: "French", de: "German", ja: "Japanese", zh: "Chinese",
    ko: "Korean", pt: "Portuguese", it: "Italian", id: "Indonesian",
    nl: "Dutch", tr: "Turkish", fil: "Filipino", pl: "Polish", sv: "Swedish",
    bg: "Bulgarian", ro: "Romanian", ar: "Arabic", cs: "Czech", el: "Greek",
    fi: "Finnish", hr: "Croatian", ms: "Malay", sk: "Slovak", da: "Danish",
    uk: "Ukrainian", ru: "Russian", bn: "Bengali", vi: "Vietnamese",
  };

  const code = String(language || "").toLowerCase();

  return names[code] || names[code.split("-")[0]] || (language || "Language");
}

function IOSConfirmAlert({
  open,
  title,
  message,
  confirmText,
  cancelText = "Cancel",
  danger = false,
  loading = false,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/30 p-3 backdrop-blur-[2px] sm:items-center sm:p-5">
      <div className="w-full max-w-[390px] overflow-hidden rounded-[28px] border border-white/70 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95">
        <div className="px-6 pb-5 pt-6 text-center">
          <h3 className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-400">
            {message}
          </p>
        </div>

        <div className="border-t border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`flex min-h-12 w-full items-center justify-center border-b border-slate-200/80 text-[16px] font-bold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 ${
              danger
                ? "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
                : "text-[var(--accent-primary)] active:bg-slate-100 dark:active:bg-slate-800"
            }`}
          >
            {loading ? "Deleting..." : confirmText}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="flex min-h-12 w-full items-center justify-center text-[16px] font-semibold text-[var(--accent-primary)] transition active:bg-slate-100 disabled:opacity-50 dark:active:bg-slate-800"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}

function IOSRenameAlert({
  open,
  value,
  onChange,
  onCancel,
  onConfirm,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/30 p-3 backdrop-blur-[2px] sm:items-center sm:p-5">
      <div className="w-full max-w-[390px] overflow-hidden rounded-[28px] border border-white/70 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95">
        <div className="px-6 pb-5 pt-6">
          <div className="text-center">
            <h3 className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-white">
              Rename chat
            </h3>

            <p className="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-400">
              Enter a new name for this chat.
            </p>
          </div>

          <input
            ref={inputRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onConfirm();
              }

              if (event.key === "Escape") {
                event.preventDefault();
                onCancel();
              }
            }}
            maxLength={80}
            className="mt-5 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[var(--accent-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--accent-primary)]/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
            placeholder="Chat name"
          />
        </div>

        <div className="border-t border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={onConfirm}
            className="flex min-h-12 w-full items-center justify-center border-b border-slate-200/80 text-[16px] font-semibold text-[var(--accent-primary)] transition active:bg-slate-100 dark:border-slate-800 dark:active:bg-slate-800"
          >
            Rename
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

function ChatOptionsMenu({ position, pinned, onPin, onRename, onDelete }) {
  if (!position) return null;

  const menuWidth = 176;
  const menuHeight = 145;

  let left = position.left;
  let top = position.top;

  if (left + menuWidth > window.innerWidth - 10) {
    left = window.innerWidth - menuWidth - 10;
  }

  if (left < 10) left = 10;

  if (top + menuHeight > window.innerHeight - 10) {
    top = position.topAbove;
  }

  if (top < 10) top = 10;

  return createPortal(
    <div
      data-chat-options-menu="true"
      className="fixed z-[150] w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-900/15 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40"
      style={{ left, top }}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={onPin}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 active:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700"
      >
        <Pin
          size={17}
          strokeWidth={2}
          className={`shrink-0 ${pinned ? "fill-current text-[var(--accent-primary)]" : "text-slate-600 dark:text-slate-400"}`}
        />
        <span>{pinned ? "Unpin" : "Pin"}</span>
      </button>

      <button
        type="button"
        onClick={onRename}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 active:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700"
      >
        <Pencil size={17} strokeWidth={2} className="shrink-0 text-slate-600 dark:text-slate-400" />
        <span>Rename</span>
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-50 active:bg-red-100 dark:hover:bg-red-950/40 dark:active:bg-red-950/60"
      >
        <Trash2 size={17} strokeWidth={2} className="shrink-0" />
        <span>Delete</span>
      </button>
    </div>,
    document.body
  );
}

function SidebarToggleButton({ collapsed, onClick }) {
  const [hover, setHover] = useState(false);
  const [buttonRect, setButtonRect] = useState(null);
  const wrapperRef = useRef(null);

  const handleMouseEnter = () => {
    setHover(true);
    if (wrapperRef.current) {
      setButtonRect(wrapperRef.current.getBoundingClientRect());
    }
  };

  const handleMouseLeave = () => setHover(false);

  return (
    <>
      <div
        ref={wrapperRef}
        data-sidebar-toggle="true"
        className="relative flex items-center justify-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          onClick={onClick}
          aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
            hover
              ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <PanelLeft size={18} />
        </button>
      </div>

      {hover && buttonRect &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: buttonRect.right + 8,
              top: buttonRect.top + buttonRect.height / 2,
              transform: "translateY(-50%)",
              zIndex: 9999,
              pointerEvents: "none",
            }}
            className="whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-lg dark:bg-slate-700"
          >
            {collapsed ? "Open sidebar" : "Close sidebar"}
          </div>,
          document.body
        )}
    </>
  );
}

export default function Sidebar({
  history = [],
  user = null,
  token = "",
  activeChatId = null,
  mobileOpen = false,
  onMobileClose,
  onNewChat,
  onSelectChat,
  onHistoryChange,
  onLogout,
  historyLoading = null,
}) {
  const navigate = useNavigate();

  const safeHistory = Array.isArray(history) ? history : [];

  const [menuId, setMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);

  const [renameChat, setRenameChat] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const [deleteChat, setDeleteChat] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedIds, setPinnedIds] = useState(() => readPinnedChats(user));
  const [pinnedOpen, setPinnedOpen] = useState(true);
  const [pinLimitMessage, setPinLimitMessage] = useState("");
  const [autoHistoryLoading, setAutoHistoryLoading] = useState(
    historyLoading === null && safeHistory.length === 0
  );

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!user) return;
    setPinnedIds(readPinnedChats(user));
  }, [user?.id, user?.email]);

  useEffect(() => {
    savePinnedChats(user, pinnedIds);
  }, [pinnedIds, user?.id, user?.email]);

  useEffect(() => {
    if (historyLoading !== null) {
      setAutoHistoryLoading(false);
      return;
    }

    if (safeHistory.length > 0) {
      setAutoHistoryLoading(false);
      return;
    }

    const timer = setTimeout(() => setAutoHistoryLoading(false), 1600);
    return () => clearTimeout(timer);
  }, [historyLoading, safeHistory.length]);

  useEffect(() => {
    if (historyLoading === true) return;
    if (safeHistory.length === 0) return;

    const validIds = new Set(safeHistory.map((item) => String(item.id)));
    setPinnedIds((current) => {
      const cleaned = current
        .filter((id) => validIds.has(String(id)))
        .slice(0, MAX_PINNED_CHATS);

      if (
        cleaned.length !== current.length ||
        cleaned.some((id, index) => id !== current[index])
      ) {
        return cleaned;
      }

      return current;
    });
  }, [safeHistory, historyLoading]);

  useEffect(() => {
    if (!pinLimitMessage) return;

    const timer = setTimeout(() => setPinLimitMessage(""), 2500);
    return () => clearTimeout(timer);
  }, [pinLimitMessage]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;

      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }

      window.dispatchEvent(
        new CustomEvent("tts:sidebar", {
          detail: { collapsed: next },
        })
      );

      return next;
    });
  };

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("tts:sidebar", {
        detail: { collapsed },
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renamedTitles = useMemo(() => {
    try {
      const saved = localStorage.getItem("tts_chat_titles");
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }, [safeHistory.length]);

  const getSavedTitle = (id, item) =>
    renamedTitles?.[String(id)] || item?.custom_title || getChatTitle(item);

  const saveRenamedTitle = (id, title) => {
    try {
      const saved = localStorage.getItem("tts_chat_titles");
      const titles = saved ? JSON.parse(saved) : {};
      titles[String(id)] = title;
      localStorage.setItem("tts_chat_titles", JSON.stringify(titles));
    } catch {
      /* ignore */
    }
  };

  const filteredHistory = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return safeHistory;

    return safeHistory.filter((item) => {
      const title = (item.custom_title || getSavedTitle(item.id, item) || "").toLowerCase();
      const lang = String(item.language || "").toLowerCase();
      const voice = String(item.voice || "").toLowerCase();
      return (
        title.includes(query) || lang.includes(query) || voice.includes(query)
      );
    });
  }, [safeHistory, searchQuery, renamedTitles]);

  const pinnedHistory = useMemo(() => {
    const pinnedSet = new Set(pinnedIds.map(String));
    return filteredHistory.filter((item) => pinnedSet.has(String(item.id)));
  }, [filteredHistory, pinnedIds]);

  const recentHistory = useMemo(() => {
    const pinnedSet = new Set(pinnedIds.map(String));
    return filteredHistory.filter((item) => !pinnedSet.has(String(item.id)));
  }, [filteredHistory, pinnedIds]);

  const chatsAreLoading =
    historyLoading === true ||
    (historyLoading === null && autoHistoryLoading);

  const isPinned = (id) => pinnedIds.includes(String(id));

  const handlePinToggle = (item) => {
    const id = String(item.id);

    setMenuId(null);
    setMenuPosition(null);

    if (pinnedIds.includes(id)) {
      setPinnedIds((current) => current.filter((value) => value !== id));
      return;
    }

    if (pinnedIds.length >= MAX_PINNED_CHATS) {
      setPinLimitMessage("You can pin up to 5 chats.");
      return;
    }

    setPinnedIds((current) => [...current, id].slice(0, MAX_PINNED_CHATS));
    setPinnedOpen(true);
  };

  const handleMenuToggle = (event, item) => {
    event.preventDefault();
    event.stopPropagation();

    if (menuId === item.id) {
      setMenuId(null);
      setMenuPosition(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 176;
    const menuHeight = 145;

    let left = rect.right - menuWidth;
    if (left < 10) left = 10;
    if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }

    let top = rect.bottom + 6;
    const topAbove = rect.top - menuHeight - 6;
    if (top + menuHeight > window.innerHeight - 10) top = topAbove;

    setMenuId(item.id);
    setMenuPosition({ left, top, topAbove });
  };

  const handleRenameStart = (item) => {
    setMenuId(null);
    setMenuPosition(null);
    setRenameChat(item);
    setRenameValue(getSavedTitle(item.id, item));
  };

  const handleRenameConfirm = () => {
    if (!renameChat) return;

    const cleanName = String(renameValue || "").replace(/\s+/g, " ").trim();
    if (!cleanName) return;

    saveRenamedTitle(renameChat.id, cleanName);

    const updatedHistory = safeHistory.map((item) =>
      item.id === renameChat.id ? { ...item, custom_title: cleanName } : item
    );

    onHistoryChange?.(updatedHistory);

    setRenameChat(null);
    setRenameValue("");
  };

  const handleDeleteStart = (item) => {
    setMenuId(null);
    setMenuPosition(null);
    setDeleteChat(item);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteChat || !token) return;

    setDeleteLoading(true);

    try {
      await deleteHistoryItem(deleteChat.id, token);

      const updatedHistory = safeHistory.filter((item) => item.id !== deleteChat.id);

      try {
        const saved = localStorage.getItem("tts_chat_titles");
        const titles = saved ? JSON.parse(saved) : {};
        delete titles[String(deleteChat.id)];
        localStorage.setItem("tts_chat_titles", JSON.stringify(titles));
      } catch {
        /* ignore */
      }

      setPinnedIds((current) =>
        current.filter((id) => id !== String(deleteChat.id))
      );

      onHistoryChange?.(updatedHistory);

      if (String(activeChatId) === String(deleteChat.id)) {
        onNewChat?.();
      }

      setDeleteChat(null);
    } catch {
      /* keep usable */
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleChatSelect = (item) => {
    setMenuId(null);
    setMenuPosition(null);
    onSelectChat?.(item);
    onMobileClose?.();
  };

  const handleAccountClick = () => {
    setMenuId(null);
    setMenuPosition(null);
    onMobileClose?.();
    navigate("/account");
  };

  const handleAccountMenuToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (menuId === "account") {
      setMenuId(null);
      setMenuPosition(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 176;
    const menuHeight = 90;

    let left = rect.right - menuWidth;
    if (left < 10) left = 10;
    if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }

    let top = rect.top - menuHeight - 6;
    const topAbove = rect.top - menuHeight - 6;
    if (top < 10) top = rect.bottom + 6;

    setMenuId("account");
    setMenuPosition({ left, top, topAbove });
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const clickedMenu = event.target.closest?.('[data-chat-options-menu="true"]');
      const clickedButton = event.target.closest?.('[data-chat-options-button="true"]');
      const clickedAccount = event.target.closest?.('[data-account-options-button="true"]');
      const clickedSidebarToggle = event.target.closest?.('[data-sidebar-toggle="true"]');

      if (
        !clickedMenu &&
        !clickedButton &&
        !clickedAccount &&
        !clickedSidebarToggle
      ) {
        setMenuId(null);
        setMenuPosition(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!menuId) return;

    const closeMenu = () => {
      setMenuId(null);
      setMenuPosition(null);
    };

    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);

    return () => {
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [menuId]);

  const renderChat = (item) => {
    const itemIsPinned = isPinned(item.id);
    const isActive = String(activeChatId) === String(item.id);
    const title = item.custom_title || getSavedTitle(item.id, item);

    return (
      <div key={item.id} className="group relative">
        <button
          type="button"
          onClick={() => handleChatSelect(item)}
          title={collapsed ? title : undefined}
          className={`flex min-h-12 w-full items-center gap-3 rounded-xl ${
            collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5 pr-11"
          } text-left transition ${
            isActive
              ? "bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-800/70"
          }`}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={
              isActive
                ? {
                    backgroundColor: "var(--accent-light)",
                    color: "var(--accent-primary)",
                  }
                : undefined
            }
          >
            <MessageCircle
              size={18}
              strokeWidth={1.9}
              className={isActive ? "text-[var(--accent-primary)]" : "text-slate-500 dark:text-slate-400"}
            />
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <p
                  className={`min-w-0 truncate text-[13px] font-medium ${
                    isActive
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {title}
                </p>

                {itemIsPinned && (
                  <Pin
                    size={12}
                    strokeWidth={2.2}
                    className="shrink-0 fill-current text-slate-400 dark:text-slate-500"
                  />
                )}
              </div>

              <p className="mt-0.5 truncate text-[10px] text-slate-400 dark:text-slate-500">
                {getLanguageName(item.language)}
                {item.voice ? ` · ${item.voice}` : ""}
              </p>
            </div>
          )}
        </button>

        {!collapsed && (
          <button
            type="button"
            aria-label="Chat options"
            data-chat-options-button="true"
            onClick={(event) => handleMenuToggle(event, item)}
            className={`absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200 ${
              menuId === item.id
                ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                : ""
            }`}
          >
            <Ellipsis size={18} />
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-[#f7f7f8] transition-[width] duration-300 ease-out dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: collapsed ? 72 : 285 }}
      >
        <div className="flex h-full flex-col">
          <div
            className={`flex h-[72px] shrink-0 items-center border-b border-slate-200/80 dark:border-slate-800 ${
              collapsed ? "justify-center px-2" : "justify-between px-3"
            }`}
          >
            <div
              className={`flex min-w-0 items-center ${
                collapsed ? "" : "gap-2.5"
              }`}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: "var(--accent-primary)" }}
              >
                <MessageCircle size={18} />
              </div>

              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                    Text-to-Speech
                  </p>
                  <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
                    Your speech history
                  </p>
                </div>
              )}
            </div>

            {!collapsed && (
              <div className="hidden lg:block">
                <SidebarToggleButton
                  collapsed={false}
                  onClick={toggleCollapsed}
                />
              </div>
            )}

            <button
              type="button"
              onClick={onMobileClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {!collapsed && (
            <div className="px-3 pt-3">
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 dark:text-slate-500">
                  <Search size={15} />
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search chats…"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-8 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:shadow-[0_0_0_3px_var(--accent-soft)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700"
                    aria-label="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          )}

          {collapsed && (
            <div className="hidden justify-center pt-3 lg:flex">
              <SidebarToggleButton
                collapsed={true}
                onClick={toggleCollapsed}
              />
            </div>
          )}

          <div className={`${collapsed ? "px-2 pt-3" : "px-3 pt-3"}`}>
            <button
              type="button"
              onClick={() => {
                setMenuId(null);
                setMenuPosition(null);
                onNewChat?.();
                onMobileClose?.();
              }}
              title="New Chat"
              className={`flex min-h-11 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white ${
                collapsed ? "justify-center px-2" : "px-3.5"
              } text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-700`}
            >
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: "var(--accent-light)",
                  color: "var(--accent-primary)",
                }}
              >
                <Plus size={17} />
              </div>

              {!collapsed && <span>New Chat</span>}
            </button>
          </div>

          {!collapsed && (
            <div className="px-4 pb-2 pt-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {searchQuery ? "Search results" : "Chats"}
              </p>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            {chatsAreLoading ? (
              <div className="flex h-full min-h-[220px] flex-col items-center justify-center px-4 text-center">
                <div
                  className="h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-t-[var(--accent-primary)] dark:border-slate-700 dark:border-t-[var(--accent-primary)]"
                  aria-hidden="true"
                />
                {!collapsed && (
                  <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Loading your chats...
                  </p>
                )}
              </div>
            ) : (
              <>
                {!collapsed && pinnedIds.length > 0 && (
                  <section className="mb-3">
                    <button
                      type="button"
                      onClick={() => setPinnedOpen((current) => !current)}
                      className="flex w-full items-center gap-1 px-2 py-1.5 text-left"
                    >
                      {pinnedOpen ? (
                        <ChevronDown size={15} className="text-slate-400" />
                      ) : (
                        <ChevronRight size={15} className="text-slate-400" />
                      )}
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Pinned
                      </span>
                    </button>

                    {pinnedOpen && (
                      <div className="space-y-1">
                        {pinnedHistory.length > 0 ? (
                          pinnedHistory.map(renderChat)
                        ) : (
                          <p className="px-7 py-2 text-[11px] text-slate-400 dark:text-slate-500">
                            No pinned chats match your search.
                          </p>
                        )}
                      </div>
                    )}
                  </section>
                )}

                {!collapsed && (
                  <div className="mb-1 px-2 py-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {searchQuery ? "Results" : "Recent"}
                    </p>
                  </div>
                )}

                {recentHistory.length === 0 ? (
                  <div
                    className={`mx-1 mt-2 rounded-2xl border border-dashed border-slate-200 bg-white/70 text-center dark:border-slate-700 dark:bg-slate-800/40 ${
                      collapsed ? "px-2 py-6" : "px-4 py-8"
                    }`}
                  >
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                      {searchQuery ? <Search size={18} /> : <MessageCircle size={18} />}
                    </div>

                    {!collapsed && (
                      <>
                        <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {searchQuery
                            ? "No chats match your search"
                            : pinnedHistory.length > 0
                              ? "No recent chats"
                              : "No chats yet"}
                        </p>
                        <p className="mt-1 text-[11px] leading-4 text-slate-400 dark:text-slate-500">
                          {searchQuery
                            ? "Try a different keyword."
                            : pinnedHistory.length > 0
                              ? "Pinned chats are shown above."
                              : "Generated speech will appear here."}
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {recentHistory.map(renderChat)}
                  </div>
                )}
              </>
            )}
          </div>

          {pinLimitMessage && !collapsed && (
            <div className="shrink-0 px-3 pb-2">
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-xs font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {pinLimitMessage}
              </div>
            </div>
          )}

          <div className="shrink-0 border-t border-slate-200/80 p-3 dark:border-slate-800">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-800 dark:ring-slate-700">
              <div
                className={`flex items-center ${
                  collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-3"
                }`}
              >
                <button
                  type="button"
                  onClick={handleAccountClick}
                  title={collapsed ? user?.full_name || "Account" : "Open account"}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl text-left transition hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: "var(--accent-light)",
                      color: "var(--accent-primary)",
                    }}
                  >
                    <UserCircle size={21} />
                  </div>

                  {!collapsed && (
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                        {user?.full_name || "User"}
                      </p>
                      <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">
                        {user?.email || ""}
                      </p>
                    </div>
                  )}
                </button>

                {!collapsed && (
                  <button
                    type="button"
                    aria-label="Account options"
                    data-account-options-button="true"
                    onClick={handleAccountMenuToggle}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200 ${
                      menuId === "account"
                        ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                        : ""
                    }`}
                  >
                    <Ellipsis size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {menuId && menuId !== "account" && (
        <ChatOptionsMenu
          position={menuPosition}
          pinned={isPinned(menuId)}
          onPin={() => {
            const item = safeHistory.find((h) => String(h.id) === String(menuId));
            if (item) handlePinToggle(item);
          }}
          onRename={() => {
            const item = safeHistory.find((h) => String(h.id) === String(menuId));
            if (item) handleRenameStart(item);
          }}
          onDelete={() => {
            const item = safeHistory.find((h) => String(h.id) === String(menuId));
            if (item) handleDeleteStart(item);
          }}
        />
      )}

      {menuId === "account" && menuPosition &&
        createPortal(
          <div
            data-chat-options-menu="true"
            className="fixed z-[150] w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-900/15 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40"
            style={{ left: menuPosition.left, top: menuPosition.top }}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setMenuId(null);
                setMenuPosition(null);
                handleAccountClick();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 active:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700"
            >
              <Settings size={17} strokeWidth={2} className="shrink-0 text-slate-600 dark:text-slate-400" />
              <span>Settings</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuId(null);
                setMenuPosition(null);
                onLogout?.();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-50 active:bg-red-100 dark:hover:bg-red-950/40 dark:active:bg-red-950/60"
            >
              <LogOut size={17} strokeWidth={2} className="shrink-0" />
              <span>Log out</span>
            </button>
          </div>,
          document.body
        )}

      <IOSRenameAlert
        open={Boolean(renameChat)}
        value={renameValue}
        onChange={setRenameValue}
        onCancel={() => {
          setRenameChat(null);
          setRenameValue("");
        }}
        onConfirm={handleRenameConfirm}
      />

      <IOSConfirmAlert
        open={deleteChat}
        title="Delete chat?"
        message="This chat will be permanently removed from your recent history."
        confirmText="Delete Chat"
        danger
        loading={deleteLoading}
        onCancel={() => {
          if (!deleteLoading) setDeleteChat(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
