/**
 * V74 P3 — Decision context catalog (declarative)
 */
import {
  DECISION_CONTEXT_CATALOG,
  DECISION_INPUT_CATALOG,
  DECISION_OUTPUT_CATALOG,
} from "./decision.inventory";
import { DECISION_UPSTREAM_DEPENDENCIES } from "./decision.dependencies";
import { DECISION_SCOPE_CATALOG } from "./decision.scope";
import { POLICY_CATALOG_ENTRIES } from "./decision.policy.catalog";
import type {
  ContextCatalogEntry,
  ContextCatalogManifest,
  ContextDomainKind,
  ContextValidation,
  ContextValidationManifest,
} from "./decision.context";
import { V74_DECISION_CONTEXT_VERSION } from "./decision.context";

const REQUIRED_DOMAINS: ContextDomainKind[] = [
  "user",
  "workspace",
  "organization",
  "knowledge",
  "runtime",
  "workflow",
  "environment",
  "history",
];

export const CONTEXT_CATALOG_ENTRIES: ContextCatalogEntry[] = [
  {
    id: "DEC-CTX-001",
    domain: "user",
    purpose: "Operator and end-user decision identity boundary",
    inputs: ["DEC-INP-001"],
    outputs: ["DEC-OUT-001"],
    priority: "high",
    dependencies: ["DEC-DEP-001"],
    validation: "DEC-CTV-001",
    inventoryContextRef: "DEC-CTX-001",
    policyRef: "DEC-PLC-002",
    scopeRef: "DEC-SCP-004",
    required: true,
    description: "User domain — operator session decision context",
  },
  {
    id: "DEC-CTX-002",
    domain: "workspace",
    purpose: "Workspace-scoped decision evaluation boundary",
    inputs: ["DEC-INP-002"],
    outputs: ["DEC-OUT-002"],
    priority: "medium",
    dependencies: ["DEC-DEP-002"],
    validation: "DEC-CTV-002",
    inventoryContextRef: "DEC-CTX-002",
    policyRef: "DEC-PLC-003",
    scopeRef: "DEC-SCP-002",
    required: true,
    description: "Workspace domain — fitness program workspace context",
  },
  {
    id: "DEC-CTX-003",
    domain: "organization",
    purpose: "Organization-level governance decision context",
    inputs: ["DEC-INP-003"],
    outputs: ["DEC-OUT-003"],
    priority: "high",
    dependencies: ["DEC-DEP-005"],
    validation: "DEC-CTV-003",
    inventoryContextRef: "DEC-CTX-003",
    policyRef: "DEC-PLC-004",
    scopeRef: "DEC-SCP-006",
    required: true,
    description: "Organization domain — governance policy enforcement context",
  },
  {
    id: "DEC-CTX-004",
    domain: "knowledge",
    purpose: "Knowledge retrieval and freeze decision context",
    inputs: ["DEC-INP-001", "DEC-INP-004"],
    outputs: ["DEC-OUT-001", "DEC-OUT-004"],
    priority: "critical",
    dependencies: ["DEC-DEP-001", "DEC-DEP-003"],
    validation: "DEC-CTV-004",
    inventoryContextRef: "DEC-CTX-004",
    policyRef: "DEC-PLC-002",
    scopeRef: "DEC-SCP-003",
    required: true,
    description: "Knowledge domain — V73 knowledge freeze decision context",
  },
  {
    id: "DEC-CTX-005",
    domain: "runtime",
    purpose: "Declarative runtime exclusion boundary context",
    inputs: ["DEC-INP-008"],
    outputs: ["DEC-OUT-008"],
    priority: "critical",
    dependencies: ["DEC-DEP-008"],
    validation: "DEC-CTV-005",
    inventoryContextRef: "DEC-CTX-005",
    policyRef: "DEC-PLC-001",
    scopeRef: "DEC-SCP-008",
    required: true,
    description: "Runtime domain — no runtime mutation decision context",
  },
  {
    id: "DEC-CTX-006",
    domain: "workflow",
    purpose: "Declarative workflow reference context (read-only)",
    inputs: ["DEC-INP-005"],
    outputs: ["DEC-OUT-005"],
    priority: "medium",
    dependencies: ["DEC-DEP-006"],
    validation: "DEC-CTV-006",
    inventoryContextRef: "DEC-CTX-006",
    policyRef: "DEC-PLC-005",
    scopeRef: "DEC-SCP-005",
    required: true,
    description: "Workflow domain — declarative workflow boundary context",
  },
  {
    id: "DEC-CTX-007",
    domain: "environment",
    purpose: "Deployment environment decision context",
    inputs: ["DEC-INP-006"],
    outputs: ["DEC-OUT-006"],
    priority: "medium",
    dependencies: ["DEC-DEP-007"],
    validation: "DEC-CTV-007",
    inventoryContextRef: "DEC-CTX-007",
    policyRef: "DEC-PLC-007",
    scopeRef: "DEC-SCP-007",
    required: true,
    description: "Environment domain — deployment session context",
  },
  {
    id: "DEC-CTX-008",
    domain: "history",
    purpose: "Decision history and audit trail context",
    inputs: ["DEC-INP-007"],
    outputs: ["DEC-OUT-007"],
    priority: "high",
    dependencies: ["DEC-DEP-007"],
    validation: "DEC-CTV-008",
    inventoryContextRef: "DEC-CTX-008",
    policyRef: "DEC-PLC-008",
    scopeRef: "DEC-SCP-001",
    required: true,
    description: "History domain — compliance audit history context",
  },
];

export const CONTEXT_VALIDATION_CATALOG: ContextValidation[] = [
  {
    id: "DEC-CTV-001",
    contextRef: "DEC-CTX-001",
    validationKind: "user-identity",
    passCondition: "operator-session-valid",
    required: true,
    description: "User domain identity validation",
  },
  {
    id: "DEC-CTV-002",
    contextRef: "DEC-CTX-002",
    validationKind: "workspace-boundary",
    passCondition: "workspace-scope-defined",
    required: true,
    description: "Workspace domain boundary validation",
  },
  {
    id: "DEC-CTV-003",
    contextRef: "DEC-CTX-003",
    validationKind: "org-governance",
    passCondition: "governance-policy-present",
    required: true,
    description: "Organization governance validation",
  },
  {
    id: "DEC-CTV-004",
    contextRef: "DEC-CTX-004",
    validationKind: "knowledge-freeze",
    passCondition: "knowledge-freeze-intact",
    required: true,
    description: "Knowledge freeze validation",
  },
  {
    id: "DEC-CTV-005",
    contextRef: "DEC-CTX-005",
    validationKind: "no-runtime",
    passCondition: "declarative-only",
    required: true,
    description: "Runtime exclusion validation",
  },
  {
    id: "DEC-CTV-006",
    contextRef: "DEC-CTX-006",
    validationKind: "workflow-readonly",
    passCondition: "workflow-unchanged",
    required: true,
    description: "Workflow read-only boundary validation",
  },
  {
    id: "DEC-CTV-007",
    contextRef: "DEC-CTX-007",
    validationKind: "environment-session",
    passCondition: "deployment-id-present",
    required: true,
    description: "Environment session validation",
  },
  {
    id: "DEC-CTV-008",
    contextRef: "DEC-CTX-008",
    validationKind: "history-audit",
    passCondition: "audit-trail-complete",
    required: true,
    description: "History audit trail validation",
  },
];

export function isDecisionContextCatalogRefsAligned(): boolean {
  const inputIds = new Set(DECISION_INPUT_CATALOG.map((i) => i.id));
  const outputIds = new Set(DECISION_OUTPUT_CATALOG.map((o) => o.id));
  const depIds = new Set(DECISION_UPSTREAM_DEPENDENCIES.map((d) => d.id));
  const scopeIds = new Set(DECISION_SCOPE_CATALOG.map((s) => s.id));
  const inventoryContextIds = new Set(DECISION_CONTEXT_CATALOG.map((c) => c.id));
  const policyIds = new Set(POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const validationIds = new Set(CONTEXT_VALIDATION_CATALOG.map((v) => v.id));
  const contextIds = new Set(CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const domains = new Set(CONTEXT_CATALOG_ENTRIES.map((c) => c.domain));

  const contextsAligned = CONTEXT_CATALOG_ENTRIES.every(
    (c) =>
      scopeIds.has(c.scopeRef) &&
      policyIds.has(c.policyRef) &&
      inventoryContextIds.has(c.inventoryContextRef) &&
      validationIds.has(c.validation) &&
      c.inputs.every((i) => inputIds.has(i)) &&
      c.outputs.every((o) => outputIds.has(o)) &&
      c.dependencies.every((d) => depIds.has(d)),
  );

  const validationsAligned = CONTEXT_VALIDATION_CATALOG.every((v) =>
    contextIds.has(v.contextRef),
  );

  const domainsComplete = REQUIRED_DOMAINS.every((d) => domains.has(d));

  return (
    contextsAligned &&
    validationsAligned &&
    domainsComplete &&
    CONTEXT_CATALOG_ENTRIES.length === 8
  );
}

export function buildContextCatalogManifest(): ContextCatalogManifest {
  const contexts = CONTEXT_CATALOG_ENTRIES;
  const domains = new Set(contexts.map((c) => c.domain));
  const catalogComplete =
    contexts.length === 8 && REQUIRED_DOMAINS.every((d) => domains.has(d));

  return {
    version: V74_DECISION_CONTEXT_VERSION,
    entryCount: contexts.length,
    domainCount: domains.size,
    catalogComplete,
    contexts,
    summary: [
      `decision-context-catalog count=${contexts.length}`,
      `domains=${domains.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildContextValidationManifest(): ContextValidationManifest {
  const validations = CONTEXT_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V74_DECISION_CONTEXT_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `decision-context-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getContextCatalogEntryById(id: string): ContextCatalogEntry | undefined {
  return CONTEXT_CATALOG_ENTRIES.find((c) => c.id === id);
}

export function getContextCatalogEntriesByDomain(
  domain: ContextDomainKind,
): ContextCatalogEntry[] {
  return CONTEXT_CATALOG_ENTRIES.filter((c) => c.domain === domain);
}

export function getContextValidationByContextRef(
  contextRef: string,
): ContextValidation | undefined {
  return CONTEXT_VALIDATION_CATALOG.find((v) => v.contextRef === contextRef);
}

export function computeDeclarativeContextValid(input: {
  domain: ContextDomainKind;
  validationKind: string;
}): boolean {
  return input.domain === "runtime" && input.validationKind === "no-runtime";
}
