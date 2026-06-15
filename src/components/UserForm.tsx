"use client";

import { useActionState } from "react";
import type { UserFormState } from "@/lib/schemas/user";

type Action = (
  prev: UserFormState,
  formData: FormData,
) => Promise<UserFormState>;

type Defaults = Partial<{
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
}>;

// Shared create/edit form for users. The create page passes `createUser`; the
// edit page passes `updateUser` + `defaults` and sets `idReadOnly` (the unity id
// is the primary key and can't change).
export default function UserForm({
  action,
  submitLabel,
  defaults,
  idReadOnly = false,
}: {
  action: Action;
  submitLabel: string;
  defaults?: Defaults;
  idReadOnly?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const err = (field: string) => state.errors?.[field]?.[0];

  return (
    <form action={formAction} className="card" style={{ maxWidth: 480 }}>
      {state.formError && (
        <p className="badge badge-red" style={{ marginBottom: "0.9rem" }}>
          {state.formError}
        </p>
      )}

      <Field label="Unity ID" error={err("id")} htmlFor="id">
        <input
          id="id"
          name="id"
          className="input"
          defaultValue={defaults?.id}
          readOnly={idReadOnly}
        />
      </Field>

      <Field label="Name" error={err("name")} htmlFor="name">
        <input id="name" name="name" className="input" defaultValue={defaults?.name} />
      </Field>

      <Field label="Email" error={err("email")} htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          className="input"
          defaultValue={defaults?.email}
        />
      </Field>

      <Field label="Role" error={err("role")} htmlFor="role">
        <select
          id="role"
          name="role"
          className="select"
          defaultValue={defaults?.role ?? "AMBASSADOR"}
        >
          <option value="AMBASSADOR">Ambassador</option>
          <option value="COORDINATOR">Coordinator</option>
        </select>
      </Field>

      <Field label="Phone (optional)" error={err("phone")} htmlFor="phone">
        <input id="phone" name="phone" className="input" defaultValue={defaults?.phone} />
      </Field>

      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error && (
        <span style={{ color: "#b42318", fontSize: "0.85rem" }}>{error}</span>
      )}
    </div>
  );
}
