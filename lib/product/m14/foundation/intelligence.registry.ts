/**
 * Product M14 — Intelligence lens in-memory registry
 */

import {
  INTELLIGENCE_LENS_STATUSES,
  PRODUCT_INTELLIGENCE_FOUNDATION_BASE,
} from "./intelligence.constants";
import { validateIntelligenceLensInput } from "./intelligence.metadata";
import type {
  IntelligenceLens,
  IntelligenceLensKind,
  IntelligenceLensStatus,
  RegisterIntelligenceLensInput,
  UpdateIntelligenceLensStatusInput,
} from "./intelligence.types";

const lenses = new Map<string, IntelligenceLens>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneLens(lens: IntelligenceLens): IntelligenceLens {
  return { ...lens, metadata: { ...lens.metadata } };
}

export function registerIntelligenceLens(
  input: RegisterIntelligenceLensInput,
): IntelligenceLens {
  const validation = validateIntelligenceLensInput(input);
  if (!validation.ok) {
    const first = validation.issues[0];
    throw new Error(
      `invalid intelligence lens: ${first?.field} ${first?.message}`,
    );
  }

  const lensKey = input.lensKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  const osBaselineRef = (
    input.osBaselineRef ?? PRODUCT_INTELLIGENCE_FOUNDATION_BASE
  )
    .trim()
    .toLowerCase();

  if (keys.has(lensKey)) {
    throw new Error(`lensKey already exists: ${lensKey}`);
  }

  const id = input.id?.trim() || createId("intlns");
  if (lenses.has(id)) throw new Error(`lens already exists: ${id}`);

  const now = nowIso();
  const lens: IntelligenceLens = {
    id,
    lensKey,
    kind: input.kind,
    status: INTELLIGENCE_LENS_STATUSES[0],
    scope: input.scope,
    title,
    summary,
    osBaselineRef,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  lenses.set(id, lens);
  keys.set(lensKey, id);
  return cloneLens(lens);
}

export function updateIntelligenceLensStatus(
  input: UpdateIntelligenceLensStatusInput,
): IntelligenceLens {
  const lensId = input.lensId.trim();
  if (!lensId) throw new Error("lens.lensId is required");
  if (
    !(INTELLIGENCE_LENS_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid lens status: ${input.status}`);
  }

  const existing = lenses.get(lensId);
  if (!existing) throw new Error(`lens not found: ${lensId}`);

  const updated: IntelligenceLens = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  lenses.set(lensId, updated);
  return cloneLens(updated);
}

export function getIntelligenceLens(id: string): IntelligenceLens | undefined {
  const lens = lenses.get(id.trim());
  return lens ? cloneLens(lens) : undefined;
}

export function getIntelligenceLensByKey(
  lensKey: string,
): IntelligenceLens | undefined {
  const id = keys.get(lensKey.trim().toUpperCase());
  return id ? getIntelligenceLens(id) : undefined;
}

export function listIntelligenceLenses(filter?: {
  kind?: IntelligenceLensKind;
  status?: IntelligenceLensStatus;
}): IntelligenceLens[] {
  let result = [...lenses.values()];
  if (filter?.kind) result = result.filter((l) => l.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((l) => l.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.lensKey.localeCompare(b.lensKey))
    .map(cloneLens);
}

export function clearIntelligenceLenses(): void {
  lenses.clear();
  keys.clear();
}
