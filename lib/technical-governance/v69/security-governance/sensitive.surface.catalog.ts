/**
 * V69 P5 — Sensitive surface catalog (declarative)
 */
import type { SensitiveSurfaceEntry, SensitiveSurfaceManifest } from "./governance.types";
import { V69_SECURITY_GOVERNANCE_VERSION } from "./governance.types";

export const SENSITIVE_SURFACE_CATALOG: SensitiveSurfaceEntry[] = [
  {
    id: "SEC-SUR-001",
    securityBoundaryRef: "SEC-BND-004",
    kind: "pii",
    surfacePath: "prisma/schema.prisma",
    classification: "high",
    required: true,
    description: "User PII in database schema",
  },
  {
    id: "SEC-SUR-002",
    securityBoundaryRef: "SEC-BND-001",
    kind: "credential",
    surfacePath: "lib/auth/**",
    classification: "critical",
    required: true,
    description: "Authentication credential handling surface",
  },
  {
    id: "SEC-SUR-003",
    securityBoundaryRef: "SEC-BND-003",
    kind: "token",
    surfacePath: "app/api/**/session",
    classification: "high",
    required: true,
    description: "API session token surface",
  },
  {
    id: "SEC-SUR-004",
    securityBoundaryRef: "SEC-BND-002",
    kind: "config",
    surfacePath: ".env*",
    classification: "critical",
    required: true,
    description: "Environment configuration secrets",
  },
  {
    id: "SEC-SUR-005",
    securityBoundaryRef: "SEC-BND-005",
    kind: "pii",
    surfacePath: "lib/**/user*",
    classification: "medium",
    required: true,
    description: "Domain user data modules",
  },
  {
    id: "SEC-SUR-006",
    securityBoundaryRef: "SEC-BND-006",
    kind: "config",
    surfacePath: "lib/platform/v68/**",
    classification: "low",
    required: true,
    description: "Frozen platform config surface (read-only)",
  },
  {
    id: "SEC-SUR-007",
    securityBoundaryRef: "SEC-BND-007",
    kind: "audit-log",
    surfacePath: "lib/monitoring/v67/**",
    classification: "medium",
    required: true,
    description: "Monitoring audit signal surface",
  },
  {
    id: "SEC-SUR-008",
    securityBoundaryRef: "SEC-BND-008",
    kind: "credential",
    surfacePath: "lib/deployment/**",
    classification: "high",
    required: true,
    description: "Deployment credential surface",
  },
];

export function buildSensitiveSurfaceManifest(): SensitiveSurfaceManifest {
  const surfaces = SENSITIVE_SURFACE_CATALOG;
  const kinds = new Set(surfaces.map((s) => s.kind));
  const catalogComplete = surfaces.length >= 6 && kinds.size >= 4;

  return {
    version: V69_SECURITY_GOVERNANCE_VERSION,
    surfaceCount: surfaces.length,
    kindCount: kinds.size,
    catalogComplete,
    surfaces,
    summary: [
      `sensitive-surfaces count=${surfaces.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getSensitiveSurfaceById(id: string): SensitiveSurfaceEntry | undefined {
  return SENSITIVE_SURFACE_CATALOG.find((s) => s.id === id);
}
