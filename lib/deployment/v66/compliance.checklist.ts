/**
 * V66 P5 — Compliance checklist (declarative, read-only)
 */
import type {
  ComplianceChecklistItem,
  ComplianceChecklistManifest,
  DeploymentSecuritySignals,
} from "./security.types";
import { V66_DEPLOYMENT_SECURITY_VERSION } from "./security.types";

export function buildComplianceChecklist(
  signals: DeploymentSecuritySignals,
): ComplianceChecklistItem[] {
  const s = {
    orchestrationReady: true,
    policyCatalogComplete: true,
    complianceChecklistPass: true,
    securityGatesPass: true,
    artifactIntegrityComplete: true,
    ...signals,
  };

  return [
    {
      id: "CC-001",
      label: "Env contract documents production-required secrets",
      status: s.policyCatalogComplete ? "pass" : "fail",
      required: true,
      framework: "SOC2-CC6",
      notes: "P1 env.contract.ts",
    },
    {
      id: "CC-002",
      label: "Forbidden production flags cataloged",
      status: s.policyCatalogComplete ? "pass" : "fail",
      required: true,
      framework: "SOC2-CC6",
    },
    {
      id: "CC-003",
      label: "Structured deployment logs for audit trail",
      status: s.orchestrationReady ? "pass" : "fail",
      required: true,
      framework: "SOC2-CC7",
      notes: "P3 deployment.log.formatter.ts",
    },
    {
      id: "CC-004",
      label: "Ops event catalog for deployment visibility",
      status: s.orchestrationReady ? "pass" : "fail",
      required: true,
      framework: "SOC2-CC7",
      notes: "P3 ops.event.catalog.ts",
    },
    {
      id: "CC-005",
      label: "Rollback path documented",
      status: s.orchestrationReady ? "pass" : "fail",
      required: true,
      framework: "SOC2-CC9",
      notes: "P4 rollback.guard.ts + docs",
    },
    {
      id: "CC-006",
      label: "Release manifest lists all deployment layers",
      status: s.orchestrationReady ? "pass" : "fail",
      required: true,
      framework: "SOC2-CC8",
      notes: "P4 release.manifest.ts",
    },
    {
      id: "CC-007",
      label: "Security policy catalog complete",
      status: s.policyCatalogComplete ? "pass" : "fail",
      required: true,
      framework: "SOC2-CC6",
    },
    {
      id: "CC-008",
      label: "Artifact integrity inventory declared",
      status: s.artifactIntegrityComplete ? "pass" : "fail",
      required: true,
      framework: "SOC2-CC8",
    },
    {
      id: "CC-009",
      label: "Deployment security gates closed",
      status: s.securityGatesPass ? "pass" : "fail",
      required: true,
      framework: "SOC2-CC6",
    },
    {
      id: "CC-010",
      label: "V66 verify chain passes",
      status: s.complianceChecklistPass ? "pass" : "fail",
      required: true,
      framework: "SOC2-CC4",
      notes: "npm run verify:v66-deployment",
    },
  ];
}

export function buildComplianceChecklistManifest(
  signals: DeploymentSecuritySignals,
): ComplianceChecklistManifest {
  const items = buildComplianceChecklist(signals);
  const passCount = items.filter((i) => i.status === "pass").length;
  const checklistPass = items.filter((i) => i.required).every((i) => i.status === "pass");

  return {
    version: V66_DEPLOYMENT_SECURITY_VERSION,
    itemCount: items.length,
    passCount,
    checklistPass,
    items,
    summary: [
      `compliance-checklist pass=${passCount}/${items.length}`,
      `checklistPass=${checklistPass}`,
    ].join(" "),
  };
}
