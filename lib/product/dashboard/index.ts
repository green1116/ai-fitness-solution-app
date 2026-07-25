/**
 * Product Dashboard — Dashboard Framework public exports
 * Isolated namespace: lib/product/dashboard
 */

export {
  DASHBOARD_KINDS,
  DASHBOARD_MANAGER_STATUSES,
  DASHBOARD_READINESS_VERDICTS,
  DASHBOARD_STATUSES,
  LAYOUT_REGIONS,
  PRODUCT_DASHBOARD_FRAMEWORK_BASE,
  PRODUCT_DASHBOARD_FRAMEWORK_FREEZE_VERSION,
  PRODUCT_DASHBOARD_FRAMEWORK_ID,
  PRODUCT_DASHBOARD_FRAMEWORK_VERSION,
  PRODUCT_DASHBOARD_FREEZE_VERSION,
  WIDGET_KINDS,
} from "./framework/framework.constants";

export type {
  DashboardManagerStatus,
  DashboardReadinessCheck,
  DashboardReadinessResult,
  DashboardReadinessVerdict,
  DashboardRegistryManifest,
} from "./framework/framework.types";

export type {
  BoardMetadata,
  CreateBoardInput,
  DashboardBoard,
  DashboardKind,
  DashboardStatus,
  UpdateBoardStatusInput,
} from "./board/board.types";

export {
  clearBoards,
  createBoard,
  getBoard,
  listBoards,
  updateBoardStatus,
} from "./board/board.registry";

export type {
  AddWidgetInput,
  DashboardWidget,
  WidgetKind,
  WidgetMetadata,
} from "./widget/widget.types";

export {
  addWidget,
  clearWidgets,
  getWidget,
  listWidgets,
} from "./widget/widget.registry";

export type {
  DashboardLayout,
  LayoutMetadata,
  LayoutRegion,
  PlaceWidgetInput,
} from "./layout/layout.types";

export {
  clearLayouts,
  getLayout,
  listLayouts,
  placeWidget,
} from "./layout/layout.registry";

export type {
  CaptureSnapshotInput,
  DashboardSnapshot,
  SnapshotMetadata,
} from "./snapshot/snapshot.types";

export {
  captureSnapshot,
  clearSnapshots,
  getSnapshot,
  listSnapshots,
} from "./snapshot/snapshot.registry";

export {
  assertDashboardFrameworkReadinessReady,
  evaluateDashboardFrameworkReadiness,
} from "./framework/framework.readiness";

export {
  clearDashboardFrameworkLayer,
  createDashboardManager,
  getDashboardRegistryManifest,
  type DashboardManager,
  type DashboardManagerSnapshot,
} from "./dashboard.manager";

export {
  assertProductDashboardReleaseGatePass,
  checkProductDashboardReleaseGate,
  PRODUCT_DASHBOARD_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
