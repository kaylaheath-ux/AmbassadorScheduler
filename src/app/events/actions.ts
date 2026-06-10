"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/demo-session";
import type { EventType } from "@/generated/prisma/enums";

function refreshEventViews(eventId?: string) {
  revalidatePath("/events");
  revalidatePath("/calendar");
  revalidatePath("/my-shifts");
  revalidatePath("/");
  if (eventId) revalidatePath(`/events/${eventId}`);
}

// Sign the current ambassador up for an event. Goes on the waitlist if the
// confirmed roster is already at capacity.
export async function signUpForEvent(eventId: string) {
  const { user } = await getCurrentUser();
  if (!user) return;

  const existing = await prisma.signup.findUnique({
    where: { userId_eventId: { userId: user.id, eventId } },
  });
  // Already holding a confirmed/waitlisted spot — nothing to do.
  if (existing && existing.status !== "CANCELLED") return;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return;

  const confirmed = await prisma.signup.count({
    where: { eventId, status: "CONFIRMED" },
  });
  const status = confirmed < event.capacity ? "CONFIRMED" : "WAITLISTED";

  await prisma.signup.upsert({
    where: { userId_eventId: { userId: user.id, eventId } },
    update: { status },
    create: { userId: user.id, eventId, status },
  });

  refreshEventViews(eventId);
}

// Drop the current ambassador's spot. If they were confirmed, promote the
// longest-waiting person off the waitlist.
export async function dropSignup(eventId: string) {
  const { user } = await getCurrentUser();
  if (!user) return;

  const existing = await prisma.signup.findUnique({
    where: { userId_eventId: { userId: user.id, eventId } },
  });
  if (!existing) return;

  await prisma.signup.delete({ where: { id: existing.id } });

  if (existing.status === "CONFIRMED") {
    const next = await prisma.signup.findFirst({
      where: { eventId, status: "WAITLISTED" },
      orderBy: { createdAt: "asc" },
    });
    if (next) {
      await prisma.signup.update({
        where: { id: next.id },
        data: { status: "CONFIRMED" },
      });
    }
  }

  refreshEventViews(eventId);
}

// Coordinator: create an event from the /events/new form, then go to its page.
export async function createEvent(formData: FormData) {
  const { user, role } = await getCurrentUser();
  if (!user || role !== "COORDINATOR") return;

  const title = String(formData.get("title") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const type = String(formData.get("type") ?? "OTHER") as EventType;
  const capacity = Number(formData.get("capacity") ?? 0);
  const startsAt = new Date(String(formData.get("startsAt")));
  const endsAt = new Date(String(formData.get("endsAt")));
  const description = String(formData.get("description") ?? "").trim();

  if (!title || !location || Number.isNaN(startsAt.getTime())) return;

  const event = await prisma.event.create({
    data: {
      title,
      location,
      type,
      capacity: Number.isFinite(capacity) ? capacity : 0,
      startsAt,
      endsAt: Number.isNaN(endsAt.getTime()) ? startsAt : endsAt,
      description: description || null,
      createdById: user.id,
    },
  });

  refreshEventViews();
  redirect(`/events/${event.id}`);
}

// Coordinator: delete an event (cascades signups/hour logs are detached).
export async function deleteEvent(eventId: string) {
  const { user, role } = await getCurrentUser();
  if (!user || role !== "COORDINATOR") return;

  // Remove dependent signups first; hour logs keep their (now-null) eventId.
  await prisma.signup.deleteMany({ where: { eventId } });
  await prisma.event.delete({ where: { id: eventId } });

  refreshEventViews();
  redirect("/events");
}
