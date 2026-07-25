/**
 * Product P8 — Tender registry
 */

import { TENDER_STATUSES } from "./tender.constants";
import type {
  CreateTenderInput,
  TenderCase,
  TenderStatus,
  UpdateTenderStatusInput,
} from "./tender.types";

const tenders = new Map<string, TenderCase>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTender(tender: TenderCase): TenderCase {
  return { ...tender, metadata: { ...tender.metadata } };
}

export function createTender(input: CreateTenderInput): TenderCase {
  const collaborationRef = input.collaborationRef.trim();
  const title = input.title.trim();
  const owner = input.owner.trim();
  if (!collaborationRef) {
    throw new Error("tender.collaborationRef is required");
  }
  if (!title) throw new Error("tender.title is required");
  if (!owner) throw new Error("tender.owner is required");

  const id = input.id?.trim() || createId("p8tnd");
  if (tenders.has(id)) {
    throw new Error(`tender already exists: ${id}`);
  }

  const now = nowIso();
  const status = TENDER_STATUSES[0];
  const tender: TenderCase = {
    id,
    collaborationRef,
    title,
    owner,
    status,
    detail: `status=${status} owner=${owner}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  tenders.set(id, tender);
  return cloneTender(tender);
}

export function updateTenderStatus(
  input: UpdateTenderStatusInput,
): TenderCase {
  const tenderId = input.tenderId.trim();
  if (!tenderId) throw new Error("tender.tenderId is required");
  if (!(TENDER_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid tender status: ${input.status}`);
  }
  const existing = tenders.get(tenderId);
  if (!existing) throw new Error(`tender not found: ${tenderId}`);

  const updated: TenderCase = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} owner=${existing.owner}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  tenders.set(tenderId, updated);
  return cloneTender(updated);
}

export function getTender(id: string): TenderCase | undefined {
  const tender = tenders.get(id.trim());
  return tender ? cloneTender(tender) : undefined;
}

export function listTenders(filter?: {
  collaborationRef?: string;
  status?: TenderStatus;
}): TenderCase[] {
  let result = [...tenders.values()];
  if (filter?.collaborationRef) {
    const cref = filter.collaborationRef.trim();
    result = result.filter((t) => t.collaborationRef === cref);
  }
  if (filter?.status) result = result.filter((t) => t.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTender);
}

export function clearTenders(): void {
  tenders.clear();
}
