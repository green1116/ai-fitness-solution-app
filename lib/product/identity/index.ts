/**
 * Product Identity — Identity Foundation public exports
 * Isolated namespace: lib/product/identity
 */

export {
  ACCESS_DECISIONS,
  AUTH_STATUSES,
  CREDENTIAL_KINDS,
  IDENTITY_MANAGER_STATUSES,
  IDENTITY_READINESS_VERDICTS,
  PRINCIPAL_KINDS,
  PRODUCT_IDENTITY_FOUNDATION_BASE,
  PRODUCT_IDENTITY_FOUNDATION_FREEZE_VERSION,
  PRODUCT_IDENTITY_FOUNDATION_ID,
  PRODUCT_IDENTITY_FOUNDATION_VERSION,
  PRODUCT_IDENTITY_FREEZE_VERSION,
  SESSION_STATUSES,
  TOKEN_KINDS,
} from "./authentication/authentication.constants";

export type {
  AuthenticateInput,
  AuthenticationRecord,
  AuthMetadata,
  AuthStatus,
  IdentityManagerStatus,
  IdentityReadinessCheck,
  IdentityReadinessResult,
  IdentityReadinessVerdict,
  IdentityRegistryManifest,
  UpdateAuthStatusInput,
} from "./authentication/authentication.types";

export {
  authenticate,
  clearAuthentications,
  getAuthentication,
  listAuthentications,
  updateAuthStatus,
} from "./authentication/authentication.registry";

export type {
  IdentityPrincipal,
  PrincipalKind,
  PrincipalMetadata,
  RegisterPrincipalInput,
} from "./principal/principal.types";

export {
  clearPrincipals,
  getPrincipal,
  listPrincipals,
  registerPrincipal,
} from "./principal/principal.registry";

export type {
  CredentialKind,
  CredentialMetadata,
  IdentityCredential,
  IssueCredentialInput,
} from "./credential/credential.types";

export {
  clearCredentials,
  getCredential,
  issueCredential,
  listCredentials,
} from "./credential/credential.registry";

export type {
  CloseSessionInput,
  IdentitySession,
  OpenSessionInput,
  SessionMetadata,
  SessionStatus,
} from "./session/session.types";

export {
  clearSessions,
  closeSession,
  getSession,
  listSessions,
  openSession,
} from "./session/session.registry";

export type {
  IdentityToken,
  IssueTokenInput,
  TokenKind,
  TokenMetadata,
} from "./token/token.types";

export {
  clearTokens,
  getToken,
  issueToken,
  listTokens,
} from "./token/token.registry";

export type {
  AccessDecision,
  AccessEvaluation,
  AccessMetadata,
  EvaluateAccessInput,
} from "./access/access.types";

export {
  clearAccess,
  evaluateAccess,
  getAccess,
  listAccess,
} from "./access/access.registry";

export {
  assertIdentityFoundationReadinessReady,
  evaluateIdentityFoundationReadiness,
} from "./authentication/authentication.readiness";

export {
  clearIdentityFoundationLayer,
  createIdentityManager,
  getIdentityRegistryManifest,
  type IdentityManager,
  type IdentityManagerSnapshot,
} from "./identity.manager";

export {
  assertProductIdentityReleaseGatePass,
  checkProductIdentityReleaseGate,
  PRODUCT_IDENTITY_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
