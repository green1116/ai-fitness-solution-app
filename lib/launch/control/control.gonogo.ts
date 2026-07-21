/**
 * Launch P7 — Go / No-Go Evaluation
 * Integrates production / onboarding / demo / security / SLA / documentation
 */

import { evaluateDemoReadiness } from "../demo/demo.readiness";
import { evaluateDocumentationReadiness } from "../documentation/documentation.readiness";
import { evaluateDeploymentReadiness } from "../launch.readiness";
import { evaluateCustomerReadiness } from "../onboarding/onboarding.readiness";
import { evaluateSecurityReadiness } from "../security/security.readiness";
import { evaluateSupportReadiness } from "../support/support.readiness";
import {
  getLaunchOrchestration,
  setOrchestrationStatus,
  updateOrchestrationStage,
} from "./control.orchestration";
import type { GoNoGoCheck, GoNoGoResult } from "./control.types";

const results = new Map<string, GoNoGoResult>();

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  domain: string,
  label: string,
  ok: boolean,
  detail: string,
): GoNoGoCheck {
  return { id, domain, label, ok, detail };
}

export function evaluateGoNoGo(orchestrationId: string): GoNoGoResult {
  const orchestration = getLaunchOrchestration(orchestrationId.trim());
  if (!orchestration) {
    return {
      orchestrationId,
      verdict: "NO_GO",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "GN-ORCH",
          "orchestration",
          "Orchestration exists",
          false,
          `orchestration not found: ${orchestrationId}`,
        ),
      ],
      summary: "go/no-go no-go: orchestration missing",
      evaluatedAt: nowIso(),
    };
  }

  const checks: GoNoGoCheck[] = [];

  const production = evaluateDeploymentReadiness(
    orchestration.productionProfileId,
  );
  checks.push(
    check(
      "GN-PRODUCTION",
      "production",
      "Production readiness READY",
      production.verdict === "READY",
      production.summary,
    ),
  );
  updateOrchestrationStage(orchestration.id, "PRODUCTION", {
    status: production.verdict === "READY" ? "READY" : "BLOCKED",
    detail: production.summary,
  });

  if (orchestration.onboardingProfileId) {
    const onboarding = evaluateCustomerReadiness(
      orchestration.onboardingProfileId,
    );
    checks.push(
      check(
        "GN-ONBOARDING",
        "onboarding",
        "Customer onboarding READY",
        onboarding.verdict === "READY",
        onboarding.summary,
      ),
    );
    updateOrchestrationStage(orchestration.id, "ONBOARDING", {
      status: onboarding.verdict === "READY" ? "READY" : "BLOCKED",
      detail: onboarding.summary,
    });
  }

  if (orchestration.demoTenantId) {
    const demo = evaluateDemoReadiness(orchestration.demoTenantId);
    checks.push(
      check(
        "GN-DEMO",
        "demo",
        "Demo environment READY",
        demo.verdict === "READY",
        demo.summary,
      ),
    );
    updateOrchestrationStage(orchestration.id, "DEMO", {
      status: demo.verdict === "READY" ? "READY" : "BLOCKED",
      detail: demo.summary,
    });
  }

  if (orchestration.securityProfileId) {
    const security = evaluateSecurityReadiness(
      orchestration.securityProfileId,
    );
    checks.push(
      check(
        "GN-SECURITY",
        "security",
        "Security readiness READY",
        security.verdict === "READY",
        security.summary,
      ),
    );
    updateOrchestrationStage(orchestration.id, "SECURITY", {
      status: security.verdict === "READY" ? "READY" : "BLOCKED",
      detail: security.summary,
    });
  } else {
    checks.push(
      check(
        "GN-SECURITY",
        "security",
        "Security profile bound",
        false,
        "security profile not bound",
      ),
    );
  }

  if (orchestration.supportSlaProfileId) {
    const support = evaluateSupportReadiness(
      orchestration.supportSlaProfileId,
    );
    checks.push(
      check(
        "GN-SLA",
        "sla",
        "SLA support READY",
        support.verdict === "READY",
        support.summary,
      ),
    );
    updateOrchestrationStage(orchestration.id, "SLA", {
      status: support.verdict === "READY" ? "READY" : "BLOCKED",
      detail: support.summary,
    });
  } else {
    checks.push(
      check(
        "GN-SLA",
        "sla",
        "SLA support profile bound",
        false,
        "support sla profile not bound",
      ),
    );
  }

  if (orchestration.documentationPackageId) {
    const docs = evaluateDocumentationReadiness(
      orchestration.documentationPackageId,
    );
    checks.push(
      check(
        "GN-DOCS",
        "documentation",
        "Documentation READY",
        docs.verdict === "READY",
        docs.summary,
      ),
    );
    updateOrchestrationStage(orchestration.id, "DOCUMENTATION", {
      status: docs.verdict === "READY" ? "READY" : "BLOCKED",
      detail: docs.summary,
    });
  } else {
    checks.push(
      check(
        "GN-DOCS",
        "documentation",
        "Documentation package bound",
        false,
        "documentation package not bound",
      ),
    );
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "GO" : passCount === 0 ? "NO_GO" : "HOLD";

  if (verdict === "GO") {
    updateOrchestrationStage(orchestration.id, "GO_LIVE", {
      status: "READY",
      detail: `verdict=${verdict}`,
    });
  } else if (verdict === "HOLD") {
    updateOrchestrationStage(orchestration.id, "GO_LIVE", {
      status: "PENDING",
      detail: `verdict=${verdict}`,
    });
  } else {
    updateOrchestrationStage(orchestration.id, "GO_LIVE", {
      status: "BLOCKED",
      detail: `verdict=${verdict}`,
    });
  }

  const current = getLaunchOrchestration(orchestration.id);
  if (
    current &&
    current.status !== "COMPLETED" &&
    current.status !== "ABORTED"
  ) {
    if (verdict === "GO") {
      setOrchestrationStatus(orchestration.id, "IN_PROGRESS");
    } else if (verdict === "NO_GO") {
      setOrchestrationStatus(orchestration.id, "ABORTED");
    } else {
      setOrchestrationStatus(orchestration.id, "PLANNED");
    }
  }

  const result: GoNoGoResult = {
    orchestrationId: orchestration.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: [
      `go-no-go verdict=${verdict}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
    evaluatedAt: nowIso(),
  };
  results.set(orchestration.id, result);
  return {
    ...result,
    checks: result.checks.map((c) => ({ ...c })),
  };
}

export function getGoNoGoResult(
  orchestrationId: string,
): GoNoGoResult | undefined {
  const result = results.get(orchestrationId.trim());
  return result
    ? { ...result, checks: result.checks.map((c) => ({ ...c })) }
    : undefined;
}

export function listGoNoGoResults(): GoNoGoResult[] {
  return [...results.values()]
    .slice()
    .sort((a, b) => a.orchestrationId.localeCompare(b.orchestrationId))
    .map((r) => ({ ...r, checks: r.checks.map((c) => ({ ...c })) }));
}

export function clearGoNoGoResults(): void {
  results.clear();
}

export function assertGoNoGo(
  result: GoNoGoResult,
): asserts result is GoNoGoResult & { verdict: "GO" } {
  if (result.verdict !== "GO") {
    throw new Error(`launch go/no-go failed: ${result.summary}`);
  }
}
