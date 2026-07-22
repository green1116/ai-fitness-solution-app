/**
 * Post-Launch P5 — Adoption Metrics
 * Integrates customer success adoption + engagement
 */

import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { getLatestAdoption } from "../customer-success/success.adoption";
import {
  getCustomerHealthProfile,
  listCustomerHealthProfiles,
} from "../customer-success/success.health";
import { computeEngagementMetrics } from "../customer-success/success.metrics";
import { GROWTH_TRENDS } from "./growth.constants";
import type {
  ComputeGrowthAdoptionInput,
  GrowthAdoptionMetrics,
  GrowthTrend,
} from "./growth.types";

const metricsStore = new Map<string, GrowthAdoptionMetrics>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneMetrics(metrics: GrowthAdoptionMetrics): GrowthAdoptionMetrics {
  return { ...metrics };
}

function deriveTrend(engagementScore: number, activeUsers: number): GrowthTrend {
  if (engagementScore >= 70 && activeUsers >= 5) return "UP";
  if (engagementScore >= 40) return "FLAT";
  if (engagementScore > 0) return "DOWN";
  return "UNKNOWN";
}

export function computeGrowthAdoptionMetrics(
  input: ComputeGrowthAdoptionInput,
): GrowthAdoptionMetrics {
  const productId = input.productId.trim();
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  let customerHealthProfileId = input.customerHealthProfileId?.trim();
  if (!customerHealthProfileId) {
    const profiles = listCustomerHealthProfiles({ productId });
    customerHealthProfileId = profiles[0]?.id;
  }

  let adoptionStage: string | undefined;
  let activeUsers = 0;
  let featureCount = 0;
  let engagementScore = 0;
  let healthScore = 0;

  if (customerHealthProfileId) {
    const health = getCustomerHealthProfile(customerHealthProfileId);
    if (!health || health.productId !== productId) {
      throw new Error(
        `customer health profile not found: ${customerHealthProfileId}`,
      );
    }
    healthScore = health.score;
    const adoption = getLatestAdoption(health.id);
    adoptionStage = adoption?.stage;
    activeUsers = adoption?.activeUsers ?? 0;
    featureCount = adoption?.featureCount ?? 0;
    try {
      engagementScore = computeEngagementMetrics(health.id).engagementScore;
    } catch {
      engagementScore = Math.round(health.score * 0.6);
    }
  }

  const trend = deriveTrend(engagementScore, activeUsers);
  if (!(GROWTH_TRENDS as readonly string[]).includes(trend)) {
    throw new Error(`invalid growth trend: ${trend}`);
  }

  const id = input.id?.trim() || createId("gadopt");
  if (metricsStore.has(id)) {
    throw new Error(`growth adoption metrics already exist: ${id}`);
  }

  const metrics: GrowthAdoptionMetrics = {
    id,
    productId,
    customerHealthProfileId,
    adoptionStage,
    activeUsers,
    featureCount,
    engagementScore,
    healthScore,
    trend,
    detail: `stage=${adoptionStage ?? "none"} users=${activeUsers} engagement=${engagementScore}`,
    computedAt: nowIso(),
  };
  metricsStore.set(id, metrics);
  return cloneMetrics(metrics);
}

export function getGrowthAdoptionMetrics(
  id: string,
): GrowthAdoptionMetrics | undefined {
  const metrics = metricsStore.get(id.trim());
  return metrics ? cloneMetrics(metrics) : undefined;
}

export function listGrowthAdoptionMetrics(filter?: {
  productId?: string;
}): GrowthAdoptionMetrics[] {
  let result = [...metricsStore.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((m) => m.productId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneMetrics);
}

export function clearGrowthAdoptionMetrics(): void {
  metricsStore.clear();
}
