/**
 * E05-P1 — Intelligence Foundation types
 * Abstraction above E04 Business Agent Platform
 */

import {
  E05_INTELLIGENCE_BASE,
  E05_INTELLIGENCE_FREEZE_VERSION,
  E05_INTELLIGENCE_PLATFORM_ID,
  E05_INTELLIGENCE_VERSION,
  INTELLIGENCE_DOMAINS,
  INTELLIGENCE_LIFECYCLE_STAGES,
  INTELLIGENCE_STATUSES,
  INSIGHT_KINDS,
} from "./intelligence.constants";

export type IntelligenceDomain = (typeof INTELLIGENCE_DOMAINS)[number];
export type IntelligenceStatus = (typeof INTELLIGENCE_STATUSES)[number];
export type IntelligenceLifecycleStage =
  (typeof INTELLIGENCE_LIFECYCLE_STAGES)[number];
export type InsightKind = (typeof INSIGHT_KINDS)[number];

export type IntelligenceDefinition = {
  id: string;
  name: string;
  domain: IntelligenceDomain;
  description: string;
  /** Bound E04 business agent id */
  businessAgentId: string;
  capabilityId?: string;
  insightIds: string[];
  dependsOn: string[];
  optional: boolean;
  readOnly: true;
};

export type IntelligenceLifecycleTransition = {
  from: IntelligenceLifecycleStage;
  to: IntelligenceLifecycleStage;
  at: string;
  note?: string;
  readOnly: true;
};

export type IntelligenceLifecycle = {
  current: IntelligenceLifecycleStage;
  stages: IntelligenceLifecycleStage[];
  transitions: IntelligenceLifecycleTransition[];
  complete: boolean;
  readOnly: true;
};

export type IntelligenceRegistryManifest = {
  platformId: typeof E05_INTELLIGENCE_PLATFORM_ID;
  version: typeof E05_INTELLIGENCE_VERSION;
  freezeVersion: typeof E05_INTELLIGENCE_FREEZE_VERSION;
  base: typeof E05_INTELLIGENCE_BASE;
  moduleCount: number;
  domains: IntelligenceDomain[];
  modules: IntelligenceDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};

export type IntelligenceFoundationResult = {
  platformId: typeof E05_INTELLIGENCE_PLATFORM_ID;
  version: typeof E05_INTELLIGENCE_VERSION;
  freezeVersion: typeof E05_INTELLIGENCE_FREEZE_VERSION;
  base: typeof E05_INTELLIGENCE_BASE;
  registry: IntelligenceRegistryManifest;
  lifecycle: IntelligenceLifecycle;
  ready: boolean;
  summary: string;
};
