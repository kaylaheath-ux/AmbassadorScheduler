import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/demo-session";
import { HOUR_STATUS_BADGE } from "@/lib/events";
import { formatDate, formatDuration, hourLogMinutes } from "@/lib/format";
import { clockIn, clockOut, requestTaskHours } from "./actions";

// Time (/time): live clock in/out for events + requesting hours for tasks.
export default async function TimePage() {
  const { user } = await getCurrentUser();
  if (!user) {
    return (
      <div className="page">
        <h1>Time</h1>
        <div className="empty">No user in session.</div>
      </div>
    );
  }

  const [signups, logs] = await Promise.all([
    prisma.signup.findMany({
      where: { userId: user.id, status: "CONFIRMED" },
      include: { event: true },
      orderBy: { event: { startsAt: "asc" } },
    }),
    prisma.hourLog.findMany({
      where: { userId: user.id },
      include: { event: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const logByEvent = new Map(logs.filter((l) => l.eventId).map((l) => [l.eventId, l]));
  const openLog = logs.find((l) => l.checkIn && !l.checkOut);
  const approvedMinutes = logs
    .filter((l) => l.status === "APPROVED")
    .reduce((sum, l) => sum + hourLogMinutes(l), 0);

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>Time</h1>
          <p>Clock in and out of events, or request hours for tasks.</p>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "0.6rem 1.1rem" }}>
          <div className="muted">Approved hours</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            {formatDuration(approvedMinutes)}
          </div>
        </div>
      </div>

      {/* Currently clocked in */}
      {openLog && (
        <div
          className="card rowBetween"
          style={{ borderColor: "var(--wolfpack-red)", marginBottom: "1.5rem" }}
        >
          <div>
            <div className="cardTitle">
              Clocked in
              {openLog.event ? `: ${openLog.event.title}` : ""}
            </div>
            <div className="muted">Don&apos;t forget to clock out when you leave.</div>
          </div>
          <form action={clockOut.bind(null, openLog.id)}>
            <button className="btn btn-primary">Clock out</button>
          </form>
        </div>
      )}

      {/* Events available to clock into */}
      <h2 className="cardTitle" style={{ marginBottom: "0.6rem" }}>
        My events
      </h2>
      {signups.length === 0 ? (
        <div className="empty" style={{ marginBottom: "1.5rem" }}>
          You&apos;re not confirmed for any events.{" "}
          <Link href="/events" style={{ color: "var(--wolfpack-red)", fontWeight: 600 }}>
            Sign up →
          </Link>
        </div>
      ) : (
        <div className="stack" style={{ marginBottom: "1.5rem" }}>
          {signups.map((s) => {
            const log = logByEvent.get(s.event.id);
            return (
              <div key={s.id} className="card rowBetween">
                <div>
                  <div className="cardTitle">{s.event.title}</div>
                  <div className="muted">{formatDate(s.event.startsAt)}</div>
                </div>
                {!log ? (
                  <form action={clockIn.bind(null, s.event.id)}>
                    <button className="btn btn-sm btn-primary">Clock in</button>
                  </form>
                ) : !log.checkOut ? (
                  <form action={clockOut.bind(null, log.id)}>
                    <button className="btn btn-sm btn-primary">Clock out</button>
                  </form>
                ) : (
                  <span className="muted">
                    {formatDuration(hourLogMinutes(log))} logged
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Request task hours */}
      <h2 className="cardTitle" style={{ marginBottom: "0.6rem" }}>
        Request task hours
      </h2>
      <form action={requestTaskHours} className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="field">
          <label htmlFor="description">What did you do?</label>
          <input
            id="description"
            name="description"
            className="input"
            placeholder="e.g. Wrote welcome letters to admitted students"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="minutes">Minutes spent</label>
          <input
            id="minutes"
            name="minutes"
            type="number"
            min={1}
            className="input"
            style={{ maxWidth: 160 }}
            required
          />
        </div>
        <button className="btn btn-primary">Submit for approval</button>
      </form>

      {/* History */}
      <h2 className="cardTitle" style={{ marginBottom: "0.6rem" }}>
        My hours
      </h2>
      {logs.length === 0 ? (
        <div className="empty">No hours logged yet.</div>
      ) : (
        <div className="tableWrap card" style={{ padding: 0 }}>
          <table className="data">
            <thead>
              <tr>
                <th>What</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td>{l.event ? l.event.title : l.description}</td>
                  <td>{formatDate(l.checkIn ?? l.createdAt)}</td>
                  <td>
                    {l.checkIn && !l.checkOut
                      ? "in progress"
                      : formatDuration(hourLogMinutes(l))}
                  </td>
                  <td>
                    <span className={`badge ${HOUR_STATUS_BADGE[l.status]}`}>
                      {l.status.toLowerCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
