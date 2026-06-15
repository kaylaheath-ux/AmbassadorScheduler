import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import UserForm from "@/components/UserForm";
import { updateUser } from "../../actions";

// Coordinator-only edit form, prefilled from the user row.
export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, role } = await getCurrentUser();
  if (!user) redirect("/login");
  if (role !== "COORDINATOR") redirect(`/directory/${id}`);

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) notFound();

  return (
    <div className="page">
      <Link href={`/directory/${target.id}`} className="muted">
        ← Back to profile
      </Link>
      <div className="pageHeader" style={{ marginTop: "0.75rem" }}>
        <div>
          <h1>Edit user</h1>
          <p>{target.name}</p>
        </div>
      </div>

      <UserForm
        action={updateUser}
        submitLabel="Save changes"
        idReadOnly
        defaults={{
          id: target.id,
          name: target.name,
          email: target.email,
          role: target.role,
          phone: target.phone ?? "",
        }}
      />
    </div>
  );
}
