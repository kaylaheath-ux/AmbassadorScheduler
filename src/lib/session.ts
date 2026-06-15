import { prisma } from "./prisma";
import { createClient } from "./supabase/server";
import type { User } from "@/generated/prisma/client";

// The two roles. (Mirrors the Prisma `Role` enum; kept as a string union here so
// client components can import the type without pulling in server code.)
export type Role = "AMBASSADOR" | "COORDINATOR";

// The "current user" for Server Components and server actions. Resolves the
// Supabase session to its email, then to our Prisma User row. An authenticated
// email with no matching User row is authenticated-but-unprovisioned: it gets
// `{ user: null, role: null }`, so every role guard rejects it.
export async function getCurrentUser(): Promise<{
  user: User | null;
  role: Role | null;
}> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) return { user: null, role: null };

  const user = await prisma.user.findUnique({
    where: { email: authUser.email },
  });
  return { user, role: (user?.role as Role) ?? null };
}
