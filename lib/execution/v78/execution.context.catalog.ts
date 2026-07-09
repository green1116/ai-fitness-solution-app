/**
 * V78 P3 — Execution context catalog (declarative)
 */
import { EXECUTION_UPSTREAM_DEPENDENCIES } from "./execution.dependencies";
import {
  EXECUTION_GOVERNANCE_CATALOG,
  EXECUTION_ROLE_CATALOG,
  EXECUTION_TOPOLOGY_CATALOG,
} from "./execution.inventory";
import { EXECUTION_POLICY_CATALOG_ENTRIES } from "./execution.policy.catalog";
import { EXECUTION_SCOPE_CATALOG } from "./execution.scope";
import type {
  ExecutionContextCatalogEntry,
  ExecutionContextCatalogManifest,
  ExecutionContextDomainKind,
  ExecutionContextValidation,
  ExecutionContextValidationManifest,
} from "./execution.context";
import { V78_EXECUTION_CONTEXT_VERSION } from "./execution.context";

const REQUIRED_DOMAINS: ExecutionContextDomainKind[] = [
  "shared",
  "role",
  "topology",
  "scope",
  "dependency",
  "governance",
  "workspace",
  "boundary",
];

export const EXECUTION_CONTEXT_CATALOG_ENTRIES: ExecutionContextCatalogEntry[] = [
  {
    id: "EXE-CTX-001",
    domain: "shared",
    purpose: "Shared execution context across participating roles",
    lifecycle: "session",
    ownership: "shared-executor-pool",
    boundary: "EXE-SCP-001",
    readWriteRule: "read:all-executors;write:owner-only",
    provenance: "v77-planning-freeze-baseline",
    roleRef: "EXE-ROL-001",
    topologyRef: "EXE-TOP-001",
    governanceRef: "EXE-GOV-001",
    priority: "high",
    dependencies: ["EXE-DEP-001"],
    validation: "EXE-CTV-001",
    inventoryRoleRef: "EXE-ROL-001",
    policyRef: "EXE-PLC-002",
    scopeRef: "EXE-SCP-001",
    required: true,
    description: "Shared domain — primary executor context",
  },
  {
    id: "EXE-CTX-002",
    domain: "role",
    purpose: "Execution role assignment and ownership context",
    lifecycle: "persistent",
    ownership: "role-owner-ref",
    boundary: "EXE-SCP-003",
    readWriteRule: "read:role+delegates;write:owner-only",
    provenance: "role-registry-declared",
    roleRef: "EXE-ROL-002",
    topologyRef: "EXE-TOP-002",
    governanceRef: "EXE-GOV-002",
    priority: "medium",
    dependencies: ["EXE-DEP-002"],
    validation: "EXE-CTV-002",
    inventoryRoleRef: "EXE-ROL-002",
    policyRef: "EXE-PLC-002",
    scopeRef: "EXE-SCP-003",
    required: true,
    description: "Role domain — topology dispatcher context",
  },
  {
    id: "EXE-CTX-003",
    domain: "topology",
    purpose: "Execution topology graph context",
    lifecycle: "persistent",
    ownership: "topology-operator",
    boundary: "EXE-SCP-003",
    readWriteRule: "read:topology;write:declarative-only",
    provenance: "topology-graph-declared",
    roleRef: "EXE-ROL-002",
    topologyRef: "EXE-TOP-002",
    governanceRef: "EXE-GOV-002",
    priority: "critical",
    dependencies: ["EXE-DEP-003"],
    validation: "EXE-CTV-003",
    inventoryRoleRef: "EXE-ROL-002",
    policyRef: "EXE-PLC-003",
    scopeRef: "EXE-SCP-003",
    required: true,
    description: "Topology domain — acyclic graph context",
  },
  {
    id: "EXE-CTX-004",
    domain: "scope",
    purpose: "Execution scope boundary context",
    lifecycle: "session",
    ownership: "scope-operator",
    boundary: "EXE-SCP-006",
    readWriteRule: "read:scope-parties;write:authorized-only",
    provenance: "scope-matrix-declared",
    roleRef: "EXE-ROL-003",
    topologyRef: "EXE-TOP-003",
    governanceRef: "EXE-GOV-005",
    priority: "high",
    dependencies: ["EXE-DEP-006"],
    validation: "EXE-CTV-004",
    inventoryRoleRef: "EXE-ROL-003",
    policyRef: "EXE-PLC-004",
    scopeRef: "EXE-SCP-006",
    required: true,
    description: "Scope domain — scope runner context",
  },
  {
    id: "EXE-CTX-005",
    domain: "dependency",
    purpose: "Upstream dependency execution context",
    lifecycle: "persistent",
    ownership: "dependency-operator",
    boundary: "EXE-SCP-007",
    readWriteRule: "read:upstream;write:declarative-only",
    provenance: "dependency-chain-declared",
    roleRef: "EXE-ROL-004",
    topologyRef: "EXE-TOP-004",
    governanceRef: "EXE-GOV-004",
    priority: "high",
    dependencies: ["EXE-DEP-005"],
    validation: "EXE-CTV-005",
    inventoryRoleRef: "EXE-ROL-004",
    policyRef: "EXE-PLC-005",
    scopeRef: "EXE-SCP-007",
    required: true,
    description: "Dependency domain — upstream lock context",
  },
  {
    id: "EXE-CTX-006",
    domain: "governance",
    purpose: "Execution governance inventory context",
    lifecycle: "persistent",
    ownership: "governance-operator",
    boundary: "EXE-SCP-006",
    readWriteRule: "read:governance;write:checklist-declared",
    provenance: "governance-inventory-declared",
    roleRef: "EXE-ROL-007",
    topologyRef: "EXE-TOP-007",
    governanceRef: "EXE-GOV-007",
    priority: "high",
    dependencies: ["EXE-DEP-004"],
    validation: "EXE-CTV-006",
    inventoryRoleRef: "EXE-ROL-007",
    policyRef: "EXE-PLC-006",
    scopeRef: "EXE-SCP-006",
    required: true,
    description: "Governance domain — governance operator context",
  },
  {
    id: "EXE-CTX-007",
    domain: "workspace",
    purpose: "Declarative workspace execution inventory context",
    lifecycle: "ephemeral",
    ownership: "platform-global",
    boundary: "EXE-SCP-008",
    readWriteRule: "read:declarative;write:none",
    provenance: "v78-inventory-self-ref",
    roleRef: "EXE-ROL-006",
    topologyRef: "EXE-TOP-006",
    governanceRef: "EXE-GOV-003",
    priority: "high",
    dependencies: ["EXE-DEP-008"],
    validation: "EXE-CTV-007",
    inventoryRoleRef: "EXE-ROL-006",
    policyRef: "EXE-PLC-007",
    scopeRef: "EXE-SCP-008",
    required: true,
    description: "Workspace domain — domain dispatcher context",
  },
  {
    id: "EXE-CTX-008",
    domain: "boundary",
    purpose: "Declarative workspace exclusion — no runtime execution",
    lifecycle: "ephemeral",
    ownership: "platform-global",
    boundary: "EXE-SCP-008",
    readWriteRule: "read:declarative;write:none",
    provenance: "v77-inventory-self-ref",
    roleRef: "EXE-ROL-008",
    topologyRef: "EXE-TOP-008",
    governanceRef: "EXE-GOV-008",
    priority: "critical",
    dependencies: ["EXE-DEP-008"],
    validation: "EXE-CTV-008",
    inventoryRoleRef: "EXE-ROL-008",
    policyRef: "EXE-PLC-001",
    scopeRef: "EXE-SCP-008",
    required: true,
    description: "Boundary domain — no runtime execution context",
  },
];

export const EXECUTION_CONTEXT_VALIDATION_CATALOG: ExecutionContextValidation[] = [
  {
    id: "EXE-CTV-001",
    contextRef: "EXE-CTX-001",
    validationKind: "shared",
    passCondition: "shared-context-defined",
    required: true,
    description: "Shared context validation",
  },
  {
    id: "EXE-CTV-002",
    contextRef: "EXE-CTX-002",
    validationKind: "role",
    passCondition: "role-context-defined",
    required: true,
    description: "Role context validation",
  },
  {
    id: "EXE-CTV-003",
    contextRef: "EXE-CTX-003",
    validationKind: "topology",
    passCondition: "topology-context-defined",
    required: true,
    description: "Topology context validation",
  },
  {
    id: "EXE-CTV-004",
    contextRef: "EXE-CTX-004",
    validationKind: "scope",
    passCondition: "scope-context-defined",
    required: true,
    description: "Scope context validation",
  },
  {
    id: "EXE-CTV-005",
    contextRef: "EXE-CTX-005",
    validationKind: "dependency",
    passCondition: "dependency-context-defined",
    required: true,
    description: "Dependency context validation",
  },
  {
    id: "EXE-CTV-006",
    contextRef: "EXE-CTX-006",
    validationKind: "governance",
    passCondition: "governance-context-defined",
    required: true,
    description: "Governance context validation",
  },
  {
    id: "EXE-CTV-007",
    contextRef: "EXE-CTX-007",
    validationKind: "workspace",
    passCondition: "workspace-context-defined",
    required: true,
    description: "Workspace context validation",
  },
  {
    id: "EXE-CTV-008",
    contextRef: "EXE-CTX-008",
    validationKind: "no-runtime",
    passCondition: "declarative-only",
    required: true,
    description: "Boundary runtime exclusion validation",
  },
];

export function isExecutionContextCatalogRefsAligned(): boolean {
  const roleIds = new Set(EXECUTION_ROLE_CATALOG.map((r) => r.id));
  const topologyIds = new Set(EXECUTION_TOPOLOGY_CATALOG.map((t) => t.id));
  const governanceIds = new Set(EXECUTION_GOVERNANCE_CATALOG.map((g) => g.id));
  const depIds = new Set(EXECUTION_UPSTREAM_DEPENDENCIES.map((d) => d.id));
  const scopeIds = new Set(EXECUTION_SCOPE_CATALOG.map((s) => s.id));
  const policyIds = new Set(EXECUTION_POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const validationIds = new Set(EXECUTION_CONTEXT_VALIDATION_CATALOG.map((v) => v.id));
  const contextIds = new Set(EXECUTION_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const domains = new Set(EXECUTION_CONTEXT_CATALOG_ENTRIES.map((c) => c.domain));

  const contextsAligned = EXECUTION_CONTEXT_CATALOG_ENTRIES.every(
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

  const validationsAligned = EXECUTION_CONTEXT_VALIDATION_CATALOG.every((v) =>
    contextIds.has(v.contextRef),
  );

  const domainsComplete = REQUIRED_DOMAINS.every((d) => domains.has(d));

  return (
    contextsAligned &&
    validationsAligned &&
    domainsComplete &&
    EXECUTION_CONTEXT_CATALOG_ENTRIES.length === 8
  );
}

export function buildExecutionContextCatalogManifest(): ExecutionContextCatalogManifest {
  const contexts = EXECUTION_CONTEXT_CATALOG_ENTRIES;
  const domains = new Set(contexts.map((c) => c.domain));
  const catalogComplete =
    contexts.length === 8 && REQUIRED_DOMAINS.every((d) => domains.has(d));

  return {
    version: V78_EXECUTION_CONTEXT_VERSION,
    entryCount: contexts.length,
    domainCount: domains.size,
    catalogComplete,
    contexts,
    summary: [
      `execution-context-catalog count=${contexts.length}`,
      `domains=${domains.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildExecutionContextValidationManifest(): ExecutionContextValidationManifest {
  const validations = EXECUTION_CONTEXT_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V78_EXECUTION_CONTEXT_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `execution-context-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getExecutionContextCatalogEntryById(
  id: string,
): ExecutionContextCatalogEntry | undefined {
  return EXECUTION_CONTEXT_CATALOG_ENTRIES.find((c) => c.id === id);
}

export function getExecutionContextCatalogEntriesByDomain(
  domain: ExecutionContextDomainKind,
): ExecutionContextCatalogEntry[] {
  return EXECUTION_CONTEXT_CATALOG_ENTRIES.filter((c) => c.domain === domain);
}

export function getExecutionContextValidationByContextRef(
  contextRef: string,
): ExecutionContextValidation | undefined {
  return EXECUTION_CONTEXT_VALIDATION_CATALOG.find((v) => v.contextRef === contextRef);
}

export function computeExecutionDeclarativeContextValid(input: {
  domain: ExecutionContextDomainKind;
  validationKind: string;
}): boolean {
  return input.domain === "boundary" && input.validationKind === "no-runtime";
}
