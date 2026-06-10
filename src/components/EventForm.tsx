"use client";

import { useActionState } from "react";
import { EVENT_TYPE_LABEL, EVENT_TYPES } from "@/lib/events";
import type { EventFormState } from "@/app/events/schema";

type Action = (
  prev: EventFormState,
  formData: FormData,
) => Promise<EventFormState>;

type Defaults = Partial<{
  id: string;
  title: string;
  type: string;
  location: string;
  startsAt: string;
  endsAt: string;
  capacity: string;
  description: string;
}>;

// Shared create/edit form. Both pages pass in the appropriate server action
// (createEvent or updateEvent); useActionState wires the form submit to it and
// hands back validation errors to render inline. `defaults` prefills the fields
// when editing.
export default function EventForm({
  action,
  submitLabel,
  defaults,
}: {
  action: Action;
  submitLabel: string;
  defaults?: Defaults;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const err = (field: string) => state.errors?.[field]?.[0];

  return (
    <form action={formAction} className="card" style={{ maxWidth: 560 }}>
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}

      {state.formError && (
        <p className="badge badge-red" style={{ marginBottom: "0.9rem" }}>
          {state.formError}
        </p>
      )}

      <Field label="Title" error={err("title")} htmlFor="title">
        <input
          id="title"
          name="title"
          className="input"
          defaultValue={defaults?.title}
        />
      </Field>

      <Field label="Type" error={err("type")} htmlFor="type">
        <select
          id="type"
          name="type"
          className="select"
          defaultValue={defaults?.type ?? "TOUR"}
        >
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {EVENT_TYPE_LABEL[t]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Location" error={err("location")} htmlFor="location">
        <input
          id="location"
          name="location"
          className="input"
          defaultValue={defaults?.location}
        />
      </Field>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <div style={{ flex: 1 }}>
          <Field label="Starts" error={err("startsAt")} htmlFor="startsAt">
            <input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              className="input"
              defaultValue={defaults?.startsAt}
            />
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Ends" error={err("endsAt")} htmlFor="endsAt">
            <input
              id="endsAt"
              name="endsAt"
              type="datetime-local"
              className="input"
              defaultValue={defaults?.endsAt}
            />
          </Field>
        </div>
      </div>

      <Field label="Capacity" error={err("capacity")} htmlFor="capacity">
        <input
          id="capacity"
          name="capacity"
          type="number"
          min={1}
          className="input"
          style={{ maxWidth: 160 }}
          defaultValue={defaults?.capacity ?? "4"}
        />
      </Field>

      <Field label="Description" error={err("description")} htmlFor="description">
        <textarea
          id="description"
          name="description"
          className="textarea"
          defaultValue={defaults?.description}
        />
      </Field>

      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

// A labelled field that shows a red validation message below it when present.
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
