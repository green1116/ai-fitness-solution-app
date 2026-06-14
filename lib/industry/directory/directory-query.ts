import type { RegistryValidation } from "../shared/types";
import type {
  DirectoryQuery,
  DirectoryQueryResult,
  IndustryDirectoryType,
  IndustryDirectoryValidation,
} from "./types";
import { CANONICAL_INDUSTRY_DIRECTORY_QUERY } from "./types";
import { getAllDirectoryEntries } from "./organization-directory";
import { validateDirectoryContextRegistry } from "./directory-context";
import { validateOrganizationDirectory } from "./organization-directory";

function matchesKeyword(
  entry: ReturnType<typeof getAllDirectoryEntries>[number],
  keyword: string,
): boolean {
  const normalized = keyword.toLowerCase();
  return (
    entry.displayName.toLowerCase().includes(normalized) ||
    entry.tags.some((tag) => tag.toLowerCase().includes(normalized)) ||
    Object.values(entry.metadata).some((value) => value.toLowerCase().includes(normalized))
  );
}

export function queryDirectory(input: DirectoryQuery = {}): DirectoryQueryResult {
  let hits = getAllDirectoryEntries();

  if (input.directoryType) {
    hits = hits.filter((entry) => entry.directoryType === input.directoryType);
  }

  if (input.region) {
    hits = hits.filter((entry) => entry.region === input.region);
  }

  if (input.status) {
    hits = hits.filter((entry) => entry.status === input.status);
  }

  if (input.keyword) {
    hits = hits.filter((entry) => matchesKeyword(entry, input.keyword!));
  }

  const queryParts = [
    input.directoryType ?? "all-types",
    input.region ?? "all-regions",
    input.keyword ?? "no-keyword",
    input.status ?? "all-status",
  ];

  return {
    queryId: `directory-query-${queryParts.join("-")}`,
    query: input,
    hits,
    hitCount: hits.length,
    directoryReady: hits.length > 0,
  };
}

export function queryDirectoryByType(directoryType: IndustryDirectoryType): DirectoryQueryResult {
  return queryDirectory({ directoryType, status: "active" });
}

export function queryDirectoryByRegion(region: string): DirectoryQueryResult {
  return queryDirectory({ region, status: "active" });
}

export function queryDirectoryByKeyword(keyword: string): DirectoryQueryResult {
  return queryDirectory({ keyword, status: "active" });
}

export function validateDirectoryQueryRegistry(): RegistryValidation {
  const canonical = queryDirectory(CANONICAL_INDUSTRY_DIRECTORY_QUERY);
  const brandQuery = queryDirectoryByType("brand");
  const regionQuery = queryDirectoryByRegion("East China");
  const keywordQuery = queryDirectoryByKeyword("Technogym");
  const contractorQuery = queryDirectoryByType("contractor");
  const manufacturerQuery = queryDirectoryByType("manufacturer");

  const valid =
    canonical.directoryReady &&
    canonical.hitCount >= 1 &&
    brandQuery.hitCount >= 3 &&
    regionQuery.hitCount >= 6 &&
    keywordQuery.hitCount >= 1 &&
    contractorQuery.hitCount >= 2 &&
    manufacturerQuery.hitCount >= 2;

  return {
    valid,
    count: canonical.hitCount,
    summary: `directory-query canonical=${canonical.hitCount} brand=${brandQuery.hitCount} region=${regionQuery.hitCount} contractor=${contractorQuery.hitCount} valid=${valid}`,
  };
}

export function validateIndustryDirectory(): IndustryDirectoryValidation {
  const organizationDirectory = validateOrganizationDirectory();
  const directoryContext = validateDirectoryContextRegistry();
  const directoryQuery = validateDirectoryQueryRegistry();

  return {
    valid: organizationDirectory.valid && directoryContext.valid && directoryQuery.valid,
    organizationDirectory,
    directoryContext,
    directoryQuery,
  };
}
