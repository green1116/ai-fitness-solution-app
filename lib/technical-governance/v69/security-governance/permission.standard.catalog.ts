/**
 * V69 P5 — Permission standard catalog (declarative)
 */
import type { PermissionStandardEntry, PermissionStandardManifest } from "./governance.types";
import { V69_SECURITY_GOVERNANCE_VERSION } from "./governance.types";

export const PERMISSION_STANDARD_CATALOG: PermissionStandardEntry[] = [
  {
    id: "SEC-PERM-001",
    securityBoundaryRef: "SEC-BND-003",
    permissionModel: "rbac-api-route",
    roleRef: "api-user",
    required: true,
    description: "API route RBAC permission model",
  },
  {
    id: "SEC-PERM-002",
    securityBoundaryRef: "SEC-BND-001",
    permissionModel: "rbac-security-admin",
    roleRef: "security-admin",
    required: true,
    description: "Security admin role for auth module",
  },
  {
    id: "SEC-PERM-003",
    securityBoundaryRef: "SEC-BND-002",
    permissionModel: "rbac-app-user",
    roleRef: "app-user",
    required: true,
    description: "Application user role model",
  },
  {
    id: "SEC-PERM-004",
    securityBoundaryRef: "SEC-BND-004",
    permissionModel: "data-scoped-access",
    roleRef: "data-service",
    required: true,
    description: "Data layer scoped access roles",
  },
  {
    id: "SEC-PERM-005",
    securityBoundaryRef: "SEC-BND-005",
    permissionModel: "domain-executor",
    roleRef: "domain-executor",
    required: true,
    description: "Domain engine executor permissions",
  },
  {
    id: "SEC-PERM-006",
    securityBoundaryRef: "SEC-BND-006",
    permissionModel: "read-only-consumer",
    roleRef: "governance-reader",
    required: true,
    description: "Frozen platform read-only consumer",
  },
  {
    id: "SEC-PERM-007",
    securityBoundaryRef: "SEC-BND-007",
    permissionModel: "read-only-consumer",
    roleRef: "monitoring-reader",
    required: true,
    description: "Frozen monitoring read-only consumer",
  },
  {
    id: "SEC-PERM-008",
    securityBoundaryRef: "SEC-BND-008",
    permissionModel: "deploy-operator",
    roleRef: "release-operator",
    required: true,
    description: "Deployment pipeline operator role",
  },
];

export function buildPermissionStandardManifest(): PermissionStandardManifest {
  const standards = PERMISSION_STANDARD_CATALOG;
  const catalogComplete = standards.length >= 6;

  return {
    version: V69_SECURITY_GOVERNANCE_VERSION,
    entryCount: standards.length,
    catalogComplete,
    standards,
    summary: [
      `permission-standards count=${standards.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getPermissionStandardByBoundaryRef(
  securityBoundaryRef: string,
): PermissionStandardEntry | undefined {
  return PERMISSION_STANDARD_CATALOG.find((p) => p.securityBoundaryRef === securityBoundaryRef);
}
