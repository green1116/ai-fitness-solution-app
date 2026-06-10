import { runApprovalRuntime } from "./approval";
import { runCommercialDashboardRuntime } from "./dashboard";
import { runDownloadRuntime } from "./download";
import { runCustomerPortalRuntime } from "./customer-portal";
import { runDeliveryLedgerRuntime } from "./ledger";
import type { CommercialDeliveryEvidence } from "./shared/types";
import { COMMERCIAL_DELIVERY_VERSION } from "./shared/types";
import { runVersionRuntime } from "./version";
import { runDeliveryWorkspaceRuntime } from "./workspace";

export const COMMERCIAL_DELIVERY_DOMAINS = [
  "delivery-workspace",
  "customer-portal",
  "delivery-ledger",
  "version-runtime",
  "approval-runtime",
  "download-runtime",
  "commercial-dashboard",
] as const;

export function buildCommercialDeliveryEvidence(input?: {
  deploymentId?: string;
}): CommercialDeliveryEvidence {
  const deploymentId = input?.deploymentId ?? "commercial-delivery-default";

  const runtimes = [
    runDeliveryWorkspaceRuntime({ deploymentId }),
    runCustomerPortalRuntime({ deploymentId }),
    runDeliveryLedgerRuntime({ deploymentId }),
    runVersionRuntime({ deploymentId }),
    runApprovalRuntime({ deploymentId }),
    runDownloadRuntime({ deploymentId }),
    runCommercialDashboardRuntime({ deploymentId }),
  ];

  const allSuccess = runtimes.every((runtime) => runtime.status === "success");
  if (!allSuccess) {
    const failed = runtimes
      .filter((runtime) => runtime.status !== "success")
      .map((runtime) => runtime.domain);
    throw new Error(`Commercial delivery evidence incomplete: ${failed.join(", ")}`);
  }

  return {
    evidenceId: `evidence-commercial-delivery-${deploymentId}`,
    version: COMMERCIAL_DELIVERY_VERSION,
    domains: [...COMMERCIAL_DELIVERY_DOMAINS],
    runtimes: runtimes.map((runtime) => ({
      domain: runtime.domain,
      runtimeId: runtime.runtimeId,
      status: runtime.status,
      stageCount: runtime.stages.length,
      summary: runtime.summary,
    })),
    generatedAt: new Date().toISOString(),
    summary: `commercial-delivery-evidence domains=${COMMERCIAL_DELIVERY_DOMAINS.length} allSuccess=true`,
  };
}
