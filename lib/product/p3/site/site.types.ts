/**
 * Product P3 — Site types
 */

import type { SITE_STATUSES } from "../project/project.constants";

export type SiteStatus = (typeof SITE_STATUSES)[number];
export type SiteMetadata = Record<string, unknown>;

export type ProjectSite = {
  id: string;
  projectId: string;
  name: string;
  location: string;
  status: SiteStatus;
  detail: string;
  metadata: SiteMetadata;
  createdAt: string;
};

export type RegisterSiteInput = {
  id?: string;
  projectId: string;
  name: string;
  location: string;
  metadata?: SiteMetadata;
};
