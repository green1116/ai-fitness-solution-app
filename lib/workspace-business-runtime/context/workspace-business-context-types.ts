import type {
  BusinessEntryView,
  BusinessReadiness,
  BusinessReadinessView,
  BusinessSurfaceView,
} from "../bridge/workspace-runtime-bridge-types";

export type BusinessStatus = BusinessReadiness;

export const BUSINESS_STATUS_VALUES: BusinessStatus[] = ["READY", "PARTIAL", "BLOCKED"];

export interface BusinessScope {
  workspaceId: string;
  version: string;
}

export interface WorkspaceBusinessContext {
  scope: BusinessScope;
  readiness: BusinessReadinessView;
  surfaces: BusinessSurfaceView[];
  entries: BusinessEntryView[];
}

export interface WorkspaceBusinessContextValidation {
  valid: boolean;
  summary: string;
}
