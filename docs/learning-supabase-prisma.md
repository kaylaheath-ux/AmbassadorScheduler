# Learning Plan: Replace students.json with Supabase + Prisma

Goal: replace the hardcoded `backend/src/data/students.json` with a real
Postgres database (Supabase) queried through a type-safe ORM (Prisma).

## Mental model (read this first)

- **Supabase** = a hosted Postgres **database** in the cloud. It replaces the
  *file* where data lives.
- **Prisma** = a TypeScript **library** in your backend. You write
  `prisma.student.findMany()` and it generates SQL + returns typed results.
  It replaces the *code* that does `students.find(...)`.

Request flow after the migration:
`Express route` → `Prisma` → `Supabase Postgres`

---

## Stage 0 — Relational database basics (~1 hr)

Your `Student` interface is already a table schema. Get comfortable with:
tables, rows, columns, primary key, `SELECT ... WHERE`.

- SQL intro: https://www.khanacademy.org/computing/computer-programming/sql
- Milestone: you can read `SELECT * FROM students WHERE id = 'kaheath';`
  and see that it's the same idea as your `/students/:id` route.

## Stage 1 — Supabase setup (~30 min)

You only need the **database**, not auth/storage/client yet.

- Docs: https://supabase.com/docs/guides/getting-started
- Steps:
  1. Create a free account + new project (pick a region near you).
  2. Set a database password (save it).
  3. Find the **connection string** (Project Settings → Database →
     Connection string → "URI"). Use the connection-pooling string for apps.
- Milestone: you have a connection string that looks like
  `postgresql://postgres:[PASSWORD]@...supabase.co:5432/postgres`

## Stage 2 — Prisma from scratch (~1–2 hrs) — the main event

This guide maps almost 1:1 to your situation:
https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgresql

It walks through: define schema → connect to Postgres → run a migration →
query from TypeScript. Key concepts you'll meet:

- `schema.prisma` — where you declare your `Student` model
- `.env` — where the connection string lives (NEVER commit this)
- `prisma migrate` — turns your schema into real database tables
- `@prisma/client` — the generated, typed query code you import

Your model will look roughly like:

```prisma
model Student {
  id     String   @id        // ncsu unity id
  name   String
  majors String[]            // Postgres native array — easy path
  minors String[]
}
```

- Milestone: `npx prisma studio` opens and shows an empty `Student` table.

## Stage 3 — Seed the data (~30 min)

Move the 5 students from `students.json` into the database once.

- Read: https://www.prisma.io/docs/guides/migrate/seed-database
- Write a small `prisma/seed.ts` that loops over the existing JSON and calls
  `prisma.student.create(...)`. Reuse your current JSON as the source.
- Milestone: Prisma Studio (or the Supabase table editor) shows 5 rows.

## Stage 4 — Refactor the routes (~1 hr)

Replace the JSON import and array methods in
`backend/src/routes/students.ts`:

```ts
// GET /students
const students = await prisma.student.findMany();
res.json(students);

// GET /students/:id
const student = await prisma.student.findUnique({ where: { id } });
if (!student) return res.status(404).json({ error: `student with id ${id} not found` });
res.json(student);
```

Note: route handlers become `async`. Wrap DB calls in try/catch.

- Milestone: `curl localhost:3000/students` returns the same data as before,
  now coming from Supabase. Delete `students.json` once it works.

---

## Things to watch out for

- **Arrays**: `majors`/`minors` are `String[]`. Postgres + Prisma support this
  natively (the "easy path"). A more "correct" design uses separate Major/Minor
  tables with relations — learn that *later*, not now.
- **Secrets**: the connection string goes in `backend/.env` and `.env` must be
  in `.gitignore`. Never commit your DB password.
- **Connection string flavors**: Supabase gives a direct one (port 5432) and a
  pooled one (port 6543). The Prisma guide explains which to use where; for a
  simple server the direct URL is fine to start.

## Suggested order summary

0. SQL basics → 1. Supabase project → 2. Prisma quickstart →
3. Seed data → 4. Refactor routes → delete JSON.

When you're ready to do it for real, I can switch into "do it with me" mode and
walk through each command live.
