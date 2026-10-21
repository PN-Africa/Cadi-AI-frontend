export const formatMinutes = (minutes: number | null | undefined): string => {
  if (minutes === null || minutes === undefined || Number.isNaN(minutes)) return "—";
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${Math.floor(minutes)}min`;

  if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return `${hours}hr${hours === 1 ? "" : "s"}`;
  }

  const days = Math.floor(minutes / 1440);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

export const formatRelativeTime = (iso: string, now: Date = new Date()): string => {
  const minutes = (now.getTime() - new Date(iso).getTime()) / 60000;

  if (Number.isNaN(minutes)) return "—";
  if (minutes < 1) return "just now";

  const text = formatMinutes(minutes);
  return text.endsWith("ago") ? text : `${text} ago`;
};

// ISO timestamp -> "10:09 AM", or "Oct 17, 10:09 AM" when the date is needed.
export const formatEventTime = (iso: string, includeDate = false): string => {
  const when = new Date(iso);
  if (Number.isNaN(when.getTime())) return "—";

  const time = when.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (!includeDate) return time;

  const date = when.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${date}, ${time}`;
};

// "Today", "Yesterday" or "Oct 17"
export const formatEventDay = (iso: string, now: Date = new Date()): string => {
  const when = new Date(iso);
  if (Number.isNaN(when.getTime())) return "—";

  const dayStart = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((dayStart(now) - dayStart(when)) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return when.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// For sentences: "today at 10:09 AM", "yesterday at 10:09 AM", "on Oct 17 at 10:09 AM"
export const formatEventPhrase = (iso: string, now: Date = new Date()): string => {
  const day = formatEventDay(iso, now);
  const time = formatEventTime(iso);

  if (day === "Today" || day === "Yesterday") return `${day.toLowerCase()} at ${time}`;
  return `on ${day} at ${time}`;
};