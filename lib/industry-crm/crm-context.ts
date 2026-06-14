import type { RegistryValidation } from "./shared/types";
import { buildIndustryCRM } from "./crm-registry";
import type { CRMContext, IndustryCRMStatus, IndustryCRMType } from "./shared/types";
import { CANONICAL_CRM_SUBJECT_ID, INDUSTRY_CRM_TAG, INDUSTRY_CRM_VERSION } from "./shared/types";

function buildTypeBreakdown(
  crmRecords: ReturnType<typeof buildIndustryCRM>,
): Record<IndustryCRMType, number> {
  const breakdown: Record<IndustryCRMType, number> = {
    supplier: 0,
    brand: 0,
    tender: 0,
    partnership: 0,
  };

  for (const crm of crmRecords) {
    breakdown[crm.crmType] += 1;
  }

  return breakdown;
}

function buildStatusBreakdown(
  crmRecords: ReturnType<typeof buildIndustryCRM>,
): Record<IndustryCRMStatus, number> {
  const breakdown: Record<IndustryCRMStatus, number> = {
    prospect: 0,
    active: 0,
    strategic: 0,
    retained: 0,
    dormant: 0,
    churned: 0,
  };

  for (const crm of crmRecords) {
    breakdown[crm.crmStatus] += 1;
  }

  return breakdown;
}

export function buildCRMContext(): CRMContext {
  const crmRecords = buildIndustryCRM();

  return {
    contextId: `crm-context-${INDUSTRY_CRM_VERSION}`,
    crmRecords,
    crmCount: crmRecords.length,
    typeBreakdown: buildTypeBreakdown(crmRecords),
    statusBreakdown: buildStatusBreakdown(crmRecords),
    crmReady: crmRecords.length > 0,
    mode: "industry-crm",
  };
}

export function validateCRMContextState(context: CRMContext): boolean {
  const canonical = context.crmRecords.filter(
    (crm) => crm.subjectId === CANONICAL_CRM_SUBJECT_ID,
  );

  return (
    context.crmReady &&
    context.crmCount >= 8 &&
    context.crmRecords.length === context.crmCount &&
    Object.values(context.typeBreakdown).every((count) => count > 0) &&
    Object.values(context.statusBreakdown).every((count) => count > 0) &&
    canonical.length >= 1 &&
    context.mode === "industry-crm"
  );
}

export function validateCRMContextRegistry(): RegistryValidation {
  const context = buildCRMContext();
  const valid =
    validateCRMContextState(context) &&
    INDUSTRY_CRM_VERSION === "v34-industry-crm-1" &&
    INDUSTRY_CRM_TAG === "v34-industry-crm-foundation";

  return {
    valid,
    count: context.crmCount,
    summary: `crm-context count=${context.crmCount} types=4/4 statuses=6/6 valid=${valid}`,
  };
}
