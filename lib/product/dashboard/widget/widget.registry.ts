/**
 * Product Dashboard — Widget registry
 */

import { getBoard } from "../board/board.registry";
import { WIDGET_KINDS } from "../framework/framework.constants";
import type {
  AddWidgetInput,
  DashboardWidget,
  WidgetKind,
} from "./widget.types";

const widgets = new Map<string, DashboardWidget>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneWidget(widget: DashboardWidget): DashboardWidget {
  return { ...widget, metadata: { ...widget.metadata } };
}

export function addWidget(input: AddWidgetInput): DashboardWidget {
  const boardId = input.boardId.trim();
  const title = input.title.trim();
  const refId = input.refId.trim();
  if (!boardId) throw new Error("widget.boardId is required");
  if (!title) throw new Error("widget.title is required");
  if (!refId) throw new Error("widget.refId is required");
  if (!(WIDGET_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid widget kind: ${input.kind}`);
  }
  if (!getBoard(boardId)) throw new Error(`board not found: ${boardId}`);

  const id = input.id?.trim() || createId("dashwg");
  if (widgets.has(id)) throw new Error(`widget already exists: ${id}`);

  const widget: DashboardWidget = {
    id,
    boardId,
    kind: input.kind,
    title,
    refId,
    detail: `kind=${input.kind} ref=${refId}`,
    metadata: { ...(input.metadata ?? {}) },
    addedAt: nowIso(),
  };
  widgets.set(id, widget);
  return cloneWidget(widget);
}

export function getWidget(id: string): DashboardWidget | undefined {
  const widget = widgets.get(id.trim());
  return widget ? cloneWidget(widget) : undefined;
}

export function listWidgets(filter?: {
  boardId?: string;
  kind?: WidgetKind;
}): DashboardWidget[] {
  let result = [...widgets.values()];
  if (filter?.boardId) {
    const boardId = filter.boardId.trim();
    result = result.filter((w) => w.boardId === boardId);
  }
  if (filter?.kind) result = result.filter((w) => w.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneWidget);
}

export function clearWidgets(): void {
  widgets.clear();
}
