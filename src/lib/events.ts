// Display labels for the EventType enum, plus the ordered list used in filters
// and the create form.
export const EVENT_TYPE_LABEL: Record<string, string> = {
  TOUR: "Tour",
  OPEN_HOUSE: "Open House",
  INFO_SESSION: "Info Session",
  TABLING: "Tabling",
  PANEL: "Panel",
  OTHER: "Other",
};

export const EVENT_TYPES = Object.keys(EVENT_TYPE_LABEL);

export const HOUR_STATUS_BADGE: Record<string, string> = {
  PENDING: "badge-amber",
  APPROVED: "badge-green",
  REJECTED: "badge-red",
};
