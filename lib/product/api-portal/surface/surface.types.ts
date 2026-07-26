/**
 * Product API Portal — surface types (shell definition only)
 */

import type { PORTAL_SURFACE_KINDS } from "../management/management.constants";

export type PortalSurfaceKind = (typeof PORTAL_SURFACE_KINDS)[number];
export type PortalSurfaceMetadata = Record<string, unknown>;

export type PortalSurface = {
  id: string;
  portalId: string;
  surfaceKey: string;
  kind: PortalSurfaceKind;
  path: string;
  title: string;
  detail: string;
  metadata: PortalSurfaceMetadata;
  createdAt: string;
};

export type RegisterPortalSurfaceInput = {
  id?: string;
  portalId: string;
  surfaceKey: string;
  kind: PortalSurfaceKind;
  path: string;
  title: string;
  metadata?: PortalSurfaceMetadata;
};
