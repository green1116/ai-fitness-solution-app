/**
 * Product Dashboard — Dashboard Framework Manager
 */

import {
  clearBoards,
  createBoard,
  getBoard,
  listBoards,
  updateBoardStatus,
} from "./board/board.registry";
import type {
  CreateBoardInput,
  DashboardBoard,
  UpdateBoardStatusInput,
} from "./board/board.types";
import {
  PRODUCT_DASHBOARD_FRAMEWORK_BASE,
  PRODUCT_DASHBOARD_FRAMEWORK_FREEZE_VERSION,
  PRODUCT_DASHBOARD_FRAMEWORK_ID,
  PRODUCT_DASHBOARD_FRAMEWORK_VERSION,
} from "./framework/framework.constants";
import {
  assertDashboardFrameworkReadinessReady,
  evaluateDashboardFrameworkReadiness,
} from "./framework/framework.readiness";
import type {
  DashboardManagerStatus,
  DashboardReadinessResult,
  DashboardRegistryManifest,
} from "./framework/framework.types";
import {
  clearLayouts,
  getLayout,
  listLayouts,
  placeWidget,
} from "./layout/layout.registry";
import type {
  DashboardLayout,
  PlaceWidgetInput,
} from "./layout/layout.types";
import {
  captureSnapshot,
  clearSnapshots,
  getSnapshot,
  listSnapshots,
} from "./snapshot/snapshot.registry";
import type {
  CaptureSnapshotInput,
  DashboardSnapshot,
} from "./snapshot/snapshot.types";
import {
  addWidget,
  clearWidgets,
  getWidget,
  listWidgets,
} from "./widget/widget.registry";
import type {
  AddWidgetInput,
  DashboardWidget,
} from "./widget/widget.types";

export type DashboardManagerSnapshot = {
  managerId: string;
  status: DashboardManagerStatus;
  layerId: typeof PRODUCT_DASHBOARD_FRAMEWORK_ID;
  version: typeof PRODUCT_DASHBOARD_FRAMEWORK_VERSION;
  boardCount: number;
  widgetCount: number;
  layoutCount: number;
  snapshotCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type DashboardManager = {
  initialize: () => DashboardManagerSnapshot;
  start: () => DashboardManagerSnapshot;
  stop: () => DashboardManagerSnapshot;
  status: () => DashboardManagerSnapshot;
  createBoard: (input: CreateBoardInput) => DashboardBoard;
  updateBoardStatus: (input: UpdateBoardStatusInput) => DashboardBoard;
  addWidget: (input: AddWidgetInput) => DashboardWidget;
  placeWidget: (input: PlaceWidgetInput) => DashboardLayout;
  captureSnapshot: (input: CaptureSnapshotInput) => DashboardSnapshot;
  evaluateReadiness: () => DashboardReadinessResult;
  manifest: () => DashboardRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getDashboardRegistryManifest(): DashboardRegistryManifest {
  return {
    frameworkId: PRODUCT_DASHBOARD_FRAMEWORK_ID,
    version: PRODUCT_DASHBOARD_FRAMEWORK_VERSION,
    freezeVersion: PRODUCT_DASHBOARD_FRAMEWORK_FREEZE_VERSION,
    base: PRODUCT_DASHBOARD_FRAMEWORK_BASE,
    boardCount: listBoards().length,
    widgetCount: listWidgets().length,
    layoutCount: listLayouts().length,
    snapshotCount: listSnapshots().length,
  };
}

export function clearDashboardFrameworkLayer(): void {
  clearSnapshots();
  clearLayouts();
  clearWidgets();
  clearBoards();
}

export function createDashboardManager(options?: {
  managerId?: string;
}): DashboardManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-dsh-mgr");
  let state: DashboardManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): DashboardManagerSnapshot {
    const reg = getDashboardRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_DASHBOARD_FRAMEWORK_ID,
      version: PRODUCT_DASHBOARD_FRAMEWORK_VERSION,
      boardCount: reg.boardCount,
      widgetCount: reg.widgetCount,
      layoutCount: reg.layoutCount,
      snapshotCount: reg.snapshotCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): DashboardManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearDashboardFrameworkLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): DashboardManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): DashboardManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    createBoard: (input) => {
      assertRunning("createBoard");
      return createBoard(input);
    },
    updateBoardStatus: (input) => {
      assertRunning("updateBoardStatus");
      return updateBoardStatus(input);
    },
    addWidget: (input) => {
      assertRunning("addWidget");
      return addWidget(input);
    },
    placeWidget: (input) => {
      assertRunning("placeWidget");
      return placeWidget(input);
    },
    captureSnapshot: (input) => {
      assertRunning("captureSnapshot");
      return captureSnapshot(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateDashboardFrameworkReadiness();
    },
    manifest: getDashboardRegistryManifest,
  };
}

export {
  assertDashboardFrameworkReadinessReady,
  getBoard,
  getLayout,
  getSnapshot,
  getWidget,
  listBoards,
  listLayouts,
  listSnapshots,
  listWidgets,
};
