# Ambassador Scheduler — Build Roadmap

A ConnectTeam-style scheduling tool for NC State CS student ambassadors to sign up
for events (tours, open houses, info sessions, tabling, panels). Two roles:
**Ambassador** (student) and **Coordinator** (admin).

Stack: Next.js (App Router) · Prisma · Supabase (Postgres).

---

## 0. Auth — Demo Mode (do this first; gates everything)

For now, skip real authentication. Use a simple role switcher so we can build and
test both experiences. Replace with university SSO (`@ncsu.edu`) later.

- [x] Add a role concept: `Ambassador` | `Coordinator`. (`src/lib/demo-auth.ts`)
- [x] Persist the selected role + a demo user (cookie + React context).
- [x] Add a way to switch roles quickly — role switcher dropdown replaced the
      sidebar account placeholder (`RoleSwitcher` / `DemoAuthProvider`).
- [x] Seed a few demo users of each role for selection.
- [x] Nav supports role gating (`NAV_ITEMS[].roles`); all current pages show to
      both roles until admin pages exist.
- [ ] Optional: a dedicated landing "Sign in" / role-select screen (the sidebar
      switcher currently covers selecting + switching).

> Later: replace demo mode with real SSO / email-domain-restricted auth.

---

## 1. Data Model (Prisma schema)

Evolve the current minimal `Student` model into a fuller schema.

- [x] `User` — replaced `Student`: `id, name, email, role, photoUrl, phone`.
- [x] `Event` — `id, title, type, location, startsAt, endsAt, capacity,
      description, createdById`.
- [x] `Signup` — `id, userId, eventId, status (confirmed | waitlisted | cancelled),
      createdAt`.
- [x] `HourLog` — `id, userId, eventId, checkIn, checkOut, approved, approvedById`.
- [ ] **Extend `HourLog` for non-event ("task") hours** — hours aren't always
      tied to an event (e.g. writing letters to students). Make `eventId`
      optional, add `description` (what the task was), a manual `minutes`
      duration, and a `status` (PENDING | APPROVED | REJECTED) so task hours can
      be requested and approved/rejected. See Section 5.
- [x] `Announcement` — `id, authorId, body, audience, createdAt`.
- [x] Run migration + add a seed script with demo users, events, and signups
      (`prisma/seed.ts`, `npm run db:seed`).

---

## 2. Events & Sign-up (the core loop)

This is the whole point of the app — build it right after the schema.

- [x] **Events list page** (`/events`): browse upcoming events with capacity shown.
- [x] Filters: event type + "needs ambassadors" (understaffed). _(date-range filter still TODO)_
- [x] **Event detail page** (`/events/[id]`): full info + roster.
- [x] **Sign up / Drop** actions, with capacity enforcement.
- [x] **Waitlist** when an event is full; auto-promote when a slot opens.

---

## 3. Calendar (already in sidebar nav)

- [x] `/calendar`: month view of events (with prev/next + Today). _(week view still TODO)_
- [x] Toggle between "All events" and "My shifts".
- [x] Click an event to open its detail page.

---

## 4. My Shifts / Personal Schedule

- [x] `/my-shifts`: list of events I've signed up for (upcoming + past).
- [x] Cancel a shift, with a cutoff window before the event (24h).
- [x] History of completed events.

---

## 5. Time / Hours (already in sidebar nav)

- [x] `/time`: a live **clock in / clock out** for events.
- [x] **Credited hours = actual clocked time (`checkOut − checkIn`), NOT the
      event's scheduled duration.** Ambassadors don't have to stay the whole
      event — the clock is the source of truth. The event's start/end times are
      only for scheduling.
- [x] Logged hours + running total (approved hours). _(per-semester quota target still TODO)_
- [x] Coordinator approval/verification of submitted hours (`/approvals`).
- [x] **Request hours for non-event tasks** (rare but needed) — e.g. writing
      letters to students. Ambassador submits a description + time spent;
      coordinator approves or rejects. Backed by the extended `HourLog`
      (optional `eventId`, `description`, `minutes`, `status`) — see Section 1.

---

## 6. Directory (exists — extend it)

- [ ] Add to profiles: availability, contact info, total hours, reliability.
- [ ] Profile photos.
- [ ] Make `/directory/[id]` show signups + hours history.

---

## 7. Dashboard (exists — make it role-aware)

- [x] **Ambassador view:** next shift, approved/pending hours, upcoming shifts,
      open events needing people, latest announcement.
- [x] **Coordinator view:** understaffed events, pending hour approvals, upcoming
      event count, ambassador count. _(no-show flags still TODO)_

---

## 8. Messages / Announcements (already in sidebar nav)

- [x] `/messages`: broadcast announcements from coordinators (post + delete).
- [ ] Per-event notifications/reminders ("your tour is tomorrow at 9am").
- [x] Audience targeting by role (all / ambassadors / coordinators). _(by-event still TODO)_

---

## 9. Coordinator / Admin Pages

- [x] **Create/Manage Events**: create + delete with capacity. _(edit + clone
      recurring still TODO)_
- [x] **Roster & Approvals**: roster on event detail; approve/reject hours on
      `/approvals`. _(attendance marking / no-show flags still TODO)_
- [x] **Reports** (`/reports`): approved hours per ambassador + event coverage.
      _(attendance rates still TODO)_

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
