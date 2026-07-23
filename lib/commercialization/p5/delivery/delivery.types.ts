/**
 * Commercialization P5 — Delivery types
 */

import type {
  DELIVERY_PHASES,
  DELIVERY_STATUSES,
} from "./delivery.constants";

export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];
export type DeliveryPhase = (typeof DELIVERY_PHASES)[number];
export type DeliveryMetadata = Record<string, unknown>;

export type DeliveryPlan = {
  id: string;
  projectId: string;
  name: string;
  status: DeliveryStatus;
  phase: DeliveryPhase;
  completedPhases: DeliveryPhase[];
  detail: string;
  metadata: DeliveryMetadata;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
};

export type RegisterDeliveryInput = {
  id?: string;
  projectId: string;
  name: string;
  metadata?: DeliveryMetadata;
};

export type DeliveryWorkflowEvent = {
  id: string;
  deliveryId: string;
  phase: DeliveryPhase;
  previousPhase?: DeliveryPhase;
  note: string;
  advancedAt: string;
};

export type AdvanceDeliveryInput = {
  id?: string;
  deliveryId: string;
  phase: DeliveryPhase;
  note?: string;
};
