/**
 * Launch P5 — SLA Support Package types
 */

import type {
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
  INCIDENT_WORKFLOW_STEPS,
  LAUNCH_SLA_SUPPORT_BASE,
  LAUNCH_SLA_SUPPORT_FREEZE_VERSION,
  LAUNCH_SLA_SUPPORT_ID,
  LAUNCH_SLA_SUPPORT_VERSION,
  SUPPORT_MANAGER_STATUSES,
  SUPPORT_POLICY_KINDS,
  SUPPORT_READINESS_VERDICTS,
  SUPPORT_SLA_PROFILE_STATUSES,
  SUPPORT_TIERS,
} from "./support.constants";

export type SupportSlaProfileStatus =
  (typeof SUPPORT_SLA_PROFILE_STATUSES)[number];
export type SupportTier = (typeof SUPPORT_TIERS)[number];
export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];
export type IncidentWorkflowStep = (typeof INCIDENT_WORKFLOW_STEPS)[number];
export type SupportPolicyKind = (typeof SUPPORT_POLICY_KINDS)[number];
export type SupportReadinessVerdict =
  (typeof SUPPORT_READINESS_VERDICTS)[number];
export type SupportManagerStatus = (typeof SUPPORT_MANAGER_STATUSES)[number];

export type SupportMetadata = Record<string, unknown>;

/** SLA profile (launch support package). */
export type SupportSlaProfile = {
  id: string;
  name: string;
  productId: string;
  productionProfileId: string;
  productTenantId: string;
  organizationId?: string;
  securityProfileId?: string;
  onboardingProfileId?: string;
  commercialSlaId?: string;
  supportTierId?: string;
  status: SupportSlaProfileStatus;
  metadata: SupportMetadata;
  createdAt: string;
};

export type CreateSupportSlaProfileInput = {
  id?: string;
  name: string;
  productId: string;
  productionProfileId: string;
  productTenantId: string;
  organizationId?: string;
  securityProfileId?: string;
  onboardingProfileId?: string;
  commercialSlaId?: string;
  supportTierId?: string;
  status?: SupportSlaProfileStatus;
  metadata?: SupportMetadata;
};

/** Support tier model. */
export type SupportTierDefinition = {
  id: string;
  name: string;
  tier: SupportTier;
  responseMinutes: number;
  resolutionMinutes: number;
  channels: string[];
  metadata: SupportMetadata;
  createdAt: string;
};

export type CreateSupportTierInput = {
  id?: string;
  name: string;
  tier: SupportTier;
  responseMinutes?: number;
  resolutionMinutes?: number;
  channels?: string[];
  metadata?: SupportMetadata;
};

/** Incident workflow. */
export type IncidentStepRecord = {
  step: IncidentWorkflowStep;
  status: "PENDING" | "COMPLETED" | "SKIPPED";
  detail: string;
  completedAt?: string;
};

export type SupportIncident = {
  id: string;
  supportSlaProfileId: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  steps: IncidentStepRecord[];
  currentStep?: IncidentWorkflowStep;
  openedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  responseMinutes?: number;
  resolutionMinutes?: number;
  metadata: SupportMetadata;
  updatedAt: string;
};

export type OpenIncidentInput = {
  id?: string;
  supportSlaProfileId: string;
  title: string;
  severity?: IncidentSeverity;
  metadata?: SupportMetadata;
};

export type AdvanceIncidentInput = {
  incidentId: string;
  detail?: string;
};

/** Support policy. */
export type SupportPolicy = {
  id: string;
  supportSlaProfileId: string;
  kind: SupportPolicyKind;
  name: string;
  valueMinutes: number;
  detail: string;
  metadata: SupportMetadata;
  createdAt: string;
};

export type CreateSupportPolicyInput = {
  id?: string;
  supportSlaProfileId: string;
  kind: SupportPolicyKind;
  name: string;
  valueMinutes: number;
  detail?: string;
  metadata?: SupportMetadata;
};

/** Response metrics. */
export type SupportResponseMetrics = {
  supportSlaProfileId: string;
  incidentCount: number;
  openCount: number;
  resolvedCount: number;
  closedCount: number;
  avgResponseMinutes: number | null;
  avgResolutionMinutes: number | null;
  withinSlaCount: number;
  breachedCount: number;
  slaComplianceRate: number | null;
  computedAt: string;
};

/** Support readiness. */
export type SupportReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type SupportReadinessResult = {
  supportSlaProfileId: string;
  verdict: SupportReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: SupportReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type SupportRegistryManifest = {
  slaSupportId: typeof LAUNCH_SLA_SUPPORT_ID;
  version: typeof LAUNCH_SLA_SUPPORT_VERSION;
  freezeVersion: typeof LAUNCH_SLA_SUPPORT_FREEZE_VERSION;
  base: typeof LAUNCH_SLA_SUPPORT_BASE;
  profileCount: number;
  tierCount: number;
  incidentCount: number;
  policyCount: number;
};
