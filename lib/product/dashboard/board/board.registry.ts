/**
 * Product Dashboard — Board registry
 */

import {
  DASHBOARD_KINDS,
  DASHBOARD_STATUSES,
} from "../framework/framework.constants";
import type {
  CreateBoardInput,
  DashboardBoard,
  DashboardKind,
  DashboardStatus,
  UpdateBoardStatusInput,
} from "./board.types";

const boards = new Map<string, DashboardBoard>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBoard(board: DashboardBoard): DashboardBoard {
  return { ...board, metadata: { ...board.metadata } };
}

export function createBoard(input: CreateBoardInput): DashboardBoard {
  const name = input.name.trim();
  const ownerId = input.ownerId.trim();
  if (!name) throw new Error("board.name is required");
  if (!ownerId) throw new Error("board.ownerId is required");
  if (!(DASHBOARD_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid dashboard kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("dashbd");
  if (boards.has(id)) throw new Error(`board already exists: ${id}`);

  const now = nowIso();
  const board: DashboardBoard = {
    id,
    name,
    kind: input.kind,
    ownerId,
    status: DASHBOARD_STATUSES[0],
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  boards.set(id, board);
  return cloneBoard(board);
}

export function updateBoardStatus(
  input: UpdateBoardStatusInput,
): DashboardBoard {
  const boardId = input.boardId.trim();
  if (!boardId) throw new Error("board.boardId is required");
  if (!(DASHBOARD_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid dashboard status: ${input.status}`);
  }

  const existing = boards.get(boardId);
  if (!existing) throw new Error(`board not found: ${boardId}`);

  const updated: DashboardBoard = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  boards.set(boardId, updated);
  return cloneBoard(updated);
}

export function getBoard(id: string): DashboardBoard | undefined {
  const board = boards.get(id.trim());
  return board ? cloneBoard(board) : undefined;
}

export function listBoards(filter?: {
  kind?: DashboardKind;
  status?: DashboardStatus;
}): DashboardBoard[] {
  let result = [...boards.values()];
  if (filter?.kind) result = result.filter((b) => b.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((b) => b.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneBoard);
}

export function clearBoards(): void {
  boards.clear();
}
