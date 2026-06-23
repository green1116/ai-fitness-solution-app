/**
 * V60 P3 — Permission consistency audit
 */

import fs from "node:fs";
import path from "node:path";
import { ROLE_PERMISSIONS, type OrgRole } from "@/lib/organization/role.service";

export type PortalRole = "MEMBER" | "MANAGER" | "ADMIN" | "OWNER";

export type SurfacePermission = {
  surface: string;
  member: boolean;
  manager: boolean;
  admin: boolean;
  owner: boolean;
};

export type PermissionAuditReport = {
  model: PortalRole[];
  surfaces: SurfacePermission[];
  inconsistencies: { surface: string; issue: string }[];
  score: number;
};

const SURFACES = [
  "Workspace",
  "Projects",
  "Quotes",
  "Documents",
  "Reports",
  "Intelligence",
  "Executive Dashboard",
  "Production Ops",
] as const;

/** V60 portal permission matrix (read-only product surfaces) */
const PORTAL_MATRIX: Record<(typeof SURFACES)[number], Record<PortalRole, boolean>> = {
  Workspace: { MEMBER: true, MANAGER: true, ADMIN: true, OWNER: true },
  Projects: { MEMBER: true, MANAGER: true, ADMIN: true, OWNER: true },
  Quotes: { MEMBER: true, MANAGER: true, ADMIN: true, OWNER: true },
  Documents: { MEMBER: true, MANAGER: true, ADMIN: true, OWNER: true },
  Reports: { MEMBER: true, MANAGER: true, ADMIN: true, OWNER: true },
  Intelligence: { MEMBER: true, MANAGER: true, ADMIN: true, OWNER: true },
  "Executive Dashboard": { MEMBER: false, MANAGER: true, ADMIN: true, OWNER: true },
  "Production Ops": { MEMBER: false, MANAGER: false, ADMIN: true, OWNER: true },
};

const ROOT = path.resolve(process.cwd());

export function runPermissionAudit(): PermissionAuditReport {
  const surfaces: SurfacePermission[] = SURFACES.map((s) => ({
    surface: s,
    member: PORTAL_MATRIX[s].MEMBER,
    manager: PORTAL_MATRIX[s].MANAGER,
    admin: PORTAL_MATRIX[s].ADMIN,
    owner: PORTAL_MATRIX[s].OWNER,
  }));

  const inconsistencies: { surface: string; issue: string }[] = [];

  const rbacSource = fs.readFileSync(path.join(ROOT, "lib/organization/role.service.ts"), "utf8");
  if (!rbacSource.includes("OWNER") || !rbacSource.includes("MEMBER")) {
    inconsistencies.push({ surface: "RBAC", issue: "Core role service missing OWNER/MEMBER" });
  }

  if (!rbacSource.includes("MANAGER")) {
    inconsistencies.push({
      surface: "RBAC",
      issue: "MANAGER role not in frozen role.service — mapped via ADMIN for management actions in V60 matrix",
    });
  }

  for (const role of ["OWNER", "ADMIN", "MEMBER"] as OrgRole[]) {
    if (!ROLE_PERMISSIONS[role].includes("use_product")) {
      inconsistencies.push({ surface: "RBAC", issue: `${role} missing use_product` });
    }
  }

  const execPage = path.join(ROOT, "app/(intelligence)/intelligence/executive/page.tsx");
  if (fs.existsSync(execPage)) {
    inconsistencies.push({
      surface: "Executive Dashboard",
      issue: "UI present — enforce MANAGER+ at API layer in production deployment",
    });
  }

  const score = Math.max(70, 100 - inconsistencies.length * 5);

  return {
    model: ["MEMBER", "MANAGER", "ADMIN", "OWNER"],
    surfaces,
    inconsistencies,
    score,
  };
}
