import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Directory page (/directory). As an async Server Component it queries Prisma
// directly on the server during render — no API call, no client-side fetching.
export default async function DirectoryPage() {
  const students = await prisma.student.findMany({ orderBy: { name: "asc" } });

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>
        Student Ambassadors
      </h1>
      <ul
        style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.5rem" }}
      >
        {students.map((student) => (
          <li key={student.id}>
            <Link
              href={`/directory/${student.id}`}
              style={{
                display: "block",
                padding: "0.75rem 1rem",
                border: "1px solid #e2e2e2",
                borderRadius: 8,
                textDecoration: "none",
              }}
            >
              {student.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
