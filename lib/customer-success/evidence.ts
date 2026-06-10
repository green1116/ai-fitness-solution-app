import { runSuccessAuditRuntime } from "./audit";
import { runAdoptionRuntime } from "./adoption";
import { runCustomerSuccessDashboardRuntime } from "./dashboard";
import { runExpansionRuntime } from "./expansion";
import { runCustomerHealthRuntime } from "./health";
import { runSuccessPlaybookRuntime } from "./playbook";
import { runRenewalRiskRuntime } from "./renewal-risk";
import type { CustomerSuccessEvidence } from "./shared/types";
import { CUSTOMER_SUCCESS_VERSION } from "./shared/types";

export const CUSTOMER_SUCCESS_DOMAINS = [
  "customer-health",
  "adoption-runtime",
  "expansion-runtime",
  "renewal-risk",
  "success-playbook",
  "success-audit",
  "customer-success-dashboard",
] as const;

export function buildCustomerSuccessEvidence(input?: {
  deploymentId?: string;
}): CustomerSuccessEvidence {
  const deploymentId = input?.deploymentId ?? "customer-success-default";

  const runtimes = [
    runCustomerHealthRuntime({ deploymentId }),
    runAdoptionRuntime({ deploymentId }),
    runExpansionRuntime({ deploymentId }),
    runRenewalRiskRuntime({ deploymentId }),
    runSuccessPlaybookRuntime({ deploymentId }),
    runSuccessAuditRuntime({ deploymentId }),
    runCustomerSuccessDashboardRuntime({ deploymentId }),
  ];

  const allSuccess = runtimes.every((runtime) => runtime.status === "success");
  if (!allSuccess) {
    const failed = runtimes
      .filter((runtime) => runtime.status !== "success")
      .map((runtime) => runtime.domain);
    throw new Error(`Customer success evidence incomplete: ${failed.join(", ")}`);
  }

  return {
    evidenceId: `evidence-customer-success-${deploymentId}`,
    version: CUSTOMER_SUCCESS_VERSION,
    domains: [...CUSTOMER_SUCCESS_DOMAINS],
    runtimes: runtimes.map((runtime) => ({
      domain: runtime.domain,
      runtimeId: runtime.runtimeId,
      status: runtime.status,
      stageCount: runtime.stages.length,
      summary: runtime.summary,
    })),
    generatedAt: new Date().toISOString(),
    summary: `customer-success-evidence domains=${CUSTOMER_SUCCESS_DOMAINS.length} allSuccess=true`,
  };
}
