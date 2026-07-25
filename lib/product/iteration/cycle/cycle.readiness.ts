/**
 * Product Iteration — readiness
 */

import { ENTERPRISE_PRODUCT_COMPLETE_ID } from "../../complete/freeze/freeze.lock";
import { listBacklog } from "../backlog/backlog.registry";
import { listCadences } from "../cadence/cadence.registry";
import { listExperiments } from "../experiment/experiment.registry";
import { listImpact } from "../impact/impact.registry";
import { listRoadmap } from "../roadmap/roadmap.registry";
import { PRODUCT_ITERATION_FOUNDATION_BASE } from "./cycle.constants";
import { listCycles } from "./cycle.registry";
import type {
  IterationReadinessCheck,
  IterationReadinessResult,
} from "./cycle.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): IterationReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateIterationFoundationReadiness(): IterationReadinessResult {
  const checks: IterationReadinessCheck[] = [];

  checks.push(
    check(
      "ITER-BASE",
      "foundation",
      "Product complete baseline aligned",
      PRODUCT_ITERATION_FOUNDATION_BASE === ENTERPRISE_PRODUCT_COMPLETE_ID,
      `base=${PRODUCT_ITERATION_FOUNDATION_BASE}`,
    ),
  );

  const cycles = listCycles();
  checks.push(
    check(
      "ITER-CYC",
      "cycle",
      "Iteration cycles present",
      cycles.length >= 1,
      `cycles=${cycles.length}`,
    ),
  );

  const backlog = listBacklog();
  checks.push(
    check(
      "ITER-BL",
      "backlog",
      "Backlog items present",
      backlog.length >= 1,
      `backlog=${backlog.length}`,
    ),
  );

  const experiments = listExperiments();
  checks.push(
    check(
      "ITER-EXP",
      "experiment",
      "Experiments present",
      experiments.length >= 1,
      `experiments=${experiments.length}`,
    ),
  );

  const roadmap = listRoadmap();
  checks.push(
    check(
      "ITER-RM",
      "roadmap",
      "Roadmap items present",
      roadmap.length >= 1,
      `roadmap=${roadmap.length}`,
    ),
  );

  const impact = listImpact();
  checks.push(
    check(
      "ITER-IMP",
      "impact",
      "Impact scores present",
      impact.length >= 1,
      `impact=${impact.length}`,
    ),
  );

  const cadence = listCadences();
  checks.push(
    check(
      "ITER-CAD",
      "cadence",
      "Cadence present",
      cadence.length >= 1,
      `cadence=${cadence.length}`,
    ),
  );

  const active = cycles.some(
    (c) => c.status === "ACTIVE" || c.status === "REVIEW" || c.status === "SHIPPED",
  );
  checks.push(
    check(
      "ITER-LIFE",
      "cycle",
      "Cycle lifecycle advanced",
      active,
      `advanced=${active}`,
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
    summary: `product-iteration readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertIterationFoundationReadinessReady(
  result: IterationReadinessResult,
): asserts result is IterationReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product iteration foundation not ready: ${result.summary}`,
    );
  }
}
