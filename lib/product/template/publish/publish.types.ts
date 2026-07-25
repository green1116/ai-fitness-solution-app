/**
 * Product Template — Publish types
 */

import type { TEMPLATE_PUBLISH_STATUSES } from "../management/management.constants";

export type TemplatePublishStatus =
  (typeof TEMPLATE_PUBLISH_STATUSES)[number];
export type PublishMetadata = Record<string, unknown>;

export type TemplatePublish = {
  id: string;
  definitionId: string;
  versionTag: string;
  variantIds: string[];
  status: TemplatePublishStatus;
  detail: string;
  metadata: PublishMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateTemplatePublishInput = {
  id?: string;
  definitionId: string;
  versionTag: string;
  variantIds: string[];
  metadata?: PublishMetadata;
};

export type UpdateTemplatePublishStatusInput = {
  publishId: string;
  status: TemplatePublishStatus;
};
