import { runEnterpriseDashboardRuntime } from "./dashboard";
import { runPermissionRuntime } from "./permission";
import { runRoleRuntime } from "./role";
import { runSeatRuntime } from "./seat";
import type { EnterpriseSaasEvidence } from "./shared/types";
import { ENTERPRISE_SAAS_VERSION } from "./shared/types";
import { runTenantRuntime } from "./tenant";
import { runUsageRuntime } from "./usage";
import { runUserRuntime } from "./user";
import { runWorkspaceRuntime } from "./workspace";

export const ENTERPRISE_SAAS_DOMAINS = [
  "tenant",
  "workspace",
  "user",
  "role",
  "permission",
  "seat",
  "usage",
  "enterprise-dashboard",
] as const;

export function buildEnterpriseSaasEvidence(input?: {
  deploymentId?: string;
}): EnterpriseSaasEvidence {
  const deploymentId = input?.deploymentId ?? "enterprise-saas-default";

  const runtimes = [
    runTenantRuntime({ deploymentId }),
    runWorkspaceRuntime({ deploymentId }),
    runUserRuntime({ deploymentId }),
    runRoleRuntime({ deploymentId }),
    runPermissionRuntime({ deploymentId }),
    runSeatRuntime({ deploymentId }),
    runUsageRuntime({ deploymentId }),
    runEnterpriseDashboardRuntime({ deploymentId }),
  ];

  const allSuccess = runtimes.every((runtime) => runtime.status === "success");
  if (!allSuccess) {
    const failed = runtimes
      .filter((runtime) => runtime.status !== "success")
      .map((runtime) => runtime.domain);
    throw new Error(`Enterprise SaaS evidence incomplete: ${failed.join(", ")}`);
  }

  return {
    evidenceId: `evidence-enterprise-saas-${deploymentId}`,
    version: ENTERPRISE_SAAS_VERSION,
    domains: [...ENTERPRISE_SAAS_DOMAINS],
    runtimes: runtimes.map((runtime) => ({
      domain: runtime.domain,
      runtimeId: runtime.runtimeId,
      status: runtime.status,
      stageCount: runtime.stages.length,
      summary: runtime.summary,
    })),
    generatedAt: new Date().toISOString(),
    summary: `enterprise-saas-evidence domains=${ENTERPRISE_SAAS_DOMAINS.length} allSuccess=true`,
  };
}
