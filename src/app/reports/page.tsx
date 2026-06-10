import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/demo-session";
import { formatDate, formatDuration, hourLogMinutes } from "@/lib/format";

// Coordinator-only program reports: approved hours per ambassador and event
// coverage (how full each upcoming event is).
export default async function ReportsPage() {
  const { role } = await getCurrentUser();
  if (role !== "COORDINATOR") redirect("/");

  const [ambassadors, events] = await Promise.all([
    prisma.user.findMany({
      where: { role: "AMBASSADOR" },
      include: { hourLogs: true },
      orderBy: { name: "asc" },
    }),
    prisma.event.findMany({
      orderBy: { startsAt: "asc" },
      include: { signups: true },
    }),
  ]);

  const hoursRows = ambassadors
    .map((a) => {
      const approved = a.hourLogs
        .filter((l) => l.status === "APPROVED")
        .reduce((sum, l) => sum + hourLogMinutes(l), 0);
      const pending = a.hourLogs.filter((l) => l.status === "PENDING").length;
      return { name: a.name, approved, pending };
    })
    .sort((a, b) => b.approved - a.approved);

  const now = new Date();
  const upcoming = events.filter((e) => e.startsAt >= now);

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>Reports</h1>
          <p>Program totals for the ambassador team.</p>
        </div>
      </div>

      <h2 className="cardTitle" style={{ marginBottom: "0.6rem" }}>
        Approved hours by ambassador
      </h2>
      <div className="tableWrap card" style={{ padding: 0, marginBottom: "2rem" }}>
        <table className="data">
          <thead>
            <tr>
              <th>Ambassador</th>
              <th>Approved hours</th>
              <th>Pending</th>
            </tr>
          </thead>
          <tbody>
            {hoursRows.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td>{formatDuration(r.approved)}</td>
                <td>{r.pending > 0 ? r.pending : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="cardTitle" style={{ marginBottom: "0.6rem" }}>
        Upcoming event coverage
      </h2>
      {upcoming.length === 0 ? (
        <div className="empty">No upcoming events.</div>
      ) : (
        <div className="tableWrap card" style={{ padding: 0 }}>
          <table className="data">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Filled</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((e) => {
                const confirmed = e.signups.filter(
                  (s) => s.status === "CONFIRMED",
                ).length;
                const full = confirmed >= e.capacity;
                return (
                  <tr key={e.id}>
                    <td>{e.title}</td>
                    <td>{formatDate(e.startsAt)}</td>
                    <td>
                      {confirmed}/{e.capacity}
                    </td>
                    <td>
                      <span
                        className={`badge ${full ? "badge-green" : "badge-amber"}`}
                      >
                        {full ? "Full" : "Needs ambassadors"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
