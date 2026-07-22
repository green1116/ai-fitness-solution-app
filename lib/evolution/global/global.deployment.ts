/**
 * Evolution P5 — Deployment Intelligence
 * Integrates deployment package, ops control, intelligence dashboard
 */

import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { getDeploymentPackage } from "../../product/e12/deployment/deployment.package";
import { getOperationsOrchestration } from "../../operations/control/control.orchestration";
import { aggregateOperationsHealth } from "../../operations/control/control.health";
import { getIntelligenceDashboard } from "../dashboard/dashboard.model";
import { DEPLOYMENT_INTELLIGENCE_MODES } from "./global.constants";
import { getMultiRegionProfile } from "./global.region";
import type {
  CreateDeploymentIntelligenceInput,
  DeploymentIntelligence,
  DeploymentIntelligenceMode,
} from "./global.types";

const intelligences = new Map<string, DeploymentIntelligence>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneIntelligence(
  item: DeploymentIntelligence,
): DeploymentIntelligence {
  return {
    ...item,
    regionProfileIds: [...item.regionProfileIds],
    metadata: { ...item.metadata },
  };
}

export function createDeploymentIntelligence(
  input: CreateDeploymentIntelligenceInput,
): DeploymentIntelligence {
  const name = input.name.trim();
  const productId = input.productId.trim();
  const deploymentPackageId = input.deploymentPackageId.trim();
  const orchestrationId = input.orchestrationId.trim();

  if (!name) throw new Error("deploymentIntelligence.name is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const pkg = getDeploymentPackage(deploymentPackageId);
  if (!pkg || pkg.productId !== productId) {
    throw new Error(`deployment package not found: ${deploymentPackageId}`);
  }

  const orch = getOperationsOrchestration(orchestrationId);
  if (!orch || orch.productId !== productId) {
    throw new Error(`operations orchestration not found: ${orchestrationId}`);
  }

  let dashboardScore = 55;
  if (input.intelligenceDashboardId) {
    const dash = getIntelligenceDashboard(
      input.intelligenceDashboardId.trim(),
    );
    if (!dash || dash.productId !== productId) {
      throw new Error(
        `intelligence dashboard not found: ${input.intelligenceDashboardId}`,
      );
    }
    if (dash.orchestrationId !== orchestrationId) {
      throw new Error("intelligence dashboard orchestration mismatch");
    }
    dashboardScore = dash.compositeScore;
  }

  const regionProfileIds = [
    ...new Set(input.regionProfileIds.map((id) => id.trim()).filter(Boolean)),
  ];
  if (regionProfileIds.length < 1) {
    throw new Error("at least one region profile is required");
  }

  let regionWeight = 0;
  for (const regionId of regionProfileIds) {
    const region = getMultiRegionProfile(regionId);
    if (!region || region.productId !== productId) {
      throw new Error(`multi-region profile not found: ${regionId}`);
    }
    if (region.deploymentPackageId !== deploymentPackageId) {
      throw new Error(
        `region profile package mismatch: ${regionId}`,
      );
    }
    regionWeight += region.weight;
  }
  regionWeight = Math.round(regionWeight / regionProfileIds.length);

  const mode: DeploymentIntelligenceMode = input.mode ?? "OPTIMIZE";
  if (!(DEPLOYMENT_INTELLIGENCE_MODES as readonly string[]).includes(mode)) {
    throw new Error(`invalid deployment intelligence mode: ${mode}`);
  }

  const opsHealth = aggregateOperationsHealth(orchestrationId);
  const intelligenceScore = Math.round(
    Math.max(
      20,
      Math.min(
        98,
        opsHealth.overallScore * 0.35 +
          dashboardScore * 0.35 +
          regionWeight * 0.3,
      ),
    ),
  );

  const id = input.id?.trim() || createId("deplintel");
  if (intelligences.has(id)) {
    throw new Error(`deployment intelligence already exists: ${id}`);
  }

  const now = nowIso();
  const item: DeploymentIntelligence = {
    id,
    name,
    productId,
    deploymentPackageId,
    orchestrationId,
    intelligenceDashboardId:
      input.intelligenceDashboardId?.trim() || undefined,
    mode,
    regionProfileIds,
    intelligenceScore,
    detail: `score=${intelligenceScore} regions=${regionProfileIds.length} mode=${mode}`,
    metadata: {
      ...(input.metadata ?? {}),
      opsScore: opsHealth.overallScore,
      dashboardScore,
      regionWeight,
    },
    createdAt: now,
    updatedAt: now,
  };
  intelligences.set(id, item);
  return cloneIntelligence(item);
}

export function getDeploymentIntelligence(
  id: string,
): DeploymentIntelligence | undefined {
  const item = intelligences.get(id.trim());
  return item ? cloneIntelligence(item) : undefined;
}

export function listDeploymentIntelligences(filter?: {
  productId?: string;
  deploymentPackageId?: string;
}): DeploymentIntelligence[] {
  let result = [...intelligences.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((i) => i.productId === pid);
  }
  if (filter?.deploymentPackageId) {
    const did = filter.deploymentPackageId.trim();
    result = result.filter((i) => i.deploymentPackageId === did);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneIntelligence);
}

export function clearDeploymentIntelligences(): void {
  intelligences.clear();
}
