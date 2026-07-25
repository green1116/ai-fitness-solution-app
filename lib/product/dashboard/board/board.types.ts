/**
 * Product Dashboard — Board types
 */

import type {
  DASHBOARD_KINDS,
  DASHBOARD_STATUSES,
} from "../framework/framework.constants";

export type DashboardKind = (typeof DASHBOARD_KINDS)[number];
export type DashboardStatus = (typeof DASHBOARD_STATUSES)[number];
export type BoardMetadata = Record<string, unknown>;

export type DashboardBoard = {
  id: string;
  name: string;
  kind: DashboardKind;
  ownerId: string;
  status: DashboardStatus;
  detail: string;
  metadata: BoardMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateBoardInput = {
  id?: string;
  name: string;
  kind: DashboardKind;
  ownerId: string;
  metadata?: BoardMetadata;
};

export type UpdateBoardStatusInput = {
  boardId: string;
  status: DashboardStatus;
};
