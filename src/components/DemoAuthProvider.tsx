"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  ROLE_COOKIE,
  DEMO_PERSONAS,
  type Role,
} from "@/lib/demo-auth";

type DemoAuth = {
  role: Role;
  persona: (typeof DEMO_PERSONAS)[Role];
  setRole: (role: Role) => void;
};

const DemoAuthContext = createContext<DemoAuth | null>(null);

// Wraps the app (in layout.tsx). `initialRole` is read server-side from the
// cookie so the first render already matches the persisted choice.
export function DemoAuthProvider({
  initialRole,
  children,
}: {
  initialRole: Role;
  children: ReactNode;
}) {
  const [role, setRoleState] = useState<Role>(initialRole);
  const router = useRouter();

  const setRole = useCallback(
    (next: Role) => {
      setRoleState(next);
      // Persist for ~1 year. Non-httpOnly so server components can read it too.
      document.cookie = `${ROLE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      // Re-render server components (dashboards, gated pages) with the new role.
      router.refresh();
    },
    [router],
  );

  return (
    <DemoAuthContext.Provider value={{ role, persona: DEMO_PERSONAS[role], setRole }}>
      {children}
    </DemoAuthContext.Provider>
  );
}

export function useDemoAuth() {
  const ctx = useContext(DemoAuthContext);
  if (!ctx) {
    throw new Error("useDemoAuth must be used within a DemoAuthProvider");
  }
  return ctx;
}
