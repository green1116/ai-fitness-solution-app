import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  EnterpriseSaasRuntimeResult,
  EnterpriseSaasStageResult,
} from "../shared/types";
import { ENTERPRISE_SAAS_VERSION } from "../shared/types";
import {
  buildEnterpriseDashboardPayload,
  buildEnterpriseDashboardSeatSummary,
  buildEnterpriseDashboardTenantSummary,
  buildEnterpriseDashboardUsageSummary,
  buildEnterpriseDashboardUserSummary,
  buildEnterpriseDashboardWorkspaceSummary,
} from "./builders";
import type { EnterpriseDashboardRuntimePayload } from "./types";
import { ENTERPRISE_DASHBOARD_RUNTIME_VERSION } from "./types";

export function validateEnterpriseDashboardRuntime(input?: {
  deploymentId?: string;
}): {
  summariesValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const tenant = buildEnterpriseDashboardTenantSummary({ deploymentId });
  const workspace = buildEnterpriseDashboardWorkspaceSummary({ deploymentId });
  const users = buildEnterpriseDashboardUserSummary({ deploymentId });
  const seats = buildEnterpriseDashboardSeatSummary({ deploymentId });
  const usage = buildEnterpriseDashboardUsageSummary({ deploymentId });

  return {
    summariesValid:
      tenant.tenantId.length > 0 &&
      workspace.workspaceId.length > 0 &&
      users.totalUsers > 0 &&
      seats.licensedSeats > 0 &&
      usage.plans >= 0,
  };
}

export function runEnterpriseDashboardRuntime(input?: {
  deploymentId?: string;
}): EnterpriseSaasRuntimeResult<EnterpriseDashboardRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const stages: EnterpriseSaasStageResult[] = [];

  const built = runStage(
    "enterprise-dashboard-summaries",
    "Enterprise Dashboard Summaries",
    () => buildEnterpriseDashboardPayload({ deploymentId }),
    stages,
  );

  const validation = runStage(
    "enterprise-dashboard-validate",
    "Enterprise Dashboard Validation",
    () => validateEnterpriseDashboardRuntime({ deploymentId }),
    stages,
  );

  if (!Object.values(validation).every(Boolean)) {
    throw new Error("Enterprise dashboard runtime validation failed");
  }

  const payload: EnterpriseDashboardRuntimePayload = {
    version: ENTERPRISE_DASHBOARD_RUNTIME_VERSION,
    saasVersion: ENTERPRISE_SAAS_VERSION,
    tenantSummary: built.tenantSummary,
    workspaceSummary: built.workspaceSummary,
    userSummary: built.userSummary,
    seatSummary: built.seatSummary,
    usageSummary: built.usageSummary,
    summary: built.summary,
  };

  return finalizeRuntime({
    domain: "enterprise-dashboard",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
