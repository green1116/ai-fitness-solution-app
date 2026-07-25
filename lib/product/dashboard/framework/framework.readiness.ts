/**
 * Product Dashboard — readiness
 */

import { PRODUCT_KPI_MANAGEMENT_ID } from "../../kpi/management/management.constants";
import { listBoards } from "../board/board.registry";
import { listLayouts } from "../layout/layout.registry";
import { listSnapshots } from "../snapshot/snapshot.registry";
import { listWidgets } from "../widget/widget.registry";
import { PRODUCT_DASHBOARD_FRAMEWORK_BASE } from "./framework.constants";
import type {
  DashboardReadinessCheck,
  DashboardReadinessResult,
} from "./framework.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): DashboardReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateDashboardFrameworkReadiness(): DashboardReadinessResult {
  const checks: DashboardReadinessCheck[] = [];

  checks.push(
    check(
      "DSH-BASE",
      "framework",
      "KPI management aligned",
      PRODUCT_DASHBOARD_FRAMEWORK_BASE === PRODUCT_KPI_MANAGEMENT_ID,
      `base=${PRODUCT_DASHBOARD_FRAMEWORK_BASE}`,
    ),
  );

  const boards = listBoards();
  checks.push(
    check(
      "DSH-BD",
      "board",
      "Published boards present",
      boards.some((b) => b.status === "PUBLISHED"),
      `boards=${boards.length}`,
    ),
  );

  const widgets = listWidgets();
  checks.push(
    check(
      "DSH-WG",
      "widget",
      "KPI widgets present",
      widgets.some((w) => w.kind === "KPI"),
      `widgets=${widgets.length}`,
    ),
  );

  const layouts = listLayouts();
  checks.push(
    check(
      "DSH-LY",
      "layout",
      "Layouts present",
      layouts.length >= 1,
      `layouts=${layouts.length}`,
    ),
  );

  const snapshots = listSnapshots();
  checks.push(
    check(
      "DSH-SN",
      "snapshot",
      "Snapshots present",
      snapshots.some((s) => s.widgetCount >= 1 && s.layoutCount >= 1),
      `snapshots=${snapshots.length}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `product-dashboard readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertDashboardFrameworkReadinessReady(
  result: DashboardReadinessResult,
): asserts result is DashboardReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product dashboard framework not ready: ${result.summary}`,
    );
  }
}
