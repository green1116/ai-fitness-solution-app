/**
 * Product Relationship — Classification registry
 */

import { CLASSIFICATION_TIERS } from "../management/management.constants";
import { getBond } from "../bond/bond.registry";
import type {
  ClassificationTier,
  ClassifyBondInput,
  RelationshipClassification,
} from "./classification.types";

const classifications = new Map<string, RelationshipClassification>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneClassification(
  classification: RelationshipClassification,
): RelationshipClassification {
  return { ...classification, metadata: { ...classification.metadata } };
}

export function classifyBond(
  input: ClassifyBondInput,
): RelationshipClassification {
  const bondId = input.bondId.trim();
  if (!bondId) throw new Error("classification.bondId is required");
  if (!(CLASSIFICATION_TIERS as readonly string[]).includes(input.tier)) {
    throw new Error(`invalid classification tier: ${input.tier}`);
  }
  if (!getBond(bondId)) throw new Error(`bond not found: ${bondId}`);

  const existing = [...classifications.values()].find(
    (c) => c.bondId === bondId,
  );
  const id = input.id?.trim() || existing?.id || createId("relcls");
  if (classifications.has(id) && existing && existing.id !== id) {
    throw new Error(`classification already exists: ${id}`);
  }

  const classification: RelationshipClassification = {
    id,
    bondId,
    tier: input.tier,
    detail: `tier=${input.tier}`,
    metadata: { ...(input.metadata ?? existing?.metadata ?? {}) },
    classifiedAt: nowIso(),
  };
  classifications.set(id, classification);
  return cloneClassification(classification);
}

export function getClassification(
  id: string,
): RelationshipClassification | undefined {
  const classification = classifications.get(id.trim());
  return classification ? cloneClassification(classification) : undefined;
}

export function listClassifications(filter?: {
  bondId?: string;
  tier?: ClassificationTier;
}): RelationshipClassification[] {
  let result = [...classifications.values()];
  if (filter?.bondId) {
    const bondId = filter.bondId.trim();
    result = result.filter((c) => c.bondId === bondId);
  }
  if (filter?.tier) result = result.filter((c) => c.tier === filter.tier);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneClassification);
}

export function clearClassifications(): void {
  classifications.clear();
}
