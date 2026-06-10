import type { PROPOSAL_GENERATION_VERSION } from "../shared/types";
import type { ComplianceMatrixRuntimePayload } from "../compliance-matrix/types";
import type { DeliveryScheduleRuntimePayload } from "../delivery-schedule/types";
import type { ExecutiveSummaryRuntimePayload } from "../executive-summary/types";
import type { ImplementationPlanRuntimePayload } from "../implementation-plan/types";
import type { RiskAnalysisRuntimePayload } from "../risk-analysis/types";
import type { TechnicalProposalRuntimePayload } from "../technical-proposal/types";

export const PROPOSAL_ASSEMBLY_RUNTIME_VERSION = "v11.0-proposal-assembly-runtime-1" as const;

export interface ProposalPackageSection {
  sectionId: string;
  name: string;
  domain: string;
  included: boolean;
  summary: string;
}

export interface ProposalPackage {
  packageId: string;
  projectId: string;
  projectName: string;
  version: string;
  sections: ProposalPackageSection[];
  completeness: number;
  generatedAt: string;
  mode: "readiness-stub";
}

export interface ProposalAssemblyRuntimePayload {
  version: typeof PROPOSAL_ASSEMBLY_RUNTIME_VERSION;
  proposalVersion: typeof PROPOSAL_GENERATION_VERSION;
  executiveSummary: ExecutiveSummaryRuntimePayload;
  technicalProposal: TechnicalProposalRuntimePayload;
  implementationPlan: ImplementationPlanRuntimePayload;
  riskAnalysis: RiskAnalysisRuntimePayload;
  deliverySchedule: DeliveryScheduleRuntimePayload;
  complianceMatrix: ComplianceMatrixRuntimePayload;
  proposalPackage: ProposalPackage;
  summary: string;
}
