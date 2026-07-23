/**
 * Launch L2 — Feedback collector
 */

import { FEEDBACK_CHANNELS } from "../pilot/pilot.constants";
import { getPilot } from "../pilot/pilot.registry";
import type {
  CollectFeedbackInput,
  FeedbackChannel,
  FeedbackEntry,
} from "./feedback.types";

const entries = new Map<string, FeedbackEntry>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEntry(entry: FeedbackEntry): FeedbackEntry {
  return { ...entry, metadata: { ...entry.metadata } };
}

export function collectFeedback(
  input: CollectFeedbackInput,
): FeedbackEntry {
  const pilotId = input.pilotId.trim();
  const comment = input.comment.trim();
  if (!pilotId) throw new Error("feedback.pilotId is required");
  if (!comment) throw new Error("feedback.comment is required");
  if (!getPilot(pilotId)) {
    throw new Error(`pilot not found: ${pilotId}`);
  }
  if (!(FEEDBACK_CHANNELS as readonly string[]).includes(input.channel)) {
    throw new Error(`invalid feedback channel: ${input.channel}`);
  }
  if (
    !Number.isFinite(input.rating) ||
    input.rating < 1 ||
    input.rating > 10
  ) {
    throw new Error("feedback.rating must be between 1 and 10");
  }

  const id = input.id?.trim() || createId("l2fbk");
  if (entries.has(id)) {
    throw new Error(`feedback entry already exists: ${id}`);
  }

  const rating = Math.round(input.rating);
  const entry: FeedbackEntry = {
    id,
    pilotId,
    channel: input.channel,
    comment,
    rating,
    detail: `channel=${input.channel} rating=${rating}`,
    metadata: { ...(input.metadata ?? {}) },
    collectedAt: nowIso(),
  };
  entries.set(id, entry);
  return cloneEntry(entry);
}

export function getFeedbackEntry(id: string): FeedbackEntry | undefined {
  const entry = entries.get(id.trim());
  return entry ? cloneEntry(entry) : undefined;
}

export function listFeedbackEntries(filter?: {
  pilotId?: string;
  channel?: FeedbackChannel;
}): FeedbackEntry[] {
  let result = [...entries.values()];
  if (filter?.pilotId) {
    const pid = filter.pilotId.trim();
    result = result.filter((e) => e.pilotId === pid);
  }
  if (filter?.channel) {
    result = result.filter((e) => e.channel === filter.channel);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEntry);
}

export function clearFeedbackEntries(): void {
  entries.clear();
}
