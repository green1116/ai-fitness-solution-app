import { getAssignmentsByTarget } from "../classification/category-assignment";
import { getAllCategories, getCategoryById } from "../classification/category-registry";
import { getAllDirectoryEntries } from "../directory/organization-directory";
import { getAllOrganizations } from "../organization-registry";
import type { RegistryValidation } from "../shared/types";
import type { IndustrySearchIndex, IndustrySearchIndexEntry } from "./types";
import { CANONICAL_SEARCH_INDEX_ENTRY_ID, INDUSTRY_SEARCH_VERSION } from "./types";

function resolveCategoryCodes(categoryIds: string[]): string[] {
  return categoryIds
    .map((categoryId) => getCategoryById(categoryId)?.categoryCode)
    .filter((code): code is string => code !== undefined);
}

function buildDirectoryIndexEntries(): IndustrySearchIndexEntry[] {
  return getAllDirectoryEntries().map((entry) => {
    const assignments = getAssignmentsByTarget("directory-entry", entry.entryId);
    const categoryIds = assignments.map((assignment) => assignment.categoryId);
    const categoryCodes = resolveCategoryCodes(categoryIds);

    return {
      indexEntryId: `ind-search-${entry.entryId}`,
      sourceType: "directory-entry",
      sourceId: entry.entryId,
      displayName: entry.displayName,
      searchType: entry.directoryType,
      region: entry.region,
      categoryIds,
      categoryCodes,
      keywords: [entry.displayName, entry.directoryType, ...entry.tags, ...Object.values(entry.metadata)],
      snippet: `${entry.displayName} · ${entry.directoryType} · ${entry.region}`,
      status: entry.status,
      mode: "industry-platform",
    };
  });
}

function buildOrganizationIndexEntries(): IndustrySearchIndexEntry[] {
  return getAllOrganizations().map((organization) => {
    const assignments = getAssignmentsByTarget("organization", organization.organizationId);
    const categoryIds = assignments.map((assignment) => assignment.categoryId);
    const categoryCodes = resolveCategoryCodes(categoryIds);
    const region = organization.metadata.region ?? organization.metadata.scope ?? "National";

    return {
      indexEntryId: `ind-search-${organization.organizationId}`,
      sourceType: "organization",
      sourceId: organization.organizationId,
      displayName: organization.organizationName,
      searchType: organization.organizationType,
      region,
      categoryIds,
      categoryCodes,
      keywords: [
        organization.organizationName,
        organization.organizationType,
        ...Object.values(organization.metadata),
      ],
      snippet: `${organization.organizationName} · ${organization.organizationType} · ${region}`,
      status: organization.status,
      mode: "industry-platform",
    };
  });
}

function buildCategoryIndexEntries(): IndustrySearchIndexEntry[] {
  return getAllCategories().map((category) => ({
    indexEntryId: `ind-search-${category.categoryId}`,
    sourceType: "category" as const,
    sourceId: category.categoryId,
    displayName: category.categoryName,
    searchType: "category",
    region: "Global",
    categoryIds: [category.categoryId],
    categoryCodes: [category.categoryCode],
    keywords: [category.categoryName, category.categoryCode, category.description, ...Object.values(category.metadata)],
    snippet: `${category.categoryName} · ${category.categoryCode}`,
    status: category.status,
    mode: "industry-platform" as const,
  }));
}

export function buildIndustrySearchIndex(): IndustrySearchIndex {
  const entries = [
    ...buildDirectoryIndexEntries(),
    ...buildOrganizationIndexEntries(),
    ...buildCategoryIndexEntries(),
  ];

  return {
    indexId: `industry-search-index-${INDUSTRY_SEARCH_VERSION}`,
    entries,
    totalEntries: entries.length,
    mode: "industry-platform",
  };
}

export function getSearchIndexEntryById(indexEntryId: string): IndustrySearchIndexEntry | undefined {
  return buildIndustrySearchIndex().entries.find((entry) => entry.indexEntryId === indexEntryId);
}

export function validateSearchIndex(): RegistryValidation {
  const index = buildIndustrySearchIndex();
  const directoryEntries = index.entries.filter((entry) => entry.sourceType === "directory-entry");
  const organizationEntries = index.entries.filter((entry) => entry.sourceType === "organization");
  const categoryEntries = index.entries.filter((entry) => entry.sourceType === "category");
  const canonical = getSearchIndexEntryById(CANONICAL_SEARCH_INDEX_ENTRY_ID);

  const fieldValid = index.entries.every(
    (entry) =>
      entry.indexEntryId.length > 0 &&
      entry.displayName.length > 0 &&
      entry.keywords.length > 0 &&
      entry.snippet.length > 0 &&
      entry.mode === "industry-platform",
  );

  const valid =
    index.totalEntries >= 36 &&
    directoryEntries.length >= 12 &&
    organizationEntries.length >= 10 &&
    categoryEntries.length >= 14 &&
    canonical !== undefined &&
    canonical.categoryCodes.length >= 1 &&
    fieldValid;

  return {
    valid,
    count: index.totalEntries,
    summary: `search-index total=${index.totalEntries} directory=${directoryEntries.length} org=${organizationEntries.length} category=${categoryEntries.length} valid=${valid}`,
  };
}
