import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// Directory page (/directory) — the roster of ambassadors. Coordinators get a
// "New user" button and manage entries from each profile.
export default async function DirectoryPage() {
  const { user, role } = await getCurrentUser();
  if (!user) redirect("/login");
  const isCoordinator = role === "COORDINATOR";

  // Only ambassadors appear in the directory — coordinators run the program.
  const students = await prisma.user.findMany({
    where: { role: "AMBASSADOR" },
    orderBy: { name: "asc" },
  });

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>Student Ambassadors</h1>
          <p>The ambassador roster.</p>
        </div>
        {isCoordinator && (
          <Link href="/directory/new" className="btn btn-primary">
            + New user
          </Link>
        )}
      </div>

      {students.length === 0 ? (
        <div className="empty">No ambassadors yet.</div>
      ) : (
        <div className="stack">
          {students.map((student) => (
            <Link key={student.id} href={`/directory/${student.id}`} className="card rowBetween">
              <span className="cardTitle">{student.name}</span>
              <span className="muted">{student.email}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
