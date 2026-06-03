import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

// Student detail page at /directory/:id. In the current App Router, `params` is
// a Promise, so we await it before reading the id.
export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await prisma.student.findUnique({ where: { id } });

  // No matching row → render Next.js's not-found UI (a 404 response).
  if (!student) {
    notFound();
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <Link href="/directory" style={{ textDecoration: "none" }}>
        ← All ambassadors
      </Link>
      <h1 style={{ fontSize: "1.75rem", margin: "1rem 0 0.25rem" }}>
        {student.name}
      </h1>
      <p style={{ color: "#666", marginTop: 0 }}>{student.id}</p>

      <h2 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>Majors</h2>
      <p style={{ marginTop: 0 }}>
        {student.majors.length ? student.majors.join(", ") : "—"}
      </p>

      <h2 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>Minors</h2>
      <p style={{ marginTop: 0 }}>
        {student.minors.length ? student.minors.join(", ") : "—"}
      </p>
    </main>
  );
}
