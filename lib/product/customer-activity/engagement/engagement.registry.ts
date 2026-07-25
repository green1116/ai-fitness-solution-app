/**
 * Product Customer Activity — Engagement registry
 */

import { ENGAGEMENT_LEVELS } from "../activity/activity.constants";
import type {
  CustomerActivityEngagement,
  EngagementLevel,
  ScoreEngagementInput,
} from "./engagement.types";

const engagements = new Map<string, CustomerActivityEngagement>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEngagement(
  engagement: CustomerActivityEngagement,
): CustomerActivityEngagement {
  return { ...engagement, metadata: { ...engagement.metadata } };
}

export function scoreEngagement(
  input: ScoreEngagementInput,
): CustomerActivityEngagement {
  const customerId = input.customerId.trim();
  if (!customerId) throw new Error("engagement.customerId is required");
  if (!(ENGAGEMENT_LEVELS as readonly string[]).includes(input.level)) {
    throw new Error(`invalid engagement level: ${input.level}`);
  }
  if (!Number.isFinite(input.score) || input.score < 0) {
    throw new Error("engagement.score must be a non-negative number");
  }

  const existing = [...engagements.values()].find(
    (e) => e.customerId === customerId,
  );
  const id = input.id?.trim() || existing?.id || createId("cacteg");
  if (engagements.has(id) && existing && existing.id !== id) {
    throw new Error(`engagement already exists: ${id}`);
  }

  const engagement: CustomerActivityEngagement = {
    id,
    customerId,
    level: input.level,
    score: input.score,
    detail: `level=${input.level} score=${input.score}`,
    metadata: { ...(input.metadata ?? existing?.metadata ?? {}) },
    scoredAt: nowIso(),
  };
  engagements.set(id, engagement);
  return cloneEngagement(engagement);
}

export function getEngagement(
  id: string,
): CustomerActivityEngagement | undefined {
  const engagement = engagements.get(id.trim());
  return engagement ? cloneEngagement(engagement) : undefined;
}

export function listEngagements(filter?: {
  customerId?: string;
  level?: EngagementLevel;
}): CustomerActivityEngagement[] {
  let result = [...engagements.values()];
  if (filter?.customerId) {
    const customerId = filter.customerId.trim();
    result = result.filter((e) => e.customerId === customerId);
  }
  if (filter?.level) result = result.filter((e) => e.level === filter.level);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEngagement);
}

export function clearEngagements(): void {
  engagements.clear();
}
