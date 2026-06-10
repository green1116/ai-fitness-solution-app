import { buildAiIntegrationEvidence } from "@/lib/ai-integration/evidence";
import { buildAiReadinessEvidence } from "@/lib/ai-readiness/evidence";
import { buildAutopilotEvidence } from "@/lib/autopilot/evidence";
import { buildCommercialDeliveryEvidence } from "@/lib/commercial-delivery/evidence";
import { buildCustomerSuccessEvidence } from "@/lib/customer-success/evidence";
import { buildEnterpriseSaasEvidence } from "@/lib/enterprise-saas/evidence";
import { buildGtmEvidence } from "@/lib/go-to-market/evidence";
import { buildKnowledgeBaseEvidence } from "@/lib/knowledge-base/evidence";
import { buildPaymentReadinessEvidence } from "@/lib/payment-readiness/evidence";
import { buildProposalGenerationEvidence } from "@/lib/proposal-generation/evidence";
import { buildProposalPdfEvidence } from "@/lib/proposal-pdf/evidence";
import { buildRevenueFoundationEvidence } from "@/lib/revenue-foundation/evidence";
import { buildRevenueOperationsEvidence } from "@/lib/revenue-operations/evidence";
import { buildTenderIntelligenceEvidence } from "@/lib/tender-intelligence/evidence";
import {
  COMMERCIAL_FREEZE_TAG,
  COMMERCIAL_LAYER_ORDER,
  COMMERCIAL_MODULE_REGISTRY,
  getModulesByLayer,
} from "../registry";
import type { CommercialLayerKey } from "../shared/types";

type ModuleEvidenceResult = {
  moduleId: string;
  layer: CommercialLayerKey;
  domainCount: number;
  allSuccess: boolean;
};

function collectModuleEvidence(deploymentId: string): ModuleEvidenceResult[] {
  const builders: Array<() => { domains: readonly string[]; runtimes: Array<{ status: string }> }> = [
    () => buildRevenueFoundationEvidence({ deploymentId }),
    () => buildPaymentReadinessEvidence({ deploymentId }),
    () => buildRevenueOperationsEvidence({ deploymentId }),
    () => buildEnterpriseSaasEvidence({ deploymentId }),
    () => buildProposalGenerationEvidence({ deploymentId }),
    () => buildProposalPdfEvidence({ deploymentId }),
    () => buildAiReadinessEvidence({ deploymentId }),
    () => buildAiIntegrationEvidence({ deploymentId }),
    () => buildAutopilotEvidence({ deploymentId }),
    () => buildTenderIntelligenceEvidence({ deploymentId }),
    () => buildKnowledgeBaseEvidence({ deploymentId }),
    () => buildCommercialDeliveryEvidence({ deploymentId }),
    () => buildCustomerSuccessEvidence({ deploymentId }),
    () => buildGtmEvidence({ deploymentId }),
  ];

  return COMMERCIAL_MODULE_REGISTRY.map((module, index) => {
    const evidence = builders[index]();
    return {
      moduleId: module.moduleId,
      layer: module.layer,
      domainCount: evidence.domains.length,
      allSuccess: evidence.runtimes.every((runtime) => runtime.status === "success"),
    };
  });
}

function layerScore(
  layer: CommercialLayerKey,
  moduleEvidence: ModuleEvidenceResult[],
): { completeness: number; stability: number; readiness: number } {
  const modules = getModulesByLayer(layer);
  const evidence = moduleEvidence.filter((entry) => entry.layer === layer);
  const expectedDomains = modules.reduce((sum, module) => sum + module.domains.length, 0);
  const actualDomains = evidence.reduce((sum, entry) => sum + entry.domainCount, 0);
  const stableModules = evidence.filter((entry) => entry.allSuccess).length;

  const completeness = expectedDomains === 0 ? 0 : Math.round((actualDomains / expectedDomains) * 100);
  const stability = modules.length === 0 ? 0 : Math.round((stableModules / modules.length) * 100);
  const readiness = Math.round((completeness + stability) / 2);

  return { completeness, stability, readiness };
}

export function buildCommercialPlatformDashboardMetrics(input?: {
  deploymentId?: string;
}): {
  platformCompleteness: number;
  platformStability: number;
  platformReadiness: number;
  commercializationReadiness: number;
  layerScores: Array<{
    layer: string;
    completeness: number;
    stability: number;
    readiness: number;
  }>;
  moduleEvidence: ModuleEvidenceResult[];
  summary: string;
} {
  const deploymentId = input?.deploymentId ?? "commercial-platform-dashboard-default";
  const moduleEvidence = collectModuleEvidence(deploymentId);

  const layerScores = COMMERCIAL_LAYER_ORDER.map((layer) => ({
    layer,
    ...layerScore(layer, moduleEvidence),
  }));

  const platformCompleteness = Math.round(
    layerScores.reduce((sum, score) => sum + score.completeness, 0) / layerScores.length,
  );
  const platformStability = Math.round(
    layerScores.reduce((sum, score) => sum + score.stability, 0) / layerScores.length,
  );
  const platformReadiness = Math.round(
    layerScores.reduce((sum, score) => sum + score.readiness, 0) / layerScores.length,
  );
  const commercializationReadiness = Math.round(
    (platformCompleteness + platformStability + platformReadiness) / 3,
  );

  return {
    platformCompleteness,
    platformStability,
    platformReadiness,
    commercializationReadiness,
    layerScores,
    moduleEvidence,
    summary: [
      `commercial-platform-dashboard tag=${COMMERCIAL_FREEZE_TAG}`,
      `completeness=${platformCompleteness}%`,
      `stability=${platformStability}%`,
      `readiness=${platformReadiness}%`,
      `commercialization=${commercializationReadiness}%`,
      `modules=${moduleEvidence.length}`,
    ].join(" "),
  };
}
