/**
 * V79 P3 — Task context catalog (declarative)
 */
import { TASK_UPSTREAM_DEPENDENCIES } from "./task.dependencies";
import {
  TASK_GOVERNANCE_CATALOG,
  TASK_ROLE_CATALOG,
  TASK_TOPOLOGY_CATALOG,
} from "./task.inventory";
import { TASK_POLICY_CATALOG_ENTRIES } from "./task.policy.catalog";
import { TASK_SCOPE_CATALOG } from "./task.scope";
import { TASK_STATE_CATALOG } from "./task.state";
import type {
  TaskContextCatalogEntry,
  TaskContextCatalogManifest,
  TaskContextDomainKind,
  TaskContextValidation,
  TaskContextValidationManifest,
} from "./task.context";
import { V79_TASK_CONTEXT_VERSION } from "./task.context";

const REQUIRED_DOMAINS: TaskContextDomainKind[] = [
  "shared",
  "role",
  "state",
  "topology",
  "scope",
  "dependency",
  "governance",
  "boundary",
];

export const TASK_CONTEXT_CATALOG_ENTRIES: TaskContextCatalogEntry[] = [
  {
    id: "TSK-CTX-001",
    domain: "shared",
    purpose: "Shared task context across participating roles",
    lifecycle: "session",
    ownership: "shared-task-pool",
    boundary: "TSK-SCP-001",
    readWriteRule: "read:all-roles;write:owner-only",
    provenance: "v78-execution-freeze-baseline",
    roleRef: "TSK-ROL-001",
    stateRef: "TSK-STA-001",
    topologyRef: "TSK-TOP-001",
    governanceRef: "TSK-GOV-001",
    priority: "high",
    dependencies: ["TSK-DEP-001"],
    validation: "TSK-CTV-001",
    inventoryRoleRef: "TSK-ROL-001",
    policyRef: "TSK-PLC-002",
    scopeRef: "TSK-SCP-001",
    required: true,
    description: "Shared domain — primary creator task context",
  },
  {
    id: "TSK-CTX-002",
    domain: "role",
    purpose: "Task role assignment and ownership context",
    lifecycle: "persistent",
    ownership: "role-owner-ref",
    boundary: "TSK-SCP-003",
    readWriteRule: "read:role+delegates;write:owner-only",
    provenance: "role-registry-declared",
    roleRef: "TSK-ROL-002",
    stateRef: "TSK-STA-002",
    topologyRef: "TSK-TOP-002",
    governanceRef: "TSK-GOV-002",
    priority: "medium",
    dependencies: ["TSK-DEP-002"],
    validation: "TSK-CTV-002",
    inventoryRoleRef: "TSK-ROL-002",
    policyRef: "TSK-PLC-002",
    scopeRef: "TSK-SCP-003",
    required: true,
    description: "Role domain — topology assigner context",
  },
  {
    id: "TSK-CTX-003",
    domain: "state",
    purpose: "Task lifecycle state transition context",
    lifecycle: "persistent",
    ownership: "state-operator",
    boundary: "TSK-SCP-004",
    readWriteRule: "read:state-parties;write:declarative-only",
    provenance: "state-catalog-declared",
    roleRef: "TSK-ROL-003",
    stateRef: "TSK-STA-004",
    topologyRef: "TSK-TOP-003",
    governanceRef: "TSK-GOV-003",
    priority: "critical",
    dependencies: ["TSK-DEP-003"],
    validation: "TSK-CTV-003",
    inventoryRoleRef: "TSK-ROL-003",
    policyRef: "TSK-PLC-003",
    scopeRef: "TSK-SCP-004",
    required: true,
    description: "State domain — active lifecycle context",
  },
  {
    id: "TSK-CTX-004",
    domain: "topology",
    purpose: "Task topology graph context",
    lifecycle: "persistent",
    ownership: "topology-operator",
    boundary: "TSK-SCP-003",
    readWriteRule: "read:topology;write:declarative-only",
    provenance: "topology-graph-declared",
    roleRef: "TSK-ROL-002",
    stateRef: "TSK-STA-003",
    topologyRef: "TSK-TOP-002",
    governanceRef: "TSK-GOV-002",
    priority: "critical",
    dependencies: ["TSK-DEP-004"],
    validation: "TSK-CTV-004",
    inventoryRoleRef: "TSK-ROL-002",
    policyRef: "TSK-PLC-004",
    scopeRef: "TSK-SCP-003",
    required: true,
    description: "Topology domain — acyclic graph context",
  },
  {
    id: "TSK-CTX-005",
    domain: "scope",
    purpose: "Task scope boundary context",
    lifecycle: "session",
    ownership: "scope-operator",
    boundary: "TSK-SCP-006",
    readWriteRule: "read:scope-parties;write:authorized-only",
    provenance: "scope-matrix-declared",
    roleRef: "TSK-ROL-005",
    stateRef: "TSK-STA-006",
    topologyRef: "TSK-TOP-005",
    governanceRef: "TSK-GOV-005",
    priority: "high",
    dependencies: ["TSK-DEP-006"],
    validation: "TSK-CTV-005",
    inventoryRoleRef: "TSK-ROL-005",
    policyRef: "TSK-PLC-005",
    scopeRef: "TSK-SCP-006",
    required: true,
    description: "Scope domain — session coordinator context",
  },
  {
    id: "TSK-CTX-006",
    domain: "dependency",
    purpose: "Upstream dependency task context",
    lifecycle: "persistent",
    ownership: "dependency-operator",
    boundary: "TSK-SCP-007",
    readWriteRule: "read:upstream;write:declarative-only",
    provenance: "dependency-chain-declared",
    roleRef: "TSK-ROL-004",
    stateRef: "TSK-STA-005",
    topologyRef: "TSK-TOP-004",
    governanceRef: "TSK-GOV-004",
    priority: "high",
    dependencies: ["TSK-DEP-005"],
    validation: "TSK-CTV-006",
    inventoryRoleRef: "TSK-ROL-004",
    policyRef: "TSK-PLC-006",
    scopeRef: "TSK-SCP-007",
    required: true,
    description: "Dependency domain — upstream lock context",
  },
  {
    id: "TSK-CTX-007",
    domain: "governance",
    purpose: "Task governance inventory context",
    lifecycle: "persistent",
    ownership: "governance-operator",
    boundary: "TSK-SCP-006",
    readWriteRule: "read:governance;write:checklist-declared",
    provenance: "governance-inventory-declared",
    roleRef: "TSK-ROL-007",
    stateRef: "TSK-STA-007",
    topologyRef: "TSK-TOP-007",
    governanceRef: "TSK-GOV-007",
    priority: "high",
    dependencies: ["TSK-DEP-002"],
    validation: "TSK-CTV-007",
    inventoryRoleRef: "TSK-ROL-007",
    policyRef: "TSK-PLC-007",
    scopeRef: "TSK-SCP-006",
    required: true,
    description: "Governance domain — governance operator context",
  },
  {
    id: "TSK-CTX-008",
    domain: "boundary",
    purpose: "Declarative task exclusion — no runtime task engine",
    lifecycle: "ephemeral",
    ownership: "platform-global",
    boundary: "TSK-SCP-008",
    readWriteRule: "read:declarative;write:none",
    provenance: "v79-inventory-self-ref",
    roleRef: "TSK-ROL-008",
    stateRef: "TSK-STA-008",
    topologyRef: "TSK-TOP-008",
    governanceRef: "TSK-GOV-008",
    priority: "critical",
    dependencies: ["TSK-DEP-008"],
    validation: "TSK-CTV-008",
    inventoryRoleRef: "TSK-ROL-008",
    policyRef: "TSK-PLC-001",
    scopeRef: "TSK-SCP-008",
    required: true,
    description: "Boundary domain — no runtime task engine context",
  },
];

export const TASK_CONTEXT_VALIDATION_CATALOG: TaskContextValidation[] = [
  {
    id: "TSK-CTV-001",
    contextRef: "TSK-CTX-001",
    validationKind: "shared",
    passCondition: "shared-context-defined",
    required: true,
    description: "Shared context validation",
  },
  {
    id: "TSK-CTV-002",
    contextRef: "TSK-CTX-002",
    validationKind: "role",
    passCondition: "role-context-defined",
    required: true,
    description: "Role context validation",
  },
  {
    id: "TSK-CTV-003",
    contextRef: "TSK-CTX-003",
    validationKind: "state",
    passCondition: "task-state-context-defined",
    required: true,
    description: "State context validation",
  },
  {
    id: "TSK-CTV-004",
    contextRef: "TSK-CTX-004",
    validationKind: "topology",
    passCondition: "topology-context-defined",
    required: true,
    description: "Topology context validation",
  },
  {
    id: "TSK-CTV-005",
    contextRef: "TSK-CTX-005",
    validationKind: "scope",
    passCondition: "scope-context-defined",
    required: true,
    description: "Scope context validation",
  },
  {
    id: "TSK-CTV-006",
    contextRef: "TSK-CTX-006",
    validationKind: "dependency",
    passCondition: "dependency-context-defined",
    required: true,
    description: "Dependency context validation",
  },
  {
    id: "TSK-CTV-007",
    contextRef: "TSK-CTX-007",
    validationKind: "governance",
    passCondition: "governance-context-defined",
    required: true,
    description: "Governance context validation",
  },
  {
    id: "TSK-CTV-008",
    contextRef: "TSK-CTX-008",
    validationKind: "no-runtime",
    passCondition: "declarative-only",
    required: true,
    description: "Boundary runtime exclusion validation",
  },
];

export function isTaskContextCatalogRefsAligned(): boolean {
  const roleIds = new Set(TASK_ROLE_CATALOG.map((r) => r.id));
  const stateIds = new Set(TASK_STATE_CATALOG.map((s) => s.id));
  const topologyIds = new Set(TASK_TOPOLOGY_CATALOG.map((t) => t.id));
  const governanceIds = new Set(TASK_GOVERNANCE_CATALOG.map((g) => g.id));
  const depIds = new Set(TASK_UPSTREAM_DEPENDENCIES.map((d) => d.id));
  const scopeIds = new Set(TASK_SCOPE_CATALOG.map((s) => s.id));
  const policyIds = new Set(TASK_POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const validationIds = new Set(TASK_CONTEXT_VALIDATION_CATALOG.map((v) => v.id));
  const contextIds = new Set(TASK_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const domains = new Set(TASK_CONTEXT_CATALOG_ENTRIES.map((c) => c.domain));

  const contextsAligned = TASK_CONTEXT_CATALOG_ENTRIES.every(
    (c) =>
      scopeIds.has(c.scopeRef) &&
      policyIds.has(c.policyRef) &&
      roleIds.has(c.inventoryRoleRef) &&
      roleIds.has(c.roleRef) &&
      stateIds.has(c.stateRef) &&
      topologyIds.has(c.topologyRef) &&
      governanceIds.has(c.governanceRef) &&
      validationIds.has(c.validation) &&
      c.dependencies.every((d) => depIds.has(d)) &&
      c.ownership.length > 0 &&
      c.boundary.length > 0 &&
      c.readWriteRule.length > 0 &&
      c.provenance.length > 0,
  );

  const validationsAligned = TASK_CONTEXT_VALIDATION_CATALOG.every((v) =>
    contextIds.has(v.contextRef),
  );

  const domainsComplete = REQUIRED_DOMAINS.every((d) => domains.has(d));

  return (
    contextsAligned &&
    validationsAligned &&
    domainsComplete &&
    TASK_CONTEXT_CATALOG_ENTRIES.length === 8
  );
}

export function buildTaskContextCatalogManifest(): TaskContextCatalogManifest {
  const contexts = TASK_CONTEXT_CATALOG_ENTRIES;
  const domains = new Set(contexts.map((c) => c.domain));
  const catalogComplete =
    contexts.length === 8 && REQUIRED_DOMAINS.every((d) => domains.has(d));

  return {
    version: V79_TASK_CONTEXT_VERSION,
    entryCount: contexts.length,
    domainCount: domains.size,
    catalogComplete,
    contexts,
    summary: [
      `task-context-catalog count=${contexts.length}`,
      `domains=${domains.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildTaskContextValidationManifest(): TaskContextValidationManifest {
  const validations = TASK_CONTEXT_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V79_TASK_CONTEXT_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `task-context-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getTaskContextCatalogEntryById(
  id: string,
): TaskContextCatalogEntry | undefined {
  return TASK_CONTEXT_CATALOG_ENTRIES.find((c) => c.id === id);
}

export function getTaskContextCatalogEntriesByDomain(
  domain: TaskContextDomainKind,
): TaskContextCatalogEntry[] {
  return TASK_CONTEXT_CATALOG_ENTRIES.filter((c) => c.domain === domain);
}

export function getTaskContextValidationByContextRef(
  contextRef: string,
): TaskContextValidation | undefined {
  return TASK_CONTEXT_VALIDATION_CATALOG.find((v) => v.contextRef === contextRef);
}

export function computeTaskDeclarativeContextValid(input: {
  domain: TaskContextDomainKind;
  validationKind: string;
}): boolean {
  return input.domain === "boundary" && input.validationKind === "no-runtime";
}
