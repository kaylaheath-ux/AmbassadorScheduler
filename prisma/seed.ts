import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Seed uses the same pg adapter as src/lib/prisma.ts, but points at DIRECT_URL
// (session-mode connection) since this runs outside Next.js as a one-off script.
const connectionString = `${process.env.DIRECT_URL ?? process.env.DATABASE_URL}`;
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

// Demo users: two coordinators run the program, the rest are student ambassadors.
const USERS = [
  {
    id: "pcoord",
    name: "Dr. Pat Coordinator",
    email: "pcoord@ncsu.edu",
    role: "COORDINATOR" as const,
  },
  {
    id: "kaheath",
    name: "Kayla Heath",
    email: "kaheath@ncsu.edu",
    role: "AMBASSADOR" as const,
  },
  {
    id: "jsmith",
    name: "Jordan Smith",
    email: "jsmith@ncsu.edu",
    role: "AMBASSADOR" as const,
  },
  {
    id: "alee",
    name: "Alex Lee",
    email: "alee@ncsu.edu",
    role: "AMBASSADOR" as const,
  },
];

// Upcoming events. Dates are fixed (seed scripts can't use Date.now reliably and
// we want repeatable data); everything here is after the 2026 demo date.
const EVENTS = [
  {
    title: "Fall Campus Tour",
    type: "TOUR" as const,
    location: "Talley Student Union",
    startsAt: new Date("2026-09-12T14:00:00-04:00"),
    endsAt: new Date("2026-09-12T16:00:00-04:00"),
    capacity: 4,
    points: 2,
    description: "Guided walking tour for prospective CS students and families.",
  },
  {
    title: "CS Open House",
    type: "OPEN_HOUSE" as const,
    location: "Engineering Building II",
    startsAt: new Date("2026-09-20T10:00:00-04:00"),
    endsAt: new Date("2026-09-20T13:00:00-04:00"),
    capacity: 6,
    points: 3,
    description: "Department open house. Staff tables, demos, and Q&A.",
  },
  {
    title: "Admitted Students Info Session",
    type: "INFO_SESSION" as const,
    location: "Hunt Library Auditorium",
    startsAt: new Date("2026-10-03T13:00:00-04:00"),
    endsAt: new Date("2026-10-03T14:30:00-04:00"),
    capacity: 3,
    points: 2,
    description: "Panel + audience questions for admitted students.",
  },
];

async function main() {
  // Clear in FK-safe order so the seed is idempotent.
  await prisma.signup.deleteMany();
  await prisma.hourLog.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  for (const u of USERS) {
    await prisma.user.create({ data: u });
  }

  const created = [];
  for (const e of EVENTS) {
    created.push(
      await prisma.event.create({ data: { ...e, createdById: "pcoord" } }),
    );
  }

  // Give Kayla a couple of signups so personal views have data on day one.
  await prisma.signup.create({
    data: { userId: "kaheath", eventId: created[0].id, status: "CONFIRMED" },
  });
  await prisma.signup.create({
    data: { userId: "kaheath", eventId: created[1].id, status: "CONFIRMED" },
  });
  await prisma.signup.create({
    data: { userId: "jsmith", eventId: created[0].id, status: "CONFIRMED" },
  });

  await prisma.announcement.create({
    data: {
      authorId: "pcoord",
      body: "Welcome to the Fall ambassador season! Sign up for tours early.",
      audience: "ALL",
    },
  });

  console.log(
    `Seeded ${USERS.length} users, ${created.length} events, 3 signups, 1 announcement.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
