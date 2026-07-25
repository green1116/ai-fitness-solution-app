/**
 * Product P9 — Feedback registry
 */

import { FEEDBACK_KINDS } from "../customer-health/health.constants";
import { getCustomerHealth } from "../customer-health/health.registry";
import type {
  CreateFeedbackInput,
  CustomerFeedback,
  FeedbackKind,
} from "./feedback.types";

const feedbackRecords = new Map<string, CustomerFeedback>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneFeedback(feedback: CustomerFeedback): CustomerFeedback {
  return { ...feedback, metadata: { ...feedback.metadata } };
}

export function createFeedback(input: CreateFeedbackInput): CustomerFeedback {
  const healthId = input.healthId.trim();
  const author = input.author.trim();
  const body = input.body.trim();
  if (!healthId) throw new Error("feedback.healthId is required");
  if (!author) throw new Error("feedback.author is required");
  if (!body) throw new Error("feedback.body is required");
  if (!(FEEDBACK_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid feedback kind: ${input.kind}`);
  }
  if (
    input.score !== undefined &&
    (!Number.isFinite(input.score) || input.score < 0 || input.score > 10)
  ) {
    throw new Error("feedback.score must be between 0 and 10");
  }
  if (!getCustomerHealth(healthId)) {
    throw new Error(`customer health not found: ${healthId}`);
  }

  const id = input.id?.trim() || createId("p9fbk");
  if (feedbackRecords.has(id)) {
    throw new Error(`feedback already exists: ${id}`);
  }

  const feedback: CustomerFeedback = {
    id,
    healthId,
    kind: input.kind,
    author,
    score: input.score,
    body,
    detail: `kind=${input.kind} author=${author}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  feedbackRecords.set(id, feedback);
  return cloneFeedback(feedback);
}

export function getFeedback(id: string): CustomerFeedback | undefined {
  const feedback = feedbackRecords.get(id.trim());
  return feedback ? cloneFeedback(feedback) : undefined;
}

export function listFeedback(filter?: {
  healthId?: string;
  kind?: FeedbackKind;
}): CustomerFeedback[] {
  let result = [...feedbackRecords.values()];
  if (filter?.healthId) {
    const hid = filter.healthId.trim();
    result = result.filter((f) => f.healthId === hid);
  }
  if (filter?.kind) result = result.filter((f) => f.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneFeedback);
}

export function clearFeedback(): void {
  feedbackRecords.clear();
}
