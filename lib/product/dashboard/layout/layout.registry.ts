/**
 * Product Dashboard — Layout registry
 */

import { getBoard } from "../board/board.registry";
import { LAYOUT_REGIONS } from "../framework/framework.constants";
import { getWidget } from "../widget/widget.registry";
import type {
  DashboardLayout,
  LayoutRegion,
  PlaceWidgetInput,
} from "./layout.types";

const layouts = new Map<string, DashboardLayout>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneLayout(layout: DashboardLayout): DashboardLayout {
  return { ...layout, metadata: { ...layout.metadata } };
}

export function placeWidget(input: PlaceWidgetInput): DashboardLayout {
  const boardId = input.boardId.trim();
  const widgetId = input.widgetId.trim();
  if (!boardId) throw new Error("layout.boardId is required");
  if (!widgetId) throw new Error("layout.widgetId is required");
  if (!(LAYOUT_REGIONS as readonly string[]).includes(input.region)) {
    throw new Error(`invalid layout region: ${input.region}`);
  }
  if (!Number.isFinite(input.order) || input.order < 0) {
    throw new Error("layout.order must be a non-negative number");
  }
  if (!getBoard(boardId)) throw new Error(`board not found: ${boardId}`);

  const widget = getWidget(widgetId);
  if (!widget) throw new Error(`widget not found: ${widgetId}`);
  if (widget.boardId !== boardId) {
    throw new Error(`widget board mismatch: ${widgetId}/${boardId}`);
  }

  const duplicate = [...layouts.values()].find(
    (l) => l.boardId === boardId && l.widgetId === widgetId,
  );
  if (duplicate) {
    throw new Error(`widget already placed: ${boardId}/${widgetId}`);
  }

  const id = input.id?.trim() || createId("dashly");
  if (layouts.has(id)) throw new Error(`layout already exists: ${id}`);

  const layout: DashboardLayout = {
    id,
    boardId,
    widgetId,
    region: input.region,
    order: input.order,
    detail: `region=${input.region} order=${input.order}`,
    metadata: { ...(input.metadata ?? {}) },
    placedAt: nowIso(),
  };
  layouts.set(id, layout);
  return cloneLayout(layout);
}

export function getLayout(id: string): DashboardLayout | undefined {
  const layout = layouts.get(id.trim());
  return layout ? cloneLayout(layout) : undefined;
}

export function listLayouts(filter?: {
  boardId?: string;
  region?: LayoutRegion;
}): DashboardLayout[] {
  let result = [...layouts.values()];
  if (filter?.boardId) {
    const boardId = filter.boardId.trim();
    result = result.filter((l) => l.boardId === boardId);
  }
  if (filter?.region) {
    result = result.filter((l) => l.region === filter.region);
  }
  return result
    .slice()
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
    .map(cloneLayout);
}

export function clearLayouts(): void {
  layouts.clear();
}
