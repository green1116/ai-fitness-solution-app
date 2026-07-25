/**
 * Product P8 — Handover registry
 */

import { HANDOVER_STATUSES } from "../tender/tender.constants";
import { getSubmission } from "../submission/submission.registry";
import { getTender } from "../tender/tender.registry";
import type {
  CompleteHandoverInput,
  CreateHandoverInput,
  TenderHandover,
} from "./handover.types";

const handovers = new Map<string, TenderHandover>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneHandover(handover: TenderHandover): TenderHandover {
  return { ...handover, metadata: { ...handover.metadata } };
}

export function createHandover(input: CreateHandoverInput): TenderHandover {
  const tenderId = input.tenderId.trim();
  const submissionId = input.submissionId.trim();
  const recipient = input.recipient.trim();
  if (!tenderId) throw new Error("handover.tenderId is required");
  if (!submissionId) throw new Error("handover.submissionId is required");
  if (!recipient) throw new Error("handover.recipient is required");
  if (!getTender(tenderId)) {
    throw new Error(`tender not found: ${tenderId}`);
  }
  const submission = getSubmission(submissionId);
  if (!submission) {
    throw new Error(`submission not found: ${submissionId}`);
  }
  if (submission.status !== "ACKNOWLEDGED" && submission.status !== "SENT") {
    throw new Error(
      `submission must be sent or acknowledged before handover: ${submissionId}`,
    );
  }

  const id = input.id?.trim() || createId("p8hnd");
  if (handovers.has(id)) {
    throw new Error(`handover already exists: ${id}`);
  }

  const status = HANDOVER_STATUSES[1];
  const notes = (input.notes ?? "").trim();
  const handover: TenderHandover = {
    id,
    tenderId,
    submissionId,
    recipient,
    status,
    notes,
    detail: `status=${status} recipient=${recipient}`,
    metadata: { ...(input.metadata ?? {}) },
    scheduledAt: nowIso(),
  };
  handovers.set(id, handover);
  return cloneHandover(handover);
}

export function completeHandover(
  input: CompleteHandoverInput,
): TenderHandover {
  const handoverId = input.handoverId.trim();
  if (!handoverId) throw new Error("handover.handoverId is required");
  const existing = handovers.get(handoverId);
  if (!existing) throw new Error(`handover not found: ${handoverId}`);
  if (existing.status === "COMPLETE") {
    throw new Error(`handover already complete: ${handoverId}`);
  }

  const notes = (input.notes ?? existing.notes).trim();
  const updated: TenderHandover = {
    ...existing,
    status: "COMPLETE",
    notes,
    detail: `status=COMPLETE recipient=${existing.recipient}`,
    metadata: { ...existing.metadata },
    completedAt: nowIso(),
  };
  handovers.set(handoverId, updated);
  return cloneHandover(updated);
}

export function getHandover(id: string): TenderHandover | undefined {
  const handover = handovers.get(id.trim());
  return handover ? cloneHandover(handover) : undefined;
}

export function listHandovers(filter?: {
  tenderId?: string;
}): TenderHandover[] {
  let result = [...handovers.values()];
  if (filter?.tenderId) {
    const tid = filter.tenderId.trim();
    result = result.filter((h) => h.tenderId === tid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneHandover);
}

export function clearHandovers(): void {
  handovers.clear();
}
