import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/session";
import "./globals.css";
import styles from "./layout.module.css";

// The Figma design uses Roboto Medium for the nav.
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Ambassador Scheduler",
  description: "Schedule student ambassadors for events.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolve the signed-in user (if any) once, server-side, for the sidebar.
  const { user, role } = await getCurrentUser();

  return (
    <html lang="en" className={roboto.variable}>
      <body>
        {/* App shell: red sidebar on the left, page content on the right */}
        <div className={styles.shell}>
          <Sidebar user={user} role={role} />
          <main className={styles.main}>{children}</main>
        </div>
      </body>
    </html>
  );
}
