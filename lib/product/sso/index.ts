/**
 * Product SSO — Enterprise SSO Federation public exports
 * Isolated namespace: lib/product/sso
 */

export {
  PRODUCT_SSO_FEDERATION_BASE,
  PRODUCT_SSO_FEDERATION_FREEZE_VERSION,
  PRODUCT_SSO_FEDERATION_ID,
  PRODUCT_SSO_FEDERATION_VERSION,
  PRODUCT_SSO_FREEZE_VERSION,
  SSO_ASSERTION_RESULTS,
  SSO_CONNECTION_STATUSES,
  SSO_MANAGER_STATUSES,
  SSO_PROVIDER_PROTOCOLS,
  SSO_PROVIDER_STATUSES,
  SSO_READINESS_VERDICTS,
} from "./federation/federation.constants";

export type {
  SsoManagerStatus,
  SsoReadinessCheck,
  SsoReadinessResult,
  SsoReadinessVerdict,
  SsoRegistryManifest,
} from "./federation/federation.types";

export type {
  ActivateProviderInput,
  DisableProviderInput,
  ProviderMetadata,
  RegisterProviderInput,
  SsoProvider,
  SsoProviderProtocol,
  SsoProviderStatus,
} from "./provider/provider.types";

export {
  activateProvider,
  clearProviders,
  disableProvider,
  getProvider,
  listProviders,
  registerProvider,
} from "./provider/provider.registry";

export type {
  ConnectionMetadata,
  LinkConnectionInput,
  SsoConnection,
  SsoConnectionStatus,
  UpdateConnectionStatusInput,
} from "./connection/connection.types";

export {
  clearConnections,
  getConnection,
  linkConnection,
  listConnections,
  updateConnectionStatus,
} from "./connection/connection.registry";

export type {
  AssertionMetadata,
  FederateAssertionInput,
  SsoAssertion,
  SsoAssertionResult,
} from "./assertion/assertion.types";

export {
  clearAssertions,
  federateAssertion,
  getAssertion,
  listAssertions,
} from "./assertion/assertion.registry";

export type {
  ExchangeMetadata,
  ExchangeSessionInput,
  SsoExchange,
} from "./exchange/exchange.types";

export {
  clearExchanges,
  exchangeSession,
  getExchange,
  listExchanges,
} from "./exchange/exchange.registry";

export {
  assertSsoFederationReadinessReady,
  evaluateSsoFederationReadiness,
} from "./federation/federation.readiness";

export {
  clearSsoFederationLayer,
  createSsoManager,
  getSsoRegistryManifest,
  type SsoManager,
  type SsoManagerSnapshot,
} from "./sso.manager";

export {
  assertProductSsoReleaseGatePass,
  checkProductSsoReleaseGate,
  PRODUCT_SSO_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
