/**
 * V61 P5 — Commercial workflow validation
 */

import fs from "node:fs";
import path from "node:path";
import { canAccessSurface, PORTAL_PERMISSION_MATRIX } from "../rbac/portal-rbac";

export type WorkflowRoleCheck = {
  role: string;
  canCreateProject: boolean;
  canGenerateQuote: boolean;
  canGeneratePdf: boolean;
  canDownloadPackage: boolean;
  canViewIntelligence: boolean;
  canViewExecutive: boolean;
};

export type CommercialWorkflowReport = {
  roles: WorkflowRoleCheck[];
  rbacMatrixPresent: boolean;
  score: number;
};

const ROOT = path.resolve(process.cwd());

export function validateCommercialWorkflow(): CommercialWorkflowReport {
  const roles = ["MEMBER", "MANAGER", "ADMIN", "OWNER"];
  const checks: WorkflowRoleCheck[] = roles.map((role) => ({
    role,
    canCreateProject: canAccessSurface(role, "projects"),
    canGenerateQuote: canAccessSurface(role, "quotes"),
    canGeneratePdf: canAccessSurface(role, "documents"),
    canDownloadPackage: canAccessSurface(role, "deliveries"),
    canViewIntelligence: canAccessSurface(role, "intelligence"),
    canViewExecutive: canAccessSurface(role, "executive"),
  }));

  const rbacMatrixPresent =
    fs.existsSync(path.join(ROOT, "lib/portal/v61/rbac/portal-rbac.ts")) &&
    PORTAL_PERMISSION_MATRIX.length >= 10;

  const memberOk = checks.find((c) => c.role === "MEMBER");
  const ownerOk = checks.find((c) => c.role === "OWNER");
  let score = 70;
  if (memberOk?.canCreateProject && memberOk.canGenerateQuote) score += 15;
  if (ownerOk?.canViewExecutive) score += 15;

  return { roles: checks, rbacMatrixPresent, score: Math.min(100, score) };
}
