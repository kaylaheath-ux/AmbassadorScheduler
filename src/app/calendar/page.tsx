import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { easternYMD, formatTime } from "@/lib/format";
import styles from "./calendar.module.css";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Calendar (/calendar): month grid of events. `?mine=1` shows only the current
// user's signups; `?y=&m=` navigates months. Defaults to the month of the next
// upcoming event so the demo isn't staring at an empty grid.
export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string; mine?: string }>;
}) {
  const { y, m, mine } = await searchParams;
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");
  const onlyMine = !!mine;

  const allEvents = await prisma.event.findMany({
    orderBy: { startsAt: "asc" },
    include: { signups: true },
  });

  // Default month: the next upcoming event, else today.
  const now = new Date();
  const upcoming = allEvents.find((e) => e.startsAt >= now);
  const fallback = easternYMD(upcoming?.startsAt ?? now);
  const year = y ? Number(y) : fallback.year;
  const month = m ? Number(m) : fallback.month; // 1-12

  const myEventIds = new Set(
    user
      ? allEvents
          .filter((e) => e.signups.some((s) => s.userId === user.id))
          .map((e) => e.id)
      : [],
  );

  // Bucket events into day numbers for this month (Eastern).
  const byDay = new Map<number, typeof allEvents>();
  for (const e of allEvents) {
    if (onlyMine && !myEventIds.has(e.id)) continue;
    const d = easternYMD(e.startsAt);
    if (d.year !== year || d.month !== month) continue;
    const list = byDay.get(d.day) ?? [];
    list.push(e);
    byDay.set(d.day, list);
  }

  // Grid math (month treated abstractly via UTC to avoid tz drift).
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const todayE = easternYMD(now);
  const isCurrentMonth = todayE.year === year && todayE.month === month;

  const prev = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };
  const mineQS = onlyMine ? "&mine=1" : "";

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>Calendar</h1>
          <p>
            {MONTHS[month - 1]} {year}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link
            href={`/calendar?y=${fallback.year}&m=${fallback.month}${mineQS}`}
            className="btn btn-sm"
          >
            Today
          </Link>
          <Link
            href={onlyMine ? "/calendar" : "/calendar?mine=1"}
            className={`btn btn-sm ${onlyMine ? "btn-primary" : ""}`}
          >
            {onlyMine ? "My shifts" : "All events"}
          </Link>
        </div>
      </div>

      <div className="rowBetween" style={{ marginBottom: "1rem" }}>
        <Link href={`/calendar?y=${prev.y}&m=${prev.m}${mineQS}`} className="btn btn-sm">
          ← {MONTHS[(prev.m - 1)]}
        </Link>
        <Link href={`/calendar?y=${next.y}&m=${next.m}${mineQS}`} className="btn btn-sm">
          {MONTHS[(next.m - 1)]} →
        </Link>
      </div>

      <div className={styles.grid}>
        {DOW.map((d) => (
          <div key={d} className={styles.dow}>
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null)
            return <div key={`e${i}`} className={`${styles.cell} ${styles.cellEmpty}`} />;
          const events = byDay.get(day) ?? [];
          const isToday = isCurrentMonth && day === todayE.day;
          return (
            <div key={day} className={styles.cell}>
              <span className={isToday ? styles.today : styles.dayNum}>{day}</span>
              {events.map((e) => (
                <Link
                  key={e.id}
                  href={`/events/${e.id}`}
                  className={`${styles.pill} ${myEventIds.has(e.id) ? styles.pillMine : ""}`}
                  title={e.title}
                >
                  {formatTime(e.startsAt)} {e.title}
                </Link>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
