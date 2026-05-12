/**
 * Lightweight analytics shim. Privacy-first: no third-party scripts by default — events go to
 * our own gateway at `/api/v1/telemetry/events`. Switch to a real analytics provider by
 * replacing the implementation of {@link send}.
 *
 * The function is intentionally tiny because:
 *  1. Every screen calls it; expensive code paths show up in TBT.
 *  2. Failures must never throw (analytics is decorative, not load-bearing).
 *  3. The interface should survive a vendor swap.
 *
 * Usage:
 *   import { analytics } from "@/lib/analytics";
 *   analytics.track("job_apply_clicked", { jobId });
 *   analytics.page("/dashboard");
 */
type Props = Record<string, string | number | boolean | null | undefined>;

interface Analytics {
  track(event: string, props?: Props): void;
  page(path: string, props?: Props): void;
  identify(userId: string, traits?: Props): void;
  flush(): Promise<void>;
}

const ENDPOINT = "/api/v1/telemetry/events";
const BATCH_LIMIT = 12;
const FLUSH_INTERVAL_MS = 5_000;

let queue: Array<{ type: string; name: string; props?: Props; ts: number; userId?: string }> = [];
let userId: string | undefined;
let timer: ReturnType<typeof setTimeout> | null = null;

function scheduleFlush() {
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    flush();
  }, FLUSH_INTERVAL_MS);
}

async function flush() {
  if (queue.length === 0 || typeof window === "undefined") return;
  const batch = queue.splice(0, BATCH_LIMIT);
  try {
    // Use sendBeacon when the page is unloading so we don't lose the batch.
    const payload = JSON.stringify({ events: batch });
    if ("sendBeacon" in navigator) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(ENDPOINT, blob);
    } else {
      await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      });
    }
  } catch {
    // Swallow — analytics must never fail the user-visible request.
  }
}

if (typeof window !== "undefined") {
  // Flush remaining batch on tab hide / unload.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("pagehide", flush);
}

export const analytics: Analytics = {
  track(event, props) {
    queue.push({ type: "track", name: event, props, ts: Date.now(), userId });
    if (queue.length >= BATCH_LIMIT) flush();
    else scheduleFlush();
  },
  page(path, props) {
    queue.push({ type: "page", name: path, props, ts: Date.now(), userId });
    scheduleFlush();
  },
  identify(id, traits) {
    userId = id;
    queue.push({ type: "identify", name: id, props: traits, ts: Date.now(), userId: id });
    scheduleFlush();
  },
  flush,
};
