import { Music2, Volume2, VolumeX } from "lucide-react";

export default function MusicToggle({ enabled, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={enabled ? "Mute ambient music" : "Play ambient music"}
      className="group fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-xl transition hover:bg-white/[0.12] sm:right-6 sm:top-6 sm:text-sm"
    >
      {enabled ? (
        <>
          <Volume2 size={16} className="shrink-0" />
          <div className="flex h-3 items-end gap-[2px]">
            <span className="tts-eq-bar h-full w-[3px] rounded-full bg-current" />
            <span className="tts-eq-bar h-full w-[3px] rounded-full bg-current" />
            <span className="tts-eq-bar h-full w-[3px] rounded-full bg-current" />
          </div>
          <span className="hidden sm:inline">Music on</span>
          <span className="inline sm:hidden">On</span>
        </>
      ) : (
        <>
          <VolumeX size={16} className="shrink-0" />
          <Music2 size={14} className="shrink-0 opacity-70" />
          <span className="hidden sm:inline">Play music</span>
          <span className="inline sm:hidden">Music</span>
        </>
      )}
    </button>
  );
}