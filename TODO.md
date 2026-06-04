# Ambassador Scheduler — Build Roadmap

A ConnectTeam-style scheduling tool for NC State CS student ambassadors to sign up
for events (tours, open houses, info sessions, tabling, panels). Two roles:
**Ambassador** (student) and **Coordinator** (admin).

Stack: Next.js (App Router) · Prisma · Supabase (Postgres).

---

## 0. Auth — Demo Mode (do this first; gates everything)

For now, skip real authentication. Use a simple role switcher so we can build and
test both experiences. Replace with university SSO (`@ncsu.edu`) later.

- [ ] Add a role concept: `Ambassador` | `Coordinator`.
- [ ] Build a demo "Sign in" / role-select screen: pick **Administrator** or **Student**.
- [ ] Persist the selected role + a demo user (cookie, or React context + localStorage).
- [ ] Add a way to switch roles quickly (e.g. in the sidebar account dropdown).
- [ ] Gate pages/nav by role (coordinators see admin pages; ambassadors don't).
- [ ] Seed a few demo users of each role for selection.

> Later: replace demo mode with real SSO / email-domain-restricted auth.

---

## 1. Data Model (Prisma schema)

Evolve the current minimal `Student` model into a fuller schema.

- [ ] `User` — extend/replace `Student`: `id, name, email, role, year, majors[],
      minors[], photoUrl, phone`.
- [ ] `Event` — `id, title, type, location, startsAt, endsAt, capacity, points,
      description, createdById`.
- [ ] `Signup` — `id, userId, eventId, status (confirmed | waitlisted | cancelled),
      createdAt`.
- [ ] `HourLog` — `id, userId, eventId, checkIn, checkOut, approved, approvedById`.
- [ ] `Announcement` — `id, authorId, body, audience, createdAt`.
- [ ] Run migration + add a seed script with demo users, events, and signups.

---

## 2. Events & Sign-up (the core loop)

This is the whole point of the app — build it right after the schema.

- [ ] **Events list page** (`/events`): browse upcoming events with capacity shown.
- [ ] Filters: date range, event type, "needs ambassadors" (understaffed).
- [ ] **Event detail page** (`/events/[id]`): full info + roster.
- [ ] **Sign up / Drop** actions, with capacity enforcement.
- [ ] **Waitlist** when an event is full; auto-promote when a slot opens.
- [ ] Major-based prioritization (e.g. CS open house highlights CS ambassadors).

---

## 3. Calendar (already in sidebar nav)

- [ ] `/calendar`: month/week view of events.
- [ ] Toggle between "All events" and "My shifts".
- [ ] Click an event to open its detail page.

---

## 4. My Shifts / Personal Schedule

- [ ] `/my-shifts`: list of events I've signed up for (upcoming + past).
- [ ] Cancel a shift, with a cutoff window before the event.
- [ ] History of completed events.

---

## 5. Time / Hours (already in sidebar nav)

- [ ] `/time`: check-in / check-out for events.
- [ ] Logged hours + running total toward a semester requirement/quota.
- [ ] Coordinator approval/verification of submitted hours.

---

## 6. Directory (exists — extend it)

- [ ] Add to profiles: availability, contact info, year, total hours, reliability.
- [ ] Profile photos.
- [ ] Make `/directory/[id]` show signups + hours history.

---

## 7. Dashboard (exists — make it role-aware)

- [ ] **Ambassador view:** next shift, hours this semester, open events needing
      people, unread messages.
- [ ] **Coordinator view:** understaffed events, pending hour approvals, sign-up
      rates, no-show flags.

---

## 8. Messages / Announcements (already in sidebar nav)

- [ ] `/messages`: broadcast announcements from coordinators.
- [ ] Per-event notifications/reminders ("your tour is tomorrow at 9am").
- [ ] Audience targeting (all, by role, by event).

---

## 9. Coordinator / Admin Pages

- [ ] **Create/Manage Events**: CRUD, set capacity, clone recurring events.
- [ ] **Roster & Approvals**: see signups, mark attendance, approve hours,
      flag no-shows.
- [ ] **Reports**: hours per ambassador, attendance rates, event coverage
      (for end-of-semester department reporting).

---

## 10. Ambassador-Specific Polish (sets it apart from generic ConnectTeam)

- [ ] Hour/requirement tracking tied to a per-semester program quota.
- [ ] Reliability / no-show tracking.
- [ ] Class-schedule-aware availability (only show shifts students can make).
- [ ] Real university SSO / `@ncsu.edu` email restriction (replaces demo mode).

---

## Suggested Build Order

1. Demo-mode auth + roles (Section 0)
2. Prisma schema + seed (Section 1)
3. Events list + sign-up/drop (Section 2)
4. Calendar view (Section 3)
5. My Shifts + cancellation (Section 4)
6. Hours / check-in + coordinator approval (Section 5)
7. Directory + Dashboard enhancements (Sections 6–7)
8. Announcements/notifications (Section 8)
9. Coordinator admin pages + reports (Section 9)
10. Ambassador-specific polish (Section 10)
