// Shared date/time + duration formatting. All event times are displayed in
// Eastern time (the program is at NC State) for consistency regardless of the
// server's timezone.
const TZ = "America/New_York";

export function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: TZ,
  }).format(d);
}

export function formatTime(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TZ,
  }).format(d);
}

// "Sat, Sep 12, 2026 · 2:00 PM – 4:00 PM"
export function formatEventWhen(start: Date, end: Date): string {
  return `${formatDate(start)} · ${formatTime(start)} – ${formatTime(end)}`;
}

// The calendar date a timestamp falls on, in Eastern time, as numeric parts.
// Used to bucket events into day cells without server-timezone surprises.
export function easternYMD(d: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

// Minutes → "1h 40m" / "45m" / "2h".
export function formatDuration(totalMinutes: number): string {
  const m = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h && rem) return `${h}h ${rem}m`;
  if (h) return `${h}h`;
  return `${rem}m`;
}

// Credited minutes for an hour log: clocked time for event logs, or the manual
// `minutes` for task logs. A clocked-in-but-not-out log counts as 0 so far.
export function hourLogMinutes(log: {
  checkIn: Date | null;
  checkOut: Date | null;
  minutes: number | null;
}): number {
  if (log.checkIn && log.checkOut) {
    return Math.max(
      0,
      Math.round((log.checkOut.getTime() - log.checkIn.getTime()) / 60000),
    );
  }
  return log.minutes ?? 0;
}
