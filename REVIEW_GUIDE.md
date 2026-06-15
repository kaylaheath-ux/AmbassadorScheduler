# Code Review Guide (for learning)

A reading path through the codebase, ordered so you build your mental model from
the ground up and then watch it all connect. **Don't read files alphabetically.**
Read one complete vertical slice (data → action → page) first; the rest goes fast
because it's all the same pattern.

Tip: keep the dev server running and read each file next to the page it renders —
flip the role switcher in the sidebar and watch behavior as you read. Use your
IDE's "Go to definition" (Cmd-click) to jump from a called function to where it's
defined.

The stack: **Next.js App Router** (Server + Client Components, server actions),
**Prisma** (database access), **Supabase** (Postgres).

---

## Phase 0 — Orient (5 min)

- [ ] `package.json` — what libraries are in play (Next 16, Prisma 7, lucide
      icons). Notice the `db:seed` script.
- [ ] `src/app/layout.tsx` — the root shell every page renders inside; the entry
      point. It's an `async` Server Component that reads a cookie and wraps
      everything in providers + the sidebar.

**Ask yourself:** what runs on the server vs. in the browser here?

---

## Phase 1 — The data model (the foundation)

Everything else is shaped by this. Read in order:

- [ ] `prisma/schema.prisma` — the source of truth. For each model note: fields,
      which are optional (`?`), the enums, and especially the **relations**
      (`@relation`) and the `@@unique([userId, eventId])` on `Signup`.
- [ ] `prisma/migrations/` — open the SQL files oldest→newest. Shows how schema
      edits became real DB changes (e.g. the `DROP COLUMN` ones from removing
      `majors`/`points`). Good for seeing what a migration actually is.
- [ ] `prisma/seed.ts` — the demo data. Clearest example of how you **write** to
      the DB with Prisma (`create`, `deleteMany`). Read this before the harder
      files to learn the query API.
- [ ] `src/lib/prisma.ts` — how the DB client is created once and reused
      (the `globalThis` caching comment).

**Self-check:** Could you draw the 5 tables and the lines between them on paper?

---

## Phase 2 — Who am I? (the auth concept)

How the app knows who's signed in and what they can do. Supabase magic-link auth.

- [ ] `src/app/login/page.tsx` + `src/app/auth/callback/route.ts` — the login
      flow: email → magic link → session cookie.
- [ ] `src/lib/supabase/server.ts` + `client.ts` — the Supabase client factories
      (server reads cookies; browser sends the magic link).
- [ ] `middleware.ts` — refreshes the session cookie on every request.
- [ ] `src/lib/session.ts` — `getCurrentUser()`: maps the Supabase session
      (by email) to a Prisma `User` + `role`. Every page/action calls this.

**Ask yourself:** why does an authenticated email with no `User` row end up with
no access — and where is that enforced?

---

## Phase 3 — One full vertical slice: Events ⭐ (spend the most time here)

Read these three together as one story — it teaches the entire request lifecycle.

- [ ] `src/app/events/page.tsx` — a **Server Component** that queries Prisma
      directly and renders HTML. Note how `searchParams` is awaited, how it
      computes roster counts, and how the sign-up button is a `<form action={…}>`.
- [ ] `src/app/events/actions.ts` — the **server actions** (`"use server"`),
      where the form submits go. Read `signUpForEvent` and `dropSignup` slowly:
      capacity check, waitlist, promotion logic, then `revalidatePath`.
- [ ] `src/app/events/[id]/page.tsx`, `src/app/events/new/page.tsx`, and
      `src/app/events/[id]/edit/page.tsx` — detail/roster + the create/edit forms.
- [ ] `src/app/events/schema.ts` + `src/components/EventForm.tsx` — the **Zod**
      validation schema and the shared client form that renders per-field errors
      via React 19's `useActionState`. Good example of validation + the
      server-action-with-state pattern.

**Trace one click:** press "Sign up" → which function runs → what changes in the
DB → why does the page update? Once that click makes sense, the whole app does.

---

## Phase 4 — The rest of the features (now it's pattern-matching)

Same shape everywhere (page reads, actions write). Skim to confirm the pattern
and spot differences.

- [ ] `src/app/time/actions.ts` + `src/app/time/page.tsx` — clock in/out + task
      hours. Note `new Date()` is fine here (server runtime).
- [ ] `src/app/approvals/page.tsx` — reuses the time actions; note the
      `redirect("/")` guard for non-coordinators.
- [ ] `src/app/my-shifts/page.tsx`
- [ ] `src/app/messages/page.tsx` + `src/app/messages/actions.ts`
- [ ] `src/app/reports/page.tsx`
- [ ] `src/app/page.tsx` (dashboard — role-aware)
- [ ] `src/app/calendar/page.tsx` — read last; trickiest logic (date/grid math).
      A good "can I follow this?" test.

---

## Phase 5 — Shared plumbing & UI

- [ ] `src/lib/format.ts` + `src/lib/events.ts` — helper functions the pages use.
- [ ] `src/app/globals.css` — the shared CSS utility classes.
- [ ] `src/components/Sidebar.tsx` (+ `Sidebar.module.css`) — nav + role-gating.

---

## What to actively look for (a learner's checklist)

Jot down anything that fits these — it sharpens your eye and gives us a punch list
afterward:

- **"Why is this here?"** — anything you can't explain the purpose of. (The
  leftover `src/app/api/students/` REST routes were one such example — they've
  since been removed since nothing called them.)
- **Repetition** — the same code in many files (the `getCurrentUser()` +
  role-check at the top of actions; inline styles). Could it be shared?
- **"What if…?"** — edge cases: what if two people grab the last spot at once?
  What if an ambassador opens `/approvals` directly?
- **Consistency** — do pages handle "empty" and "no user" the same way?

---

## Key concepts to make sure you understand by the end

- **Server Component vs Client Component** — default is server; `"use client"`
  opts into the browser (state, events, effects).
- **Server action** — a `"use server"` function a `<form>` can call directly; it
  runs on the server, mutates the DB, then `revalidatePath()` refreshes the UI.
- **`params` / `searchParams` are Promises** in the App Router — you `await` them.
- **`cookies()`** (server) vs `document.cookie` (client) — the two halves of the
  demo session.
- **Prisma query API** — `findMany`, `findUnique`, `create`, `update`, `upsert`,
  `delete`, `count`, plus `where` / `include` / `orderBy`.

---

## My notes / questions as I go

(Write findings here — file:line + the question or smell — and we'll work
through them together.)

-
