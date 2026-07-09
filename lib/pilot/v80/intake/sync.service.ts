/**
 * V80 Pilot P2 — Single-source sync mapping (requirements → Project / Quote / Tender)
 */

import type { CompanyInfoInput } from "@/lib/product-engine";
import type { CreateProjectInput } from "@/lib/services/project.service";

import {
  mapRequirementsToProjectInput,
  mapRequirementsToQuoteCompanyInfo,
  mapRequirementsToQuoteContent,
  mapRequirementsToTenderMetadata,
} from "./project.mapping";
import type { TenderRequirements } from "./requirements.schema";

export type IntakeSyncPackage = {
  requirements: TenderRequirements;
  projectInput: CreateProjectInput;
  quoteCompanyInfo: CompanyInfoInput;
  quoteContent: Record<string, unknown>;
  tenderMetadata: Record<string, unknown>;
};

/** One entry point for all downstream writes — prevents mapping drift */
export function buildIntakeSyncPackage(
  requirements: TenderRequirements,
  organizationId: string,
  tenderExtras?: Record<string, unknown>,
): IntakeSyncPackage {
  return {
    requirements,
    projectInput: mapRequirementsToProjectInput(requirements, organizationId),
    quoteCompanyInfo: mapRequirementsToQuoteCompanyInfo(requirements),
    quoteContent: mapRequirementsToQuoteContent(requirements),
    tenderMetadata: mapRequirementsToTenderMetadata(requirements, tenderExtras),
  };
}
