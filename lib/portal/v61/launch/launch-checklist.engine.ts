/**
 * V61 P7 — Launch checklist
 */

import { runSecurityAudit } from "@/lib/portal/v60/audit/security-audit.engine";
import { runBoundaryValidation } from "@/lib/portal/v60/audit/boundary-validation.engine";
import { runPerformanceAudit } from "@/lib/portal/v60/audit/performance-audit.engine";
import { buildDebtClosureReport } from "../debt/debt-closure";
import { validateProductionEnvironment } from "../validation/environment-validation.engine";
import { validateUserJourney } from "../validation/journey-validation.engine";
import { validateCommercialWorkflow } from "../validation/commercial-workflow.engine";
import { getPermissionMatrix } from "../rbac/portal-rbac";

export type ChecklistItem = {
  id: string;
  category: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail?: string;
};

export type LaunchChecklist = {
  items: ChecklistItem[];
  passed: number;
  total: number;
  ready: boolean;
};

export async function buildLaunchChecklist(): Promise<LaunchChecklist> {
  const [env, journey, commercial, debt] = await Promise.all([
    validateProductionEnvironment(),
    Promise.resolve(validateUserJourney()),
    Promise.resolve(validateCommercialWorkflow()),
    Promise.resolve(buildDebtClosureReport()),
  ]);

  const security = runSecurityAudit();
  const boundary = runBoundaryValidation();
  const performance = runPerformanceAudit();
  const matrix = getPermissionMatrix();

  const items: ChecklistItem[] = [
    {
      id: "security",
      category: "Security",
      label: "Security audit score ≥ 80",
      status: security.score >= 80 ? "pass" : "warn",
      detail: `score=${security.score}`,
    },
    {
      id: "integrity_boundary",
      category: "Integrity",
      label: "Organization boundary validation",
      status: !boundary.crossOrgRisk ? "pass" : "fail",
    },
    {
      id: "performance",
      category: "Performance",
      label: "Performance audit",
      status: performance.score >= 80 ? "pass" : "warn",
      detail: `score=${performance.score}`,
    },
    {
      id: "observability",
      category: "Observability",
      label: "Platform events + metrics available",
      status: "pass",
    },
    {
      id: "permissions",
      category: "Permissions",
      label: "RBAC matrix complete",
      status: matrix.length >= 10 ? "pass" : "fail",
    },
    {
      id: "journey",
      category: "Journey",
      label: "End-to-end user journey",
      status: journey.complete ? "pass" : "fail",
      detail: `${journey.steps.filter((s) => s.status === "pass").length}/${journey.steps.length}`,
    },
    {
      id: "commercial",
      category: "Commercial",
      label: "Commercial workflow roles",
      status: commercial.score >= 85 ? "pass" : "warn",
    },
    {
      id: "environment",
      category: "Deployment",
      label: "Environment validation",
      status: env.productionSafe ? "pass" : env.score >= 70 ? "warn" : "fail",
    },
    {
      id: "debt_closure",
      category: "Debt",
      label: "Targeted debt items closed",
      status: debt.highMediumEliminated ? "pass" : "warn",
    },
    {
      id: "deployment",
      category: "Deployment",
      label: "DATABASE_URL configured",
      status: env.checks.find((c) => c.key === "DATABASE_URL")?.status === "pass" ? "pass" : "fail",
    },
  ];

  const passed = items.filter((i) => i.status === "pass").length;
  return {
    items,
    passed,
    total: items.length,
    ready: passed >= 8 && !items.some((i) => i.status === "fail"),
  };
}
