/**
 * V61 P2 — Dashboard RBAC (OWNER / ADMIN / MEMBER)
 */

import type { OrgRole } from "@/lib/organization/role.service";
import type { DashboardView } from "./dashboard.types";

const VIEW_ACCESS: Record<OrgRole, DashboardView[]> = {
  OWNER: ["overview", "revenue", "customers", "sales", "growth", "operations"],
  ADMIN: ["overview", "revenue", "customers", "sales", "growth"],
  MEMBER: ["overview", "growth"],
};

export class DashboardAccessError extends Error {
  readonly code = "DASHBOARD_ACCESS_DENIED";
  readonly status = 403;

  constructor(message: string) {
    super(message);
    this.name = "DashboardAccessError";
  }
}

export function resolveAllowedViews(role: OrgRole): DashboardView[] {
  return VIEW_ACCESS[role] ?? ["overview"];
}

export function canAccessDashboardView(role: OrgRole, view: DashboardView): boolean {
  return resolveAllowedViews(role).includes(view);
}

export function enforceDashboardAccess(role: OrgRole, view: DashboardView): void {
  if (!canAccessDashboardView(role, view)) {
    throw new DashboardAccessError(`Role ${role} cannot access ${view} dashboard`);
  }
}

export function resolveDashboardPermissionLevel(role: OrgRole): "full" | "partial" | "limited" {
  if (role === "OWNER") return "full";
  if (role === "ADMIN") return "partial";
  return "limited";
}
