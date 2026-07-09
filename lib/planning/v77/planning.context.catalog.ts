/**
 * V77 P3 — Planning context catalog (declarative)
 */
import { PLANNING_UPSTREAM_DEPENDENCIES } from "./planning.dependencies";
import {
  PLANNING_GOVERNANCE_CATALOG,
  PLANNING_ROLE_CATALOG,
  PLANNING_TOPOLOGY_CATALOG,
} from "./planning.inventory";
import { PLANNING_POLICY_CATALOG_ENTRIES } from "./planning.policy.catalog";
import { PLANNING_SCOPE_CATALOG } from "./planning.scope";
import type {
  PlanningContextCatalogEntry,
  PlanningContextCatalogManifest,
  PlanningContextDomainKind,
  PlanningContextValidation,
  PlanningContextValidationManifest,
} from "./planning.context";
import { V77_PLANNING_CONTEXT_VERSION } from "./planning.context";

const REQUIRED_DOMAINS: PlanningContextDomainKind[] = [
  "shared",
  "role",
  "topology",
  "scope",
  "dependency",
  "governance",
  "workspace",
  "boundary",
];

export const PLANNING_CONTEXT_CATALOG_ENTRIES: PlanningContextCatalogEntry[] = [
  {
    id: "PLN-CTX-001",
    domain: "shared",
    purpose: "Shared planning context across participating roles",
    lifecycle: "session",
    ownership: "shared-planner-pool",
    boundary: "PLN-SCP-001",
    readWriteRule: "read:all-planners;write:owner-only",
    provenance: "v76-collaboration-freeze-baseline",
    roleRef: "PLN-ROL-001",
    topologyRef: "PLN-TOP-001",
    governanceRef: "PLN-GOV-001",
    priority: "high",
    dependencies: ["PLN-DEP-001"],
    validation: "PLN-CTV-001",
    inventoryRoleRef: "PLN-ROL-001",
    policyRef: "PLN-PLC-002",
    scopeRef: "PLN-SCP-001",
    required: true,
    description: "Shared domain — primary planner context",
  },
  {
    id: "PLN-CTX-002",
    domain: "role",
    purpose: "Planning role assignment and ownership context",
    lifecycle: "persistent",
    ownership: "role-owner-ref",
    boundary: "PLN-SCP-003",
    readWriteRule: "read:role+delegates;write:owner-only",
    provenance: "role-registry-declared",
    roleRef: "PLN-ROL-002",
    topologyRef: "PLN-TOP-002",
    governanceRef: "PLN-GOV-002",
    priority: "medium",
    dependencies: ["PLN-DEP-002"],
    validation: "PLN-CTV-002",
    inventoryRoleRef: "PLN-ROL-002",
    policyRef: "PLN-PLC-002",
    scopeRef: "PLN-SCP-003",
    required: true,
    description: "Role domain — topology coordinator context",
  },
  {
    id: "PLN-CTX-003",
    domain: "topology",
    purpose: "Planning topology graph context",
    lifecycle: "persistent",
    ownership: "topology-operator",
    boundary: "PLN-SCP-003",
    readWriteRule: "read:topology;write:declarative-only",
    provenance: "topology-graph-declared",
    roleRef: "PLN-ROL-002",
    topologyRef: "PLN-TOP-002",
    governanceRef: "PLN-GOV-002",
    priority: "critical",
    dependencies: ["PLN-DEP-003"],
    validation: "PLN-CTV-003",
    inventoryRoleRef: "PLN-ROL-002",
    policyRef: "PLN-PLC-003",
    scopeRef: "PLN-SCP-003",
    required: true,
    description: "Topology domain — acyclic graph context",
  },
  {
    id: "PLN-CTX-004",
    domain: "scope",
    purpose: "Planning scope boundary context",
    lifecycle: "session",
    ownership: "scope-operator",
    boundary: "PLN-SCP-006",
    readWriteRule: "read:scope-parties;write:authorized-only",
    provenance: "scope-matrix-declared",
    roleRef: "PLN-ROL-005",
    topologyRef: "PLN-TOP-005",
    governanceRef: "PLN-GOV-005",
    priority: "high",
    dependencies: ["PLN-DEP-006"],
    validation: "PLN-CTV-004",
    inventoryRoleRef: "PLN-ROL-005",
    policyRef: "PLN-PLC-004",
    scopeRef: "PLN-SCP-006",
    required: true,
    description: "Scope domain — coordination reviewer context",
  },
  {
    id: "PLN-CTX-005",
    domain: "dependency",
    purpose: "Upstream dependency planning context",
    lifecycle: "persistent",
    ownership: "dependency-operator",
    boundary: "PLN-SCP-007",
    readWriteRule: "read:upstream;write:declarative-only",
    provenance: "dependency-chain-declared",
    roleRef: "PLN-ROL-004",
    topologyRef: "PLN-TOP-004",
    governanceRef: "PLN-GOV-006",
    priority: "high",
    dependencies: ["PLN-DEP-005"],
    validation: "PLN-CTV-005",
    inventoryRoleRef: "PLN-ROL-004",
    policyRef: "PLN-PLC-005",
    scopeRef: "PLN-SCP-007",
    required: true,
    description: "Dependency domain — upstream lock context",
  },
  {
    id: "PLN-CTX-006",
    domain: "governance",
    purpose: "Planning governance inventory context",
    lifecycle: "persistent",
    ownership: "governance-operator",
    boundary: "PLN-SCP-006",
    readWriteRule: "read:governance;write:checklist-declared",
    provenance: "governance-inventory-declared",
    roleRef: "PLN-ROL-007",
    topologyRef: "PLN-TOP-007",
    governanceRef: "PLN-GOV-007",
    priority: "high",
    dependencies: ["PLN-DEP-004"],
    validation: "PLN-CTV-006",
    inventoryRoleRef: "PLN-ROL-007",
    policyRef: "PLN-PLC-006",
    scopeRef: "PLN-SCP-006",
    required: true,
    description: "Governance domain — governance operator context",
  },
  {
    id: "PLN-CTX-007",
    domain: "workspace",
    purpose: "Declarative workspace planning inventory context",
    lifecycle: "ephemeral",
    ownership: "platform-global",
    boundary: "PLN-SCP-008",
    readWriteRule: "read:declarative;write:none",
    provenance: "v77-inventory-self-ref",
    roleRef: "PLN-ROL-006",
    topologyRef: "PLN-TOP-006",
    governanceRef: "PLN-GOV-003",
    priority: "high",
    dependencies: ["PLN-DEP-008"],
    validation: "PLN-CTV-007",
    inventoryRoleRef: "PLN-ROL-006",
    policyRef: "PLN-PLC-007",
    scopeRef: "PLN-SCP-008",
    required: true,
    description: "Workspace domain — session executor context",
  },
  {
    id: "PLN-CTX-008",
    domain: "boundary",
    purpose: "Declarative workspace exclusion — no runtime planning",
    lifecycle: "ephemeral",
    ownership: "platform-global",
    boundary: "PLN-SCP-008",
    readWriteRule: "read:declarative;write:none",
    provenance: "v76-inventory-self-ref",
    roleRef: "PLN-ROL-008",
    topologyRef: "PLN-TOP-008",
    governanceRef: "PLN-GOV-008",
    priority: "critical",
    dependencies: ["PLN-DEP-008"],
    validation: "PLN-CTV-008",
    inventoryRoleRef: "PLN-ROL-008",
    policyRef: "PLN-PLC-001",
    scopeRef: "PLN-SCP-008",
    required: true,
    description: "Boundary domain — no runtime planning context",
  },
];

export const PLANNING_CONTEXT_VALIDATION_CATALOG: PlanningContextValidation[] = [
  {
    id: "PLN-CTV-001",
    contextRef: "PLN-CTX-001",
    validationKind: "shared",
    passCondition: "shared-context-defined",
    required: true,
    description: "Shared context validation",
  },
  {
    id: "PLN-CTV-002",
    contextRef: "PLN-CTX-002",
    validationKind: "role",
    passCondition: "role-context-defined",
    required: true,
    description: "Role context validation",
  },
  {
    id: "PLN-CTV-003",
    contextRef: "PLN-CTX-003",
    validationKind: "topology",
    passCondition: "topology-context-defined",
    required: true,
    description: "Topology context validation",
  },
  {
    id: "PLN-CTV-004",
    contextRef: "PLN-CTX-004",
    validationKind: "scope",
    passCondition: "scope-context-defined",
    required: true,
    description: "Scope context validation",
  },
  {
    id: "PLN-CTV-005",
    contextRef: "PLN-CTX-005",
    validationKind: "dependency",
    passCondition: "dependency-context-defined",
    required: true,
    description: "Dependency context validation",
  },
  {
    id: "PLN-CTV-006",
    contextRef: "PLN-CTX-006",
    validationKind: "governance",
    passCondition: "governance-context-defined",
    required: true,
    description: "Governance context validation",
  },
  {
    id: "PLN-CTV-007",
    contextRef: "PLN-CTX-007",
    validationKind: "workspace",
    passCondition: "workspace-context-defined",
    required: true,
    description: "Workspace context validation",
  },
  {
    id: "PLN-CTV-008",
    contextRef: "PLN-CTX-008",
    validationKind: "no-runtime",
    passCondition: "declarative-only",
    required: true,
    description: "Boundary runtime exclusion validation",
  },
];

export function isPlanningContextCatalogRefsAligned(): boolean {
  const roleIds = new Set(PLANNING_ROLE_CATALOG.map((r) => r.id));
  const topologyIds = new Set(PLANNING_TOPOLOGY_CATALOG.map((t) => t.id));
  const governanceIds = new Set(PLANNING_GOVERNANCE_CATALOG.map((g) => g.id));
  const depIds = new Set(PLANNING_UPSTREAM_DEPENDENCIES.map((d) => d.id));
  const scopeIds = new Set(PLANNING_SCOPE_CATALOG.map((s) => s.id));
  const policyIds = new Set(PLANNING_POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const validationIds = new Set(PLANNING_CONTEXT_VALIDATION_CATALOG.map((v) => v.id));
  const contextIds = new Set(PLANNING_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const domains = new Set(PLANNING_CONTEXT_CATALOG_ENTRIES.map((c) => c.domain));

  const contextsAligned = PLANNING_CONTEXT_CATALOG_ENTRIES.every(
    (c) =>
      scopeIds.has(c.scopeRef) &&
      policyIds.has(c.policyRef) &&
      roleIds.has(c.inventoryRoleRef) &&
      roleIds.has(c.roleRef) &&
      topologyIds.has(c.topologyRef) &&
      governanceIds.has(c.governanceRef) &&
      validationIds.has(c.validation) &&
      c.dependencies.every((d) => depIds.has(d)) &&
      c.ownership.length > 0 &&
      c.boundary.length > 0 &&
      c.readWriteRule.length > 0 &&
      c.provenance.length > 0,
  );

  const validationsAligned = PLANNING_CONTEXT_VALIDATION_CATALOG.every((v) =>
    contextIds.has(v.contextRef),
  );

  const domainsComplete = REQUIRED_DOMAINS.every((d) => domains.has(d));

  return (
    contextsAligned &&
    validationsAligned &&
    domainsComplete &&
    PLANNING_CONTEXT_CATALOG_ENTRIES.length === 8
  );
}

export function buildPlanningContextCatalogManifest(): PlanningContextCatalogManifest {
  const contexts = PLANNING_CONTEXT_CATALOG_ENTRIES;
  const domains = new Set(contexts.map((c) => c.domain));
  const catalogComplete =
    contexts.length === 8 && REQUIRED_DOMAINS.every((d) => domains.has(d));

  return {
    version: V77_PLANNING_CONTEXT_VERSION,
    entryCount: contexts.length,
    domainCount: domains.size,
    catalogComplete,
    contexts,
    summary: [
      `planning-context-catalog count=${contexts.length}`,
      `domains=${domains.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildPlanningContextValidationManifest(): PlanningContextValidationManifest {
  const validations = PLANNING_CONTEXT_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V77_PLANNING_CONTEXT_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `planning-context-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getPlanningContextCatalogEntryById(
  id: string,
): PlanningContextCatalogEntry | undefined {
  return PLANNING_CONTEXT_CATALOG_ENTRIES.find((c) => c.id === id);
}

export function getPlanningContextCatalogEntriesByDomain(
  domain: PlanningContextDomainKind,
): PlanningContextCatalogEntry[] {
  return PLANNING_CONTEXT_CATALOG_ENTRIES.filter((c) => c.domain === domain);
}

export function getPlanningContextValidationByContextRef(
  contextRef: string,
): PlanningContextValidation | undefined {
  return PLANNING_CONTEXT_VALIDATION_CATALOG.find((v) => v.contextRef === contextRef);
}

export function computePlanningDeclarativeContextValid(input: {
  domain: PlanningContextDomainKind;
  validationKind: string;
}): boolean {
  return input.domain === "boundary" && input.validationKind === "no-runtime";
}
