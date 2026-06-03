import Link from "next/link";

// Dashboard — the landing page at "/". Placeholder for now; the student list
// now lives under the Directory tab (/directory).
export default function DashboardPage() {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Dashboard</h1>
      <p style={{ color: "#555" }}>
        Welcome. Head to the{" "}
        <Link href="/directory" style={{ color: "#cc0000", fontWeight: 600 }}>
          Directory
        </Link>{" "}
        to see all student ambassadors.
      </p>
    </div>
  );
}
