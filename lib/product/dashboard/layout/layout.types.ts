/**
 * Product Dashboard — Layout types
 */

import type { LAYOUT_REGIONS } from "../framework/framework.constants";

export type LayoutRegion = (typeof LAYOUT_REGIONS)[number];
export type LayoutMetadata = Record<string, unknown>;

export type DashboardLayout = {
  id: string;
  boardId: string;
  widgetId: string;
  region: LayoutRegion;
  order: number;
  detail: string;
  metadata: LayoutMetadata;
  placedAt: string;
};

export type PlaceWidgetInput = {
  id?: string;
  boardId: string;
  widgetId: string;
  region: LayoutRegion;
  order: number;
  metadata?: LayoutMetadata;
};
