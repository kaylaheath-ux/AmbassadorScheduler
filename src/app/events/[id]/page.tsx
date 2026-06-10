import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/demo-session";
import { EVENT_TYPE_LABEL } from "@/lib/events";
import { formatEventWhen } from "@/lib/format";
import { signUpForEvent, dropSignup, deleteEvent } from "../actions";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, role } = await getCurrentUser();
  const isCoordinator = role === "COORDINATOR";

  const event = await prisma.event.findUnique({
    where: { id },
    include: { signups: { include: { user: true } } },
  });
  if (!event) notFound();

  const confirmed = event.signups
    .filter((s) => s.status === "CONFIRMED")
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const waitlisted = event.signups
    .filter((s) => s.status === "WAITLISTED")
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const mine = user ? event.signups.find((s) => s.userId === user.id) : undefined;
  const isFull = confirmed.length >= event.capacity;

  return (
    <div className="page">
      <Link href="/events" className="muted">
        ← All events
      </Link>

      <div className="pageHeader" style={{ marginTop: "0.75rem" }}>
        <div>
          <h1>{event.title}</h1>
          <p>
            {formatEventWhen(event.startsAt, event.endsAt)} · {event.location}
          </p>
        </div>
        <span className="badge badge-blue">{EVENT_TYPE_LABEL[event.type]}</span>
      </div>

      {event.description && (
        <p style={{ marginBottom: "1.25rem" }}>{event.description}</p>
      )}

      {/* Sign-up controls (ambassadors) */}
      {!isCoordinator && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div className="rowBetween">
            <span className="muted">
              {confirmed.length}/{event.capacity} signed up
              {isFull && " · full"}
            </span>
            {mine?.status === "CONFIRMED" ? (
              <form action={dropSignup.bind(null, event.id)}>
                <button className="btn btn-danger">Drop this event</button>
              </form>
            ) : mine?.status === "WAITLISTED" ? (
              <form action={dropSignup.bind(null, event.id)}>
                <button className="btn btn-danger">Leave waitlist</button>
              </form>
            ) : (
              <form action={signUpForEvent.bind(null, event.id)}>
                <button className="btn btn-primary">
                  {isFull ? "Join waitlist" : "Sign up"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Roster */}
      <h2 className="cardTitle" style={{ marginBottom: "0.6rem" }}>
        Confirmed ({confirmed.length}/{event.capacity})
      </h2>
      {confirmed.length === 0 ? (
        <div className="empty" style={{ marginBottom: "1.5rem" }}>
          No one signed up yet.
        </div>
      ) : (
        <div className="stack" style={{ marginBottom: "1.5rem" }}>
          {confirmed.map((s) => (
            <div key={s.id} className="card rowBetween">
              <span>{s.user.name}</span>
              <span className="muted">{s.user.email}</span>
            </div>
          ))}
        </div>
      )}

      {waitlisted.length > 0 && (
        <>
          <h2 className="cardTitle" style={{ marginBottom: "0.6rem" }}>
            Waitlist ({waitlisted.length})
          </h2>
          <div className="stack" style={{ marginBottom: "1.5rem" }}>
            {waitlisted.map((s, i) => (
              <div key={s.id} className="card rowBetween">
                <span>
                  #{i + 1} {s.user.name}
                </span>
                <span className="muted">{s.user.email}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {isCoordinator && (
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <Link href={`/events/${event.id}/edit`} className="btn">
            Edit event
          </Link>
          <form action={deleteEvent.bind(null, event.id)}>
            <button className="btn btn-danger">Delete event</button>
          </form>
        </div>
      )}
    </div>
  );
}
