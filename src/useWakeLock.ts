import { useEffect } from "react";

/**
 * Keeps the screen awake while `active`, so a phone in your hand does not lock
 * mid-run and cut the coach off. Re-acquires the lock when the tab comes back,
 * since the browser drops it whenever the page is hidden.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;

    let released = false;
    let lock: WakeLockSentinel | null = null;

    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request("screen");
        if (released) void lock.release();
      } catch {
        // Denied (usually a hidden tab or low battery) — the run still works.
      }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible" && !released) void acquire();
    };

    void acquire();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      released = true;
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release().catch(() => undefined);
    };
  }, [active]);
}
