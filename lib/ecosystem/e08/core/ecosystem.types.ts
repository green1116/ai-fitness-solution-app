/**
 * E08-P1 — Enterprise Ecosystem Foundation types
 * Abstraction above E07 Digital Workforce Platform
 */

import {
  E08_ECOSYSTEM_BASE,
  E08_ECOSYSTEM_FREEZE_VERSION,
  E08_ECOSYSTEM_PLATFORM_ID,
  E08_ECOSYSTEM_VERSION,
  ECOSYSTEM_DOMAINS,
  ECOSYSTEM_LIFECYCLE_STAGES,
  ECOSYSTEM_STATUSES,
  RELATIONSHIP_KINDS,
} from "./ecosystem.constants";

export type EcosystemDomain = (typeof ECOSYSTEM_DOMAINS)[number];
export type EcosystemStatus = (typeof ECOSYSTEM_STATUSES)[number];
export type EcosystemLifecycleStage =
  (typeof ECOSYSTEM_LIFECYCLE_STAGES)[number];
export type RelationshipKind = (typeof RELATIONSHIP_KINDS)[number];

export type EcosystemPartnerDefinition = {
  id: string;
  name: string;
  domain: EcosystemDomain;
  description: string;
  /** Bound E07 digital worker id */
  workerId: string;
  relationshipIds: string[];
  dependsOn: string[];
  optional: boolean;
  readOnly: true;
};

export type EcosystemLifecycleTransition = {
  from: EcosystemLifecycleStage;
  to: EcosystemLifecycleStage;
  at: string;
  note?: string;
  readOnly: true;
};

export type EcosystemLifecycle = {
  current: EcosystemLifecycleStage;
  stages: EcosystemLifecycleStage[];
  transitions: EcosystemLifecycleTransition[];
  complete: boolean;
  readOnly: true;
};

export type EcosystemRegistryManifest = {
  platformId: typeof E08_ECOSYSTEM_PLATFORM_ID;
  version: typeof E08_ECOSYSTEM_VERSION;
  freezeVersion: typeof E08_ECOSYSTEM_FREEZE_VERSION;
  base: typeof E08_ECOSYSTEM_BASE;
  partnerCount: number;
  domains: EcosystemDomain[];
  partners: EcosystemPartnerDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};

export type EcosystemFoundationResult = {
  platformId: typeof E08_ECOSYSTEM_PLATFORM_ID;
  version: typeof E08_ECOSYSTEM_VERSION;
  freezeVersion: typeof E08_ECOSYSTEM_FREEZE_VERSION;
  base: typeof E08_ECOSYSTEM_BASE;
  registry: EcosystemRegistryManifest;
  lifecycle: EcosystemLifecycle;
  ready: boolean;
  summary: string;
};
