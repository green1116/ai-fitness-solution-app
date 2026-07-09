/**
 * V69 P5 — Access standard catalog (declarative)
 */
import type { AccessStandardEntry, AccessStandardManifest } from "./governance.types";
import { V69_SECURITY_GOVERNANCE_VERSION } from "./governance.types";

export const ACCESS_STANDARD_CATALOG: AccessStandardEntry[] = [
  {
    id: "SEC-ACC-001",
    securityBoundaryRef: "SEC-BND-002",
    accessPattern: "session-cookie-or-bearer",
    authRequired: true,
    required: true,
    description: "Application routes require authenticated session",
  },
  {
    id: "SEC-ACC-002",
    securityBoundaryRef: "SEC-BND-003",
    accessPattern: "api-key-or-session",
    authRequired: true,
    required: true,
    description: "API routes require auth credential",
  },
  {
    id: "SEC-ACC-003",
    securityBoundaryRef: "SEC-BND-001",
    accessPattern: "rbac-role-gate",
    authRequired: true,
    required: true,
    description: "Security core requires RBAC role gate",
  },
  {
    id: "SEC-ACC-004",
    securityBoundaryRef: "SEC-BND-004",
    accessPattern: "service-account-internal",
    authRequired: true,
    required: true,
    description: "Data layer internal service account only",
  },
  {
    id: "SEC-ACC-005",
    securityBoundaryRef: "SEC-BND-005",
    accessPattern: "domain-module-scope",
    authRequired: true,
    required: true,
    description: "Domain modules scoped to caller context",
  },
  {
    id: "SEC-ACC-006",
    securityBoundaryRef: "SEC-BND-006",
    accessPattern: "read-only-import",
    authRequired: false,
    required: true,
    description: "Frozen platform zone read-only import only",
  },
  {
    id: "SEC-ACC-007",
    securityBoundaryRef: "SEC-BND-007",
    accessPattern: "read-only-import",
    authRequired: false,
    required: true,
    description: "Frozen monitoring zone read-only import only",
  },
  {
    id: "SEC-ACC-008",
    securityBoundaryRef: "SEC-BND-008",
    accessPattern: "ci-deploy-token",
    authRequired: true,
    required: true,
    description: "Deployment pipeline CI token required",
  },
];

export function buildAccessStandardManifest(): AccessStandardManifest {
  const standards = ACCESS_STANDARD_CATALOG;
  const catalogComplete = standards.length >= 6;

  return {
    version: V69_SECURITY_GOVERNANCE_VERSION,
    entryCount: standards.length,
    catalogComplete,
    standards,
    summary: [
      `access-standards count=${standards.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getAccessStandardByBoundaryRef(
  securityBoundaryRef: string,
): AccessStandardEntry | undefined {
  return ACCESS_STANDARD_CATALOG.find((a) => a.securityBoundaryRef === securityBoundaryRef);
}
