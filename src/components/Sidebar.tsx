"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Calendar,
  AlarmClock,
  Users,
  Mail,
} from "lucide-react";
import type { Role } from "@/lib/demo-auth";
import { useDemoAuth } from "./DemoAuthProvider";
import RoleSwitcher from "./RoleSwitcher";
import styles from "./Sidebar.module.css";

// Nav items mirror the Figma design. Icons are the closest lucide equivalents
// of the custom icons in the mockup. `roles` (optional) restricts an item to
// certain roles; omit it to show the item to everyone.
const NAV_ITEMS: {
  label: string;
  href: string;
  Icon: typeof BarChart3;
  roles?: Role[];
}[] = [
  { label: "Dashboard", href: "/", Icon: BarChart3 },
  { label: "Calendar", href: "/calendar", Icon: Calendar },
  { label: "Time", href: "/time", Icon: AlarmClock },
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
