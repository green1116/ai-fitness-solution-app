/**
 * Product Customer Profile — Attribute types
 */

import type { ATTRIBUTE_KINDS } from "../profile/profile.constants";

export type AttributeKind = (typeof ATTRIBUTE_KINDS)[number];
export type AttributeMetadata = Record<string, unknown>;

export type CustomerProfileAttribute = {
  id: string;
  identityId: string;
  kind: AttributeKind;
  key: string;
  value: string;
  detail: string;
  metadata: AttributeMetadata;
  assignedAt: string;
};

export type AssignAttributeInput = {
  id?: string;
  identityId: string;
  kind: AttributeKind;
  key: string;
  value: string;
  metadata?: AttributeMetadata;
};
