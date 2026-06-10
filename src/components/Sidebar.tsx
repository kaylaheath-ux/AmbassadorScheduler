"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Calendar,
  CalendarCheck,
  AlarmClock,
  ClipboardCheck,
  BarChart3,
  Users,
  Mail,
} from "lucide-react";
import type { Role } from "@/lib/demo-auth";
import { useDemoAuth } from "./DemoAuthProvider";
import RoleSwitcher from "./RoleSwitcher";
import styles from "./Sidebar.module.css";

// Nav items. `roles` (optional) restricts an item to certain roles; omit it to
// show the item to everyone. Icons are the closest lucide equivalents.
const NAV_ITEMS: {
  label: string;
  href: string;
  Icon: typeof BarChart3;
  roles?: Role[];
}[] = [
  { label: "Dashboard", href: "/", Icon: LayoutDashboard },
  { label: "Events", href: "/events", Icon: CalendarDays },
  { label: "Calendar", href: "/calendar", Icon: Calendar },
  { label: "My Shifts", href: "/my-shifts", Icon: CalendarCheck, roles: ["AMBASSADOR"] },
  { label: "Time", href: "/time", Icon: AlarmClock, roles: ["AMBASSADOR"] },
  { label: "Approvals", href: "/approvals", Icon: ClipboardCheck, roles: ["COORDINATOR"] },
  { label: "Reports", href: "/reports", Icon: BarChart3, roles: ["COORDINATOR"] },
  { label: "Directory", href: "/directory", Icon: Users },
  { label: "Messages", href: "/messages", Icon: Mail },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useDemoAuth();
  const navItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role),
  );

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

      <nav className={styles.nav}>
        {navItems.map(({ label, href, Icon }) => {
          // Highlight on the exact route and any nested route (e.g. Directory
          // stays active on /directory/kaheath). The "/" Dashboard only matches
          // exactly, so it doesn't light up for every page.
          const isActive =
            pathname === href ||
            (href !== "/" && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              <Icon size={24} strokeWidth={2} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <RoleSwitcher />
    </aside>
  );
}
