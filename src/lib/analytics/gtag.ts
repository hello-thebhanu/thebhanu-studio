declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "js",
      target: string | Date,
      params?: Record<string, string | number | boolean>
    ) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  window.gtag("event", eventName, params);
}
