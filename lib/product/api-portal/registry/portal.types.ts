/**
 * Product API Portal — portal registry types
 */

import type { PORTAL_STATUSES } from "../management/management.constants";

export type PortalStatus = (typeof PORTAL_STATUSES)[number];
export type PortalMetadata = Record<string, unknown>;

export type ProductPortal = {
  id: string;
  portalKey: string;
  name: string;
  status: PortalStatus;
  sdkClientKeyRef: string;
  detail: string;
  metadata: PortalMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterPortalInput = {
  id?: string;
  portalKey: string;
  name: string;
  sdkClientKeyRef: string;
  metadata?: PortalMetadata;
};

export type UpdatePortalStatusInput = {
  portalId: string;
  status: PortalStatus;
};
