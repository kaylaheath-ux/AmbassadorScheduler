import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import { deleteUser } from "../actions";

// User profile at /directory/[id]. Coordinators can edit or delete.
export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, role } = await getCurrentUser();
  if (!user) redirect("/login");
  const isCoordinator = role === "COORDINATOR";

  const student = await prisma.user.findUnique({ where: { id } });
  if (!student) notFound();

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <Link href="/directory" className="muted">
        ← All ambassadors
      </Link>

      <div className="pageHeader" style={{ marginTop: "0.75rem" }}>
        <div>
          <h1>{student.name}</h1>
          <p>{student.id}</p>
        </div>
        <span className="badge badge-blue">
          {student.role === "COORDINATOR" ? "Coordinator" : "Ambassador"}
        </span>
      </div>

      <div className="card stack">
        <div>
          <div className="muted">Email</div>
          <div>{student.email}</div>
        </div>
        {student.phone && (
          <div>
            <div className="muted">Phone</div>
            <div>{student.phone}</div>
          </div>
        )}
      </div>

      {isCoordinator && (
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <Link href={`/directory/${student.id}/edit`} className="btn">
            Edit
          </Link>
          <form action={deleteUser.bind(null, student.id)}>
            <ConfirmSubmit
              message={`Delete ${student.name}? This removes their signups and hours.`}
              className="btn btn-danger"
            >
              Delete
            </ConfirmSubmit>
          </form>
        </div>
      )}
    </div>
  );
}
