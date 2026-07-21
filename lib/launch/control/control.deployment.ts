/**
 * Launch P7 — Deployment Status Aggregation
 */

import { getDeploymentPackage } from "../../product/e12/deployment/deployment.package";
import { evaluateDeploymentReadiness } from "../launch.readiness";
import { getLaunchOrchestration } from "./control.orchestration";
import type { DeploymentStatusAggregate } from "./control.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function aggregateDeploymentStatus(
  orchestrationId: string,
): DeploymentStatusAggregate {
  const orchestration = getLaunchOrchestration(orchestrationId.trim());
  if (!orchestration) {
    throw new Error(`orchestration not found: ${orchestrationId}`);
  }

  const signals: DeploymentStatusAggregate["signals"] = [];

  let packageStatus: string | undefined;
  if (orchestration.deploymentPackageId) {
    const pkg = getDeploymentPackage(orchestration.deploymentPackageId);
    packageStatus = pkg?.status;
    signals.push({
      source: "deployment-package",
      status: pkg?.status ?? "MISSING",
      detail: pkg
        ? `package=${pkg.id} version=${pkg.version}`
        : `missing=${orchestration.deploymentPackageId}`,
    });
  } else {
    signals.push({
      source: "deployment-package",
      status: "MISSING",
      detail: "deployment package not bound",
    });
  }

  const production = evaluateDeploymentReadiness(
    orchestration.productionProfileId,
  );
  signals.push({
    source: "production-readiness",
    status: production.verdict,
    detail: production.summary,
  });

  const productionStage = orchestration.stages.find(
    (s) => s.stage === "PRODUCTION",
  );
  if (productionStage) {
    signals.push({
      source: "orchestration-production-stage",
      status: productionStage.status,
      detail: productionStage.detail,
    });
  }

  let aggregateStatus: DeploymentStatusAggregate["aggregateStatus"] = "UNKNOWN";
  const pkgReady =
    packageStatus === "VALIDATED" || packageStatus === "RELEASED";
  const prodReady = production.verdict === "READY";

  if (pkgReady && prodReady) {
    aggregateStatus =
      orchestration.status === "COMPLETED" ? "LIVE" : "READY";
  } else if (!pkgReady && production.verdict === "NOT_READY") {
    aggregateStatus = "FAILED";
  } else if (!pkgReady || !prodReady) {
    aggregateStatus =
      packageStatus === undefined ? "PENDING" : "DEGRADED";
  }

  return {
    orchestrationId: orchestration.id,
    deploymentPackageId: orchestration.deploymentPackageId,
    packageStatus,
    productionReadiness: production.verdict,
    aggregateStatus,
    signals,
    aggregatedAt: nowIso(),
  };
}
