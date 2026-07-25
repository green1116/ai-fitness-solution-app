/**
 * Product Relationship — Relationship Management public exports
 * Isolated namespace: lib/product/relationship
 */

export {
  CLASSIFICATION_TIERS,
  PARTY_ROLES,
  PRODUCT_RELATIONSHIP_FREEZE_VERSION,
  PRODUCT_RELATIONSHIP_MANAGEMENT_BASE,
  PRODUCT_RELATIONSHIP_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_RELATIONSHIP_MANAGEMENT_ID,
  PRODUCT_RELATIONSHIP_MANAGEMENT_VERSION,
  RELATIONSHIP_KINDS,
  RELATIONSHIP_MANAGER_STATUSES,
  RELATIONSHIP_READINESS_VERDICTS,
  RELATIONSHIP_STATUSES,
} from "./management/management.constants";

export type {
  RelationshipManagerStatus,
  RelationshipReadinessCheck,
  RelationshipReadinessResult,
  RelationshipReadinessVerdict,
  RelationshipRegistryManifest,
} from "./management/management.types";

export type {
  BondMetadata,
  CreateBondInput,
  RelationshipBond,
  RelationshipKind,
  RelationshipStatus,
  UpdateBondStatusInput,
} from "./bond/bond.types";

export {
  clearBonds,
  createBond,
  getBond,
  listBonds,
  updateBondStatus,
} from "./bond/bond.registry";

export type {
  AttachPartyInput,
  PartyMetadata,
  PartyRole,
  RelationshipParty,
} from "./party/party.types";

export {
  attachParty,
  clearParties,
  getParty,
  listParties,
} from "./party/party.registry";

export type {
  ClassificationMetadata,
  ClassificationTier,
  ClassifyBondInput,
  RelationshipClassification,
} from "./classification/classification.types";

export {
  classifyBond,
  clearClassifications,
  getClassification,
  listClassifications,
} from "./classification/classification.registry";

export type {
  LifecycleMetadata,
  RelationshipLifecycleEvent,
  TransitionBondLifecycleInput,
} from "./lifecycle/lifecycle.types";

export {
  clearLifecycleEvents,
  getLifecycleEvent,
  listLifecycleEvents,
  transitionBondLifecycle,
} from "./lifecycle/lifecycle.registry";

export {
  assertRelationshipManagementReadinessReady,
  evaluateRelationshipManagementReadiness,
} from "./management/management.readiness";

export {
  clearRelationshipManagementLayer,
  createRelationshipManager,
  getRelationshipRegistryManifest,
  type RelationshipManager,
  type RelationshipManagerSnapshot,
} from "./relationship.manager";

export {
  assertProductRelationshipReleaseGatePass,
  checkProductRelationshipReleaseGate,
  PRODUCT_RELATIONSHIP_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
