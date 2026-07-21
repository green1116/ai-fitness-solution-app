/**
 * Launch P7 — Control Plane Readiness
 */

import { getLatestReleaseDecision } from "./control.decision";
import { aggregateDeploymentStatus } from "./control.deployment";
import { getGoNoGoResult, evaluateGoNoGo } from "./control.gonogo";
import { computeLaunchMetrics } from "./control.metrics";
import { getLaunchOrchestration } from "./control.orchestration";
import type {
  ControlReadinessCheck,
  ControlReadinessResult,
} from "./control.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): ControlReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateControlReadiness(
  orchestrationId: string,
): ControlReadinessResult {
  const orchestration = getLaunchOrchestration(orchestrationId.trim());
  if (!orchestration) {
    return {
      orchestrationId,
      verdict: "NOT_READY",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "CP-ORCH",
          "orchestration",
          "Orchestration exists",
          false,
          `orchestration not found: ${orchestrationId}`,
        ),
      ],
      summary: "control readiness not ready: orchestration missing",
      evaluatedAt: nowIso(),
    };
  }

  const checks: ControlReadinessCheck[] = [];

  const goNoGo =
    getGoNoGoResult(orchestration.id) ?? evaluateGoNoGo(orchestration.id);
  checks.push(
    check(
      "CP-GONOGO",
      "gonogo",
      "Go / No-Go is GO",
      goNoGo.verdict === "GO",
      goNoGo.summary,
    ),
  );

  const deployment = aggregateDeploymentStatus(orchestration.id);
  checks.push(
    check(
      "CP-DEPLOYMENT",
      "deployment",
      "Deployment aggregate READY or LIVE",
      deployment.aggregateStatus === "READY" ||
        deployment.aggregateStatus === "LIVE",
      `status=${deployment.aggregateStatus}`,
    ),
  );

  const decision = getLatestReleaseDecision(orchestration.id);
  checks.push(
    check(
      "CP-DECISION",
      "decision",
      "Release decision APPROVE",
      decision?.verdict === "APPROVE",
      decision
        ? `verdict=${decision.verdict}`
        : "release decision missing",
    ),
  );

  const metrics = computeLaunchMetrics(orchestration.id);
  checks.push(
    check(
      "CP-METRICS",
      "metrics",
      "Readiness score >= 80",
      metrics.readinessScore >= 80,
      `score=${metrics.readinessScore}`,
    ),
  );

  const boundDocs = !!orchestration.documentationPackageId;
  const boundSecurity = !!orchestration.securityProfileId;
  const boundSla = !!orchestration.supportSlaProfileId;
  checks.push(
    check(
      "CP-INTEGRATION",
      "integration",
      "Security / SLA / Documentation bound",
      boundDocs && boundSecurity && boundSla,
      `security=${boundSecurity} sla=${boundSla} docs=${boundDocs}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    orchestrationId: orchestration.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: [
      `control-readiness verdict=${verdict}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
    evaluatedAt: nowIso(),
  };
}

export function assertControlReadinessReady(
  result: ControlReadinessResult,
): asserts result is ControlReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`control plane not ready: ${result.summary}`);
  }
}
