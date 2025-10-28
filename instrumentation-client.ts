import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";
const uiHost = process.env.NEXT_PUBLIC_POSTHOG_UI_HOST || "https://eu.posthog.com";

if (typeof window !== "undefined" && key) {
  posthog.init(key, {
    api_host: apiHost,
    ui_host: uiHost,
    capture_exceptions: true, // Enables capturing exceptions using Error Tracking
    debug: process.env.NODE_ENV === "development",
  });
}
