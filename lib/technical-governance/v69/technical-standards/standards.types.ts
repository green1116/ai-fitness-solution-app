/**
 * V69 P4 — Technical standards types (read-only)
 */

export const V69_TECHNICAL_STANDARDS_VERSION = "v69-technical-standards-1" as const;
export const V69_TECHNICAL_STANDARDS_FREEZE_VERSION = "v69-technical-standards-freeze-1" as const;

export type StandardDomain =
  | "naming"
  | "version"
  | "interface"
  | "directory"
  | "change"
  | "governance";

export type StandardEnforceLevel = "required" | "recommended" | "informational";

export type TechnicalStandardsSignals = {
  codeGovernanceReady?: boolean;
  policySetComplete?: boolean;
  namingStandardsComplete?: boolean;
  versionStandardsComplete?: boolean;
  interfaceStandardsComplete?: boolean;
  directoryStandardsComplete?: boolean;
  changeStandardsComplete?: boolean;
  refsAligned?: boolean;
  freezeLockIntact?: boolean;
};

export type StandardPolicySetEntry = {
  id: string;
  domain: StandardDomain;
  label: string;
  standardRef: string;
  codePolicyRef?: string;
  enforceLevel: StandardEnforceLevel;
  required: boolean;
  description: string;
};

export type StandardPolicySetManifest = {
  version: typeof V69_TECHNICAL_STANDARDS_VERSION;
  entryCount: number;
  domainCount: number;
  catalogComplete: boolean;
  policies: StandardPolicySetEntry[];
  summary: string;
};

export type NamingStandardEntry = {
  id: string;
  target: string;
  pattern: string;
  example: string;
  enforceLevel: StandardEnforceLevel;
  required: boolean;
  description: string;
};

export type NamingStandardManifest = {
  version: typeof V69_TECHNICAL_STANDARDS_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  standards: NamingStandardEntry[];
  summary: string;
};

export type VersionStandardEntry = {
  id: string;
  artifactKind: string;
  versionPattern: string;
  bumpRule: string;
  enforceLevel: StandardEnforceLevel;
  required: boolean;
  description: string;
};

export type VersionStandardManifest = {
  version: typeof V69_TECHNICAL_STANDARDS_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  standards: VersionStandardEntry[];
  summary: string;
};

export type InterfaceStandardEntry = {
  id: string;
  interfaceKind: "api" | "barrel" | "verify" | "report" | "catalog";
  contract: string;
  codeObjectRef?: string;
  enforceLevel: StandardEnforceLevel;
  required: boolean;
  description: string;
};

export type InterfaceStandardManifest = {
  version: typeof V69_TECHNICAL_STANDARDS_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  standards: InterfaceStandardEntry[];
  summary: string;
};

export type DirectoryStandardEntry = {
  id: string;
  boundaryRef: string;
  pathConvention: string;
  layoutRule: string;
  enforceLevel: StandardEnforceLevel;
  required: boolean;
  description: string;
};

export type DirectoryStandardManifest = {
  version: typeof V69_TECHNICAL_STANDARDS_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  standards: DirectoryStandardEntry[];
  summary: string;
};

export type ChangeStandardEntry = {
  id: string;
  changeKind: "additive" | "frozen" | "rollback" | "verify";
  procedure: string;
  gateRef?: string;
  enforceLevel: StandardEnforceLevel;
  required: boolean;
  description: string;
};

export type ChangeStandardManifest = {
  version: typeof V69_TECHNICAL_STANDARDS_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  standards: ChangeStandardEntry[];
  summary: string;
};

export type TechnicalStandardsRegistry = {
  version: typeof V69_TECHNICAL_STANDARDS_VERSION;
  policySetIds: string[];
  namingIds: string[];
  versionIds: string[];
  interfaceIds: string[];
  directoryIds: string[];
  changeIds: string[];
  totalEntries: number;
  registryComplete: boolean;
  summary: string;
};

export type TechnicalStandardsReport = {
  version: typeof V69_TECHNICAL_STANDARDS_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  codeGovernanceVersion: string;
  codeGovernanceReady: boolean;
  policySet: StandardPolicySetManifest;
  naming: NamingStandardManifest;
  versioning: VersionStandardManifest;
  interfaces: InterfaceStandardManifest;
  directories: DirectoryStandardManifest;
  changes: ChangeStandardManifest;
  registry: TechnicalStandardsRegistry;
  standardsReady: boolean;
  readinessScore: number;
  summary: string;
};
