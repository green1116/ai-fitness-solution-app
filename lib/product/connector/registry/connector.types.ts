/**
 * Product Connector — registry types (declaration only)
 */

import type {
  CONNECTOR_KINDS,
  CONNECTOR_STATUSES,
} from "../management/management.constants";

export type ConnectorKind = (typeof CONNECTOR_KINDS)[number];
export type ConnectorStatus = (typeof CONNECTOR_STATUSES)[number];
export type ConnectorMetadata = Record<string, unknown>;

export type ProductConnector = {
  id: string;
  connectorKey: string;
  name: string;
  kind: ConnectorKind;
  status: ConnectorStatus;
  detail: string;
  metadata: ConnectorMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterConnectorInput = {
  id?: string;
  connectorKey: string;
  name: string;
  kind: ConnectorKind;
  metadata?: ConnectorMetadata;
};

export type UpdateConnectorStatusInput = {
  connectorId: string;
  status: ConnectorStatus;
};
