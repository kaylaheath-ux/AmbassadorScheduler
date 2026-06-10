"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/demo-session";
import { eventSchema, type EventFormState } from "./schema";

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

// Pull the event fields out of FormData and validate them with Zod. Returns the
// clean, typed values on success, or per-field error messages on failure.
function parseEventForm(formData: FormData) {
  return eventSchema.safeParse({
    title: formData.get("title") ?? "",
    type: formData.get("type") ?? "",
    location: formData.get("location") ?? "",
    startsAt: formData.get("startsAt") ?? "",
    endsAt: formData.get("endsAt") ?? "",
    capacity: formData.get("capacity") ?? "",
    description: formData.get("description") ?? "",
  });
}

// Coordinator: create an event from the /events/new form. Shaped for
// useActionState — returns validation errors instead of throwing, and only
// redirects on success.
export async function createEvent(
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const { user, role } = await getCurrentUser();
  if (!user || role !== "COORDINATOR") return { formError: "Not authorized." };

  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }
  const data = parsed.data;

  const event = await prisma.event.create({
    data: {
      title: data.title,
      type: data.type,
      location: data.location,
      capacity: data.capacity,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      description: data.description || null,
      createdById: user.id,
    },
  });

  refreshEventViews();
  redirect(`/events/${event.id}`);
}

// Coordinator: edit an existing event. Same validation as create; the event id
// rides along in a hidden form field.
export async function updateEvent(
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const { user, role } = await getCurrentUser();
  if (!user || role !== "COORDINATOR") return { formError: "Not authorized." };

  const id = z.string().min(1).safeParse(formData.get("id"));
  if (!id.success) return { formError: "Missing event id." };

  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }
  const data = parsed.data;

  await prisma.event.update({
    where: { id: id.data },
    data: {
      title: data.title,
      type: data.type,
      location: data.location,
      capacity: data.capacity,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      description: data.description || null,
    },
  });

  refreshEventViews(id.data);
  redirect(`/events/${id.data}`);
}

// Coordinator: delete an event. The id is validated before we touch the DB.
export async function deleteEvent(eventId: string) {
  const { user, role } = await getCurrentUser();
  if (!user || role !== "COORDINATOR") return;

  const id = z.string().min(1).safeParse(eventId);
  if (!id.success) return;

  // Remove dependent signups first; hour logs keep their (now-null) eventId.
  await prisma.signup.deleteMany({ where: { eventId: id.data } });
  await prisma.event.delete({ where: { id: id.data } });

  refreshEventViews();
  redirect("/events");
}
