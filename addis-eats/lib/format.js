// Shared locale formatters: instantiate once and reuse across the application.
export const etb = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  maximumFractionDigits: 0
});

export const when = new Intl.DateTimeFormat("en-ET", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Addis_Ababa"
});

export const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function formatRelativeTime(date, now = Date.now()) {
  const milliseconds = new Date(date).getTime() - now;
  if (!Number.isFinite(milliseconds)) return "Time unavailable";
  const minutes = Math.round(milliseconds / 60000);
  if (Math.abs(minutes) < 60) return relative.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relative.format(hours, "hour");
  return relative.format(Math.round(hours / 24), "day");
}
