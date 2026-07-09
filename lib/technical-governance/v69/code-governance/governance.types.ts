/**
 * V69 P3 — Code governance types (read-only)
 */

export const V69_CODE_GOVERNANCE_VERSION = "v69-code-governance-1" as const;
export const V69_CODE_GOVERNANCE_FREEZE_VERSION = "v69-code-governance-freeze-1" as const;

export type CodePolicyKind =
  | "naming"
  | "structure"
  | "boundary"
  | "verification"
  | "documentation"
  | "frozen-layer";

export type ImportAllowanceKind = "runtime" | "type-only" | "read-only" | "forbidden";

export type CodeGovernanceSignals = {
  architectureDependencyReady?: boolean;
  objectCatalogComplete?: boolean;
  policyCatalogComplete?: boolean;
  boundaryCatalogComplete?: boolean;
  ownershipCatalogComplete?: boolean;
  importAllowanceComplete?: boolean;
  refsAligned?: boolean;
  freezeLockIntact?: boolean;
};

export type CodeGovernanceObject = {
  id: string;
  arcDefRef: string;
  name: string;
  rootPath: string;
  dependencyEntryRef: string;
  required: boolean;
  description: string;
};

export type CodeGovernanceObjectManifest = {
  version: typeof V69_CODE_GOVERNANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  objects: CodeGovernanceObject[];
  summary: string;
};

export type CodePolicyStandard = {
  id: string;
  kind: CodePolicyKind;
  label: string;
  rule: string;
  enforceLevel: "required" | "recommended";
  required: boolean;
  description: string;
};

export type CodePolicyManifest = {
  version: typeof V69_CODE_GOVERNANCE_VERSION;
  policyCount: number;
  kindCount: number;
  catalogComplete: boolean;
  policies: CodePolicyStandard[];
  summary: string;
};

export type DirectoryBoundaryEntry = {
  id: string;
  codeObjectRef: string;
  pathPattern: string;
  arcDefRef: string;
  mutable: boolean;
  required: boolean;
  description: string;
};

export type DirectoryBoundaryManifest = {
  version: typeof V69_CODE_GOVERNANCE_VERSION;
  boundaryCount: number;
  catalogComplete: boolean;
  boundaries: DirectoryBoundaryEntry[];
  summary: string;
};

export type FileOwnershipEntry = {
  id: string;
  boundaryRef: string;
  ownerRole: string;
  team: string;
  contactGroup: string;
  required: boolean;
  description: string;
};

export type FileOwnershipManifest = {
  version: typeof V69_CODE_GOVERNANCE_VERSION;
  ownershipCount: number;
  catalogComplete: boolean;
  ownerships: FileOwnershipEntry[];
  summary: string;
};

export type ImportAllowanceEntry = {
  id: string;
  fromBoundaryRef: string;
  toBoundaryRef: string;
  dependencyEdgeRef?: string;
  allowanceKind: ImportAllowanceKind;
  allowed: boolean;
  required: boolean;
  description: string;
};

export type ImportAllowanceManifest = {
  version: typeof V69_CODE_GOVERNANCE_VERSION;
  allowanceCount: number;
  kindCount: number;
  catalogComplete: boolean;
  allowances: ImportAllowanceEntry[];
  summary: string;
};

export type CodeGovernanceRegistry = {
  version: typeof V69_CODE_GOVERNANCE_VERSION;
  objectIds: string[];
  policyIds: string[];
  boundaryIds: string[];
  ownershipIds: string[];
  allowanceIds: string[];
  totalEntries: number;
  registryComplete: boolean;
  summary: string;
};

export type CodeGovernanceReport = {
  version: typeof V69_CODE_GOVERNANCE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  architectureDependencyVersion: string;
  architectureDependencyReady: boolean;
  objects: CodeGovernanceObjectManifest;
  policies: CodePolicyManifest;
  boundaries: DirectoryBoundaryManifest;
  ownerships: FileOwnershipManifest;
  importAllowances: ImportAllowanceManifest;
  registry: CodeGovernanceRegistry;
  governanceReady: boolean;
  readinessScore: number;
  summary: string;
};
