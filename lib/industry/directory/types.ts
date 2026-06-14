import type { IndustryEntityStatus, IndustryPlatformDataMode, Organization, RegistryValidation } from "../shared/types";

export const INDUSTRY_DIRECTORY_VERSION = "v30-industry-platform-3" as const;
export const INDUSTRY_DIRECTORY_TAG = "v30-industry-directory-foundation" as const;

export type IndustryDirectoryType =
  | "brand"
  | "supplier"
  | "buyer"
  | "consultant"
  | "contractor"
  | "manufacturer";

export interface OrganizationDirectoryEntry {
  entryId: string;
  organizationId: string;
  directoryType: IndustryDirectoryType;
  displayName: string;
  status: IndustryEntityStatus;
  region: string;
  tags: string[];
  metadata: Record<string, string>;
  mode: IndustryPlatformDataMode;
}

export interface IndustryDirectoryContext {
  contextId: string;
  entries: OrganizationDirectoryEntry[];
  organizations: Organization[];
  totalCount: number;
  typeBreakdown: Record<IndustryDirectoryType, number>;
  mode: IndustryPlatformDataMode;
}

export interface DirectoryQuery {
  directoryType?: IndustryDirectoryType;
  region?: string;
  keyword?: string;
  status?: IndustryEntityStatus;
}

export interface DirectoryQueryResult {
  queryId: string;
  query: DirectoryQuery;
  hits: OrganizationDirectoryEntry[];
  hitCount: number;
  directoryReady: boolean;
}

export interface IndustryDirectoryValidation {
  valid: boolean;
  organizationDirectory: RegistryValidation;
  directoryContext: RegistryValidation;
  directoryQuery: RegistryValidation;
}

export const CANONICAL_INDUSTRY_DIRECTORY_QUERY: DirectoryQuery = {
  directoryType: "brand",
  region: "East China",
  keyword: "Life Fitness",
  status: "active",
} as const;

export const CANONICAL_DIRECTORY_ENTRY_ID = "ind-dir-brand-life-fitness" as const;
