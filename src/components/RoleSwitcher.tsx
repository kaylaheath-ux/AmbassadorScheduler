"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { DEMO_PERSONAS, type Role } from "@/lib/demo-auth";
import { useDemoAuth } from "./DemoAuthProvider";
import styles from "./Sidebar.module.css";

const ROLES = Object.keys(DEMO_PERSONAS) as Role[];

// Replaces the static "Kayla Heath ⌄" account placeholder. Shows the current
// demo persona and lets you switch between Ambassador and Coordinator.
export default function RoleSwitcher() {
  const { role, persona, setRole } = useDemoAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.account}>
      {open && (
        <ul className={styles.roleMenu}>
          {ROLES.map((r) => {
            const p = DEMO_PERSONAS[r];
            return (
              <li key={r}>
                <button
                  type="button"
                  className={styles.roleOption}
                  onClick={() => {
                    setRole(r);
                    setOpen(false);
                  }}
                >
                  <span>
                    {p.label}
                    <span className={styles.roleName}>{p.name}</span>
                  </span>
                  {r === role && <Check size={18} strokeWidth={2.5} aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        className={styles.accountButton}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span>
          {persona.label}
          <span className={styles.roleName}>{persona.name}</span>
        </span>
        <ChevronDown
          size={24}
          strokeWidth={2}
          aria-hidden
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.15s ease",
          }}
        />
      </button>
    </div>
  );
}
