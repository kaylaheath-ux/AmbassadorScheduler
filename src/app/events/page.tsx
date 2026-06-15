import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { EVENT_TYPE_LABEL, EVENT_TYPES } from "@/lib/events";
import { formatEventWhen } from "@/lib/format";
import { signUpForEvent, dropSignup } from "./actions";

// Events list (/events). Ambassadors browse upcoming events and sign up; the
// confirmed roster is capped at capacity, with overflow going to a waitlist.
export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; need?: string }>;
}) {
  const { type, need } = await searchParams;
  const { user, role } = await getCurrentUser();
  if (!user) redirect("/login");
  const isCoordinator = role === "COORDINATOR";

  const now = new Date();
  const events = await prisma.event.findMany({
    where: {
      startsAt: { gte: now },
      ...(type && EVENT_TYPES.includes(type) ? { type: type as never } : {}),
    },
    orderBy: { startsAt: "asc" },
    include: { signups: true },
  });

  // Annotate each event with roster counts and the current user's status.
  const rows = events
    .map((e) => {
      const confirmed = e.signups.filter((s) => s.status === "CONFIRMED");
      const waitlisted = e.signups
        .filter((s) => s.status === "WAITLISTED")
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      const mine = user ? e.signups.find((s) => s.userId === user.id) : undefined;
      const waitPos = mine
        ? waitlisted.findIndex((s) => s.id === mine.id) + 1
        : 0;
      const isFull = confirmed.length >= e.capacity;
      return { e, confirmedCount: confirmed.length, isFull, mine, waitPos };
    })
    .filter((r) => (need ? r.isFull === false || r.confirmedCount < r.e.capacity : true));

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>Events</h1>
          <p>Upcoming events you can sign up for.</p>
        </div>
        {isCoordinator && (
          <Link href="/events/new" className="btn btn-primary">
            + New event
          </Link>
        )}
      </div>

      {/* Type filters */}
      <div className="rowBetween" style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <FilterChip label="All" href="/events" active={!type && !need} />
          {EVENT_TYPES.map((t) => (
            <FilterChip
              key={t}
              label={EVENT_TYPE_LABEL[t]}
              href={`/events?type=${t}`}
              active={type === t}
            />
          ))}
          <FilterChip
            label="Needs ambassadors"
            href="/events?need=1"
            active={!!need}
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="empty">No upcoming events match this filter.</div>
      ) : (
        <div className="stack">
          {rows.map(({ e, confirmedCount, isFull, mine, waitPos }) => (
            <div key={e.id} className="card">
              <div className="rowBetween">
                <div>
                  <Link href={`/events/${e.id}`} className="cardTitle">
                    {e.title}
                  </Link>
                  <div className="muted" style={{ marginTop: "0.2rem" }}>
                    {formatEventWhen(e.startsAt, e.endsAt)} · {e.location}
                  </div>
                </div>
                <span className="badge badge-blue">
                  {EVENT_TYPE_LABEL[e.type]}
                </span>
              </div>

              <div className="rowBetween" style={{ marginTop: "0.85rem" }}>
                <span className="muted">
                  {confirmedCount}/{e.capacity} signed up
                  {isFull && " · full"}
                </span>

                {/* Ambassadors get sign-up/drop controls; coordinators manage. */}
                {isCoordinator ? (
                  <Link href={`/events/${e.id}`} className="btn btn-sm">
                    Manage
                  </Link>
                ) : mine?.status === "CONFIRMED" ? (
                  <form action={dropSignup.bind(null, e.id)}>
                    <span className="badge badge-green" style={{ marginRight: "0.6rem" }}>
                      Signed up
                    </span>
                    <button className="btn btn-sm btn-danger">Drop</button>
                  </form>
                ) : mine?.status === "WAITLISTED" ? (
                  <form action={dropSignup.bind(null, e.id)}>
                    <span className="badge badge-amber" style={{ marginRight: "0.6rem" }}>
                      Waitlist #{waitPos}
                    </span>
                    <button className="btn btn-sm btn-danger">Leave</button>
                  </form>
                ) : (
                  <form action={signUpForEvent.bind(null, e.id)}>
                    <button className="btn btn-sm btn-primary">
                      {isFull ? "Join waitlist" : "Sign up"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link href={href} className={`btn btn-sm ${active ? "btn-primary" : ""}`}>
      {label}
    </Link>
  );
}
