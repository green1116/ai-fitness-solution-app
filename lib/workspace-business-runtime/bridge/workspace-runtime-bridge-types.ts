import type { BusinessSurfaceKey } from "../shared/business-constants";

export type BusinessReadiness = "READY" | "PARTIAL" | "BLOCKED";

export const BUSINESS_READINESS_VALUES: BusinessReadiness[] = ["READY", "PARTIAL", "BLOCKED"];

export interface BusinessReadinessView {
  readiness: BusinessReadiness;
  workspaceId: string;
  kernelAggregateStatus: string;
  kernelEligible: boolean;
  kernelAssembled: boolean;
}

export interface BusinessSurfaceView {
  key: BusinessSurfaceKey;
  kernelStatus: string;
  eligible: boolean;
  visible: boolean;
  active: boolean;
}

export interface BusinessEntryView {
  key: BusinessSurfaceKey;
  kernelStatus: string;
  eligible: boolean;
  active: boolean;
}

export interface WorkspaceBusinessBridgeView {
  workspaceId: string;
  version: string;
  readiness: BusinessReadinessView;
  surfaces: BusinessSurfaceView[];
  entries: BusinessEntryView[];
}

export interface BusinessP1Validation {
  valid: boolean;
  summary: string;
}
