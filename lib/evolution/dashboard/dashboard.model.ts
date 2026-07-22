/**
 * Evolution P4 — Intelligence Dashboard Model
 * Binds predictive / autonomous CS / growth / ops control
 */

import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { getExecutiveOpsDashboard } from "../../operations/control/control.dashboard";
import { getOperationsOrchestration } from "../../operations/control/control.orchestration";
import { getGrowthDashboard } from "../../operations/growth/growth.dashboard";
import { getCustomerIntelligenceProfile } from "../customer/customer.intelligence";
import { getPredictionModel } from "../predictive/predictive.model";
import { DASHBOARD_SCOPES } from "./dashboard.constants";
import type {
  CreateIntelligenceDashboardInput,
  DashboardScope,
  IntelligenceDashboard,
} from "./dashboard.types";

const dashboards = new Map<string, IntelligenceDashboard>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDashboard(
  dashboard: IntelligenceDashboard,
): IntelligenceDashboard {
  return { ...dashboard, metadata: { ...dashboard.metadata } };
}

export function createIntelligenceDashboard(
  input: CreateIntelligenceDashboardInput,
): IntelligenceDashboard {
  const name = input.name.trim();
  const productId = input.productId.trim();
  const orchestrationId = input.orchestrationId.trim();

  if (!name) throw new Error("intelligenceDashboard.name is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const orch = getOperationsOrchestration(orchestrationId);
  if (!orch || orch.productId !== productId) {
    throw new Error(`operations orchestration not found: ${orchestrationId}`);
  }

  let growthScore = 55;
  if (input.growthDashboardId) {
    const dash = getGrowthDashboard(input.growthDashboardId.trim());
    if (!dash || dash.productId !== productId) {
      throw new Error(
        `growth dashboard not found: ${input.growthDashboardId}`,
      );
    }
    growthScore = dash.growthScore;
  }

  let predictiveConfidence = 55;
  if (input.predictionModelId) {
    const model = getPredictionModel(input.predictionModelId.trim());
    if (!model || model.productId !== productId) {
      throw new Error(
        `prediction model not found: ${input.predictionModelId}`,
      );
    }
    predictiveConfidence = model.confidence;
  }

  let customerScore = 55;
  if (input.customerIntelligenceId) {
    const cs = getCustomerIntelligenceProfile(
      input.customerIntelligenceId.trim(),
    );
    if (!cs || cs.productId !== productId) {
      throw new Error(
        `customer intelligence profile not found: ${input.customerIntelligenceId}`,
      );
    }
    customerScore = cs.intelligenceScore;
  }

  let opsScore = 55;
  if (input.executiveOpsDashboardId) {
    const exec = getExecutiveOpsDashboard(
      input.executiveOpsDashboardId.trim(),
    );
    if (!exec || exec.productId !== productId) {
      throw new Error(
        `executive ops dashboard not found: ${input.executiveOpsDashboardId}`,
      );
    }
    if (exec.orchestrationId !== orchestrationId) {
      throw new Error(
        "executive ops dashboard orchestration mismatch",
      );
    }
    opsScore = exec.executiveScore;
  }

  const scope: DashboardScope = input.scope ?? "ENTERPRISE";
  if (!(DASHBOARD_SCOPES as readonly string[]).includes(scope)) {
    throw new Error(`invalid dashboard scope: ${scope}`);
  }

  const compositeScore = Math.round(
    Math.max(
      20,
      Math.min(
        98,
        predictiveConfidence * 0.25 +
          customerScore * 0.25 +
          growthScore * 0.25 +
          opsScore * 0.25,
      ),
    ),
  );

  const id = input.id?.trim() || createId("intdash");
  if (dashboards.has(id)) {
    throw new Error(`intelligence dashboard already exists: ${id}`);
  }

  const now = nowIso();
  const dashboard: IntelligenceDashboard = {
    id,
    name,
    productId,
    scope,
    orchestrationId,
    growthDashboardId: input.growthDashboardId?.trim() || undefined,
    predictionModelId: input.predictionModelId?.trim() || undefined,
    customerIntelligenceId: input.customerIntelligenceId?.trim() || undefined,
    executiveOpsDashboardId:
      input.executiveOpsDashboardId?.trim() || undefined,
    compositeScore,
    detail: `scope=${scope} composite=${compositeScore}`,
    metadata: {
      ...(input.metadata ?? {}),
      growthScore,
      predictiveConfidence,
      customerScore,
      opsScore,
    },
    createdAt: now,
    updatedAt: now,
  };
  dashboards.set(id, dashboard);
  return cloneDashboard(dashboard);
}

export function getIntelligenceDashboard(
  id: string,
): IntelligenceDashboard | undefined {
  const dashboard = dashboards.get(id.trim());
  return dashboard ? cloneDashboard(dashboard) : undefined;
}

export function listIntelligenceDashboards(filter?: {
  productId?: string;
  orchestrationId?: string;
}): IntelligenceDashboard[] {
  let result = [...dashboards.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((d) => d.productId === pid);
  }
  if (filter?.orchestrationId) {
    const oid = filter.orchestrationId.trim();
    result = result.filter((d) => d.orchestrationId === oid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDashboard);
}

export function clearIntelligenceDashboards(): void {
  dashboards.clear();
}
