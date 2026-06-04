import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/students/:id — return one student by unity id.
// Replaces the Express `GET /students/:id` route. In the App Router the dynamic
// segment comes from the second argument's `params`, which is a Promise.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const student = await prisma.user.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json(
        { error: `student with id ${id} not found` },
        { status: 404 },
      );
    }
    return NextResponse.json(student);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "failed to fetch student" },
      { status: 500 },
    );
  }
}
