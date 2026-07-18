/**
 * E08-P1 — Enterprise Ecosystem Foundation public exports
 */

export {
  E08_ECOSYSTEM_BASE,
  E08_ECOSYSTEM_FREEZE_VERSION,
  E08_ECOSYSTEM_PLATFORM_ID,
  E08_ECOSYSTEM_VERSION,
  ECOSYSTEM_DOMAINS,
  ECOSYSTEM_LIFECYCLE_STAGES,
  ECOSYSTEM_STATUSES,
  RELATIONSHIP_KINDS,
} from "./core/ecosystem.constants";

export type {
  EcosystemDomain,
  EcosystemFoundationResult,
  EcosystemLifecycle,
  EcosystemLifecycleStage,
  EcosystemPartnerDefinition,
  EcosystemRegistryManifest,
  EcosystemStatus,
  RelationshipKind,
} from "./core/ecosystem.types";

export {
  advanceEcosystemLifecycle,
  assertEcosystemFoundationPass,
  buildEcosystemFoundation,
  buildEcosystemFoundationLifecycle,
  canAdvanceEcosystemLifecycle,
  createInitialEcosystemLifecycle,
} from "./core/ecosystem.lifecycle";

export {
  ECOSYSTEM_PARTNER_CATALOG,
  buildEcosystemRegistryManifest,
  getPartnerByDomain,
  getPartnerById,
  isPartnerDependencyGraphValid,
  listExecutablePartners,
} from "./core/ecosystem.registry";

export type {
  RelationshipDefinition,
  RelationshipRegistryManifest,
} from "./relationship/relationship.types";

export {
  RELATIONSHIP_CATALOG,
  buildRelationshipRegistryManifest,
  getRelationshipById,
  listRelationshipsByKind,
} from "./relationship/relationship.registry";

export type {
  EcosystemExecutionContext,
  EcosystemInput,
  EcosystemMetadata,
} from "./runtime/ecosystem.context";

export {
  assertValidEcosystemContext,
  createEcosystemExecutionContext,
} from "./runtime/ecosystem.context";

export type {
  EcosystemExecuteBundle,
  EcosystemExecutionResult,
} from "./runtime/ecosystem.executor";

export {
  executeEcosystemPartner,
  executeEcosystemPartnerOrThrow,
} from "./runtime/ecosystem.executor";
