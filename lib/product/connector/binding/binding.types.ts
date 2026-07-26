/**
 * Product Connector — binding types (marketplace listing ref only)
 */

import type { CONNECTOR_BINDING_STATUSES } from "../management/management.constants";

export type ConnectorBindingStatus =
  (typeof CONNECTOR_BINDING_STATUSES)[number];
export type BindingMetadata = Record<string, unknown>;

export type ConnectorBinding = {
  id: string;
  connectorId: string;
  bindingKey: string;
  listingKeyRef: string;
  status: ConnectorBindingStatus;
  detail: string;
  metadata: BindingMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindConnectorInput = {
  id?: string;
  connectorId: string;
  bindingKey: string;
  listingKeyRef: string;
  metadata?: BindingMetadata;
};

export type UpdateConnectorBindingStatusInput = {
  bindingId: string;
  status: ConnectorBindingStatus;
};
