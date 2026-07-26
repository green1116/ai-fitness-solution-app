/**
 * Product Delivery — Delivery Engine public exports
 * Isolated namespace: lib/product/delivery
 */

export {
  DELIVERY_DISPATCH_CONTRACT_STATUSES,
  DELIVERY_MANAGER_STATUSES,
  DELIVERY_PIPELINE_STAGES,
  DELIVERY_READINESS_VERDICTS,
  DELIVERY_REQUEST_PRIORITIES,
  DELIVERY_RETRY_BACKOFFS,
  DELIVERY_STATUSES,
  PRODUCT_DELIVERY_ENGINE_BASE,
  PRODUCT_DELIVERY_ENGINE_FREEZE_VERSION,
  PRODUCT_DELIVERY_ENGINE_ID,
  PRODUCT_DELIVERY_ENGINE_VERSION,
  PRODUCT_DELIVERY_FREEZE_VERSION,
} from "./management/management.constants";

export type {
  DeliveryManagerStatus,
  DeliveryReadinessCheck,
  DeliveryReadinessResult,
  DeliveryReadinessVerdict,
  DeliveryRegistryManifest,
} from "./management/management.types";

export type {
  CreateDeliveryRequestInput,
  DeliveryRequest,
  DeliveryRequestPriority,
  RequestMetadata,
} from "./request/request.types";

export {
  clearDeliveryRequests,
  createDeliveryRequest,
  getDeliveryRequest,
  listDeliveryRequests,
} from "./request/request.registry";

export type {
  DefineDeliveryPipelineInput,
  DeliveryPipeline,
  DeliveryPipelineStage,
  PipelineMetadata,
} from "./pipeline/pipeline.types";

export {
  clearDeliveryPipelines,
  defineDeliveryPipeline,
  getDeliveryPipeline,
  listDeliveryPipelines,
} from "./pipeline/pipeline.registry";

export type {
  DeliveryStatus,
  DeliveryStatusRecord,
  OpenDeliveryStatusInput,
  StatusMetadata,
  UpdateDeliveryStatusInput,
} from "./status/status.types";

export {
  clearDeliveryStatuses,
  getDeliveryStatus,
  listDeliveryStatuses,
  openDeliveryStatus,
  updateDeliveryStatus,
} from "./status/status.registry";

export type {
  AttachDeliveryRetryPolicyInput,
  DeliveryRetryBackoff,
  DeliveryRetryPolicy,
  RetryMetadata,
} from "./retry/retry.types";

export {
  attachDeliveryRetryPolicy,
  clearDeliveryRetryPolicies,
  getDeliveryRetryPolicy,
  listDeliveryRetryPolicies,
} from "./retry/retry.registry";

export type {
  DeliveryDispatchContract,
  DeliveryDispatchContractStatus,
  DispatchMetadata,
  RegisterDeliveryDispatchContractInput,
  UpdateDeliveryDispatchContractStatusInput,
} from "./dispatch/dispatch.types";

export {
  clearDeliveryDispatchContracts,
  getDeliveryDispatchContract,
  listDeliveryDispatchContracts,
  registerDeliveryDispatchContract,
  updateDeliveryDispatchContractStatus,
} from "./dispatch/dispatch.registry";

export type { DeliveryReleaseManifest } from "./manifest/manifest.registry";

export {
  clearDeliveryReleaseManifests,
  createDeliveryReleaseManifest,
  getDeliveryReleaseManifest,
  listDeliveryReleaseManifests,
} from "./manifest/manifest.registry";

export {
  assertDeliveryEngineReadinessReady,
  evaluateDeliveryEngineReadiness,
} from "./management/management.readiness";

export {
  clearDeliveryEngineLayer,
  createDeliveryManager,
  getDeliveryRegistryManifest,
  type DeliveryManager,
  type DeliveryManagerSnapshot,
} from "./delivery.manager";

export {
  assertProductDeliveryReleaseGatePass,
  checkProductDeliveryReleaseGate,
  PRODUCT_DELIVERY_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
