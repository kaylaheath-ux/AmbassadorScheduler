import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { cookies } from "next/headers";
import Sidebar from "@/components/Sidebar";
import { DemoAuthProvider } from "@/components/DemoAuthProvider";
import { ROLE_COOKIE, DEFAULT_ROLE, isRole } from "@/lib/demo-auth";
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
  // Read the demo role from the cookie so the first render matches the persisted
  // choice (no flash of the wrong persona).
  const cookieStore = await cookies();
  const cookieRole = cookieStore.get(ROLE_COOKIE)?.value;
  const initialRole = isRole(cookieRole) ? cookieRole : DEFAULT_ROLE;

  return (
    <html lang="en" className={roboto.variable}>
      <body>
        <DemoAuthProvider initialRole={initialRole}>
          {/* App shell: red sidebar on the left, page content on the right */}
          <div className={styles.shell}>
            <Sidebar />
            <main className={styles.main}>{children}</main>
          </div>
        </DemoAuthProvider>
      </body>
    </html>
  );
}
