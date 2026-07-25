/**
 * Product KPI — readiness
 */

import { PRODUCT_ANALYTICS_FOUNDATION_ID } from "../../analytics/foundation/foundation.constants";
import { listKpiDefinitions } from "../definition/definition.registry";
import { listKpiMeasurements } from "../measurement/measurement.registry";
import { listScorecards } from "../scorecard/scorecard.registry";
import { listKpiTargets } from "../target/target.registry";
import { PRODUCT_KPI_MANAGEMENT_BASE } from "./management.constants";
import type {
  KpiReadinessCheck,
  KpiReadinessResult,
} from "./management.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): KpiReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateKpiManagementReadiness(): KpiReadinessResult {
  const checks: KpiReadinessCheck[] = [];

  checks.push(
    check(
      "KPI-BASE",
      "management",
      "Analytics foundation aligned",
      PRODUCT_KPI_MANAGEMENT_BASE === PRODUCT_ANALYTICS_FOUNDATION_ID,
      `base=${PRODUCT_KPI_MANAGEMENT_BASE}`,
    ),
  );

  const definitions = listKpiDefinitions();
  checks.push(
    check(
      "KPI-DEF",
      "definition",
      "Active KPIs present",
      definitions.some((d) => d.status === "ACTIVE"),
      `definitions=${definitions.length}`,
    ),
  );

  const targets = listKpiTargets();
  checks.push(
    check(
      "KPI-TGT",
      "target",
      "KPI targets present",
      targets.length >= 1,
      `targets=${targets.length}`,
    ),
  );

  const measurements = listKpiMeasurements();
  checks.push(
    check(
      "KPI-MEA",
      "measurement",
      "On-track or above measurements present",
      measurements.some(
        (m) => m.result === "ON_TRACK" || m.result === "ABOVE",
      ),
      `measurements=${measurements.length}`,
    ),
  );

  const scorecards = listScorecards();
  checks.push(
    check(
      "KPI-SC",
      "scorecard",
      "Scorecards present",
      scorecards.some((s) => s.onTrackCount >= 1),
      `scorecards=${scorecards.length}`,
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
    summary: `product-kpi readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertKpiManagementReadinessReady(
  result: KpiReadinessResult,
): asserts result is KpiReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product kpi management not ready: ${result.summary}`,
    );
  }
}
