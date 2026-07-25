/**
 * Product Session — Session Control public exports
 * Isolated namespace: lib/product/session
 */

export {
  PRODUCT_SESSION_CONTROL_BASE,
  PRODUCT_SESSION_CONTROL_FREEZE_VERSION,
  PRODUCT_SESSION_CONTROL_ID,
  PRODUCT_SESSION_CONTROL_VERSION,
  PRODUCT_SESSION_FREEZE_VERSION,
  SESSION_LIFECYCLE_STATUSES,
  SESSION_MANAGER_STATUSES,
  SESSION_READINESS_VERDICTS,
  TOKEN_FLOW_KINDS,
  TOKEN_FLOW_STATUSES,
  VALIDATION_RESULTS,
} from "./control/control.constants";

export type {
  SessionManagerStatus,
  SessionReadinessCheck,
  SessionReadinessResult,
  SessionReadinessVerdict,
  SessionRegistryManifest,
} from "./control/control.types";

export type {
  CloseControlledSessionInput,
  ControlledSession,
  OpenControlledSessionInput,
  RefreshSessionInput,
  SessionLifecycleMetadata,
  SessionLifecycleStatus,
} from "./lifecycle/lifecycle.types";

export {
  clearSessions,
  closeSession,
  getSession,
  listSessions,
  openSession,
  refreshSession,
} from "./lifecycle/lifecycle.registry";

export type {
  FlowToken,
  IssueFlowTokenInput,
  RevokeTokenInput,
  RotateTokenInput,
  TokenFlowKind,
  TokenFlowMetadata,
  TokenFlowStatus,
} from "./token/token.types";

export {
  clearTokens,
  getToken,
  issueToken,
  listTokens,
  revokeToken,
  rotateToken,
} from "./token/token.registry";

export type {
  RecordRefreshInput,
  RefreshMetadata,
  SessionRefreshRecord,
} from "./refresh/refresh.types";

export {
  clearRefreshes,
  getRefresh,
  listRefreshes,
  recordRefresh,
} from "./refresh/refresh.registry";

export type {
  SessionValidation,
  ValidateSessionInput,
  ValidationMetadata,
  ValidationResult,
} from "./validation/validation.types";

export {
  clearValidations,
  getValidation,
  listValidations,
  validateSession,
} from "./validation/validation.registry";

export {
  assertSessionControlReadinessReady,
  evaluateSessionControlReadiness,
} from "./control/control.readiness";

export {
  clearSessionControlLayer,
  createSessionManager,
  getSessionRegistryManifest,
  type SessionManager,
  type SessionManagerSnapshot,
} from "./session.manager";

export {
  assertProductSessionReleaseGatePass,
  checkProductSessionReleaseGate,
  PRODUCT_SESSION_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
