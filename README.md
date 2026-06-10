# Ambassador Scheduler

A scheduling tool for NC State CS **student ambassadors** to sign up for events
(campus tours, open houses, info sessions, tabling, panels) and log their hours —
think a focused, role-based version of ConnectTeam built for an ambassador
program.

There are two roles:

- **Ambassador** — browses events, signs up (with a waitlist when full), clocks
  in/out to earn hours, and requests hours for non-event tasks.
- **Coordinator** — creates/edits events, reviews and approves submitted hours,
  posts announcements, and sees program-wide reports.

> **Auth is in demo mode.** Instead of real login, you pick a role with the
> switcher in the sidebar. See [Demo mode](#demo-mode) below.

## Tech stack

- **[Next.js 16](https://nextjs.org)** (App Router, React 19, Server Components +
  server actions)
- **[Prisma 7](https://www.prisma.io)** ORM over **PostgreSQL** (hosted on
  [Supabase](https://supabase.com))
- **[Zod](https://zod.dev)** for input validation on event create/edit
- **[lucide-react](https://lucide.dev)** icons
- TypeScript throughout

No component library — styling is plain CSS (shared utility classes in
`globals.css` plus a couple of CSS Modules).

## Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (the project is set up for Supabase)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root with two connection strings:

```bash
# Pooled connection used by the app at runtime
DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true"
# Direct (session-mode) connection used by the Prisma CLI for migrations/seed
DIRECT_URL="postgresql://...:5432/postgres"
```

On Supabase, `DATABASE_URL` is the pgbouncer pooler (port 6543) and `DIRECT_URL`
is the session-mode connection (port 5432). The CLI config in
`prisma.config.ts` reads `DIRECT_URL`.

### 3. Set up the database

```bash
npx prisma migrate deploy   # apply migrations
npm run db:seed             # load demo users, events, signups, hours
```

### 4. Run the app

```bash
npm run dev
```

Open <http://localhost:3000>. Use the role switcher at the bottom of the sidebar
to flip between Ambassador and Coordinator.

## Demo mode

There is no real authentication yet. The selected role is stored in a `demo-role`
cookie and maps to a seeded persona:

| Role        | Persona              |
| ----------- | -------------------- |
| Ambassador  | Kayla Heath          |
| Coordinator | Dr. Pat Coordinator  |

- The cookie is read **server-side** (`src/lib/demo-session.ts`) so the first
  render is correct, and **client-side** (`src/components/DemoAuthProvider.tsx`)
  so switching is instant.
- Server actions and coordinator-only pages re-check the role before doing
  anything; ambassadors are redirected away from `/events/new`, `/approvals`,
  and `/reports`.

This is intentionally a stand-in. Replacing it with real `@ncsu.edu` SSO is
tracked in `TODO.md`.

## Features by page

| Route                 | Who         | What                                                                 |
| --------------------- | ----------- | -------------------------------------------------------------------- |
| `/`                   | Both        | Role-aware dashboard (next shift + hours, or understaffed + pending) |
| `/events`             | Both        | Browse upcoming events; filter by type / "needs ambassadors"         |
| `/events/[id]`        | Both        | Event detail + roster (+ waitlist); coordinator edit/delete          |
| `/events/new`         | Coordinator | Create an event (Zod-validated)                                      |
| `/events/[id]/edit`   | Coordinator | Edit an event (Zod-validated)                                        |
| `/calendar`           | Both        | Month grid; toggle "All events" ↔ "My shifts"                        |
| `/my-shifts`          | Ambassador  | Upcoming + past shifts; cancel (locked 24h before)                   |
| `/time`               | Ambassador  | Clock in/out, request task hours, hours history                      |
| `/approvals`          | Coordinator | Approve/reject submitted hours                                       |
| `/reports`            | Coordinator | Approved hours per ambassador + event coverage                       |
| `/directory`          | Both        | List of ambassadors                                                  |
| `/directory/[id]`     | Both        | Ambassador profile                                                   |
| `/messages`           | Both        | Announcements feed; coordinators post (audience-targeted)            |

### How hours work

Credited hours come from the **clock**, not an event's scheduled length — an
ambassador clocks in on arrival and out when they leave, and the credited time is
`checkOut − checkIn`. Hours can also be requested for non-event **tasks** (e.g.
writing letters to students) with a manual duration. Either kind starts `PENDING`
and a coordinator approves or rejects it.

## Data model

Defined in `prisma/schema.prisma`:

- **User** — `id` (unity id), name, email, `role` (AMBASSADOR | COORDINATOR).
- **Event** — title, type, location, start/end, capacity, description, creator.
- **Signup** — links a user to an event with a status (CONFIRMED | WAITLISTED |
  CANCELLED); unique per (user, event). Confirmed roster is capped at capacity;
  overflow is waitlisted and auto-promoted when a spot frees up.
- **HourLog** — credited time. Either an **event** clock (`eventId` +
  `checkIn`/`checkOut`) or a **task** (`description` + `minutes`); has a status
  (PENDING | APPROVED | REJECTED).
- **Announcement** — coordinator post with an audience (ALL / AMBASSADOR /
  COORDINATOR).

## Project structure

```
prisma/
  schema.prisma          # data model
  migrations/            # SQL migration history
  seed.ts                # demo data (npm run db:seed)
src/
  app/
    layout.tsx           # root shell: reads role cookie, wraps app in providers
    page.tsx             # dashboard (role-aware)
    <feature>/page.tsx   # one folder per route
    <feature>/actions.ts # "use server" mutations for that feature
    events/schema.ts     # Zod schema for event create/edit
  components/
    Sidebar.tsx          # nav + role gating
    DemoAuthProvider.tsx / RoleSwitcher.tsx  # client-side demo role state + switcher
    EventForm.tsx        # shared create/edit form (useActionState + Zod errors)
  lib/
    prisma.ts            # singleton Prisma client
    demo-auth.ts         # role types + personas
    demo-session.ts      # server-side "current user" from the cookie
    events.ts            # event-type labels/values + badge helpers
    format.ts            # date/time + duration formatting (Eastern time)
```

The app follows one consistent pattern: **pages are Server Components that read
from Prisma directly; mutations are server actions** (`actions.ts`) that write,
then call `revalidatePath` to refresh the affected views.

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server                 |
| `npm run build`   | `prisma generate` + production build |
| `npm start`       | Run the production build             |
| `npm run lint`    | ESLint                               |
| `npm run db:seed` | Reset and reseed demo data           |

Useful Prisma commands: `npx prisma migrate dev` (create a migration in dev),
`npx prisma migrate deploy` (apply migrations), `npx prisma studio` (browse data).

## Roadmap

Planned work and the demo-mode → SSO swap are tracked in
[`TODO.md`](./TODO.md). A learning-oriented reading path through the codebase is
in [`REVIEW_GUIDE.md`](./REVIEW_GUIDE.md).
