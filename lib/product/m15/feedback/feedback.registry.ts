/**
 * Product M15 — Evolution feedback in-memory registry
 */

import {
  EVOLUTION_FEEDBACK_STATUSES,
  PRODUCT_EVOLUTION_FEEDBACK_BASE,
} from "./feedback.constants";
import { validateEvolutionFeedbackInput } from "./feedback.metadata";
import type {
  EvolutionFeedback,
  EvolutionFeedbackKind,
  EvolutionFeedbackStatus,
  RegisterEvolutionFeedbackInput,
  UpdateEvolutionFeedbackStatusInput,
} from "./feedback.types";

const feedbacks = new Map<string, EvolutionFeedback>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneFeedback(feedback: EvolutionFeedback): EvolutionFeedback {
  return { ...feedback, metadata: { ...feedback.metadata } };
}

export function registerEvolutionFeedback(
  input: RegisterEvolutionFeedbackInput,
): EvolutionFeedback {
  const validation = validateEvolutionFeedbackInput(input);
  if (!validation.ok) {
    const first = validation.issues[0];
    throw new Error(
      `invalid evolution feedback: ${first?.field} ${first?.message}`,
    );
  }

  const feedbackKey = input.feedbackKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  const foundationRef = (
    input.foundationRef ?? PRODUCT_EVOLUTION_FEEDBACK_BASE
  )
    .trim()
    .toLowerCase();

  if (keys.has(feedbackKey)) {
    throw new Error(`feedbackKey already exists: ${feedbackKey}`);
  }

  const id = input.id?.trim() || createId("evofb");
  if (feedbacks.has(id)) throw new Error(`feedback already exists: ${id}`);

  const now = nowIso();
  const feedback: EvolutionFeedback = {
    id,
    feedbackKey,
    kind: input.kind,
    status: EVOLUTION_FEEDBACK_STATUSES[0],
    scope: input.scope,
    title,
    summary,
    foundationRef,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  feedbacks.set(id, feedback);
  keys.set(feedbackKey, id);
  return cloneFeedback(feedback);
}

export function updateEvolutionFeedbackStatus(
  input: UpdateEvolutionFeedbackStatusInput,
): EvolutionFeedback {
  const feedbackId = input.feedbackId.trim();
  if (!feedbackId) throw new Error("feedback.feedbackId is required");
  if (
    !(EVOLUTION_FEEDBACK_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid feedback status: ${input.status}`);
  }

  const existing = feedbacks.get(feedbackId);
  if (!existing) throw new Error(`feedback not found: ${feedbackId}`);

  const updated: EvolutionFeedback = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  feedbacks.set(feedbackId, updated);
  return cloneFeedback(updated);
}

export function getEvolutionFeedback(
  id: string,
): EvolutionFeedback | undefined {
  const feedback = feedbacks.get(id.trim());
  return feedback ? cloneFeedback(feedback) : undefined;
}

export function getEvolutionFeedbackByKey(
  feedbackKey: string,
): EvolutionFeedback | undefined {
  const id = keys.get(feedbackKey.trim().toUpperCase());
  return id ? getEvolutionFeedback(id) : undefined;
}

export function listEvolutionFeedbacks(filter?: {
  kind?: EvolutionFeedbackKind;
  status?: EvolutionFeedbackStatus;
}): EvolutionFeedback[] {
  let result = [...feedbacks.values()];
  if (filter?.kind) result = result.filter((f) => f.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((f) => f.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.feedbackKey.localeCompare(b.feedbackKey))
    .map(cloneFeedback);
}

export function clearEvolutionFeedbacks(): void {
  feedbacks.clear();
  keys.clear();
}
