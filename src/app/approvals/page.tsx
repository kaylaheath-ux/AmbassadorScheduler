import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/demo-session";
import { HOUR_STATUS_BADGE } from "@/lib/events";
import { formatDate, formatDuration, hourLogMinutes } from "@/lib/format";
import { approveHourLog, rejectHourLog } from "../time/actions";

// Coordinator-only: review submitted hours (both event clocks and task requests).
export default async function ApprovalsPage() {
  const { role } = await getCurrentUser();
  if (role !== "COORDINATOR") redirect("/");

  const logs = await prisma.hourLog.findMany({
    include: { user: true, event: true },
    orderBy: { createdAt: "desc" },
  });

  // Only completed entries can be decided; an open clock isn't ready yet.
  const pending = logs.filter(
    (l) => l.status === "PENDING" && !(l.checkIn && !l.checkOut),
  );
  const decided = logs.filter((l) => l.status !== "PENDING");

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>Approvals</h1>
          <p>Review hours submitted by ambassadors.</p>
        </div>
        <span className="badge badge-amber">{pending.length} pending</span>
      </div>

      {pending.length === 0 ? (
        <div className="empty" style={{ marginBottom: "1.5rem" }}>
          Nothing waiting for approval.
        </div>
      ) : (
        <div className="stack" style={{ marginBottom: "2rem" }}>
          {pending.map((l) => (
            <div key={l.id} className="card rowBetween">
              <div>
                <div className="cardTitle">
                  {l.event ? l.event.title : l.description}
                </div>
                <div className="muted" style={{ marginTop: "0.2rem" }}>
                  {l.user.name} · {formatDate(l.checkIn ?? l.createdAt)} ·{" "}
                  {formatDuration(hourLogMinutes(l))}
                  {!l.event && " · task"}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <form action={approveHourLog.bind(null, l.id)}>
                  <button className="btn btn-sm btn-primary">Approve</button>
                </form>
                <form action={rejectHourLog.bind(null, l.id)}>
                  <button className="btn btn-sm btn-danger">Reject</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="cardTitle" style={{ marginBottom: "0.6rem" }}>
        Recently decided
      </h2>
      {decided.length === 0 ? (
        <div className="empty">No decisions yet.</div>
      ) : (
        <div className="tableWrap card" style={{ padding: 0 }}>
          <table className="data">
            <thead>
              <tr>
                <th>Ambassador</th>
                <th>What</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {decided.map((l) => (
                <tr key={l.id}>
                  <td>{l.user.name}</td>
                  <td>{l.event ? l.event.title : l.description}</td>
                  <td>{formatDuration(hourLogMinutes(l))}</td>
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
