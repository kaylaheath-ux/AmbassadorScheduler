import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/demo-session";
import { toDateTimeLocalValue } from "@/lib/format";
import EventForm from "@/components/EventForm";
import { updateEvent } from "../../actions";

// Coordinator-only edit form. Reuses EventForm, prefilled from the event row.
export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { role } = await getCurrentUser();
  if (role !== "COORDINATOR") redirect(`/events/${id}`);

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();

  return (
    <div className="page">
      <Link href={`/events/${event.id}`} className="muted">
        ← Back to event
      </Link>
      <div className="pageHeader" style={{ marginTop: "0.75rem" }}>
        <div>
          <h1>Edit event</h1>
          <p>{event.title}</p>
        </div>
      </div>

      <EventForm
        action={updateEvent}
        submitLabel="Save changes"
        defaults={{
          id: event.id,
          title: event.title,
          type: event.type,
          location: event.location,
          startsAt: toDateTimeLocalValue(event.startsAt),
          endsAt: toDateTimeLocalValue(event.endsAt),
          capacity: String(event.capacity),
          description: event.description ?? "",
        }}
      />
    </div>
  );
}
