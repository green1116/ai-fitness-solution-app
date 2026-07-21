/**
 * Enterprise Platform v1 — Alignment types
 */

import type {
  CAPABILITY_DOMAINS,
  E09_ENTERPRISE_COMPLETE_ID,
  E10_ENTERPRISE_COMPLETE_ID,
  E11_ENTERPRISE_COMPLETE_ID,
  ENTERPRISE_LAYER_CODES,
  PLATFORM_V1_BASE,
  PLATFORM_V1_FREEZE_VERSION,
  PLATFORM_V1_ID,
  PLATFORM_V1_SIGNOFF_VERSION,
  PLATFORM_V1_VERSION,
  RELEASE_BASELINE_PHASES,
} from "./platform.v1.constants";

export type EnterpriseLayerCode = (typeof ENTERPRISE_LAYER_CODES)[number];
export type CapabilityDomain = (typeof CAPABILITY_DOMAINS)[number];
export type ReleaseBaselinePhase = (typeof RELEASE_BASELINE_PHASES)[number];

export type EnterpriseLayerEntry = {
  code: EnterpriseLayerCode;
  label: string;
  completeId: string;
  freezeVersion: string;
  governanceBase: string;
  rootPath: string;
  signoffPath: string;
  primaryId: string;
  secondaryId?: string;
};

export type DependencyEdge = {
  from: EnterpriseLayerCode | "PLATFORM_V1";
  to: EnterpriseLayerCode | "PLATFORM_V1";
  viaBase: string;
  label: string;
};

export type DependencyMap = {
  edges: DependencyEdge[];
  chainOk: boolean;
  failures: string[];
};

export type CapabilityEntry = {
  id: string;
  layer: EnterpriseLayerCode;
  domain: CapabilityDomain;
  label: string;
  modulePath: string;
};

export type CapabilityIndex = {
  entries: CapabilityEntry[];
  byLayer: Record<EnterpriseLayerCode, CapabilityEntry[]>;
  byDomain: Record<CapabilityDomain, CapabilityEntry[]>;
  count: number;
};

export type ReleaseBaselineEntry = {
  phase: ReleaseBaselinePhase;
  freezeVersion: string;
  signoffVersion: string;
  completeId: string;
  governanceBase: string;
};

export type ReleaseBaseline = {
  version: typeof PLATFORM_V1_FREEZE_VERSION;
  entries: ReleaseBaselineEntry[];
  aligned: boolean;
  summary: string;
};

export type PlatformV1Manifest = {
  platformId: typeof PLATFORM_V1_ID;
  version: typeof PLATFORM_V1_VERSION;
  freezeVersion: typeof PLATFORM_V1_FREEZE_VERSION;
  signoff: typeof PLATFORM_V1_SIGNOFF_VERSION;
  base: typeof PLATFORM_V1_BASE;
  e09CompleteId: typeof E09_ENTERPRISE_COMPLETE_ID;
  e10CompleteId: typeof E10_ENTERPRISE_COMPLETE_ID;
  e11CompleteId: typeof E11_ENTERPRISE_COMPLETE_ID;
  layers: EnterpriseLayerEntry[];
  dependency: DependencyMap;
  capabilities: CapabilityIndex;
  baseline: ReleaseBaseline;
  aligned: boolean;
  builtAt: string;
  summary: string;
};
