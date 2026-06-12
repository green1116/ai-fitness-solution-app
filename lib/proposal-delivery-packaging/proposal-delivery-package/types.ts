import type { PROPOSAL_DELIVERY_PACKAGING_VERSION } from "../shared/types";
import type { BudgetJustificationProfile } from "../budget-justification/types";
import type { MaintenanceNarrative } from "../maintenance-narrative/types";
import type { ROINarrative } from "../roi-narrative/types";
import type { TCOProfile } from "../tco-runtime/types";

export const PROPOSAL_DELIVERY_PACKAGE_RUNTIME_VERSION = "v19.5-proposal-delivery-package-1" as const;

export interface ProposalDeliveryPackage {
  packageId: string;
  proposalLabel: string;
  bidderBrand: string;
  executiveSummary: string;
  technicalProposal: string;
  equipmentPlan: string;
  budgetNarrative: string;
  budgetJustification: BudgetJustificationProfile;
  maintenanceNarrative: MaintenanceNarrative;
  roiNarrative: ROINarrative;
  tcoNarrative: TCOProfile;
  riskAnalysis: string;
  complianceMatrix: string;
  deliveryPackageReadiness: number;
}

export interface ProposalDeliveryPackageRuntimePayload {
  version: typeof PROPOSAL_DELIVERY_PACKAGE_RUNTIME_VERSION;
  packagingVersion: typeof PROPOSAL_DELIVERY_PACKAGING_VERSION;
  packages: ProposalDeliveryPackage[];
  packageCount: number;
  summary: string;
}
