"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/demo-session";

function refreshHourViews() {
  revalidatePath("/time");
  revalidatePath("/approvals");
  revalidatePath("/reports");
  revalidatePath("/");
}

// Clock in to an event the ambassador is signed up for. Credited time is the
// real elapsed clock, not the event's scheduled length.
export async function clockIn(eventId: string) {
  const { user } = await getCurrentUser();
  if (!user) return;

  // One log per event (avoid duplicate clocks in this demo).
  const existing = await prisma.hourLog.findFirst({
    where: { userId: user.id, eventId },
  });
  if (existing) return;

  await prisma.hourLog.create({
    data: {
      userId: user.id,
      eventId,
      checkIn: new Date(),
      status: "PENDING",
    },
  });
  refreshHourViews();
}

// Clock out: stamp the end time on an open log owned by the current user.
export async function clockOut(logId: string) {
  const { user } = await getCurrentUser();
  if (!user) return;

  const log = await prisma.hourLog.findUnique({ where: { id: logId } });
  if (!log || log.userId !== user.id || log.checkOut) return;

  await prisma.hourLog.update({
    where: { id: logId },
    data: { checkOut: new Date() },
  });
  refreshHourViews();
}

// Request credit for a non-event task (e.g. writing letters). Coordinator
// approves later.
export async function requestTaskHours(formData: FormData) {
  const { user } = await getCurrentUser();
  if (!user) return;

  const description = String(formData.get("description") ?? "").trim();
  const minutes = Number(formData.get("minutes") ?? 0);
  if (!description || !Number.isFinite(minutes) || minutes <= 0) return;

  await prisma.hourLog.create({
    data: {
      userId: user.id,
      description,
      minutes: Math.round(minutes),
      status: "PENDING",
    },
  });
  refreshHourViews();
}

// Coordinator: approve / reject a submitted hour log.
export async function approveHourLog(logId: string) {
  const { user, role } = await getCurrentUser();
  if (!user || role !== "COORDINATOR") return;
  await prisma.hourLog.update({
    where: { id: logId },
    data: { status: "APPROVED", approvedById: user.id },
  });
  refreshHourViews();
}

export async function rejectHourLog(logId: string) {
  const { user, role } = await getCurrentUser();
  if (!user || role !== "COORDINATOR") return;
  await prisma.hourLog.update({
    where: { id: logId },
    data: { status: "REJECTED", approvedById: user.id },
  });
  refreshHourViews();
}
