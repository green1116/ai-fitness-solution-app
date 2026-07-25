/**
 * Product Metering — Rating registry
 */

import { getAggregate } from "../aggregate/aggregate.registry";
import type {
  RateUsageInput,
  RatingResult,
  UsageRating,
} from "./rating.types";

const ratings = new Map<string, UsageRating>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRating(rating: UsageRating): UsageRating {
  return { ...rating, metadata: { ...rating.metadata } };
}

export function rateUsage(input: RateUsageInput): UsageRating {
  const aggregateId = input.aggregateId.trim();
  if (!aggregateId) throw new Error("rating.aggregateId is required");
  if (!Number.isFinite(input.unitRateCents) || input.unitRateCents < 0) {
    throw new Error("rating.unitRateCents must be >= 0");
  }

  const aggregate = getAggregate(aggregateId);
  if (!aggregate) throw new Error(`aggregate not found: ${aggregateId}`);

  let result: RatingResult = "RATED";
  let amountCents = aggregate.totalQuantity * input.unitRateCents;
  if (input.unitRateCents === 0 || aggregate.totalQuantity === 0) {
    result = "ZERO";
    amountCents = 0;
  }

  const id = input.id?.trim() || createId("metrat");
  if (ratings.has(id)) throw new Error(`rating already exists: ${id}`);

  const rating: UsageRating = {
    id,
    aggregateId,
    meterId: aggregate.meterId,
    accountId: aggregate.accountId,
    unitRateCents: input.unitRateCents,
    quantity: aggregate.totalQuantity,
    amountCents,
    result,
    detail: `result=${result} amount=${amountCents}`,
    metadata: { ...(input.metadata ?? {}) },
    ratedAt: nowIso(),
  };
  ratings.set(id, rating);
  return cloneRating(rating);
}

export function getRating(id: string): UsageRating | undefined {
  const rating = ratings.get(id.trim());
  return rating ? cloneRating(rating) : undefined;
}

export function listRatings(filter?: {
  accountId?: string;
  result?: RatingResult;
}): UsageRating[] {
  let result = [...ratings.values()];
  if (filter?.accountId) {
    const accountId = filter.accountId.trim();
    result = result.filter((r) => r.accountId === accountId);
  }
  if (filter?.result) {
    result = result.filter((r) => r.result === filter.result);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRating);
}

export function clearRatings(): void {
  ratings.clear();
}
