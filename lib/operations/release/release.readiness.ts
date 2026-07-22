/**
 * Post-Launch P4 — Release Management Readiness
 * Integrates launch control, deployment package, incident response, production ops
 */

import { getDeploymentPackage } from "../../product/e12/deployment/deployment.package";
import { getLaunchOrchestration } from "../../launch/control/control.orchestration";
import { listOperationsIncidents } from "../incident/incident.model";
import { OPERATIONS_INCIDENT_RESPONSE_ID } from "../incident/incident.constants";
import { getProductionOperation } from "../production/production.operation";
import { listDeploymentApprovals } from "./release.approval";
import { OPERATIONS_RELEASE_MANAGEMENT_BASE } from "./release.constants";
import { getOperationsRelease } from "./release.lifecycle";
import { computeReleaseMetrics } from "./release.metrics";
import { listRollbackWorkflows } from "./release.rollback";
import { getReleaseVersion } from "./release.version";
import type {
  ReleaseReadinessCheck,
  ReleaseReadinessResult,
} from "./release.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): ReleaseReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateReleaseReadiness(
  operationsReleaseId: string,
): ReleaseReadinessResult {
  const release = getOperationsRelease(operationsReleaseId.trim());
  if (!release) {
    return {
      operationsReleaseId,
      verdict: "NOT_READY",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "RM-RELEASE",
          "release",
          "Operations release exists",
          false,
          `release not found: ${operationsReleaseId}`,
        ),
      ],
      summary: "release readiness not ready: release missing",
      evaluatedAt: nowIso(),
    };
  }

  const checks: ReleaseReadinessCheck[] = [];

  checks.push(
    check(
      "RM-BASE",
      "operations",
      "P3 incident response baseline aligned",
      OPERATIONS_RELEASE_MANAGEMENT_BASE === OPERATIONS_INCIDENT_RESPONSE_ID,
      `base=${OPERATIONS_RELEASE_MANAGEMENT_BASE}`,
    ),
  );

  const operation = getProductionOperation(release.productionOperationId);
  checks.push(
    check(
      "RM-PRODUCTION",
      "production",
      "Production operation bound",
      !!operation && operation.productId === release.productId,
      operation
        ? `operation=${operation.id} status=${operation.status}`
        : "production operation missing",
    ),
  );

  const orch = getLaunchOrchestration(release.orchestrationId);
  checks.push(
    check(
      "RM-CONTROL",
      "control",
      "Launch orchestration bound",
      !!orch && orch.productId === release.productId,
      orch
        ? `orch=${orch.id} status=${orch.status}`
        : "orchestration missing",
    ),
  );

  const pkg = getDeploymentPackage(release.deploymentPackageId);
  checks.push(
    check(
      "RM-DEPLOYMENT",
      "deployment",
      "Deployment package bound",
      !!pkg && pkg.productId === release.productId,
      pkg ? `package=${pkg.id} version=${pkg.version}` : "package missing",
    ),
  );

  const version = release.versionRecordId
    ? getReleaseVersion(release.versionRecordId)
    : undefined;
  checks.push(
    check(
      "RM-VERSION",
      "version",
      "Release version tracked",
      !!version,
      version
        ? `version=${version.version} kind=${version.kind}`
        : "version missing",
    ),
  );

  const approvals = listDeploymentApprovals({
    operationsReleaseId: release.id,
  });
  checks.push(
    check(
      "RM-APPROVAL",
      "approval",
      "Deployment approval decided",
      approvals.some(
        (a) => a.status === "APPROVED" || a.status === "REJECTED",
      ),
      `approvals=${approvals.length}`,
    ),
  );

  const openCritical = listOperationsIncidents({
    productionOperationId: release.productionOperationId,
  }).filter(
    (i) =>
      (i.severity === "SEV1" || i.severity === "SEV2") &&
      i.status !== "RESOLVED" &&
      i.status !== "CLOSED",
  );
  checks.push(
    check(
      "RM-INCIDENT",
      "incident",
      "No open critical incidents blocking release path",
      openCritical.length === 0 ||
        release.status === "ROLLED_BACK" ||
        release.status === "FAILED",
      `openCritical=${openCritical.length}`,
    ),
  );

  const lifecycleOk =
    release.status === "RELEASED" ||
    release.status === "ROLLED_BACK" ||
    release.status === "APPROVED";
  checks.push(
    check(
      "RM-LIFECYCLE",
      "lifecycle",
      "Release lifecycle advanced",
      lifecycleOk,
      `status=${release.status}`,
    ),
  );

  if (release.status === "ROLLED_BACK") {
    const rollbacks = listRollbackWorkflows({
      operationsReleaseId: release.id,
    });
    checks.push(
      check(
        "RM-ROLLBACK",
        "rollback",
        "Rollback workflow complete",
        rollbacks.some((w) => w.complete && !w.failed),
        `rollbacks=${rollbacks.length}`,
      ),
    );
  }

  const metrics = computeReleaseMetrics({
    productionOperationId: release.productionOperationId,
  });
  checks.push(
    check(
      "RM-METRICS",
      "metrics",
      "Release metrics acceptable",
      metrics.releaseCount >= 1 && metrics.releaseSuccessScore >= 50,
      `count=${metrics.releaseCount} score=${metrics.releaseSuccessScore}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    operationsReleaseId: release.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: `release readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertReleaseReadinessReady(
  result: ReleaseReadinessResult,
): asserts result is ReleaseReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`release management not ready: ${result.summary}`);
  }
}
