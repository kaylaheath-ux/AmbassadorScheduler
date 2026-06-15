import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import UserForm from "@/components/UserForm";
import { createUser } from "../actions";

// Coordinator-only form to add an ambassador or coordinator.
export default async function NewUserPage() {
  const { user, role } = await getCurrentUser();
  if (!user) redirect("/login");
  if (role !== "COORDINATOR") redirect("/directory");

  return (
    <div className="page">
      <Link href="/directory" className="muted">
        ← Directory
      </Link>
      <div className="pageHeader" style={{ marginTop: "0.75rem" }}>
        <div>
          <h1>New user</h1>
          <p>Add an ambassador or coordinator.</p>
        </div>
      </div>

      <UserForm action={createUser} submitLabel="Create user" />
    </div>
  );
}
