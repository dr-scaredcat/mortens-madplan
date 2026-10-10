import { useCallback, useEffect, useRef, useState } from "react";

/**
 * "Hold skærmen tændt" via Screen Wake Lock API.
 *
 * Understøttes af Chrome/Android og Safari/iOS 16.4+ (i installerede
 * hjemmeskærms-apps virker det fra iOS 18.4). Låsen slippes automatisk af
 * browseren, når fanen skjules — derfor genoprettes den, når appen bliver
 * synlig igen, så længe brugeren har slået funktionen til.
 */
export function useWakeLock(initial = false) {
  const supported = typeof navigator !== "undefined" && "wakeLock" in navigator;
  const [enabled, setEnabled] = useState(initial);
  const [active, setActive] = useState(false);
  const sentinel = useRef<WakeLockSentinel | null>(null);

  const release = useCallback(async () => {
    try {
      await sentinel.current?.release();
    } catch {
      // ignorér
    }
    sentinel.current = null;
    setActive(false);
  }, []);

  const request = useCallback(async () => {
    if (!supported || document.visibilityState !== "visible") return;
    try {
      const s = await navigator.wakeLock.request("screen");
      sentinel.current = s;
      setActive(true);
      s.addEventListener("release", () => {
        if (sentinel.current === s) {
          sentinel.current = null;
          setActive(false);
        }
      });
    } catch {
      setActive(false);
    }
  }, [supported]);

  useEffect(() => {
    if (!enabled) {
      void release();
      return;
    }
    void request();
    const onVisible = () => {
      if (document.visibilityState === "visible" && !sentinel.current) void request();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      void release();
    };
  }, [enabled, request, release]);

  return { supported, enabled, active, setEnabled };
}
