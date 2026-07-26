/**
 * Product Connector — contract types (shape refs only, no provider SDK)
 */

import type { CONNECTOR_CONTRACT_KINDS } from "../management/management.constants";

export type ConnectorContractKind =
  (typeof CONNECTOR_CONTRACT_KINDS)[number];
export type ContractMetadata = Record<string, unknown>;

export type ConnectorContract = {
  id: string;
  definitionId: string;
  contractKey: string;
  kind: ConnectorContractKind;
  shapeRef: string;
  detail: string;
  metadata: ContractMetadata;
  createdAt: string;
};

export type RegisterConnectorContractInput = {
  id?: string;
  definitionId: string;
  contractKey: string;
  kind: ConnectorContractKind;
  shapeRef: string;
  metadata?: ContractMetadata;
};
