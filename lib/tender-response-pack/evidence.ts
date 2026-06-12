import { runComplianceAttachmentRuntime } from "./compliance-attachment";
import { runCommercialAttachmentRuntime } from "./commercial-attachment";
import { runEquipmentAttachmentRuntime } from "./equipment-attachment";
import { runResponsePackAssemblyRuntime } from "./response-pack-assembly";
import { runResponsePackContextRuntime } from "./response-pack-context";
import { runSubmissionReadinessRuntime } from "./submission-readiness";
import { runTenderResponseDashboardRuntime } from "./dashboard";
import { runVariantPackRuntime } from "./variant-pack";
import type { TenderResponsePackEvidence } from "./shared/types";
import { TENDER_RESPONSE_PACK_VERSION } from "./shared/types";

export const TENDER_RESPONSE_PACK_DOMAINS = [
  "response-pack-context",
  "compliance-attachment",
  "equipment-attachment",
  "commercial-attachment",
  "response-pack-assembly",
  "variant-pack",
  "submission-readiness",
  "tender-response-dashboard",
] as const;

export function buildTenderResponsePackEvidence(input?: {
  deploymentId?: string;
}): TenderResponsePackEvidence {
  const deploymentId = input?.deploymentId ?? "tender-response-pack-default";

  const runtimes = [
    runResponsePackContextRuntime({ deploymentId, bidderBrand: "Technogym" }),
    runComplianceAttachmentRuntime({ deploymentId, bidderBrand: "Technogym" }),
    runEquipmentAttachmentRuntime({ deploymentId, bidderBrand: "Technogym" }),
    runCommercialAttachmentRuntime({ deploymentId, bidderBrand: "Technogym" }),
    runResponsePackAssemblyRuntime({ deploymentId, bidderBrand: "Technogym" }),
    runVariantPackRuntime({ deploymentId }),
    runSubmissionReadinessRuntime({ deploymentId }),
    runTenderResponseDashboardRuntime({ deploymentId }),
  ];

  const allSuccess = runtimes.every((runtime) => runtime.status === "success");
  if (!allSuccess) {
    const failed = runtimes
      .filter((runtime) => runtime.status !== "success")
      .map((runtime) => runtime.domain);
    throw new Error(`Tender response pack evidence incomplete: ${failed.join(", ")}`);
  }

  return {
    evidenceId: `evidence-tender-response-pack-${deploymentId}`,
    version: TENDER_RESPONSE_PACK_VERSION,
    domains: [...TENDER_RESPONSE_PACK_DOMAINS],
    runtimes: runtimes.map((runtime) => ({
      domain: runtime.domain,
      runtimeId: runtime.runtimeId,
      status: runtime.status,
      stageCount: runtime.stages.length,
      summary: runtime.summary,
    })),
    generatedAt: new Date().toISOString(),
    summary: `tender-response-pack-evidence domains=${TENDER_RESPONSE_PACK_DOMAINS.length} allSuccess=true`,
  };
}
