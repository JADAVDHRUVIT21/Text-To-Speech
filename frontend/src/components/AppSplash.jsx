import { useEffect, useState } from "react";
import LoadingTransition from "./LoadingTransition";

/*
 * AppSplash
 *
 * Global cold-start splash. Shows on first mount, holds for a minimum
 * duration so it never flashes, then fades out.
 *
 * ready = true  → session done verifying, splash can go away
 * ready = false → keep showing
 */
export default function AppSplash({
  ready = false,
  minimumDuration = 1400,
}) {
  const [minElapsed, setMinElapsed] = useState(false);
  const [visible, setVisible] = useState(true);

  // Force the splash to stay for `minimumDuration`
  useEffect(() => {
    const timer = setTimeout(() => setMinElapsed(true), minimumDuration);
    return () => clearTimeout(timer);
  }, [minimumDuration]);

  // Once BOTH ready and minElapsed are true → hide the splash
  useEffect(() => {
    if (ready && minElapsed) {
      const fadeTimer = setTimeout(() => setVisible(false), 350);
      return () => clearTimeout(fadeTimer);
    }
  }, [ready, minElapsed]);

  return (
    <LoadingTransition
      visible={visible}
      message="Opening app"
      subMessage="Loading your workspace"
    />
  );
}