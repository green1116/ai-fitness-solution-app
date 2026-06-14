import type { ProjectType } from "@/lib/procurement-intelligence/shared/types";
import type { ProposalSection } from "../../proposal-sections/types";

export interface CommercialProposalPack {
  packId: string;
  sku: string;
  city: string;
  quantity: number;
  projectType: ProjectType;
  bundleId: string;
  equipmentSection: ProposalSection;
  supplyChainSection: ProposalSection;
  procurementSection: ProposalSection;
  deliverySection: ProposalSection;
  integrationReadiness: number;
}

export interface ProposalComposerSimulation {
  composerId: string;
  inputSectionCount: number;
  outputPackId: string;
  mappedSections: string[];
  composerReadiness: number;
}

export interface TenderResponsePackCompatibility {
  compatible: boolean;
  equipmentAttachmentCompatible: boolean;
  commercialAttachmentCompatible: boolean;
  deliveryScheduleCompatible: boolean;
  supplyChainCompatible: boolean;
  compatibilityScore: number;
}

export interface CommercialProposalPackValidation {
  valid: boolean;
  equipmentSectionExists: boolean;
  supplyChainSectionExists: boolean;
  procurementSectionExists: boolean;
  deliverySectionExists: boolean;
}

export interface ProposalIntegrationReadinessReport {
  version: string;
  reportId: string;
  packValidation: CommercialProposalPackValidation;
  composerSimulation: ProposalComposerSimulation | null;
  tenderResponseCompatibility: TenderResponsePackCompatibility | null;
  examplePack: CommercialProposalPack | null;
  integrationReadiness: number;
  summary: string;
  generatedAt: string;
}
