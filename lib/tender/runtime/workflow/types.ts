import type { EvidenceDecisionPolicy } from "@/lib/tender/evidence/runtime/types";
import type { BuildBidDecisionGateInput } from "@/lib/tender/score/buildBidDecisionGate";
import type { TechnicalCompliancePackage } from "@/lib/tender/compliance/types";
import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";
import type { SKUIntelligenceResult } from "@/lib/tender/sku/skuTypes";
import type { TenderWorkflowStepId } from "../types";

export type TenderRuntimeWorkflowInput = {
  rawText?: string;
  sourceName?: string;
  graph?: TenderSemanticGraph;
  compliance?: TechnicalCompliancePackage;
  skuResult?: SKUIntelligenceResult;
  mode?: string;
  forceAllow?: boolean;
  gatePolicy?: BuildBidDecisionGateInput["policy"];
  evidencePolicy?: EvidenceDecisionPolicy;
  skipSteps?: TenderWorkflowStepId[];
  options?: {
    runSku?: boolean;
    runCompliance?: boolean;
    runResponses?: boolean;
  };
};
