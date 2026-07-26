/**
 * Product API Gateway — public exports
 * Isolated namespace: lib/product/api-gateway
 */

export {
  GATEWAY_HTTP_METHODS,
  GATEWAY_MANAGER_STATUSES,
  GATEWAY_POLICY_MODES,
  GATEWAY_READINESS_VERDICTS,
  GATEWAY_STATUSES,
  GATEWAY_VALIDATION_VERDICTS,
  PRODUCT_API_GATEWAY_BASE,
  PRODUCT_API_GATEWAY_FREEZE_TAG,
  PRODUCT_API_GATEWAY_FREEZE_VERSION,
  PRODUCT_API_GATEWAY_ID,
  PRODUCT_API_GATEWAY_VERSION,
} from "./management/management.constants";

export type {
  GatewayManagerStatus,
  GatewayReadinessCheck,
  GatewayReadinessResult,
  GatewayReadinessVerdict,
  GatewayRegistryManifest,
} from "./management/management.types";

export type {
  GatewayMetadata,
  GatewayStatus,
  ProductGateway,
  RegisterGatewayInput,
  UpdateGatewayStatusInput,
} from "./registry/gateway.types";

export {
  clearGateways,
  getGateway,
  listGateways,
  registerGateway,
  updateGatewayStatus,
} from "./registry/gateway.registry";

export type {
  GatewayHttpMethod,
  GatewayRoute,
  GatewayRouteResolution,
  RegisterGatewayRouteInput,
  ResolveGatewayRouteInput,
  RouteMetadata,
} from "./route/route.types";

export {
  clearGatewayRoutes,
  getGatewayRoute,
  listGatewayRoutes,
  registerGatewayRoute,
  resolveGatewayRoute,
} from "./route/route.registry";

export type {
  AttachGatewayRequestPolicyInput,
  GatewayPolicyMode,
  GatewayRequestPolicy,
  PolicyMetadata,
} from "./policy/policy.types";

export {
  attachGatewayRequestPolicy,
  clearGatewayRequestPolicies,
  getGatewayRequestPolicy,
  listGatewayRequestPolicies,
} from "./policy/policy.registry";

export type {
  GatewayRequestValidation,
  GatewayValidationVerdict,
  ValidateGatewayRequestInput,
  ValidationMetadata,
} from "./validation/validation.types";

export {
  clearGatewayRequestValidations,
  getGatewayRequestValidation,
  listGatewayRequestValidations,
  validateGatewayRequest,
} from "./validation/validation.registry";

export type { ApiGatewayReleaseManifest } from "./manifest/manifest.registry";

export {
  clearApiGatewayReleaseManifests,
  createApiGatewayReleaseManifest,
  getApiGatewayReleaseManifest,
  listApiGatewayReleaseManifests,
} from "./manifest/manifest.registry";

export {
  assertApiGatewayReadinessReady,
  evaluateApiGatewayReadiness,
} from "./management/management.readiness";

export {
  clearApiGatewayLayer,
  createApiGatewayManager,
  getApiGatewayRegistryManifest,
  type ApiGatewayManager,
  type GatewayManagerSnapshot,
} from "./api-gateway.manager";

export {
  assertProductApiGatewayReleaseGatePass,
  checkProductApiGatewayReleaseGate,
  PRODUCT_API_GATEWAY_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
