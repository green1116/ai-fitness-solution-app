/**
 * Product P12 — Production Launch readiness
 */

import { PRODUCT_P11_COMMERCIAL_RELEASE_ID } from "../../p11/release/release.constants";
import { listAdoptions } from "../adoption/adoption.registry";
import { listMonitoring } from "../monitoring/monitoring.registry";
import { listOperations } from "../operations/operations.registry";
import { listReadiness } from "../readiness/readiness.registry";
import { listRollouts } from "../rollout/rollout.registry";
import { listSupportCases } from "../support/support.registry";
import { PRODUCT_P12_PRODUCTION_LAUNCH_BASE } from "./launch.constants";
import { listLaunches } from "./launch.registry";
import type { P12ReadinessCheck, P12ReadinessResult } from "./launch.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): P12ReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateP12ProductionLaunchReadiness(): P12ReadinessResult {
  const checks: P12ReadinessCheck[] = [];

  checks.push(
    check(
      "P12-BASE",
      "foundation",
      "P11 commercial release baseline aligned",
      PRODUCT_P12_PRODUCTION_LAUNCH_BASE === PRODUCT_P11_COMMERCIAL_RELEASE_ID,
      `base=${PRODUCT_P12_PRODUCTION_LAUNCH_BASE}`,
    ),
  );

  const launches = listLaunches();
  checks.push(
    check(
      "P12-LCH",
      "launch",
      "Launches present",
      launches.length >= 1,
      `launches=${launches.length}`,
    ),
  );

  const readiness = listReadiness();
  checks.push(
    check(
      "P12-RDY",
      "readiness",
      "Readiness gates passed",
      readiness.some((r) => r.gate === "PASS"),
      `readiness=${readiness.length}`,
    ),
  );

  const rollouts = listRollouts();
  checks.push(
    check(
      "P12-RLT",
      "rollout",
      "Rollouts advanced",
      rollouts.some((r) => r.percent >= 50 || Boolean(r.completedAt)),
      `rollouts=${rollouts.length}`,
    ),
  );

  const adoptions = listAdoptions();
  checks.push(
    check(
      "P12-ADO",
      "adoption",
      "Adoption measured",
      adoptions.some(
        (a) =>
          a.level === "ACTIVE" ||
          a.level === "EMBEDDED" ||
          a.level === "CHAMPION",
      ),
      `adoptions=${adoptions.length}`,
    ),
  );

  const operations = listOperations();
  checks.push(
    check(
      "P12-OPS",
      "operations",
      "Operations activated",
      operations.length >= 1,
      `operations=${operations.length}`,
    ),
  );

  const monitoring = listMonitoring();
  checks.push(
    check(
      "P12-MON",
      "monitoring",
      "Monitoring signals present",
      monitoring.length >= 1,
      `monitoring=${monitoring.length}`,
    ),
  );

  const support = listSupportCases();
  checks.push(
    check(
      "P12-SUP",
      "support",
      "Support coverage present",
      support.length >= 1,
      `support=${support.length}`,
    ),
  );

  const advanced = launches.some(
    (l) =>
      l.status === "LIVE" ||
      l.status === "STABILIZING" ||
      l.status === "COMPLETE",
  );
  checks.push(
    check(
      "P12-LIFE",
      "launch",
      "Launch lifecycle advanced",
      advanced,
      `advanced=${advanced}`,
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
    summary: `p12-production-launch readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertP12ProductionLaunchReadinessReady(
  result: P12ReadinessResult,
): asserts result is P12ReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`p12 production launch not ready: ${result.summary}`);
  }
}
