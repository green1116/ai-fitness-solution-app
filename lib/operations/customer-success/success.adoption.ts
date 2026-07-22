/**
 * Post-Launch P2 — Adoption Tracking
 */

import { ADOPTION_STAGES } from "./success.constants";
import {
  getCustomerHealthProfile,
  reassessCustomerHealth,
} from "./success.health";
import type {
  AdoptionRecord,
  AdoptionStage,
  RecordAdoptionInput,
} from "./success.types";

const records = new Map<string, AdoptionRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRecord(record: AdoptionRecord): AdoptionRecord {
  return { ...record };
}

export function recordAdoption(input: RecordAdoptionInput): AdoptionRecord {
  const customerHealthProfileId = input.customerHealthProfileId.trim();
  const stage = input.stage;

  if (!getCustomerHealthProfile(customerHealthProfileId)) {
    throw new Error(
      `customer health profile not found: ${customerHealthProfileId}`,
    );
  }
  if (!(ADOPTION_STAGES as readonly string[]).includes(stage)) {
    throw new Error(`invalid adoption stage: ${stage}`);
  }
  if (input.featureCount < 0 || input.activeUsers < 0) {
    throw new Error("adoption counts must be non-negative");
  }

  const id = input.id?.trim() || createId("adoption");
  if (records.has(id)) throw new Error(`adoption record already exists: ${id}`);

  const record: AdoptionRecord = {
    id,
    customerHealthProfileId,
    stage,
    featureCount: input.featureCount,
    activeUsers: input.activeUsers,
    detail: input.detail?.trim() || `stage=${stage}`,
    recordedAt: nowIso(),
  };
  records.set(id, record);

  // Boost health when adoption advances
  const boost =
    stage === "EXPANDING"
      ? 20
      : stage === "ADOPTED"
        ? 15
        : stage === "ADOPTING"
          ? 10
          : 5;
  const profile = getCustomerHealthProfile(customerHealthProfileId)!;
  reassessCustomerHealth(profile.id, {
    score: Math.min(100, profile.score + boost),
    detail: `adoption ${stage}`,
  });

  return cloneRecord(record);
}

export function getAdoptionRecord(id: string): AdoptionRecord | undefined {
  const record = records.get(id.trim());
  return record ? cloneRecord(record) : undefined;
}

export function listAdoptionRecords(filter?: {
  customerHealthProfileId?: string;
  stage?: AdoptionStage;
}): AdoptionRecord[] {
  let result = [...records.values()];
  if (filter?.customerHealthProfileId) {
    const pid = filter.customerHealthProfileId.trim();
    result = result.filter((r) => r.customerHealthProfileId === pid);
  }
  if (filter?.stage) result = result.filter((r) => r.stage === filter.stage);
  return result
    .slice()
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
    .map(cloneRecord);
}

export function getLatestAdoption(
  customerHealthProfileId: string,
): AdoptionRecord | undefined {
  return listAdoptionRecords({ customerHealthProfileId })[0];
}

export function clearAdoptionRecords(): void {
  records.clear();
}
