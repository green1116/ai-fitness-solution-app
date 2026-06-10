import { runPaymentReadinessDashboardRuntime } from "./dashboard";
import { runPaymentEventsRuntime } from "./events";
import { runPaymentGatewayRuntime } from "./gateway";
import { runInvoiceSettlementRuntime } from "./invoice-settlement";
import type { PaymentReadinessEvidence } from "./shared/types";
import { PAYMENT_READINESS_VERSION } from "./shared/types";
import { runSubscriptionSyncRuntime } from "./subscription-sync";
import { runWebhookContractRuntime } from "./webhook";

export const PAYMENT_READINESS_DOMAINS = [
  "payment-gateway",
  "payment-events",
  "webhook-contract",
  "subscription-sync",
  "invoice-settlement",
  "payment-readiness",
] as const;

export function buildPaymentReadinessEvidence(input?: {
  deploymentId?: string;
}): PaymentReadinessEvidence {
  const deploymentId = input?.deploymentId ?? "payment-readiness-default";

  const runtimes = [
    runPaymentGatewayRuntime({ deploymentId }),
    runPaymentEventsRuntime({ deploymentId }),
    runWebhookContractRuntime({ deploymentId }),
    runSubscriptionSyncRuntime({ deploymentId }),
    runInvoiceSettlementRuntime({ deploymentId }),
    runPaymentReadinessDashboardRuntime({ deploymentId }),
  ];

  const allSuccess = runtimes.every((runtime) => runtime.status === "success");
  if (!allSuccess) {
    const failed = runtimes
      .filter((runtime) => runtime.status !== "success")
      .map((runtime) => runtime.domain);
    throw new Error(`Payment readiness evidence incomplete: ${failed.join(", ")}`);
  }

  return {
    evidenceId: `evidence-payment-readiness-${deploymentId}`,
    version: PAYMENT_READINESS_VERSION,
    domains: [...PAYMENT_READINESS_DOMAINS],
    runtimes: runtimes.map((runtime) => ({
      domain: runtime.domain,
      runtimeId: runtime.runtimeId,
      status: runtime.status,
      stageCount: runtime.stages.length,
      summary: runtime.summary,
    })),
    generatedAt: new Date().toISOString(),
    summary: `payment-readiness-evidence domains=${PAYMENT_READINESS_DOMAINS.length} allSuccess=true`,
  };
}
