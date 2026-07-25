/**
 * Product P12 — Support types
 */

import type { SUPPORT_PRIORITIES } from "../launch/launch.constants";

export type SupportPriority = (typeof SUPPORT_PRIORITIES)[number];
export type SupportMetadata = Record<string, unknown>;

export type LaunchSupportCase = {
  id: string;
  launchId: string;
  title: string;
  priority: SupportPriority;
  owner: string;
  open: boolean;
  detail: string;
  metadata: SupportMetadata;
  openedAt: string;
  closedAt?: string;
};

export type OpenSupportCaseInput = {
  id?: string;
  launchId: string;
  title: string;
  priority: SupportPriority;
  owner: string;
  metadata?: SupportMetadata;
};

export type CloseSupportCaseInput = {
  caseId: string;
};
