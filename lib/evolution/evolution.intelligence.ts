/**
 * Evolution P1 — Operations Intelligence Model
 * Integrates ops control plane, growth, cloud, SLA
 */

import { checkRuntimeHealth } from "../cloud-runtime/e11/runtime/cloud.health";
import { getProductIdentity } from "../product/e12/identity/product.identity";
import { getGrowthDashboard } from "../operations/growth/growth.dashboard";
import { getOperationsOrchestration } from "../operations/control/control.orchestration";
import { aggregateOperationsHealth } from "../operations/control/control.health";
import { computeSupportResponseMetrics } from "../launch/support/support.metrics";
import { getSupportSlaProfile } from "../launch/support/support.profile";
import { INTELLIGENCE_SIGNAL_KINDS } from "./evolution.constants";
import type {
  CreateOperationsIntelligenceInput,
  IntelligenceSignal,
  IntelligenceSignalKind,
  OperationsIntelligenceProfile,
} from "./evolution.types";

const profiles = new Map<string, OperationsIntelligenceProfile>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneProfile(
  profile: OperationsIntelligenceProfile,
): OperationsIntelligenceProfile {
  return {
    ...profile,
    signals: profile.signals.map((s) => ({ ...s })),
    metadata: { ...profile.metadata },
  };
}

function signal(
  kind: IntelligenceSignalKind,
  score: number,
  detail: string,
): IntelligenceSignal {
  if (!(INTELLIGENCE_SIGNAL_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid intelligence signal kind: ${kind}`);
  }
  return {
    kind,
    score: Math.max(0, Math.min(100, Math.round(score))),
    detail,
  };
}

export function createOperationsIntelligenceProfile(
  input: CreateOperationsIntelligenceInput,
): OperationsIntelligenceProfile {
  const name = input.name.trim();
  const productId = input.productId.trim();
  const orchestrationId = input.orchestrationId.trim();

  if (!name) throw new Error("intelligenceProfile.name is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const orch = getOperationsOrchestration(orchestrationId);
  if (!orch || orch.productId !== productId) {
    throw new Error(`operations orchestration not found: ${orchestrationId}`);
  }

  if (input.growthDashboardId) {
    const dash = getGrowthDashboard(input.growthDashboardId.trim());
    if (!dash || dash.productId !== productId) {
      throw new Error(
        `growth dashboard not found: ${input.growthDashboardId}`,
      );
    }
  }

  if (input.supportSlaProfileId) {
    const sla = getSupportSlaProfile(input.supportSlaProfileId.trim());
    if (!sla || sla.productId !== productId) {
      throw new Error(
        `support sla profile not found: ${input.supportSlaProfileId}`,
      );
    }
  }

  const health = aggregateOperationsHealth(orch.id);
  const signals: IntelligenceSignal[] = [];

  signals.push(
    signal(
      "RELIABILITY",
      health.overallScore,
      `ops health=${health.overallLevel}`,
    ),
  );
  signals.push(
    signal(
      "EFFICIENCY",
      Math.max(0, health.overallScore - health.degradedDomains.length * 8),
      `degraded=${health.degradedDomains.length}`,
    ),
  );

  let growthScore = 60;
  if (input.growthDashboardId) {
    const dash = getGrowthDashboard(input.growthDashboardId.trim());
    growthScore = dash?.growthScore ?? 60;
  }
  signals.push(signal("GROWTH", growthScore, `growthScore=${growthScore}`));

  let slaScore = 70;
  if (input.supportSlaProfileId) {
    try {
      const sla = computeSupportResponseMetrics(input.supportSlaProfileId.trim());
      slaScore =
        sla.slaComplianceRate != null
          ? Math.round(sla.slaComplianceRate)
          : Math.max(40, 90 - sla.openCount * 15);
      signals.push(
        signal(
          "COST",
          Math.max(30, 100 - sla.openCount * 10),
          `slaOpen=${sla.openCount} compliance=${sla.slaComplianceRate ?? "n/a"}`,
        ),
      );
    } catch {
      signals.push(signal("COST", 65, "sla metrics unavailable"));
    }
  } else {
    signals.push(signal("COST", 65, "sla unbound"));
  }

  let capacityScore = 70;
  if (input.cloudRuntimeId) {
    try {
      const report = checkRuntimeHealth(input.cloudRuntimeId.trim());
      capacityScore =
        report.level === "HEALTHY"
          ? 90
          : report.level === "DEGRADED"
            ? 55
            : report.level === "UNHEALTHY"
              ? 25
              : 40;
      signals.push(
        signal(
          "CAPACITY",
          capacityScore,
          `cloud=${report.level} runtime=${input.cloudRuntimeId}`,
        ),
      );
    } catch {
      signals.push(signal("CAPACITY", 50, "cloud health unavailable"));
    }
  } else {
    signals.push(signal("CAPACITY", 60, "cloud unbound"));
  }

  const intelligenceScore = Math.round(
    signals.reduce((sum, s) => sum + s.score, 0) / signals.length,
  );

  const id = input.id?.trim() || createId("opsintel");
  if (profiles.has(id)) {
    throw new Error(`operations intelligence profile already exists: ${id}`);
  }

  const now = nowIso();
  const profile: OperationsIntelligenceProfile = {
    id,
    name,
    productId,
    orchestrationId,
    growthDashboardId: input.growthDashboardId?.trim() || undefined,
    supportSlaProfileId: input.supportSlaProfileId?.trim() || undefined,
    cloudRuntimeId: input.cloudRuntimeId?.trim() || undefined,
    signals,
    intelligenceScore,
    detail: `intelligence=${intelligenceScore} signals=${signals.length}`,
    metadata: {
      ...(input.metadata ?? {}),
      slaScore,
      growthScore,
      capacityScore,
    },
    createdAt: now,
    updatedAt: now,
  };
  profiles.set(id, profile);
  return cloneProfile(profile);
}

export function getOperationsIntelligenceProfile(
  id: string,
): OperationsIntelligenceProfile | undefined {
  const profile = profiles.get(id.trim());
  return profile ? cloneProfile(profile) : undefined;
}

export function listOperationsIntelligenceProfiles(filter?: {
  productId?: string;
}): OperationsIntelligenceProfile[] {
  let result = [...profiles.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((p) => p.productId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneProfile);
}

export function clearOperationsIntelligenceProfiles(): void {
  profiles.clear();
}
