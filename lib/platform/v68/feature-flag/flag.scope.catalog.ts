/**
 * V68 P4 — Feature flag scope catalog (declarative)
 */
import type { FlagScopeEntry, FlagScopeManifest } from "./governance.types";
import { V68_FEATURE_FLAG_GOVERNANCE_VERSION } from "./governance.types";

export const FLAG_SCOPE_CATALOG: FlagScopeEntry[] = [
  {
    id: "FF-SCP-001",
    flagRef: "FF-DEF-001",
    scopeKind: "global",
    targetRef: "production",
    required: true,
    description: "Production API flag scoped globally to production",
  },
  {
    id: "FF-SCP-002",
    flagRef: "FF-DEF-002",
    scopeKind: "service",
    targetRef: "SVC-DEF-002",
    required: true,
    description: "Health probe flag scoped to health-probe service",
  },
  {
    id: "FF-SCP-003",
    flagRef: "FF-DEF-003",
    scopeKind: "service",
    targetRef: "SVC-DEF-003",
    required: true,
    description: "Incident lifecycle flag scoped to incident service",
  },
  {
    id: "FF-SCP-004",
    flagRef: "FF-DEF-004",
    scopeKind: "service",
    targetRef: "SVC-DEF-004",
    required: true,
    description: "Alert routing flag scoped to alert-routing service",
  },
  {
    id: "FF-SCP-005",
    flagRef: "FF-DEF-005",
    scopeKind: "environment",
    targetRef: "NODE_ENV=production",
    required: true,
    description: "On-call paging scoped to production environment",
  },
  {
    id: "FF-SCP-006",
    flagRef: "FF-DEF-006",
    scopeKind: "service",
    targetRef: "SVC-DEF-006",
    required: true,
    description: "Verify gate scoped to deployment-verify service",
  },
  {
    id: "FF-SCP-007",
    flagRef: "FF-DEF-007",
    scopeKind: "environment",
    targetRef: "NODE_ENV=staging",
    required: true,
    description: "Readiness probe scoped to staging environment",
  },
  {
    id: "FF-SCP-008",
    flagRef: "FF-DEF-008",
    scopeKind: "tenant",
    targetRef: "platform-ops",
    required: true,
    description: "SLO alerts scoped to platform-ops tenant",
  },
];

export function buildFlagScopeManifest(): FlagScopeManifest {
  const scopes = FLAG_SCOPE_CATALOG;
  const scopeKinds = new Set(scopes.map((s) => s.scopeKind));
  const catalogComplete = scopes.length >= 6 && scopeKinds.size >= 3;

  return {
    version: V68_FEATURE_FLAG_GOVERNANCE_VERSION,
    entryCount: scopes.length,
    scopeKindCount: scopeKinds.size,
    catalogComplete,
    scopes,
    summary: [
      `flag-scopes count=${scopes.length}`,
      `kinds=${scopeKinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getFlagScopesByFlagRef(flagRef: string): FlagScopeEntry[] {
  return FLAG_SCOPE_CATALOG.filter((s) => s.flagRef === flagRef);
}
