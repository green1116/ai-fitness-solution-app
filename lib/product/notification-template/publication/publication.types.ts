/**
 * Product Notification Template — Publication / version lifecycle types
 * Draft > Review > Published > Archived
 */

import type { NOTIFICATION_TEMPLATE_VERSION_STATES } from "../management/management.constants";

export type NotificationTemplateVersionState =
  (typeof NOTIFICATION_TEMPLATE_VERSION_STATES)[number];
export type PublicationMetadata = Record<string, unknown>;

export type NotificationTemplatePublication = {
  id: string;
  templateId: string;
  versionTag: string;
  variantIds: string[];
  schemaId: string;
  state: NotificationTemplateVersionState;
  detail: string;
  metadata: PublicationMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateNotificationTemplatePublicationInput = {
  id?: string;
  templateId: string;
  versionTag: string;
  variantIds: string[];
  schemaId: string;
  metadata?: PublicationMetadata;
};

export type TransitionNotificationTemplatePublicationInput = {
  publicationId: string;
  state: NotificationTemplateVersionState;
};
