/**
 * Product BI — Connector types
 */

import type {
  BI_CONNECTOR_KINDS,
  BI_CONNECTOR_STATUSES,
} from "../integration/integration.constants";

export type BiConnectorKind = (typeof BI_CONNECTOR_KINDS)[number];
export type BiConnectorStatus = (typeof BI_CONNECTOR_STATUSES)[number];
export type ConnectorMetadata = Record<string, unknown>;

export type BiConnector = {
  id: string;
  name: string;
  kind: BiConnectorKind;
  endpoint: string;
  status: BiConnectorStatus;
  detail: string;
  metadata: ConnectorMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterConnectorInput = {
  id?: string;
  name: string;
  kind: BiConnectorKind;
  endpoint: string;
  metadata?: ConnectorMetadata;
};

export type ConnectBiInput = {
  connectorId: string;
};
