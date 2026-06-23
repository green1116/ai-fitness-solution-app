/**
 * V61 P2 — Portal RBAC (extends frozen role.service without modifying it)
 */

export const PORTAL_ROLES = ["OWNER", "ADMIN", "MANAGER", "MEMBER"] as const;
export type PortalRole = (typeof PORTAL_ROLES)[number];

export type PortalSurface =
  | "workspace"
  | "projects"
  | "quotes"
  | "documents"
  | "reports"
  | "deliveries"
  | "intelligence"
  | "executive"
  | "production_ops"
  | "launch";

export type PermissionMatrixRow = {
  surface: PortalSurface;
  label: string;
  owner: boolean;
  admin: boolean;
  manager: boolean;
  member: boolean;
};

export const PORTAL_PERMISSION_MATRIX: PermissionMatrixRow[] = [
  { surface: "workspace", label: "Workspace", owner: true, admin: true, manager: true, member: true },
  { surface: "projects", label: "Projects", owner: true, admin: true, manager: true, member: true },
  { surface: "quotes", label: "Quotes", owner: true, admin: true, manager: true, member: true },
  { surface: "documents", label: "Documents", owner: true, admin: true, manager: true, member: true },
  { surface: "reports", label: "Reports", owner: true, admin: true, manager: true, member: true },
  { surface: "deliveries", label: "Deliveries", owner: true, admin: true, manager: true, member: true },
  { surface: "intelligence", label: "Intelligence", owner: true, admin: true, manager: true, member: true },
  { surface: "executive", label: "Executive Dashboard", owner: true, admin: true, manager: true, member: false },
  { surface: "production_ops", label: "Production Ops", owner: true, admin: true, manager: false, member: false },
  { surface: "launch", label: "Launch Center", owner: true, admin: true, manager: false, member: false },
];

export class PortalAccessError extends Error {
  readonly code = "PORTAL_FORBIDDEN";
  readonly status = 403;

  constructor(surface: PortalSurface, role: string) {
    super(`Role ${role} cannot access ${surface}`);
    this.name = "PortalAccessError";
  }
}

export function normalizePortalRole(role: string | undefined | null): PortalRole {
  const upper = String(role ?? "MEMBER").toUpperCase();
  if (PORTAL_ROLES.includes(upper as PortalRole)) return upper as PortalRole;
  return "MEMBER";
}

/** ADMIN inherits MANAGER capabilities for executive surfaces */
function roleColumn(role: PortalRole): keyof Pick<PermissionMatrixRow, "owner" | "admin" | "manager" | "member"> {
  if (role === "OWNER") return "owner";
  if (role === "ADMIN") return "admin";
  if (role === "MANAGER") return "manager";
  return "member";
}

export function canAccessSurface(role: string | undefined | null, surface: PortalSurface): boolean {
  const normalized = normalizePortalRole(role);
  const row = PORTAL_PERMISSION_MATRIX.find((r) => r.surface === surface);
  if (!row) return false;

  if (row[roleColumn(normalized)]) return true;

  // ADMIN satisfies MANAGER-only surfaces (executive)
  if (normalized === "ADMIN" && surface === "executive") return row.manager;

  return false;
}

export function getPermissionMatrix(): PermissionMatrixRow[] {
  return PORTAL_PERMISSION_MATRIX;
}
