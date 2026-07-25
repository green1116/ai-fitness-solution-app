/**
 * Product Configuration — Namespace types
 */

import type {
  CONFIG_NAMESPACE_SCOPES,
  CONFIG_NAMESPACE_STATUSES,
} from "../management/management.constants";

export type ConfigNamespaceScope = (typeof CONFIG_NAMESPACE_SCOPES)[number];
export type ConfigNamespaceStatus = (typeof CONFIG_NAMESPACE_STATUSES)[number];
export type NamespaceMetadata = Record<string, unknown>;

export type ConfigNamespace = {
  id: string;
  code: string;
  name: string;
  scope: ConfigNamespaceScope;
  status: ConfigNamespaceStatus;
  detail: string;
  metadata: NamespaceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterConfigNamespaceInput = {
  id?: string;
  code: string;
  name: string;
  scope: ConfigNamespaceScope;
  metadata?: NamespaceMetadata;
};

export type UpdateConfigNamespaceStatusInput = {
  namespaceId: string;
  status: ConfigNamespaceStatus;
};
