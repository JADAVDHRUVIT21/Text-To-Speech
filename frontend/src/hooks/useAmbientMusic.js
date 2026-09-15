import { useEffect, useState } from "react";
import {
  getSnapshot,
  subscribe,
  toggleMusic,
} from "../audio/ambientMusic";

/**
 * Mirrors the global ambient music singleton.
 * Returns { enabled, toggle }. No auto-start — music only plays
 * when the user clicks the toggle.
 */
export function useAmbientMusic() {
  const [snapshot, setSnapshot] = useState(getSnapshot());

  useEffect(() => {
    const unsubscribe = subscribe((next) => setSnapshot({ ...next }));
    return () => unsubscribe();
  }, []);

  return {
    enabled: snapshot.enabled,
    toggle: toggleMusic,
  };
}