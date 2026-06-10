// The EventType enum values as a readonly tuple — the single source of truth.
// Used by the Zod schema (z.enum needs a literal tuple) and to derive the list
// + labels below.
export const EVENT_TYPE_VALUES = [
  "TOUR",
  "OPEN_HOUSE",
  "INFO_SESSION",
  "TABLING",
  "PANEL",
  "OTHER",
] as const;

// Display labels for the EventType enum.
export const EVENT_TYPE_LABEL: Record<string, string> = {
  TOUR: "Tour",
  OPEN_HOUSE: "Open House",
  INFO_SESSION: "Info Session",
  TABLING: "Tabling",
  PANEL: "Panel",
  OTHER: "Other",
};

// Plain string[] for filter checks (`.includes(someString)`) and `.map` in forms.
export const EVENT_TYPES: string[] = [...EVENT_TYPE_VALUES];

export const HOUR_STATUS_BADGE: Record<string, string> = {
  PENDING: "badge-amber",
  APPROVED: "badge-green",
  REJECTED: "badge-red",
};
