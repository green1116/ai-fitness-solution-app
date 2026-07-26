/**
 * Product Notification Template — Variable schema types
 */

import type { NOTIFICATION_TEMPLATE_VARIABLE_TYPES } from "../management/management.constants";

export type NotificationTemplateVariableType =
  (typeof NOTIFICATION_TEMPLATE_VARIABLE_TYPES)[number];
export type SchemaMetadata = Record<string, unknown>;

export type NotificationTemplateVariable = {
  name: string;
  type: NotificationTemplateVariableType;
  required: boolean;
  defaultValue?: string;
  description: string;
};

export type NotificationTemplateSchema = {
  id: string;
  templateId: string;
  variables: NotificationTemplateVariable[];
  detail: string;
  metadata: SchemaMetadata;
  createdAt: string;
};

export type DeclareNotificationTemplateSchemaInput = {
  id?: string;
  templateId: string;
  variables: NotificationTemplateVariable[];
  metadata?: SchemaMetadata;
};
