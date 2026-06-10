import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/demo-session";
import EventForm from "@/components/EventForm";
import { createEvent } from "../actions";

// Coordinator-only form to create an event. Ambassadors are bounced to the list.
export default async function NewEventPage() {
  const { role } = await getCurrentUser();
  if (role !== "COORDINATOR") redirect("/events");

  return (
    <div className="page">
      <Link href="/events" className="muted">
        ← All events
      </Link>
      <div className="pageHeader" style={{ marginTop: "0.75rem" }}>
        <div>
          <h1>New event</h1>
          <p>Create an event for ambassadors to sign up for.</p>
        </div>
      </div>

      <EventForm action={createEvent} submitLabel="Create event" />
    </div>
  );
}
