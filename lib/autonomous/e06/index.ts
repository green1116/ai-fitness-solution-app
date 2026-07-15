/**
 * E06-P1 — Autonomous Operation Foundation public exports
 */

export {
  E06_OPERATION_BASE,
  E06_OPERATION_FREEZE_VERSION,
  E06_OPERATION_PLATFORM_ID,
  E06_OPERATION_VERSION,
  OPERATION_DOMAINS,
  OPERATION_LIFECYCLE_STAGES,
  OPERATION_POLICY_EFFECTS,
  OPERATION_POLICY_KINDS,
  OPERATION_POLICY_OPS,
  OPERATION_STATUSES,
} from "./core/operation.constants";

export type {
  OperationDefinition,
  OperationDomain,
  OperationFoundationResult,
  OperationLifecycle,
  OperationLifecycleStage,
  OperationPolicyCondition,
  OperationPolicyDefinition,
  OperationPolicyEffect,
  OperationPolicyEvaluation,
  OperationPolicyKind,
  OperationPolicyOp,
  OperationPolicyRegistryManifest,
  OperationPolicyResult,
  OperationRegistryManifest,
  OperationStatus,
} from "./core/operation.types";

export {
  advanceOperationLifecycle,
  assertOperationFoundationPass,
  buildOperationFoundation,
  buildOperationFoundationLifecycle,
  canAdvanceOperationLifecycle,
  createInitialOperationLifecycle,
} from "./core/operation.lifecycle";

export {
  OPERATION_CATALOG,
  buildOperationRegistryManifest,
  getOperationByDomain,
  getOperationById,
  isOperationDependencyGraphValid,
  listExecutableOperations,
  listPoliciesForOperation,
} from "./core/operation.registry";

export type { OperationFacts } from "./policy/operation.policy";

export {
  evaluateOperationCondition,
  evaluateOperationPolicy,
  selectOperationPolicyEffect,
} from "./policy/operation.policy";

export {
  OPERATION_POLICY_CATALOG,
  buildOperationPolicyRegistryManifest,
  getOperationPolicyById,
  listPoliciesByKind,
} from "./policy/operation.policy.registry";

export type {
  OperationExecutionContext,
  OperationInput,
  OperationMetadata,
} from "./runtime/operation.context";

export {
  assertValidOperationContext,
  createOperationExecutionContext,
} from "./runtime/operation.context";

export type {
  OperationExecuteBundle,
  OperationExecutionResult,
} from "./runtime/operation.executor";

export {
  executeOperation,
  executeOperationOrThrow,
} from "./runtime/operation.executor";
