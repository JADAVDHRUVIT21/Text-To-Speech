import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bot,
  Check,
  ChevronDown,
  Copy,
  Maximize2,
  Minimize2,
  MessageCircle,
  Pencil,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";
import puter from "@heyputer/puter.js";

const AI_MODEL = "openai/gpt-5.6-luna";

const SYSTEM_PROMPT = `
You are the AI Assistant inside a modern Text-to-Speech web application built with React, FastAPI, PostgreSQL and Puter.js.

You help the user in two categories:
1. Questions about THIS application (features, shortcuts, usage).
2. General questions (programming, tech, education, science, sports, news, weather, current events, everyday topics).

=====================================================
APPLICATION FACTS (use these exactly, never guess)
=====================================================

App name: Text-to-Speech
Purpose: Convert text into natural-sounding speech in many languages.

KEYBOARD SHORTCUTS (these are the ONLY shortcuts):
- New Chat: Ctrl + J on Windows/Linux, Command + J on Mac
- Focus Search Bar: Ctrl + K on Windows/Linux, Command + K on Mac

There is NO Ctrl+Shift+O shortcut. There is NO Command+Shift+O shortcut.
If the user asks about a shortcut, only mention Ctrl+J / Ctrl+K (or Cmd on Mac).

SIDEBAR FEATURES:
- New Chat button (creates a fresh empty chat)
- Search chats field (filters chats by title, language, or voice)
- Pinned section (you can pin up to 5 chats)
- Recent section (all other chats)
- Each chat row has a "..." menu with Pin, Rename, Delete
- Account menu at the bottom with Settings and Logout

MAIN DASHBOARD FEATURES:
- Text area for typing or pasting text
- Upload document button (supports PDF, TXT, DOCX, EPUB, up to 10 MB)
- Language dropdown (20+ languages)
- Voice dropdown (Puter voices: AWS Polly, xAI, OpenAI, Gemini, Speechify, plus System Voice)
- Generate Speech button (creates the audio)
- Clear button (resets the text and player)
- Audio player appears after generation with Play / Pause, ±10 sec, seek bar, and Download
- Success and error messages shown below the player

HOW GENERATION WORKS:
1. User types or pastes text (max 2,999 characters).
2. User selects a language and a voice.
3. When the user presses Generate Speech:
   - The text is checked for abusive content.
   - The text is automatically translated to the selected language using AI.
   - The translated text is converted to speech using Puter.js.
   - The audio player appears and the audio starts playing.
   - The chat is saved automatically to history.

HISTORY:
- Every generated speech is saved to the user's history.
- Clicking a chat in the sidebar loads its text and regenerates the voice.
- Users can Pin, Rename, or Delete chats from the "..." menu.

LANGUAGES:
Supports English, Hindi, Gujarati, Marathi, Tamil, Spanish, French, German, Japanese, Chinese, Korean, Arabic, Portuguese, Italian, Russian, Dutch, Turkish, Polish, Swedish, Bulgarian, Romanian, Czech, Greek, Finnish, Croatian, Malay, Slovak, Danish, Ukrainian, Filipino, Indonesian, Bengali, Vietnamese.

VOICES:
- Downloadable voices: AWS Polly, xAI (Eve, Ara, Rex, Sal, Leo), OpenAI, Gemini, Speechify.
- System Voice: uses the browser/device voice. It CANNOT be downloaded and has no seek bar.

AUTHENTICATION:
- Register with full name, email, password.
- Login with email and password.
- JWT-based sessions.
- Logout from the account menu at the bottom of the sidebar.

SETTINGS:
- Available from the account menu → Settings (goes to /account).
- Theme options: Light, Dark, and custom accent color.
- Settings persist locally.

CONTENT SAFETY:
- Text is checked for abusive content before generation.
- Abusive language is blocked with a warning.

=====================================================
LIVE INFORMATION RULE
=====================================================

When the user asks about anything time-sensitive, including words like:
current, currently, today, tonight, latest, live, now, recent, score, results, upcoming, this week, this month, yesterday, tomorrow, weather, price, ranking, schedule

you MUST use the web search tool and return the freshest information.

Never invent live information. If search fails, say you could not get the latest information.

=====================================================
RESPONSE FORMATTING RULES
=====================================================

- Write in plain, natural sentences.
- Do NOT use markdown formatting.
- Do NOT use asterisks, double asterisks, or bold/italic markers.
- Do NOT use bullet symbols like "*".
- Do NOT include URLs or links unless the user explicitly asks for a link or source.
- When listing, use short plain sentences or numbered lines like "1.", "2.", "3.".
- Keep answers clear, friendly, and concise unless the user asks for more detail.
- Never guess about this application. If something is not in the facts above, say you are not sure and suggest they check the app.
`;

const ABUSE_MESSAGE =
  "Sorry, I can understand your question, but I can't respond to abusive or offensive language. Please use respectful language and try again.";

function cleanAnswer(raw) {
  if (!raw) return "";

  let text = raw;

  text = text.replace(/\*\*(.*?)\*\*/g, "$1");
  text = text.replace(/__(.*?)__/g, "$1");
  text = text.replace(/\*(.*?)\*/g, "$1");
  text = text.replace(/_(.*?)_/g, "$1");

  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    "$1"
  );

  text = text.replace(/\(https?:\/\/[^\s)]+\)/g, "");
  text = text.replace(/https?:\/\/[^\s)]+/g, "");

  text = text.replace(/utm_source=[^\s)]+/g, "");

  text = text.replace(/^\s*[\*\-]\s+/gm, "• ");

  text = text.replace(/\(\s*\)/g, "");

  text = text.replace(/[ \t]{2,}/g, " ");

  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}

const checkAbusiveContent = async (userMessage) => {
  try {
    const moderationPrompt = `
You are a strict content moderation classifier.

Analyze the user's message.

Determine whether it contains abusive, insulting, vulgar, harassing, threatening, hateful, or seriously offensive language.

The message can contain:
English
Hindi
Gujarati
Hinglish
Hindi written using English letters
Gujarati written using English letters
Mixed languages
Spelling variations
Repeated letters
Intentional spaces
Punctuation variations
Number substitutions
Character substitutions

You must classify the message only.

Return exactly one word:

BLOCK

or

ALLOW

Do not explain your decision.
Do not repeat the user's message.
Do not quote any offensive language.
Do not identify specific offensive words.
Do not output anything except BLOCK or ALLOW.

USER MESSAGE:
<<<${userMessage}>>>
`;

    const response = await puter.ai.chat(moderationPrompt, {
      model: AI_MODEL,
    });

    let result = "";

    if (typeof response === "string") {
      result = response;
    } else if (response?.message?.content) {
      if (typeof response.message.content === "string") {
        result = response.message.content;
      } else if (Array.isArray(response.message.content)) {
        result = response.message.content
          .map((item) => item?.text || "")
          .join("");
      }
    } else if (response?.content) {
      result =
        typeof response.content === "string"
          ? response.content
          : JSON.stringify(response.content);
    }

    result = result.trim().toUpperCase();

    return result === "BLOCK" || result.includes("BLOCK");
  } catch (error) {
    console.error("CONTENT MODERATION ERROR:", error);

    return false;
  }
};

/* ---------------------------------------------------------------- */
/*  Mobile bottom sheet: Copy + Edit                                 */
/* ---------------------------------------------------------------- */

function MobileMessageSheet({
  open,
  onCopy,
  onEdit,
  onClose,
  copied,
}) {
  if (!open) return null;

  return createPortal(
    <>
      <div
        className="
          fixed
          inset-0
          z-[100000]
          bg-black/40
          backdrop-blur-[2px]
          sm:hidden
        "
        onClick={onClose}
      />

      <div
        className="
          fixed
          inset-x-0
          bottom-0
          z-[100001]
          sm:hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="
            mx-auto
            w-full
            max-w-md
            overflow-hidden
            rounded-t-[24px]
            border-t
            border-slate-200
            bg-white
            pb-[env(safe-area-inset-bottom)]
            shadow-[0_-10px_40px_rgba(15,23,42,0.25)]
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <div className="flex justify-center pt-3">
            <span className="h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>

          <div className="p-2 pt-3">
            <button
              type="button"
              onClick={onCopy}
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-2xl
                px-4
                py-3.5
                text-left
                text-[15px]
                font-semibold
                text-slate-700
                transition
                active:bg-slate-100
                dark:text-slate-200
                dark:active:bg-slate-800
              "
            >
              {copied ? (
                <Check className="h-5 w-5 text-emerald-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-2xl
                px-4
                py-3.5
                text-left
                text-[15px]
                font-semibold
                text-slate-700
                transition
                active:bg-slate-100
                dark:text-slate-200
                dark:active:bg-slate-800
              "
            >
              <Pencil className="h-5 w-5" />
              <span>Edit message</span>
            </button>
          </div>

          <div className="px-3 pb-3">
            <button
              type="button"
              onClick={onClose}
              className="
                flex
                min-h-12
                w-full
                items-center
                justify-center
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                text-[15px]
                font-bold
                text-slate-700
                transition
                active:scale-[0.99]
                dark:border-slate-800
                dark:bg-slate-950
                dark:text-slate-200
              "
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content:
        "Hi! I'm your AI Assistant. You can ask me about this application or ask general questions, including current information.",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  // Desktop hover state
  const [activeMessageId, setActiveMessageId] = useState(null);

  // Mobile bottom-sheet state
  const [sheetMessage, setSheetMessage] = useState(null);

  // Copied feedback
  const [copiedId, setCopiedId] = useState(null);

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const editTextareaRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const longPressFiredRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (editingId !== null) {
      setTimeout(() => {
        editTextareaRef.current?.focus();
        editTextareaRef.current?.select();
      }, 60);
    }
  }, [editingId]);

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const askAI = async (userMessage, historyOverride = null) => {
    const sourceMessages = Array.isArray(historyOverride)
      ? historyOverride
      : messages;

    const conversation = sourceMessages
      .map(
        (item) =>
          `${item.role === "user" ? "User" : "Assistant"}: ${item.content}`
      )
      .join("\n");

    const prompt = `
${SYSTEM_PROMPT}

Previous conversation:
${conversation}

Current user question:
${userMessage}

Instructions:
If this question requires current information, use web search.
If this question is about cricket, sports, news, weather, prices, rankings, schedules or other changing information, use web search.
Give the user a direct answer.
Answer in plain text.
Never use markdown, asterisks, bold/italic markers, or bullet "*" symbols.
Do not include URLs or links unless the user explicitly asks for a link or source.
Never fabricate live information.

Assistant:
`;

    try {
      const response = await puter.ai.chat(prompt, {
        model: AI_MODEL,
        tools: [
          {
            type: "web_search",
          },
        ],
      });

      if (!response) {
        throw new Error("No response received from AI.");
      }

      let answer = "";

      if (typeof response === "string") {
        answer = response;
      } else if (response?.message?.content) {
        if (typeof response.message.content === "string") {
          answer = response.message.content;
        } else if (Array.isArray(response.message.content)) {
          answer = response.message.content
            .map((item) => item?.text || "")
            .join("");
        }
      } else if (response?.content) {
        answer =
          typeof response.content === "string"
            ? response.content
            : JSON.stringify(response.content);
      }

      answer = cleanAnswer(answer);

      if (!answer) {
        throw new Error("AI returned an empty response.");
      }

      return answer;
    } catch (error) {
      console.error("AI ASSISTANT ERROR:", error);

      throw new Error(
        "I couldn't get the latest information right now. Please try again."
      );
    }
  };

  const sendAndReply = async (value, baseMessages) => {
    setLoading(true);

    try {
      const isAbusive = await checkAbusiveContent(value);

      if (isAbusive) {
        const assistantMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: ABUSE_MESSAGE,
        };

        setMessages((previous) => [...previous, assistantMessage]);
        return;
      }

      const answer = await askAI(value, baseMessages);

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: answer,
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (error) {
      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          error?.message ||
          "Something went wrong while contacting the AI assistant.",
        error: true,
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } finally {
      setLoading(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleSend = async (customMessage = null) => {
    const value = (customMessage ?? message).trim();

    if (!value || loading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: value,
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setMessage("");
    setActiveMessageId(null);

    await sendAndReply(value, nextMessages);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (text) => {
    handleSend(text);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsFullscreen(false);

    setEditingId(null);
    setEditingValue("");
    setActiveMessageId(null);
    setCopiedId(null);
    setSheetMessage(null);

    setMessages([
      {
        id: 1,
        role: "assistant",
        content:
          "Hi! I'm your AI Assistant. You can ask me about this application or ask general questions, including current information.",
      },
    ]);

    setMessage("");
  };

  const handleMinimize = () => {
    setIsOpen(false);
    setIsFullscreen(false);
    setEditingId(null);
    setEditingValue("");
    setActiveMessageId(null);
    setCopiedId(null);
    setSheetMessage(null);
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  /* ---------------- Copy ---------------- */

  const copyText = async (item) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(item.content);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = item.content;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopiedId(item.id);

      setTimeout(() => {
        setCopiedId((current) => (current === item.id ? null : current));
      }, 1200);

      return true;
    } catch (err) {
      console.error("COPY ERROR:", err);
      return false;
    }
  };

  const handleCopy = async (item) => {
    await copyText(item);
  };

  const handleSheetCopy = async () => {
    if (!sheetMessage) return;

    const ok = await copyText(sheetMessage);

    if (ok) {
      setTimeout(() => {
        setSheetMessage(null);
      }, 700);
    }
  };

  /* ---------------- Edit ---------------- */

  const startEdit = (item) => {
    if (loading) return;
    if (item.role !== "user") return;

    setActiveMessageId(null);
    setSheetMessage(null);
    setEditingId(item.id);
    setEditingValue(item.content);
  };

  const handleSheetEdit = () => {
    if (!sheetMessage) return;
    startEdit(sheetMessage);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const confirmEdit = async () => {
    if (editingId === null) return;

    const value = editingValue.trim();
    if (!value || loading) return;

    const index = messages.findIndex((m) => m.id === editingId);
    if (index === -1) {
      cancelEdit();
      return;
    }

    const editedMessage = {
      ...messages[index],
      content: value,
    };

    const trimmed = [...messages.slice(0, index), editedMessage];

    setMessages(trimmed);
    setEditingId(null);
    setEditingValue("");

    await sendAndReply(value, trimmed);
  };

  const handleEditKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      confirmEdit();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
    }
  };

  /* ---------------- Mobile long-press ---------------- */

  const handleTouchStart = (event, item) => {
    if (item.role !== "user" || loading) return;

    longPressFiredRef.current = false;

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    longPressTimerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      setSheetMessage(item);
      longPressTimerRef.current = null;
    }, 450);
  };

  const handleTouchEnd = (event, item) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // If long-press didn't fire, do nothing (allow normal tap).
    // Prevents unwanted selection.
    if (longPressFiredRef.current) {
      event.preventDefault?.();
    }
  };

  const handleTouchMove = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const windowClasses = isFullscreen
    ? "fixed inset-0 z-[99999] flex flex-col overflow-hidden bg-white dark:bg-slate-950"
    : "fixed bottom-4 right-4 z-[99999] flex h-[calc(100vh-32px)] max-h-[720px] w-[calc(100vw-32px)] max-w-[480px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-950 dark:shadow-[0_25px_80px_rgba(0,0,0,0.7)]";

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Assistant"
          className="
            fixed
            bottom-5
            right-5
            z-[99999]
            flex
            items-center
            gap-2
            rounded-full
            bg-gradient-to-r
            from-blue-600
            via-indigo-600
            to-purple-600
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            shadow-[0_12px_35px_rgba(37,99,235,0.35)]
            transition
            duration-300
            hover:scale-105
            hover:shadow-[0_16px_40px_rgba(37,99,235,0.45)]
            active:scale-95
            dark:shadow-[0_12px_35px_rgba(37,99,235,0.5)]
          "
        >
          <Sparkles className="h-5 w-5" />

          <span>AI Assistant</span>

          <span
            className="
              h-2.5
              w-2.5
              animate-pulse
              rounded-full
              bg-emerald-400
              shadow-[0_0_8px_rgba(52,211,153,0.9)]
            "
          />
        </button>
      )}

      {isOpen && (
        <div className={windowClasses}>
          <div
            className="
              flex
              shrink-0
              items-center
              justify-between
              bg-gradient-to-r
              from-blue-600
              via-indigo-600
              to-purple-600
              px-5
              py-4
              text-white
            "
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white/15
                  ring-1
                  ring-white/20
                "
              >
                <Sparkles className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-sm font-bold sm:text-base">
                    AI Assistant
                  </h2>

                  <span
                    className="
                      h-2
                      w-2
                      animate-pulse
                      rounded-full
                      bg-emerald-400
                      shadow-[0_0_8px_rgba(52,211,153,0.8)]
                    "
                  />

                  <span
                    className="
                      hidden
                      rounded-full
                      bg-white/15
                      px-2
                      py-0.5
                      text-[10px]
                      font-semibold
                      sm:inline-flex
                    "
                  >
                    LIVE AI
                  </span>
                </div>

                <p className="mt-0.5 text-[11px] text-blue-100 sm:text-xs">
                  General AI + live information
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {isFullscreen ? (
                <button
                  type="button"
                  aria-label="Exit fullscreen"
                  onClick={toggleFullscreen}
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    text-white/80
                    transition
                    hover:bg-white/10
                    hover:text-white
                  "
                >
                  <Minimize2 className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="button"
                  aria-label="Minimize AI Assistant"
                  onClick={handleMinimize}
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    text-white/80
                    transition
                    hover:bg-white/10
                    hover:text-white
                  "
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              )}

              <button
                type="button"
                aria-label="Close AI Assistant"
                onClick={handleClose}
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  text-white/80
                  transition
                  hover:bg-white/10
                  hover:text-white
                "
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            className="
              flex
              shrink-0
              items-center
              justify-between
              border-b
              border-slate-100
              bg-white
              px-5
              py-3
              dark:border-slate-800
              dark:bg-slate-950
            "
          >
            <div className="flex items-center gap-2">
              <span
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                  text-blue-600
                  dark:bg-blue-950/50
                  dark:text-blue-400
                "
              >
                <Bot className="h-4 w-4" />
              </span>

              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Smart Assistant
                </p>

                <div className="mt-0.5 flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      loading
                        ? "animate-pulse bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                  />

                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {loading ? "Checking..." : "Live search ready"}
                  </span>
                </div>
              </div>
            </div>

            {!isFullscreen && (
              <button
                type="button"
                aria-label="Expand AI Assistant"
                onClick={toggleFullscreen}
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  transition
                  hover:bg-slate-100
                  hover:text-slate-700
                  dark:text-slate-500
                  dark:hover:bg-slate-800
                  dark:hover:text-slate-200
                "
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            )}
          </div>

          <div
            className="
              flex-1
              overflow-y-auto
              overflow-x-hidden
              bg-slate-50
              px-4
              py-5
              sm:px-5
              dark:bg-slate-900
            "
          >
            {messages.map((item) => {
              const isEditing = editingId === item.id;
              const isUser = item.role === "user";
              const isActive = activeMessageId === item.id;
              const isCopied = copiedId === item.id;

              return (
                <div
                  key={item.id}
                  className={`mb-4 flex items-start gap-3 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-gradient-to-br
                        from-blue-500
                        to-purple-600
                        text-white
                        shadow-sm
                      "
                    >
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}

                  {isEditing ? (
                    <div
                      className="
                        min-w-0
                        w-full
                        max-w-[calc(100%-48px)]
                        rounded-2xl
                        rounded-tr-md
                        border
                        border-blue-300
                        bg-white
                        p-2
                        shadow-md
                        ring-4
                        ring-blue-50
                        dark:border-blue-700
                        dark:bg-slate-950
                        dark:ring-blue-950/40
                      "
                    >
                      <textarea
                        ref={editTextareaRef}
                        value={editingValue}
                        onChange={(event) =>
                          setEditingValue(event.target.value)
                        }
                        onKeyDown={handleEditKeyDown}
                        rows={Math.min(
                          8,
                          Math.max(2, editingValue.split("\n").length)
                        )}
                        className="
                          w-full
                          resize-none
                          rounded-xl
                          bg-transparent
                          px-3
                          py-2
                          text-sm
                          leading-6
                          text-slate-700
                          outline-none
                          dark:text-slate-200
                        "
                        style={{
                          overflowWrap: "anywhere",
                          wordBreak: "break-word",
                        }}
                      />

                      <div className="mt-1 flex items-center justify-end gap-2 px-1">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          disabled={loading}
                          className="
                            flex
                            h-8
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-3
                            text-xs
                            font-semibold
                            text-slate-600
                            transition
                            hover:bg-slate-50
                            disabled:opacity-50
                            dark:border-slate-800
                            dark:bg-slate-900
                            dark:text-slate-300
                            dark:hover:bg-slate-800
                          "
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={confirmEdit}
                          disabled={loading || !editingValue.trim()}
                          className="
                            flex
                            h-8
                            items-center
                            justify-center
                            gap-1.5
                            rounded-lg
                            bg-gradient-to-r
                            from-blue-600
                            to-indigo-600
                            px-3
                            text-xs
                            font-semibold
                            text-white
                            shadow-sm
                            transition
                            hover:from-blue-700
                            hover:to-indigo-700
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          <Send className="h-3.5 w-3.5" />
                          Send
                        </button>
                      </div>
                    </div>
                  ) : isUser ? (
                    <div
                      className="flex flex-col items-end max-w-[calc(100%-48px)]"
                      onMouseEnter={() => setActiveMessageId(item.id)}
                      onMouseLeave={() =>
                        setActiveMessageId((current) =>
                          current === item.id ? null : current
                        )
                      }
                    >
                      <div
                        onTouchStart={(e) => handleTouchStart(e, item)}
                        onTouchEnd={(e) => handleTouchEnd(e, item)}
                        onTouchMove={handleTouchMove}
                        onTouchCancel={handleTouchMove}
                        onDoubleClick={() => startEdit(item)}
                        onContextMenu={(e) => {
                          // Desktop right-click also opens the mobile sheet
                          // (nice bonus — but only if not on a touch device)
                          e.preventDefault();
                          setSheetMessage(item);
                        }}
                        className="
                          group
                          min-w-0
                          max-w-full
                          overflow-hidden
                          rounded-2xl
                          rounded-tr-md
                          bg-blue-600
                          px-4
                          py-3
                          text-left
                          text-white
                          shadow-sm
                          select-none
                        "
                        style={{
                          WebkitTouchCallout: "none",
                          WebkitUserSelect: "none",
                          userSelect: "none",
                        }}
                      >
                        <p
                          className="
                            break-words
                            whitespace-pre-wrap
                            text-sm
                            leading-6
                            text-white
                          "
                          style={{
                            overflowWrap: "anywhere",
                            wordBreak: "break-word",
                          }}
                        >
                          {item.content}
                        </p>
                      </div>

                      {/* Desktop hover action row (hidden on mobile) */}
                      <div
                        className={`
                          mt-1.5 hidden items-center gap-1 rounded-full bg-white/95 px-1.5 py-1
                          shadow-sm ring-1 ring-slate-200
                          transition-all duration-150
                          sm:flex
                          dark:bg-slate-900/95 dark:ring-slate-700
                          ${
                            isActive
                              ? "pointer-events-auto opacity-100 translate-y-0"
                              : "pointer-events-none opacity-0 -translate-y-1"
                          }
                        `}
                      >
                        <button
                          type="button"
                          onClick={() => handleCopy(item)}
                          title={isCopied ? "Copied" : "Copy"}
                          aria-label="Copy message"
                          className="
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-full
                            text-slate-600
                            transition
                            hover:bg-slate-100
                            hover:text-slate-900
                            active:scale-95
                            dark:text-slate-300
                            dark:hover:bg-slate-800
                            dark:hover:text-white
                          "
                        >
                          {isCopied ? (
                            <span className="text-[10px] font-bold text-emerald-600">
                              ✓
                            </span>
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          title="Edit message"
                          aria-label="Edit message"
                          className="
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-full
                            text-slate-600
                            transition
                            hover:bg-slate-100
                            hover:text-slate-900
                            active:scale-95
                            dark:text-slate-300
                            dark:hover:bg-slate-800
                            dark:hover:text-white
                          "
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`
                        min-w-0
                        max-w-[calc(100%-48px)]
                        overflow-hidden
                        rounded-2xl
                        rounded-tl-md
                        border
                        px-4
                        py-3
                        text-left
                        shadow-sm
                        ${
                          item.error
                            ? "border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40"
                            : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                        }
                      `}
                    >
                      <p
                        className={`
                          break-words
                          whitespace-pre-wrap
                          text-sm
                          leading-6
                          ${
                            item.error
                              ? "text-red-600 dark:text-red-400"
                              : "text-slate-700 dark:text-slate-200"
                          }
                        `}
                        style={{
                          overflowWrap: "anywhere",
                          wordBreak: "break-word",
                        }}
                      >
                        {item.content}
                      </p>
                    </div>
                  )}

                  {isUser && !isEditing && (
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-200
                        text-slate-600
                        dark:bg-slate-800
                        dark:text-slate-300
                      "
                    >
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="mb-4 flex items-start gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-br
                    from-blue-500
                    to-purple-600
                    text-white
                  "
                >
                  <Sparkles className="h-4 w-4" />
                </div>

                <div
                  className="
                    rounded-2xl
                    rounded-tl-md
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-3
                    shadow-sm
                    dark:border-slate-800
                    dark:bg-slate-950
                  "
                >
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" />

                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-indigo-400"
                      style={{ animationDelay: "100ms" }}
                    />

                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-purple-400"
                      style={{ animationDelay: "200ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div className="mt-6">
                <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Try asking
                </p>

                <div className="grid gap-2">
                  {[
                    "How do I generate speech?",
                    "What can this application do?",
                    "What is the current cricket score?",
                    "What are today's latest technology news?",
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleSuggestion(item)}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        py-3
                        text-left
                        text-xs
                        font-medium
                        text-slate-600
                        shadow-sm
                        transition
                        hover:border-blue-200
                        hover:bg-blue-50
                        hover:text-blue-600
                        dark:border-slate-800
                        dark:bg-slate-950
                        dark:text-slate-300
                        dark:hover:border-blue-700
                        dark:hover:bg-blue-950/40
                        dark:hover:text-blue-300
                      "
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div
            className="
              shrink-0
              border-t
              border-slate-200
              bg-white
              p-3
              sm:p-4
              dark:border-slate-800
              dark:bg-slate-950
            "
          >
            <div
              className="
                flex
                items-end
                gap-2
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                p-2
                transition
                focus-within:border-blue-300
                focus-within:bg-white
                focus-within:ring-4
                focus-within:ring-blue-50
                dark:border-slate-800
                dark:bg-slate-900
                dark:focus-within:border-blue-700
                dark:focus-within:bg-slate-950
                dark:focus-within:ring-blue-950/40
              "
            >
              <textarea
                ref={inputRef}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask anything..."
                className="
                  max-h-28
                  min-h-9
                  flex-1
                  resize-none
                  bg-transparent
                  px-1
                  py-2
                  text-sm
                  text-slate-700
                  outline-none
                  placeholder:text-slate-400
                  dark:text-slate-200
                  dark:placeholder:text-slate-500
                "
              />

              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!message.trim() || loading}
                aria-label="Send message"
                className="
                  mb-0.5
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-gradient-to-r
                  from-blue-600
                  to-indigo-600
                  text-white
                  shadow-sm
                  transition
                  hover:from-blue-700
                  hover:to-indigo-700
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between px-1">
              <p className="text-[9px] text-slate-400 sm:text-[10px] dark:text-slate-500">
                Live answers may use web sources. Verify important information.
              </p>

              <MessageCircle className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom sheet — only visible below the sm breakpoint */}
      <MobileMessageSheet
        open={!!sheetMessage}
        copied={copiedId !== null && copiedId === sheetMessage?.id}
        onCopy={handleSheetCopy}
        onEdit={handleSheetEdit}
        onClose={() => setSheetMessage(null)}
      />
    </>
  );
}