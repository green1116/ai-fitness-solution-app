/**
 * Product API Gateway — gateway registry types
 */

import type { GATEWAY_STATUSES } from "../management/management.constants";

export type GatewayStatus = (typeof GATEWAY_STATUSES)[number];
export type GatewayMetadata = Record<string, unknown>;

export type ProductGateway = {
  id: string;
  gatewayKey: string;
  name: string;
  status: GatewayStatus;
  detail: string;
  metadata: GatewayMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterGatewayInput = {
  id?: string;
  gatewayKey: string;
  name: string;
  metadata?: GatewayMetadata;
};

export type UpdateGatewayStatusInput = {
  gatewayId: string;
  status: GatewayStatus;
};
