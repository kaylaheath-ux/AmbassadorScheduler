import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/demo-session";
import { EVENT_TYPE_LABEL, EVENT_TYPES } from "@/lib/events";
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

      <form action={createEvent} className="card" style={{ maxWidth: 560 }}>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" className="input" required />
        </div>

        <div className="field">
          <label htmlFor="type">Type</label>
          <select id="type" name="type" className="select" defaultValue="TOUR">
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {EVENT_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="location">Location</label>
          <input id="location" name="location" className="input" required />
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="startsAt">Starts</label>
            <input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              className="input"
              required
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="endsAt">Ends</label>
            <input
              id="endsAt"
              name="endsAt"
              type="datetime-local"
              className="input"
              required
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="capacity">Capacity</label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            defaultValue={4}
            className="input"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" className="textarea" />
        </div>

        <button className="btn btn-primary" type="submit">
          Create event
        </button>
      </form>
    </div>
  );
}
