/**
 * Product Customer — Customer Foundation public exports
 * Isolated namespace: lib/product/customer
 */

export {
  CUSTOMER_KINDS,
  CUSTOMER_MANAGER_STATUSES,
  CUSTOMER_READINESS_VERDICTS,
  CUSTOMER_SEGMENTS,
  CUSTOMER_STATUSES,
  PRODUCT_CUSTOMER_FOUNDATION_BASE,
  PRODUCT_CUSTOMER_FOUNDATION_FREEZE_VERSION,
  PRODUCT_CUSTOMER_FOUNDATION_ID,
  PRODUCT_CUSTOMER_FOUNDATION_VERSION,
  PRODUCT_CUSTOMER_FREEZE_VERSION,
  RELATIONSHIP_KINDS,
} from "./foundation/foundation.constants";

export type {
  CustomerManagerStatus,
  CustomerReadinessCheck,
  CustomerReadinessResult,
  CustomerReadinessVerdict,
  CustomerRegistryManifest,
} from "./foundation/foundation.types";

export type {
  CustomerKind,
  CustomerProfile,
  CustomerStatus,
  ProfileMetadata,
  RegisterCustomerInput,
  UpdateCustomerStatusInput,
} from "./profile/profile.types";

export {
  clearCustomers,
  getCustomer,
  listCustomers,
  registerCustomer,
  updateCustomerStatus,
} from "./profile/profile.registry";

export type {
  CustomerRelationship,
  LinkRelationshipInput,
  RelationshipKind,
  RelationshipMetadata,
} from "./relationship/relationship.types";

export {
  clearRelationships,
  getRelationship,
  linkRelationship,
  listRelationships,
} from "./relationship/relationship.registry";

export type {
  AssignSegmentInput,
  CustomerSegmentAssignment,
  CustomerSegmentCode,
  SegmentMetadata,
} from "./segment/segment.types";

export {
  assignSegment,
  clearSegments,
  getSegment,
  listSegments,
} from "./segment/segment.registry";

export type {
  CustomerLifecycleEvent,
  LifecycleMetadata,
  TransitionLifecycleInput,
} from "./lifecycle/lifecycle.types";

export {
  clearLifecycleEvents,
  getLifecycleEvent,
  listLifecycleEvents,
  transitionLifecycle,
} from "./lifecycle/lifecycle.registry";

export {
  assertCustomerFoundationReadinessReady,
  evaluateCustomerFoundationReadiness,
} from "./foundation/foundation.readiness";

export {
  clearCustomerFoundationLayer,
  createCustomerManager,
  getCustomerRegistryManifest,
  type CustomerManager,
  type CustomerManagerSnapshot,
} from "./customer.manager";

export {
  assertProductCustomerReleaseGatePass,
  checkProductCustomerReleaseGate,
  PRODUCT_CUSTOMER_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
