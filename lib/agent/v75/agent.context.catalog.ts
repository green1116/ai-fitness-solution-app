/**
 * V75 P3 — Agent context catalog (declarative)
 */
import {
  AGENT_CONTEXT_CATALOG,
  AGENT_INPUT_CATALOG,
  AGENT_OUTPUT_CATALOG,
} from "./agent.inventory";
import { AGENT_UPSTREAM_DEPENDENCIES } from "./agent.dependencies";
import { AGENT_SCOPE_CATALOG } from "./agent.scope";
import { AGENT_POLICY_CATALOG_ENTRIES } from "./agent.policy.catalog";
import type {
  AgentContextCatalogEntry,
  AgentContextCatalogManifest,
  AgentContextDomainKind,
  AgentContextValidation,
  AgentContextValidationManifest,
} from "./agent.context";
import { V75_AGENT_CONTEXT_VERSION } from "./agent.context";

const REQUIRED_DOMAINS: AgentContextDomainKind[] = [
  "user",
  "workspace",
  "organization",
  "task",
  "session",
  "orchestration",
  "environment",
  "history",
];

export const AGENT_CONTEXT_CATALOG_ENTRIES: AgentContextCatalogEntry[] = [
  {
    id: "AGT-CTX-001",
    domain: "user",
    purpose: "Operator and end-user agent identity boundary",
    sourceRef: "AGT-SRC-001",
    lifecycle: "session",
    inputs: ["AGT-INP-001"],
    outputs: ["AGT-OUT-001"],
    priority: "high",
    dependencies: ["AGT-DEP-001"],
    validation: "AGT-CTV-001",
    inventoryContextRef: "AGT-CTX-001",
    policyRef: "AGT-PLC-002",
    scopeRef: "AGT-SCP-004",
    required: true,
    description: "User domain — operator session agent context",
  },
  {
    id: "AGT-CTX-002",
    domain: "workspace",
    purpose: "Workspace-scoped agent orchestration boundary",
    sourceRef: "AGT-SRC-002",
    lifecycle: "persistent",
    inputs: ["AGT-INP-002"],
    outputs: ["AGT-OUT-002"],
    priority: "medium",
    dependencies: ["AGT-DEP-002"],
    validation: "AGT-CTV-002",
    inventoryContextRef: "AGT-CTX-002",
    policyRef: "AGT-PLC-003",
    scopeRef: "AGT-SCP-002",
    required: true,
    description: "Workspace domain — fitness program workspace context",
  },
  {
    id: "AGT-CTX-003",
    domain: "organization",
    purpose: "Organization-level governance agent context",
    sourceRef: "AGT-SRC-003",
    lifecycle: "persistent",
    inputs: ["AGT-INP-003"],
    outputs: ["AGT-OUT-003"],
    priority: "high",
    dependencies: ["AGT-DEP-005"],
    validation: "AGT-CTV-003",
    inventoryContextRef: "AGT-CTX-003",
    policyRef: "AGT-PLC-004",
    scopeRef: "AGT-SCP-006",
    required: true,
    description: "Organization domain — governance policy enforcement context",
  },
  {
    id: "AGT-CTX-004",
    domain: "task",
    purpose: "Task execution and decision consumer context",
    sourceRef: "AGT-SRC-001",
    lifecycle: "ephemeral",
    inputs: ["AGT-INP-001", "AGT-INP-004"],
    outputs: ["AGT-OUT-001", "AGT-OUT-004"],
    priority: "critical",
    dependencies: ["AGT-DEP-001", "AGT-DEP-003"],
    validation: "AGT-CTV-004",
    inventoryContextRef: "AGT-CTX-004",
    policyRef: "AGT-PLC-002",
    scopeRef: "AGT-SCP-003",
    required: true,
    description: "Task domain — V74 decision freeze consumer context",
  },
  {
    id: "AGT-CTX-005",
    domain: "session",
    purpose: "Declarative session exclusion boundary context",
    sourceRef: "AGT-SRC-008",
    lifecycle: "ephemeral",
    inputs: ["AGT-INP-008"],
    outputs: ["AGT-OUT-008"],
    priority: "critical",
    dependencies: ["AGT-DEP-008"],
    validation: "AGT-CTV-005",
    inventoryContextRef: "AGT-CTX-005",
    policyRef: "AGT-PLC-001",
    scopeRef: "AGT-SCP-008",
    required: true,
    description: "Session domain — no runtime execution agent context",
  },
  {
    id: "AGT-CTX-006",
    domain: "orchestration",
    purpose: "Declarative orchestration reference context (read-only)",
    sourceRef: "AGT-SRC-006",
    lifecycle: "session",
    inputs: ["AGT-INP-005"],
    outputs: ["AGT-OUT-005"],
    priority: "medium",
    dependencies: ["AGT-DEP-006"],
    validation: "AGT-CTV-006",
    inventoryContextRef: "AGT-CTX-006",
    policyRef: "AGT-PLC-005",
    scopeRef: "AGT-SCP-005",
    required: true,
    description: "Orchestration domain — declarative orchestration boundary context",
  },
  {
    id: "AGT-CTX-007",
    domain: "environment",
    purpose: "Deployment environment agent context",
    sourceRef: "AGT-SRC-007",
    lifecycle: "persistent",
    inputs: ["AGT-INP-006"],
    outputs: ["AGT-OUT-006"],
    priority: "medium",
    dependencies: ["AGT-DEP-006"],
    validation: "AGT-CTV-007",
    inventoryContextRef: "AGT-CTX-007",
    policyRef: "AGT-PLC-007",
    scopeRef: "AGT-SCP-007",
    required: true,
    description: "Environment domain — deployment session context",
  },
  {
    id: "AGT-CTX-008",
    domain: "history",
    purpose: "Agent history and audit trail context",
    sourceRef: "AGT-SRC-005",
    lifecycle: "archived",
    inputs: ["AGT-INP-007"],
    outputs: ["AGT-OUT-007"],
    priority: "high",
    dependencies: ["AGT-DEP-006"],
    validation: "AGT-CTV-008",
    inventoryContextRef: "AGT-CTX-008",
    policyRef: "AGT-PLC-008",
    scopeRef: "AGT-SCP-001",
    required: true,
    description: "History domain — compliance audit history context",
  },
];

export const AGENT_CONTEXT_VALIDATION_CATALOG: AgentContextValidation[] = [
  {
    id: "AGT-CTV-001",
    contextRef: "AGT-CTX-001",
    validationKind: "user-identity",
    passCondition: "operator-session-valid",
    required: true,
    description: "User domain identity validation",
  },
  {
    id: "AGT-CTV-002",
    contextRef: "AGT-CTX-002",
    validationKind: "workspace-boundary",
    passCondition: "workspace-scope-defined",
    required: true,
    description: "Workspace domain boundary validation",
  },
  {
    id: "AGT-CTV-003",
    contextRef: "AGT-CTX-003",
    validationKind: "org-governance",
    passCondition: "governance-policy-present",
    required: true,
    description: "Organization governance validation",
  },
  {
    id: "AGT-CTV-004",
    contextRef: "AGT-CTX-004",
    validationKind: "task-decision",
    passCondition: "decision-freeze-intact",
    required: true,
    description: "Task decision consumer validation",
  },
  {
    id: "AGT-CTV-005",
    contextRef: "AGT-CTX-005",
    validationKind: "no-runtime",
    passCondition: "declarative-only",
    required: true,
    description: "Session runtime exclusion validation",
  },
  {
    id: "AGT-CTV-006",
    contextRef: "AGT-CTX-006",
    validationKind: "orchestration-readonly",
    passCondition: "orchestration-unchanged",
    required: true,
    description: "Orchestration read-only boundary validation",
  },
  {
    id: "AGT-CTV-007",
    contextRef: "AGT-CTX-007",
    validationKind: "environment-session",
    passCondition: "deployment-id-present",
    required: true,
    description: "Environment session validation",
  },
  {
    id: "AGT-CTV-008",
    contextRef: "AGT-CTX-008",
    validationKind: "history-audit",
    passCondition: "audit-trail-complete",
    required: true,
    description: "History audit trail validation",
  },
];

export function isAgentContextCatalogRefsAligned(): boolean {
  const inputIds = new Set(AGENT_INPUT_CATALOG.map((i) => i.id));
  const outputIds = new Set(AGENT_OUTPUT_CATALOG.map((o) => o.id));
  const depIds = new Set(AGENT_UPSTREAM_DEPENDENCIES.map((d) => d.id));
  const scopeIds = new Set(AGENT_SCOPE_CATALOG.map((s) => s.id));
  const inventoryContextIds = new Set(AGENT_CONTEXT_CATALOG.map((c) => c.id));
  const policyIds = new Set(AGENT_POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const validationIds = new Set(AGENT_CONTEXT_VALIDATION_CATALOG.map((v) => v.id));
  const contextIds = new Set(AGENT_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const domains = new Set(AGENT_CONTEXT_CATALOG_ENTRIES.map((c) => c.domain));

  const contextsAligned = AGENT_CONTEXT_CATALOG_ENTRIES.every(
    (c) =>
      scopeIds.has(c.scopeRef) &&
      policyIds.has(c.policyRef) &&
      inventoryContextIds.has(c.inventoryContextRef) &&
      validationIds.has(c.validation) &&
      c.inputs.every((i) => inputIds.has(i)) &&
      c.outputs.every((o) => outputIds.has(o)) &&
      c.dependencies.every((d) => depIds.has(d)),
  );

  const validationsAligned = AGENT_CONTEXT_VALIDATION_CATALOG.every((v) =>
    contextIds.has(v.contextRef),
  );

  const domainsComplete = REQUIRED_DOMAINS.every((d) => domains.has(d));

  return (
    contextsAligned &&
    validationsAligned &&
    domainsComplete &&
    AGENT_CONTEXT_CATALOG_ENTRIES.length === 8
  );
}

export function buildAgentContextCatalogManifest(): AgentContextCatalogManifest {
  const contexts = AGENT_CONTEXT_CATALOG_ENTRIES;
  const domains = new Set(contexts.map((c) => c.domain));
  const catalogComplete =
    contexts.length === 8 && REQUIRED_DOMAINS.every((d) => domains.has(d));

  return {
    version: V75_AGENT_CONTEXT_VERSION,
    entryCount: contexts.length,
    domainCount: domains.size,
    catalogComplete,
    contexts,
    summary: [
      `agent-context-catalog count=${contexts.length}`,
      `domains=${domains.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildAgentContextValidationManifest(): AgentContextValidationManifest {
  const validations = AGENT_CONTEXT_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V75_AGENT_CONTEXT_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `agent-context-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getAgentContextCatalogEntryById(
  id: string,
): AgentContextCatalogEntry | undefined {
  return AGENT_CONTEXT_CATALOG_ENTRIES.find((c) => c.id === id);
}

export function getAgentContextCatalogEntriesByDomain(
  domain: AgentContextDomainKind,
): AgentContextCatalogEntry[] {
  return AGENT_CONTEXT_CATALOG_ENTRIES.filter((c) => c.domain === domain);
}

export function getAgentContextValidationByContextRef(
  contextRef: string,
): AgentContextValidation | undefined {
  return AGENT_CONTEXT_VALIDATION_CATALOG.find((v) => v.contextRef === contextRef);
}

export function computeAgentDeclarativeContextValid(input: {
  domain: AgentContextDomainKind;
  validationKind: string;
}): boolean {
  return input.domain === "session" && input.validationKind === "no-runtime";
}
