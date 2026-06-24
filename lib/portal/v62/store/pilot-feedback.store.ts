/**
 * V62 P2 — User feedback store
 */

export const FEEDBACK_CATEGORIES = [
  "UX",
  "Data",
  "Quote",
  "PDF",
  "Delivery",
  "Intelligence",
  "Launch",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_STATUSES = [
  "new",
  "triaged",
  "in_progress",
  "resolved",
  "closed",
] as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export type PilotFeedbackRecord = {
  id: string;
  organizationId: string;
  userId?: string;
  category: FeedbackCategory;
  status: FeedbackStatus;
  message: string;
  createdAt: string;
  updatedAt: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __v62PilotFeedback: PilotFeedbackRecord[] | undefined;
}

function store(): PilotFeedbackRecord[] {
  globalThis.__v62PilotFeedback ||= [];
  return globalThis.__v62PilotFeedback;
}

let seq = 0;

export function submitPilotFeedback(input: {
  organizationId: string;
  userId?: string;
  category: FeedbackCategory;
  message: string;
}): PilotFeedbackRecord {
  const now = new Date().toISOString();
  const record: PilotFeedbackRecord = {
    id: `pfb_${++seq}_${Date.now()}`,
    organizationId: input.organizationId,
    userId: input.userId,
    category: input.category,
    status: "new",
    message: input.message.trim(),
    createdAt: now,
    updatedAt: now,
  };
  store().push(record);
  return record;
}

export function updateFeedbackStatus(id: string, status: FeedbackStatus): PilotFeedbackRecord | null {
  const item = store().find((f) => f.id === id);
  if (!item) return null;
  item.status = status;
  item.updatedAt = new Date().toISOString();
  return item;
}

export function listPilotFeedback(organizationId?: string): PilotFeedbackRecord[] {
  const items = [...store()].reverse();
  return organizationId ? items.filter((f) => f.organizationId === organizationId) : items;
}

export function clearPilotFeedbackForTests(): void {
  globalThis.__v62PilotFeedback = [];
}
