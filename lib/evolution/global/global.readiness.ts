/**
 * Evolution P5 — Global Deployment Network Readiness
 */

import { getDeploymentPackage } from "../../product/e12/deployment/deployment.package";
import { getOperationsOrchestration } from "../../operations/control/control.orchestration";
import { EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID } from "../dashboard/dashboard.constants";
import { getIntelligenceDashboard } from "../dashboard/dashboard.model";
import { EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_BASE } from "./global.constants";
import { getDeploymentIntelligence } from "./global.deployment";
import { listRegionalHealthReports } from "./global.health";
import { listDeploymentOptimizations } from "./global.optimization";
import { listMultiRegionProfiles } from "./global.region";
import { listGlobalRoutingInsights } from "./global.routing";
import type {
  GlobalReadinessCheck,
  GlobalReadinessResult,
} from "./global.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GlobalReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateGlobalReadiness(
  deploymentIntelligenceId: string,
): GlobalReadinessResult {
  const intel = getDeploymentIntelligence(deploymentIntelligenceId.trim());
  if (!intel) {
    return {
      deploymentIntelligenceId,
      verdict: "NOT_READY",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "GDN-INTEL",
          "deployment",
          "Deployment intelligence exists",
          false,
          `intelligence not found: ${deploymentIntelligenceId}`,
        ),
      ],
      summary: "global readiness not ready: intelligence missing",
      evaluatedAt: nowIso(),
    };
  }

  const checks: GlobalReadinessCheck[] = [];

  checks.push(
    check(
      "GDN-BASE",
      "evolution",
      "P4 enterprise intelligence dashboard baseline aligned",
      EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_BASE ===
        EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID,
      `base=${EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_BASE}`,
    ),
  );

  const pkg = getDeploymentPackage(intel.deploymentPackageId);
  checks.push(
    check(
      "GDN-PACKAGE",
      "deployment",
      "Deployment package bound",
      !!pkg && pkg.productId === intel.productId,
      pkg ? `package=${pkg.id} version=${pkg.version}` : "package missing",
    ),
  );

  const orch = getOperationsOrchestration(intel.orchestrationId);
  checks.push(
    check(
      "GDN-CONTROL",
      "control",
      "Operations control orchestration bound",
      !!orch && orch.productId === intel.productId,
      orch
        ? `orch=${orch.id} status=${orch.status}`
        : "orchestration missing",
    ),
  );

  if (intel.intelligenceDashboardId) {
    const dash = getIntelligenceDashboard(intel.intelligenceDashboardId);
    checks.push(
      check(
        "GDN-DASHBOARD",
        "dashboard",
        "Intelligence dashboard bound",
        !!dash && dash.productId === intel.productId,
        dash
          ? `dashboard=${dash.id} score=${dash.compositeScore}`
          : "intelligence dashboard missing",
      ),
    );
  } else {
    checks.push(
      check(
        "GDN-DASHBOARD",
        "dashboard",
        "Intelligence dashboard bound",
        false,
        "intelligenceDashboardId missing",
      ),
    );
  }

  const regions = listMultiRegionProfiles({
    deploymentPackageId: intel.deploymentPackageId,
  }).filter((r) => intel.regionProfileIds.includes(r.id));
  checks.push(
    check(
      "GDN-REGIONS",
      "region",
      "Multi-region profiles present",
      regions.length >= 1,
      `regions=${regions.length}`,
    ),
  );

  const withRuntime = regions.filter((r) => !!r.cloudRuntimeId);
  checks.push(
    check(
      "GDN-CLOUD",
      "cloud",
      "Cloud runtime bound to regions",
      withRuntime.length >= 1,
      `runtimeBound=${withRuntime.length}`,
    ),
  );

  const health = listRegionalHealthReports({
    deploymentIntelligenceId: intel.id,
  });
  checks.push(
    check(
      "GDN-HEALTH",
      "health",
      "Regional health assessments present",
      health.length >= 1,
      `reports=${health.length}`,
    ),
  );

  const routing = listGlobalRoutingInsights({
    deploymentIntelligenceId: intel.id,
  });
  checks.push(
    check(
      "GDN-ROUTING",
      "routing",
      "Global routing insight present",
      routing.length >= 1,
      `insights=${routing.length}`,
    ),
  );

  const optimizations = listDeploymentOptimizations({
    deploymentIntelligenceId: intel.id,
  });
  checks.push(
    check(
      "GDN-OPT",
      "optimization",
      "Deployment optimization present",
      optimizations.length >= 1,
      `optimizations=${optimizations.length}`,
    ),
  );

  checks.push(
    check(
      "GDN-SCORE",
      "intelligence",
      "Deployment intelligence score acceptable",
      intel.intelligenceScore >= 40,
      `intelligence=${intel.intelligenceScore}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    deploymentIntelligenceId: intel.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: `global readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertGlobalReadinessReady(
  result: GlobalReadinessResult,
): asserts result is GlobalReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `global deployment network not ready: ${result.summary}`,
    );
  }
}
