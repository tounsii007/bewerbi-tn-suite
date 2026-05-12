import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

/**
 * Browser worker — start once in client entry points (Storybook preview, _app dev mode).
 *
 *   import { worker } from "@/mocks/browser";
 *   if (process.env.NEXT_PUBLIC_USE_MSW === "1") worker.start({ onUnhandledRequest: "bypass" });
 */
export const worker = setupWorker(...handlers);
