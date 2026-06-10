import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/demo-session";
import { formatDuration, formatEventWhen, hourLogMinutes } from "@/lib/format";

// Dashboard ("/") — role-aware. Ambassadors see their next shift + hours;
// coordinators see what needs attention across the program.
export default async function DashboardPage() {
  const { user, role, persona } = await getCurrentUser();
  const isCoordinator = role === "COORDINATOR";
  const now = new Date();

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>Welcome, {persona.name.split(" ")[0]}</h1>
          <p>
            {isCoordinator
              ? "Here's what needs your attention."
              : "Here's your ambassador snapshot."}
          </p>
        </div>
      </div>

      {isCoordinator ? (
        <CoordinatorDashboard now={now} />
      ) : (
        <AmbassadorDashboard userId={user?.id} now={now} />
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: string | number;
  href?: string;
}) {
  const inner = (
    <div className="card" style={{ minWidth: 0 }}>
      <div className="muted">{label}</div>
      <div style={{ fontSize: "1.6rem", fontWeight: 700, marginTop: "0.2rem" }}>
        {value}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

const statGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "1rem",
  marginBottom: "1.75rem",
} as const;

async function AmbassadorDashboard({
  userId,
  now,
}: {
  userId?: string;
  now: Date;
}) {
  if (!userId) return <div className="empty">No user in session.</div>;

  const [signups, logs, upcomingEvents, latest] = await Promise.all([
    prisma.signup.findMany({
      where: { userId, event: { startsAt: { gte: now } } },
      include: { event: true },
      orderBy: { event: { startsAt: "asc" } },
    }),
    prisma.hourLog.findMany({ where: { userId } }),
    prisma.event.findMany({
      where: { startsAt: { gte: now } },
      include: { signups: true },
    }),
    prisma.announcement.findFirst({
      where: { OR: [{ audience: "ALL" }, { audience: "AMBASSADOR" }] },
      include: { author: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const approvedMinutes = logs
    .filter((l) => l.status === "APPROVED")
    .reduce((sum, l) => sum + hourLogMinutes(l), 0);
  const pendingCount = logs.filter((l) => l.status === "PENDING").length;
  const next = signups[0];
  const myEventIds = new Set(signups.map((s) => s.event.id));
  const openEvents = upcomingEvents.filter(
    (e) =>
      !myEventIds.has(e.id) &&
      e.signups.filter((s) => s.status === "CONFIRMED").length < e.capacity,
  );

  return (
    <>
      <div style={statGrid}>
        <Stat label="Approved hours" value={formatDuration(approvedMinutes)} href="/time" />
        <Stat label="Pending hours" value={pendingCount} href="/time" />
        <Stat label="Upcoming shifts" value={signups.length} href="/my-shifts" />
        <Stat label="Events needing you" value={openEvents.length} href="/events?need=1" />
      </div>

      <h2 className="cardTitle" style={{ marginBottom: "0.6rem" }}>
        Next shift
      </h2>
      {next ? (
        <Link href={`/events/${next.event.id}`} className="card" style={{ display: "block", marginBottom: "1.75rem" }}>
          <div className="cardTitle">{next.event.title}</div>
          <div className="muted" style={{ marginTop: "0.2rem" }}>
            {formatEventWhen(next.event.startsAt, next.event.endsAt)} ·{" "}
            {next.event.location}
          </div>
        </Link>
      ) : (
        <div className="empty" style={{ marginBottom: "1.75rem" }}>
          No upcoming shifts.{" "}
          <Link href="/events" style={{ color: "var(--wolfpack-red)", fontWeight: 600 }}>
            Browse events →
          </Link>
        </div>
      )}

      {latest && (
        <>
          <h2 className="cardTitle" style={{ marginBottom: "0.6rem" }}>
            Latest announcement
          </h2>
          <Link href="/messages" className="card" style={{ display: "block" }}>
            <div className="muted">{latest.author.name}</div>
            <p style={{ marginTop: "0.35rem" }}>{latest.body}</p>
          </Link>
        </>
      )}
    </>
  );
}

async function CoordinatorDashboard({ now }: { now: Date }) {
  const [upcoming, pendingApprovals, ambassadorCount] = await Promise.all([
    prisma.event.findMany({
      where: { startsAt: { gte: now } },
      include: { signups: true },
      orderBy: { startsAt: "asc" },
    }),
    prisma.hourLog.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { role: "AMBASSADOR" } }),
  ]);

  const understaffed = upcoming.filter(
    (e) => e.signups.filter((s) => s.status === "CONFIRMED").length < e.capacity,
  );

  return (
    <>
      <div style={statGrid}>
        <Stat label="Upcoming events" value={upcoming.length} href="/events" />
        <Stat label="Understaffed" value={understaffed.length} href="/events?need=1" />
        <Stat label="Pending approvals" value={pendingApprovals} href="/approvals" />
        <Stat label="Ambassadors" value={ambassadorCount} href="/directory" />
      </div>

      <h2 className="cardTitle" style={{ marginBottom: "0.6rem" }}>
        Events still needing ambassadors
      </h2>
      {understaffed.length === 0 ? (
        <div className="empty">Every upcoming event is fully staffed. 🎉</div>
      ) : (
        <div className="stack">
          {understaffed.map((e) => {
            const confirmed = e.signups.filter(
              (s) => s.status === "CONFIRMED",
            ).length;
            return (
              <Link key={e.id} href={`/events/${e.id}`} className="card rowBetween">
                <div>
                  <div className="cardTitle">{e.title}</div>
                  <div className="muted" style={{ marginTop: "0.2rem" }}>
                    {formatEventWhen(e.startsAt, e.endsAt)}
                  </div>
                </div>
                <span className="badge badge-amber">
                  {confirmed}/{e.capacity} filled
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
