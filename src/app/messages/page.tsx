import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { formatDate } from "@/lib/format";
import { postAnnouncement, deleteAnnouncement } from "./actions";

const AUDIENCE_LABEL: Record<string, string> = {
  ALL: "Everyone",
  AMBASSADOR: "Ambassadors",
  COORDINATOR: "Coordinators",
};

// Messages (/messages): announcements feed. Coordinators post; everyone reads
// items addressed to them.
export default async function MessagesPage() {
  const { user, role } = await getCurrentUser();
  if (!user) redirect("/login");
  const isCoordinator = role === "COORDINATOR";

  // Show announcements addressed to everyone, plus those for the user's role.
  const audiences = role ? ["ALL", role] : ["ALL"];
  const announcements = await prisma.announcement.findMany({
    where: { audience: { in: audiences } },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>Messages</h1>
          <p>Announcements from the ambassador program.</p>
        </div>
      </div>

      {isCoordinator && (
        <form action={postAnnouncement} className="card" style={{ marginBottom: "1.5rem" }}>
          <div className="field">
            <label htmlFor="body">New announcement</label>
            <textarea
              id="body"
              name="body"
              className="textarea"
              placeholder="Share an update with the team…"
              required
            />
          </div>
          <div className="rowBetween">
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="audience">Audience</label>
              <select id="audience" name="audience" className="select" defaultValue="ALL">
                <option value="ALL">Everyone</option>
                <option value="AMBASSADOR">Ambassadors</option>
                <option value="COORDINATOR">Coordinators</option>
              </select>
            </div>
            <button className="btn btn-primary" style={{ alignSelf: "flex-end" }}>
              Post
            </button>
          </div>
        </form>
      )}

      {announcements.length === 0 ? (
        <div className="empty">No announcements yet.</div>
      ) : (
        <div className="stack">
          {announcements.map((a) => (
            <div key={a.id} className="card">
              <div className="rowBetween">
                <span className="muted">
                  {a.author.name} · {formatDate(a.createdAt)}
                </span>
                <span className="badge badge-gray">
                  {AUDIENCE_LABEL[a.audience] ?? a.audience}
                </span>
              </div>
              <p style={{ marginTop: "0.5rem" }}>{a.body}</p>
              {isCoordinator && (
                <form
                  action={deleteAnnouncement.bind(null, a.id)}
                  style={{ marginTop: "0.6rem" }}
                >
                  <button className="btn btn-sm btn-danger">Delete</button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
