import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import type { User } from "@/generated/prisma/client";
import type { Role } from "@/lib/session";
import { signOut } from "@/app/auth/actions";
import SidebarNav from "./SidebarNav";
import styles from "./Sidebar.module.css";

// App rail. Server Component: receives the current user/role from the layout and
// shows the nav + an account block (name + Log out, or a Log in link).
export default function Sidebar({
  user,
  role,
}: {
  user: User | null;
  role: Role | null;
}) {
  return (
    <aside className={styles.sidebar}>
      <Image
        className={styles.logo}
        src="/nc-state-logo.png"
        alt="NC State Computer Science"
        width={1500}
        height={700}
        priority
      />

      {user && <SidebarNav role={role} />}

      <div className={styles.account}>
        {user ? (
          <form action={signOut} className={styles.accountButton}>
            <span>
              {user.name}
              <span className={styles.roleName}>
                {role === "COORDINATOR" ? "Coordinator" : "Ambassador"}
              </span>
            </span>
            <button type="submit" className={styles.logout} aria-label="Log out">
              <LogOut size={20} strokeWidth={2} aria-hidden />
            </button>
          </form>
        ) : (
          <Link href="/login" className={styles.accountButton}>
            Log in
          </Link>
        )}
      </div>
    </aside>
  );
}
