import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/demo-session";
import { EVENT_TYPE_LABEL } from "@/lib/events";
import { formatEventWhen } from "@/lib/format";
import { dropSignup } from "../events/actions";

// Cancellations lock this many hours before the event starts.
const CANCEL_CUTOFF_HOURS = 24;

export default async function MyShiftsPage() {
  const { user } = await getCurrentUser();
  if (!user) {
    return (
      <div className="page">
        <h1>My Shifts</h1>
        <div className="empty">No user in session.</div>
      </div>
    );
  }

  const signups = await prisma.signup.findMany({
    where: { userId: user.id },
    include: { event: true },
    orderBy: { event: { startsAt: "asc" } },
  });

  const now = new Date();
  const upcoming = signups.filter((s) => s.event.startsAt >= now);
  const past = signups
    .filter((s) => s.event.startsAt < now)
    .sort((a, b) => b.event.startsAt.getTime() - a.event.startsAt.getTime());

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>My Shifts</h1>
          <p>Events you&apos;ve signed up for.</p>
        </div>
        <Link href="/events" className="btn btn-sm">
          Browse events
        </Link>
      </div>

      <h2 className="cardTitle" style={{ marginBottom: "0.6rem" }}>
        Upcoming
      </h2>
      {upcoming.length === 0 ? (
        <div className="empty" style={{ marginBottom: "1.5rem" }}>
          You have no upcoming shifts.{" "}
          <Link href="/events" style={{ color: "var(--wolfpack-red)", fontWeight: 600 }}>
            Find one →
          </Link>
        </div>
      ) : (
        <div className="stack" style={{ marginBottom: "1.5rem" }}>
          {upcoming.map((s) => {
            const locked =
              s.event.startsAt.getTime() - now.getTime() <
              CANCEL_CUTOFF_HOURS * 3600_000;
            return (
              <div key={s.id} className="card">
                <div className="rowBetween">
                  <div>
                    <Link href={`/events/${s.event.id}`} className="cardTitle">
                      {s.event.title}
                    </Link>
                    <div className="muted" style={{ marginTop: "0.2rem" }}>
                      {formatEventWhen(s.event.startsAt, s.event.endsAt)} ·{" "}
                      {s.event.location}
                    </div>
                  </div>
                  <span
                    className={`badge ${
                      s.status === "CONFIRMED" ? "badge-green" : "badge-amber"
                    }`}
                  >
                    {s.status === "CONFIRMED" ? "Confirmed" : "Waitlisted"}
                  </span>
                </div>
                <div className="rowBetween" style={{ marginTop: "0.75rem" }}>
                  <span className="badge badge-blue">
                    {EVENT_TYPE_LABEL[s.event.type]}
                  </span>
                  {locked ? (
                    <span className="muted">
                      Cancellation closed ({CANCEL_CUTOFF_HOURS}h before)
                    </span>
                  ) : (
                    <form action={dropSignup.bind(null, s.event.id)}>
                      <button className="btn btn-sm btn-danger">Cancel</button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h2 className="cardTitle" style={{ marginBottom: "0.6rem" }}>
        Past
      </h2>
      {past.length === 0 ? (
        <div className="empty">No past shifts yet.</div>
      ) : (
        <div className="stack">
          {past.map((s) => (
            <div key={s.id} className="card rowBetween">
              <div>
                <Link href={`/events/${s.event.id}`} className="cardTitle">
                  {s.event.title}
                </Link>
                <div className="muted" style={{ marginTop: "0.2rem" }}>
                  {formatEventWhen(s.event.startsAt, s.event.endsAt)}
                </div>
              </div>
              <span className="badge badge-gray">Completed</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
