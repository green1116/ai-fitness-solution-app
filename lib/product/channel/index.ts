/**
 * Product Channel — Channel Management public exports
 * Isolated namespace: lib/product/channel
 */

export {
  CHANNEL_CAPABILITY_FEATURES,
  CHANNEL_KINDS,
  CHANNEL_MANAGER_STATUSES,
  CHANNEL_POLICY_MODES,
  CHANNEL_READINESS_VERDICTS,
  CHANNEL_STATUSES,
  CHANNEL_VALIDATION_VERDICTS,
  PRODUCT_CHANNEL_FREEZE_VERSION,
  PRODUCT_CHANNEL_MANAGEMENT_BASE,
  PRODUCT_CHANNEL_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_CHANNEL_MANAGEMENT_ID,
  PRODUCT_CHANNEL_MANAGEMENT_VERSION,
} from "./management/management.constants";

export type {
  ChannelManagerStatus,
  ChannelReadinessCheck,
  ChannelReadinessResult,
  ChannelReadinessVerdict,
  ChannelRegistryManifest,
} from "./management/management.types";

export type {
  ChannelKind,
  ChannelMetadata,
  ChannelStatus,
  NotificationChannel,
  RegisterChannelInput,
  UpdateChannelStatusInput,
} from "./registry/channel.types";

export {
  clearChannels,
  getChannel,
  getChannelByKey,
  listChannels,
  registerChannel,
  updateChannelStatus,
} from "./registry/channel.registry";

export type {
  CapabilityMetadata,
  ChannelCapability,
  ChannelCapabilityFeature,
  DeclareChannelCapabilityInput,
} from "./capability/capability.types";

export {
  clearChannelCapabilities,
  declareChannelCapability,
  getChannelCapability,
  listChannelCapabilities,
} from "./capability/capability.registry";

export type {
  AttachChannelPolicyInput,
  ChannelPolicy,
  ChannelPolicyMode,
  PolicyMetadata,
} from "./policy/policy.types";

export {
  attachChannelPolicy,
  clearChannelPolicies,
  getChannelPolicy,
  listChannelPolicies,
} from "./policy/policy.registry";

export type {
  ChannelValidation,
  ChannelValidationVerdict,
  ValidateChannelInput,
  ValidationMetadata,
} from "./validation/validation.types";

export {
  clearChannelValidations,
  getChannelValidation,
  listChannelValidations,
  validateChannel,
} from "./validation/validation.registry";

export type { ChannelReleaseManifest } from "./manifest/manifest.registry";

export {
  clearChannelReleaseManifests,
  createChannelReleaseManifest,
  getChannelReleaseManifest,
  listChannelReleaseManifests,
} from "./manifest/manifest.registry";

export {
  assertChannelManagementReadinessReady,
  evaluateChannelManagementReadiness,
} from "./management/management.readiness";

export {
  clearChannelManagementLayer,
  createChannelManager,
  getChannelRegistryManifest,
  type ChannelManager,
  type ChannelManagerSnapshot,
} from "./channel.manager";

export {
  assertProductChannelReleaseGatePass,
  checkProductChannelReleaseGate,
  PRODUCT_CHANNEL_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
