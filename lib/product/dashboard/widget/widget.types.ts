/**
 * Product Dashboard — Widget types
 */

import type { WIDGET_KINDS } from "../framework/framework.constants";

export type WidgetKind = (typeof WIDGET_KINDS)[number];
export type WidgetMetadata = Record<string, unknown>;

export type DashboardWidget = {
  id: string;
  boardId: string;
  kind: WidgetKind;
  title: string;
  refId: string;
  detail: string;
  metadata: WidgetMetadata;
  addedAt: string;
};

export type AddWidgetInput = {
  id?: string;
  boardId: string;
  kind: WidgetKind;
  title: string;
  refId: string;
  metadata?: WidgetMetadata;
};
