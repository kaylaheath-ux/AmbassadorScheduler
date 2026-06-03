import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/students — return every student.
// Replaces the Express `GET /students` route. Route handlers receive a Web
// Request and return a Web Response; NextResponse.json() is the equivalent of
// Express's res.json().
export async function GET() {
  try {
    const students = await prisma.student.findMany();
    return NextResponse.json(students);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "failed to fetch students" },
      { status: 500 },
    );
  }
}
