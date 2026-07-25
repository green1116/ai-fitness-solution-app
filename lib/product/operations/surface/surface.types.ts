/**
 * Product Operations — Surface types
 */

import type {
  OPS_CONSOLE_KINDS,
  OPS_CONSOLE_STATUSES,
} from "../console/console.constants";

export type OpsConsoleKind = (typeof OPS_CONSOLE_KINDS)[number];
export type OpsConsoleStatus = (typeof OPS_CONSOLE_STATUSES)[number];
export type SurfaceMetadata = Record<string, unknown>;

export type OpsSurface = {
  id: string;
  code: string;
  name: string;
  kind: OpsConsoleKind;
  configReleaseId: string;
  status: OpsConsoleStatus;
  detail: string;
  metadata: SurfaceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterOpsSurfaceInput = {
  id?: string;
  code: string;
  name: string;
  kind: OpsConsoleKind;
  configReleaseId: string;
  metadata?: SurfaceMetadata;
};

export type UpdateOpsSurfaceStatusInput = {
  surfaceId: string;
  status: OpsConsoleStatus;
};
