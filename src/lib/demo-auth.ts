// Demo-mode "authentication". There is no real login yet — instead the app runs
// as one of two seeded personas, chosen with the role switcher in the sidebar.
// The choice is stored in a non-httpOnly cookie so both server components
// (via next/headers) and client components (via document.cookie) can read it.
// Replace this whole module with real SSO later (see TODO.md, Section 10).

export type Role = "AMBASSADOR" | "COORDINATOR";

export const ROLE_COOKIE = "demo-role";
export const DEFAULT_ROLE: Role = "AMBASSADOR";

// Each role maps to a seeded user (see prisma/seed.ts).
export const DEMO_PERSONAS: Record<Role, { id: string; name: string; label: string }> = {
  AMBASSADOR: { id: "kaheath", name: "Kayla Heath", label: "Ambassador" },
  COORDINATOR: { id: "pcoord", name: "Dr. Pat Coordinator", label: "Coordinator" },
};

export function isRole(value: unknown): value is Role {
  return value === "AMBASSADOR" || value === "COORDINATOR";
}

export function personaForRole(role: Role) {
  return DEMO_PERSONAS[role];
}
