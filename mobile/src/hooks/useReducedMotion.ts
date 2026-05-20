import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * Iter 142 — detect the user's OS-level "reduce motion" preference.
 *
 * Returns `true` when the user has enabled the system setting (iOS:
 * Settings → Accessibility → Motion → Reduce Motion; Android:
 * Settings → Accessibility → Remove animations).
 *
 * Primitives that drive heavy animations (AuroraBackground, ShimmerButton,
 * Reveal, NumberTicker) read this and gate their effects so the experience
 * stays smooth and respectful for users who need it.
 *
 *   const reduceMotion = useReducedMotion();
 *   <AuroraBackground static={reduceMotion}>...</AuroraBackground>
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Initial check
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (mounted) setReduced(value);
      })
      .catch(() => {
        // Some platforms (web) may not implement this — assume motion is OK.
        if (mounted) setReduced(false);
      });

    // Subscribe to changes (user toggles the setting at runtime).
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (value) => {
        if (mounted) setReduced(value);
      },
    );

    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduced;
}
