/**
 * Product Customer Insight — Recommendation registry
 */

import { INSIGHT_RECOMMENDATION_KINDS } from "../insight/insight.constants";
import type {
  CustomerInsightRecommendation,
  InsightRecommendationKind,
  IssueRecommendationInput,
} from "./recommendation.types";

const recommendations = new Map<string, CustomerInsightRecommendation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRecommendation(
  recommendation: CustomerInsightRecommendation,
): CustomerInsightRecommendation {
  return { ...recommendation, metadata: { ...recommendation.metadata } };
}

export function issueRecommendation(
  input: IssueRecommendationInput,
): CustomerInsightRecommendation {
  const customerId = input.customerId.trim();
  const action = input.action.trim();
  if (!customerId) throw new Error("recommendation.customerId is required");
  if (!action) throw new Error("recommendation.action is required");
  if (
    !(INSIGHT_RECOMMENDATION_KINDS as readonly string[]).includes(input.kind)
  ) {
    throw new Error(`invalid insight recommendation kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("cinrec");
  if (recommendations.has(id)) {
    throw new Error(`insight recommendation already exists: ${id}`);
  }

  const recommendation: CustomerInsightRecommendation = {
    id,
    customerId,
    kind: input.kind,
    action,
    detail: `kind=${input.kind}`,
    metadata: { ...(input.metadata ?? {}) },
    recommendedAt: nowIso(),
  };
  recommendations.set(id, recommendation);
  return cloneRecommendation(recommendation);
}

export function getRecommendation(
  id: string,
): CustomerInsightRecommendation | undefined {
  const recommendation = recommendations.get(id.trim());
  return recommendation ? cloneRecommendation(recommendation) : undefined;
}

export function listRecommendations(filter?: {
  customerId?: string;
  kind?: InsightRecommendationKind;
}): CustomerInsightRecommendation[] {
  let result = [...recommendations.values()];
  if (filter?.customerId) {
    const customerId = filter.customerId.trim();
    result = result.filter((r) => r.customerId === customerId);
  }
  if (filter?.kind) result = result.filter((r) => r.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRecommendation);
}

export function clearRecommendations(): void {
  recommendations.clear();
}
