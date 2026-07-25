/**
 * Product Notification — Notification Foundation public exports
 * Isolated namespace: lib/product/notification
 */

export {
  NOTIFICATION_CHANNEL_KINDS,
  NOTIFICATION_CHANNEL_STATUSES,
  NOTIFICATION_DELIVERY_STATUSES,
  NOTIFICATION_MANAGER_STATUSES,
  NOTIFICATION_MESSAGE_PRIORITIES,
  NOTIFICATION_READINESS_VERDICTS,
  NOTIFICATION_TEMPLATE_KINDS,
  PRODUCT_NOTIFICATION_FOUNDATION_BASE,
  PRODUCT_NOTIFICATION_FOUNDATION_FREEZE_VERSION,
  PRODUCT_NOTIFICATION_FOUNDATION_ID,
  PRODUCT_NOTIFICATION_FOUNDATION_VERSION,
  PRODUCT_NOTIFICATION_FREEZE_VERSION,
} from "./foundation/foundation.constants";

export type {
  NotificationManagerStatus,
  NotificationReadinessCheck,
  NotificationReadinessResult,
  NotificationReadinessVerdict,
  NotificationRegistryManifest,
} from "./foundation/foundation.types";

export type {
  ChannelMetadata,
  NotificationChannel,
  NotificationChannelKind,
  NotificationChannelStatus,
  RegisterNotificationChannelInput,
  UpdateNotificationChannelStatusInput,
} from "./channel/channel.types";

export {
  clearNotificationChannels,
  getNotificationChannel,
  listNotificationChannels,
  registerNotificationChannel,
  updateNotificationChannelStatus,
} from "./channel/channel.registry";

export type {
  NotificationTemplate,
  NotificationTemplateKind,
  RegisterNotificationTemplateInput,
  TemplateMetadata,
} from "./template/template.types";

export {
  clearNotificationTemplates,
  getNotificationTemplate,
  listNotificationTemplates,
  registerNotificationTemplate,
} from "./template/template.registry";

export type {
  ComposeNotificationMessageInput,
  MessageMetadata,
  NotificationMessage,
  NotificationMessagePriority,
} from "./message/message.types";

export {
  clearNotificationMessages,
  composeNotificationMessage,
  getNotificationMessage,
  listNotificationMessages,
} from "./message/message.registry";

export type {
  DeliveryMetadata,
  NotificationDelivery,
  NotificationDeliveryStatus,
  QueueNotificationDeliveryInput,
  UpdateNotificationDeliveryStatusInput,
} from "./delivery/delivery.types";

export {
  clearNotificationDeliveries,
  getNotificationDelivery,
  listNotificationDeliveries,
  queueNotificationDelivery,
  updateNotificationDeliveryStatus,
} from "./delivery/delivery.registry";

export {
  assertNotificationFoundationReadinessReady,
  evaluateNotificationFoundationReadiness,
} from "./foundation/foundation.readiness";

export {
  clearNotificationFoundationLayer,
  createNotificationManager,
  getNotificationRegistryManifest,
  type NotificationManager,
  type NotificationManagerSnapshot,
} from "./notification.manager";

export {
  assertProductNotificationReleaseGatePass,
  checkProductNotificationReleaseGate,
  PRODUCT_NOTIFICATION_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
