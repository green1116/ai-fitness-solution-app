/**
 * Product API Portal — documentation types (definition only)
 */

import type { PORTAL_DOC_KINDS } from "../management/management.constants";

export type PortalDocKind = (typeof PORTAL_DOC_KINDS)[number];
export type PortalDocMetadata = Record<string, unknown>;

export type PortalDocument = {
  id: string;
  portalId: string;
  docKey: string;
  kind: PortalDocKind;
  title: string;
  slug: string;
  detail: string;
  metadata: PortalDocMetadata;
  createdAt: string;
};

export type RegisterPortalDocumentInput = {
  id?: string;
  portalId: string;
  docKey: string;
  kind: PortalDocKind;
  title: string;
  slug: string;
  metadata?: PortalDocMetadata;
};
