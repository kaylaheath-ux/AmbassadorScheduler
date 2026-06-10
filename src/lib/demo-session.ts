import { cookies } from "next/headers";
import { prisma } from "./prisma";
import {
  ROLE_COOKIE,
  DEFAULT_ROLE,
  isRole,
  personaForRole,
  type Role,
} from "./demo-auth";

// Server-side counterpart to DemoAuthProvider: reads the demo role from the
// cookie and resolves it to the seeded persona + their User row. Server
// components and server actions use this as the "current user". Uses next/headers
// so it is server-only. Replace with a real session lookup when SSO lands.

export async function getCurrentRole(): Promise<Role> {
  const store = await cookies();
  const value = store.get(ROLE_COOKIE)?.value;
  return isRole(value) ? value : DEFAULT_ROLE;
}

export async function getCurrentUser() {
  const role = await getCurrentRole();
  const persona = personaForRole(role);
  const user = await prisma.user.findUnique({ where: { id: persona.id } });
  return { role, persona, user };
}
