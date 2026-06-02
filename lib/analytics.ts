export function trackEvent(event: string, payload?: any) {
  const isProd = process.env.NODE_ENV === "production";
  const normalizedEvent =
    event === "click_download_pdf" || event === "click_download_zip"
      ? "click_download"
      : event;
  const prodAllowed = new Set(["click_download", "upgrade_success", "lead_submit"]);
  if (isProd && !prodAllowed.has(normalizedEvent)) return;

  const data = {
    event: normalizedEvent,
    ...payload,
    timestamp: Date.now(),
  };

  if (!isProd) {
    console.log("[analytics]", data);
  }

  fetch("/api/analytics/log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).catch(() => {});
}
