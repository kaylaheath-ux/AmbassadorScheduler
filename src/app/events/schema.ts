import { z } from "zod";
import { EVENT_TYPE_VALUES } from "@/lib/events";

// Validation schema for the event create/edit form. Lives apart from actions.ts
// (which is "use server") so both the server actions and the client form can
// import it — the schema and the EventFormState type carry no server code.
export const eventSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(120),
    type: z.enum(EVENT_TYPE_VALUES),
    location: z.string().trim().min(1, "Location is required").max(160),
    // datetime-local fields arrive as strings like "2026-09-12T14:00"; coerce to Date.
    startsAt: z.coerce.date({ error: "Start date/time is required" }),
    endsAt: z.coerce.date({ error: "End date/time is required" }),
    capacity: z.coerce
      .number({ error: "Capacity is required" })
      .int("Capacity must be a whole number")
      .min(1, "Capacity must be at least 1"),
    description: z.string().trim().max(2000),
  })
  // Cross-field rule: the error attaches to the endsAt field.
  .refine((d) => d.endsAt > d.startsAt, {
    error: "End time must be after the start time",
    path: ["endsAt"],
  });

// Returned by the create/edit server actions and consumed by the form via
// useActionState. `errors` is keyed by field name → messages; `formError` is a
// top-level problem (e.g. not authorized).
export type EventFormState = {
  errors?: Record<string, string[] | undefined>;
  formError?: string;
};
