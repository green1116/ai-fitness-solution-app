/**
 * Product Report — readiness
 */

import { PRODUCT_DASHBOARD_FRAMEWORK_ID } from "../../dashboard/framework/framework.constants";
import { listDeliveries } from "../delivery/delivery.registry";
import { listReportJobs } from "../job/job.registry";
import { listRenders } from "../render/render.registry";
import { listTemplates } from "../template/template.registry";
import { PRODUCT_REPORT_ENGINE_BASE } from "./engine.constants";
import type {
  ReportReadinessCheck,
  ReportReadinessResult,
} from "./engine.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): ReportReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateReportEngineReadiness(): ReportReadinessResult {
  const checks: ReportReadinessCheck[] = [];

  checks.push(
    check(
      "RPT-BASE",
      "engine",
      "Dashboard framework aligned",
      PRODUCT_REPORT_ENGINE_BASE === PRODUCT_DASHBOARD_FRAMEWORK_ID,
      `base=${PRODUCT_REPORT_ENGINE_BASE}`,
    ),
  );

  const templates = listTemplates();
  checks.push(
    check(
      "RPT-TPL",
      "template",
      "Report templates present",
      templates.length >= 1,
      `templates=${templates.length}`,
    ),
  );

  const jobs = listReportJobs();
  checks.push(
    check(
      "RPT-JOB",
      "job",
      "Succeeded jobs present",
      jobs.some((j) => j.status === "SUCCEEDED"),
      `jobs=${jobs.length}`,
    ),
  );

  const renders = listRenders();
  checks.push(
    check(
      "RPT-RND",
      "render",
      "Renders present",
      renders.length >= 1,
      `renders=${renders.length}`,
    ),
  );

  const deliveries = listDeliveries();
  checks.push(
    check(
      "RPT-DLV",
      "delivery",
      "Deliveries present",
      deliveries.length >= 1,
      `deliveries=${deliveries.length}`,
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
    summary: `product-report readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertReportEngineReadinessReady(
  result: ReportReadinessResult,
): asserts result is ReportReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product report engine not ready: ${result.summary}`,
    );
  }
}
