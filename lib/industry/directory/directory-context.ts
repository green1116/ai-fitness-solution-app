import { getOrganizationById } from "../organization-registry";
import type { RegistryValidation } from "../shared/types";
import type { IndustryDirectoryType, IndustryDirectoryContext } from "./types";
import {
  CANONICAL_DIRECTORY_ENTRY_ID,
  INDUSTRY_DIRECTORY_TAG,
  INDUSTRY_DIRECTORY_VERSION,
} from "./types";
import { getAllDirectoryEntries, getDirectoryEntryById } from "./organization-directory";

function buildTypeBreakdown(
  entries: ReturnType<typeof getAllDirectoryEntries>,
): Record<IndustryDirectoryType, number> {
  const breakdown: Record<IndustryDirectoryType, number> = {
    brand: 0,
    supplier: 0,
    buyer: 0,
    consultant: 0,
    contractor: 0,
    manufacturer: 0,
  };

  for (const entry of entries) {
    breakdown[entry.directoryType] += 1;
  }

  return breakdown;
}

export function buildIndustryDirectoryContext(): IndustryDirectoryContext {
  const entries = getAllDirectoryEntries();
  const organizationIds = new Set(entries.map((entry) => entry.organizationId));
  const organizations = [...organizationIds]
    .map((organizationId) => getOrganizationById(organizationId))
    .filter((organization): organization is NonNullable<typeof organization> => organization !== undefined);

  return {
    contextId: `industry-directory-context-${INDUSTRY_DIRECTORY_VERSION}`,
    entries,
    organizations,
    totalCount: entries.length,
    typeBreakdown: buildTypeBreakdown(entries),
    mode: "industry-platform",
  };
}

export function validateIndustryDirectoryContext(context: IndustryDirectoryContext): boolean {
  const requiredTypes: IndustryDirectoryType[] = [
    "brand",
    "supplier",
    "buyer",
    "consultant",
    "contractor",
    "manufacturer",
  ];

  return (
    context.entries.length >= 12 &&
    context.organizations.length > 0 &&
    context.totalCount === context.entries.length &&
    requiredTypes.every((type) => context.typeBreakdown[type] > 0) &&
    context.entries.every(
      (entry) => getOrganizationById(entry.organizationId)?.organizationId === entry.organizationId,
    ) &&
    context.mode === "industry-platform"
  );
}

export function validateDirectoryContextRegistry(): RegistryValidation {
  const context = buildIndustryDirectoryContext();
  const canonical = getDirectoryEntryById(CANONICAL_DIRECTORY_ENTRY_ID);
  const canonicalInContext = context.entries.some(
    (entry) => entry.entryId === CANONICAL_DIRECTORY_ENTRY_ID,
  );

  const valid =
    validateIndustryDirectoryContext(context) &&
    canonical !== undefined &&
    canonicalInContext &&
    INDUSTRY_DIRECTORY_VERSION === "v30-industry-platform-3" &&
    INDUSTRY_DIRECTORY_TAG === "v30-industry-directory-foundation";

  return {
    valid,
    count: context.totalCount,
    summary: `directory-context entries=${context.totalCount} orgs=${context.organizations.length} canonical=${canonicalInContext} valid=${valid}`,
  };
}
