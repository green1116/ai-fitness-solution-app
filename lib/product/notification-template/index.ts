/**
 * Product Notification Template — public exports
 * Isolated namespace: lib/product/notification-template
 */

export {
  NOTIFICATION_TEMPLATE_KINDS,
  NOTIFICATION_TEMPLATE_LOCALES,
  NOTIFICATION_TEMPLATE_MANAGER_STATUSES,
  NOTIFICATION_TEMPLATE_READINESS_VERDICTS,
  NOTIFICATION_TEMPLATE_VARIABLE_TYPES,
  NOTIFICATION_TEMPLATE_VERSION_STATES,
  PRODUCT_TEMPLATE_FREEZE_VERSION,
  PRODUCT_TEMPLATE_MANAGEMENT_BASE,
  PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_TEMPLATE_MANAGEMENT_ID,
  PRODUCT_TEMPLATE_MANAGEMENT_VERSION,
} from "./management/management.constants";

export type {
  NotificationTemplateManagerStatus,
  NotificationTemplateReadinessCheck,
  NotificationTemplateReadinessResult,
  NotificationTemplateReadinessVerdict,
  NotificationTemplateRegistryManifest,
} from "./management/management.types";

export type {
  NotificationTemplate,
  NotificationTemplateKind,
  RegisterNotificationTemplateInput,
  TemplateMetadata,
} from "./registry/template.types";

export {
  clearNotificationTemplates,
  getNotificationTemplate,
  getNotificationTemplateByKey,
  listNotificationTemplates,
  registerNotificationTemplate,
} from "./registry/template.registry";

export type {
  NotificationTemplateLocale,
  NotificationTemplateVariant,
  RegisterNotificationTemplateVariantInput,
  VariantMetadata,
} from "./variant/variant.types";

export {
  clearNotificationTemplateVariants,
  getNotificationTemplateVariant,
  listNotificationTemplateVariants,
  registerNotificationTemplateVariant,
} from "./variant/variant.registry";

export type {
  DeclareNotificationTemplateSchemaInput,
  NotificationTemplateSchema,
  NotificationTemplateVariable,
  NotificationTemplateVariableType,
  SchemaMetadata,
} from "./schema/schema.types";

export {
  clearNotificationTemplateSchemas,
  declareNotificationTemplateSchema,
  getNotificationTemplateSchema,
  listNotificationTemplateSchemas,
} from "./schema/schema.registry";

export {
  renderNotificationTemplate,
  type RenderNotificationTemplateInput,
  type RenderNotificationTemplateResult,
} from "./renderer/renderer";

export type {
  CreateNotificationTemplatePublicationInput,
  NotificationTemplatePublication,
  NotificationTemplateVersionState,
  PublicationMetadata,
  TransitionNotificationTemplatePublicationInput,
} from "./publication/publication.types";

export {
  clearNotificationTemplatePublications,
  createNotificationTemplatePublication,
  getNotificationTemplatePublication,
  listNotificationTemplatePublications,
  transitionNotificationTemplatePublication,
} from "./publication/publication.registry";

export type { NotificationTemplateReleaseManifest } from "./manifest/manifest.registry";

export {
  clearNotificationTemplateReleaseManifests,
  createNotificationTemplateReleaseManifest,
  getNotificationTemplateReleaseManifest,
  listNotificationTemplateReleaseManifests,
} from "./manifest/manifest.registry";

export {
  assertNotificationTemplateReadinessReady,
  evaluateNotificationTemplateReadiness,
} from "./management/management.readiness";

export {
  clearNotificationTemplateManagementLayer,
  createNotificationTemplateManager,
  getNotificationTemplateRegistryManifest,
  type NotificationTemplateManager,
  type NotificationTemplateManagerSnapshot,
} from "./notification-template.manager";

export {
  assertProductNotificationTemplateReleaseGatePass,
  checkProductNotificationTemplateReleaseGate,
  PRODUCT_NOTIFICATION_TEMPLATE_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
