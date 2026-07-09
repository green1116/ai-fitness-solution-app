/**
 * V69 P5 — Security governance types (read-only)
 */

export const V69_SECURITY_GOVERNANCE_VERSION = "v69-security-governance-1" as const;
export const V69_SECURITY_GOVERNANCE_FREEZE_VERSION = "v69-security-governance-freeze-1" as const;

export type SecurityPolicyKind =
  | "access-control"
  | "authentication"
  | "authorization"
  | "audit"
  | "risk"
  | "data-protection";

export type SecurityBoundaryKind = "public" | "authenticated" | "privileged" | "internal" | "frozen";

export type SensitiveSurfaceKind = "pii" | "credential" | "token" | "config" | "audit-log";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type SecurityGovernanceSignals = {
  technicalStandardsReady?: boolean;
  objectCatalogComplete?: boolean;
  policyCatalogComplete?: boolean;
  boundaryCatalogComplete?: boolean;
  sensitiveSurfaceComplete?: boolean;
  accessStandardsComplete?: boolean;
  permissionStandardsComplete?: boolean;
  auditStandardsComplete?: boolean;
  riskStandardsComplete?: boolean;
  refsAligned?: boolean;
  freezeLockIntact?: boolean;
};

export type SecurityGovernanceObject = {
  id: string;
  arcDefRef: string;
  codeObjectRef: string;
  boundaryRef: string;
  name: string;
  required: boolean;
  description: string;
};

export type SecurityGovernanceObjectManifest = {
  version: typeof V69_SECURITY_GOVERNANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  objects: SecurityGovernanceObject[];
  summary: string;
};

export type SecurityPolicyEntry = {
  id: string;
  kind: SecurityPolicyKind;
  label: string;
  standardRef?: string;
  enforceLevel: "required" | "recommended";
  required: boolean;
  description: string;
};

export type SecurityPolicyManifest = {
  version: typeof V69_SECURITY_GOVERNANCE_VERSION;
  policyCount: number;
  kindCount: number;
  catalogComplete: boolean;
  policies: SecurityPolicyEntry[];
  summary: string;
};

export type SecurityBoundaryEntry = {
  id: string;
  kind: SecurityBoundaryKind;
  codeBoundaryRef: string;
  arcDefRef: string;
  trustZone: string;
  required: boolean;
  description: string;
};

export type SecurityBoundaryManifest = {
  version: typeof V69_SECURITY_GOVERNANCE_VERSION;
  boundaryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  boundaries: SecurityBoundaryEntry[];
  summary: string;
};

export type SensitiveSurfaceEntry = {
  id: string;
  securityBoundaryRef: string;
  kind: SensitiveSurfaceKind;
  surfacePath: string;
  classification: RiskLevel;
  required: boolean;
  description: string;
};

export type SensitiveSurfaceManifest = {
  version: typeof V69_SECURITY_GOVERNANCE_VERSION;
  surfaceCount: number;
  kindCount: number;
  catalogComplete: boolean;
  surfaces: SensitiveSurfaceEntry[];
  summary: string;
};

export type AccessStandardEntry = {
  id: string;
  securityBoundaryRef: string;
  accessPattern: string;
  authRequired: boolean;
  required: boolean;
  description: string;
};

export type AccessStandardManifest = {
  version: typeof V69_SECURITY_GOVERNANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  standards: AccessStandardEntry[];
  summary: string;
};

export type PermissionStandardEntry = {
  id: string;
  securityBoundaryRef: string;
  permissionModel: string;
  roleRef: string;
  required: boolean;
  description: string;
};

export type PermissionStandardManifest = {
  version: typeof V69_SECURITY_GOVERNANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  standards: PermissionStandardEntry[];
  summary: string;
};

export type AuditStandardEntry = {
  id: string;
  securityPolicyRef: string;
  auditEvent: string;
  retentionDays: number;
  required: boolean;
  description: string;
};

export type AuditStandardManifest = {
  version: typeof V69_SECURITY_GOVERNANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  standards: AuditStandardEntry[];
  summary: string;
};

export type RiskControlEntry = {
  id: string;
  sensitiveSurfaceRef: string;
  riskLevel: RiskLevel;
  controlKind: string;
  mitigation: string;
  required: boolean;
  description: string;
};

export type RiskControlManifest = {
  version: typeof V69_SECURITY_GOVERNANCE_VERSION;
  entryCount: number;
  riskLevelCount: number;
  catalogComplete: boolean;
  controls: RiskControlEntry[];
  summary: string;
};

export type SecurityGovernanceRegistry = {
  version: typeof V69_SECURITY_GOVERNANCE_VERSION;
  objectIds: string[];
  policyIds: string[];
  boundaryIds: string[];
  surfaceIds: string[];
  accessIds: string[];
  permissionIds: string[];
  auditIds: string[];
  riskIds: string[];
  totalEntries: number;
  registryComplete: boolean;
  summary: string;
};

export type SecurityGovernanceReport = {
  version: typeof V69_SECURITY_GOVERNANCE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  technicalStandardsVersion: string;
  technicalStandardsReady: boolean;
  objects: SecurityGovernanceObjectManifest;
  policies: SecurityPolicyManifest;
  boundaries: SecurityBoundaryManifest;
  sensitiveSurfaces: SensitiveSurfaceManifest;
  accessStandards: AccessStandardManifest;
  permissionStandards: PermissionStandardManifest;
  auditStandards: AuditStandardManifest;
  riskControls: RiskControlManifest;
  registry: SecurityGovernanceRegistry;
  governanceReady: boolean;
  readinessScore: number;
  summary: string;
};
