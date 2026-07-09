/**
 * V76 P3 — Collaboration context catalog (declarative)
 */
import {
  COLLABORATION_CONTEXT_CATALOG,
  COLLABORATION_INPUT_CATALOG,
  COLLABORATION_OUTPUT_CATALOG,
} from "./collaboration.inventory";
import { COLLABORATION_UPSTREAM_DEPENDENCIES } from "./collaboration.dependencies";
import { COLLABORATION_SCOPE_CATALOG } from "./collaboration.scope";
import { COLLABORATION_POLICY_CATALOG_ENTRIES } from "./collaboration.policy.catalog";
import type {
  CollaborationContextCatalogEntry,
  CollaborationContextCatalogManifest,
  CollaborationContextDomainKind,
  CollaborationContextValidation,
  CollaborationContextValidationManifest,
} from "./collaboration.context";
import { V76_COLLABORATION_CONTEXT_VERSION } from "./collaboration.context";

const REQUIRED_DOMAINS: CollaborationContextDomainKind[] = [
  "shared",
  "ownership",
  "boundary",
  "lifecycle",
  "readWrite",
  "provenance",
  "governance",
  "workspace",
];

export const COLLABORATION_CONTEXT_CATALOG_ENTRIES: CollaborationContextCatalogEntry[] = [
  {
    id: "COL-CTX-001",
    domain: "shared",
    purpose: "Shared collaboration context across participating roles",
    sourceRef: "COL-SRC-001",
    lifecycle: "session",
    ownership: "shared-role-pool",
    boundary: "COL-SCP-001",
    readWriteRule: "read:all-participants;write:owner-only",
    provenance: "v75-agent-freeze-baseline",
    inputs: ["COL-INP-001"],
    outputs: ["COL-OUT-001"],
    priority: "high",
    dependencies: ["COL-DEP-001"],
    validation: "COL-CTV-001",
    inventoryContextRef: "COL-CTX-001",
    policyRef: "COL-PLC-002",
    scopeRef: "COL-SCP-001",
    required: true,
    description: "Shared domain — shared-role collaboration context",
  },
  {
    id: "COL-CTX-002",
    domain: "ownership",
    purpose: "Context ownership assignment for topology graph nodes",
    sourceRef: "COL-SRC-002",
    lifecycle: "persistent",
    ownership: "topology-node-owner",
    boundary: "COL-SCP-003",
    readWriteRule: "read:owner+delegates;write:owner-only",
    provenance: "topology-registry-declared",
    inputs: ["COL-INP-002"],
    outputs: ["COL-OUT-002"],
    priority: "medium",
    dependencies: ["COL-DEP-002"],
    validation: "COL-CTV-002",
    inventoryContextRef: "COL-CTX-002",
    policyRef: "COL-PLC-006",
    scopeRef: "COL-SCP-003",
    required: true,
    description: "Ownership domain — topology graph context",
  },
  {
    id: "COL-CTX-003",
    domain: "readWrite",
    purpose: "Context read/write access rules for communication contracts",
    sourceRef: "COL-SRC-003",
    lifecycle: "session",
    ownership: "contract-holder",
    boundary: "COL-SCP-006",
    readWriteRule: "read:contract-parties;write:authorized-only",
    provenance: "communication-contract-declared",
    inputs: ["COL-INP-003"],
    outputs: ["COL-OUT-003"],
    priority: "critical",
    dependencies: ["COL-DEP-005"],
    validation: "COL-CTV-003",
    inventoryContextRef: "COL-CTX-003",
    policyRef: "COL-PLC-003",
    scopeRef: "COL-SCP-006",
    required: true,
    description: "ReadWrite domain — communication contract context",
  },
  {
    id: "COL-CTX-004",
    domain: "boundary",
    purpose: "Context boundary enforcement for delegation limits",
    sourceRef: "COL-SRC-004",
    lifecycle: "persistent",
    ownership: "delegation-operator",
    boundary: "COL-SCP-003",
    readWriteRule: "read:governance;write:declarative-only",
    provenance: "delegation-matrix-declared",
    inputs: ["COL-INP-004"],
    outputs: ["COL-OUT-004"],
    priority: "high",
    dependencies: ["COL-DEP-005"],
    validation: "COL-CTV-004",
    inventoryContextRef: "COL-CTX-004",
    policyRef: "COL-PLC-004",
    scopeRef: "COL-SCP-003",
    required: true,
    description: "Boundary domain — delegation boundary context",
  },
  {
    id: "COL-CTX-005",
    domain: "provenance",
    purpose: "Context provenance chain and coordination audit lineage",
    sourceRef: "COL-SRC-005",
    lifecycle: "archived",
    ownership: "audit-operator",
    boundary: "COL-SCP-006",
    readWriteRule: "read:audit;write:append-only-declared",
    provenance: "provenance-chain-intact",
    inputs: ["COL-INP-005"],
    outputs: ["COL-OUT-005"],
    priority: "high",
    dependencies: ["COL-DEP-006"],
    validation: "COL-CTV-005",
    inventoryContextRef: "COL-CTX-005",
    policyRef: "COL-PLC-005",
    scopeRef: "COL-SCP-006",
    required: true,
    description: "Provenance domain — coordination policy context",
  },
  {
    id: "COL-CTX-006",
    domain: "lifecycle",
    purpose: "Context lifecycle state transitions (ephemeral→archived)",
    sourceRef: "COL-SRC-006",
    lifecycle: "ephemeral",
    ownership: "session-operator",
    boundary: "COL-SCP-004",
    readWriteRule: "read:session;write:transition-declared",
    provenance: "lifecycle-state-machine-declared",
    inputs: ["COL-INP-006"],
    outputs: ["COL-OUT-006"],
    priority: "medium",
    dependencies: ["COL-DEP-006"],
    validation: "COL-CTV-006",
    inventoryContextRef: "COL-CTX-006",
    policyRef: "COL-PLC-005",
    scopeRef: "COL-SCP-004",
    required: true,
    description: "Lifecycle domain — session management context",
  },
  {
    id: "COL-CTX-007",
    domain: "governance",
    purpose: "Governance inventory context for compliance decisions",
    sourceRef: "COL-SRC-007",
    lifecycle: "persistent",
    ownership: "governance-operator",
    boundary: "COL-SCP-006",
    readWriteRule: "read:governance;write:checklist-declared",
    provenance: "governance-inventory-declared",
    inputs: ["COL-INP-007"],
    outputs: ["COL-OUT-007"],
    priority: "high",
    dependencies: ["COL-DEP-006"],
    validation: "COL-CTV-007",
    inventoryContextRef: "COL-CTX-007",
    policyRef: "COL-PLC-007",
    scopeRef: "COL-SCP-006",
    required: true,
    description: "Governance domain — governance inventory context",
  },
  {
    id: "COL-CTX-008",
    domain: "workspace",
    purpose: "Declarative workspace exclusion — no runtime execution",
    sourceRef: "COL-SRC-008",
    lifecycle: "ephemeral",
    ownership: "platform-global",
    boundary: "COL-SCP-008",
    readWriteRule: "read:declarative;write:none",
    provenance: "v76-inventory-self-ref",
    inputs: ["COL-INP-008"],
    outputs: ["COL-OUT-008"],
    priority: "critical",
    dependencies: ["COL-DEP-008"],
    validation: "COL-CTV-008",
    inventoryContextRef: "COL-CTX-008",
    policyRef: "COL-PLC-001",
    scopeRef: "COL-SCP-008",
    required: true,
    description: "Workspace domain — collaboration inventory foundation context",
  },
];

export const COLLABORATION_CONTEXT_VALIDATION_CATALOG: CollaborationContextValidation[] = [
  {
    id: "COL-CTV-001",
    contextRef: "COL-CTX-001",
    validationKind: "shared-role",
    passCondition: "shared-context-defined",
    required: true,
    description: "Shared context validation",
  },
  {
    id: "COL-CTV-002",
    contextRef: "COL-CTX-002",
    validationKind: "ownership",
    passCondition: "owner-declared",
    required: true,
    description: "Ownership validation",
  },
  {
    id: "COL-CTV-003",
    contextRef: "COL-CTX-003",
    validationKind: "read-write",
    passCondition: "read-write-rules-documented",
    required: true,
    description: "Read/write rules validation",
  },
  {
    id: "COL-CTV-004",
    contextRef: "COL-CTX-004",
    validationKind: "boundary",
    passCondition: "delegation-boundary-intact",
    required: true,
    description: "Boundary validation",
  },
  {
    id: "COL-CTV-005",
    contextRef: "COL-CTX-005",
    validationKind: "provenance",
    passCondition: "provenance-chain-documented",
    required: true,
    description: "Provenance validation",
  },
  {
    id: "COL-CTV-006",
    contextRef: "COL-CTX-006",
    validationKind: "lifecycle",
    passCondition: "lifecycle-transition-declared",
    required: true,
    description: "Lifecycle validation",
  },
  {
    id: "COL-CTV-007",
    contextRef: "COL-CTX-007",
    validationKind: "governance",
    passCondition: "governance-inventory-present",
    required: true,
    description: "Governance validation",
  },
  {
    id: "COL-CTV-008",
    contextRef: "COL-CTX-008",
    validationKind: "no-runtime",
    passCondition: "declarative-only",
    required: true,
    description: "Workspace runtime exclusion validation",
  },
];

export function isCollaborationContextCatalogRefsAligned(): boolean {
  const inputIds = new Set(COLLABORATION_INPUT_CATALOG.map((i) => i.id));
  const outputIds = new Set(COLLABORATION_OUTPUT_CATALOG.map((o) => o.id));
  const depIds = new Set(COLLABORATION_UPSTREAM_DEPENDENCIES.map((d) => d.id));
  const scopeIds = new Set(COLLABORATION_SCOPE_CATALOG.map((s) => s.id));
  const inventoryContextIds = new Set(COLLABORATION_CONTEXT_CATALOG.map((c) => c.id));
  const policyIds = new Set(COLLABORATION_POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const validationIds = new Set(COLLABORATION_CONTEXT_VALIDATION_CATALOG.map((v) => v.id));
  const contextIds = new Set(COLLABORATION_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const domains = new Set(COLLABORATION_CONTEXT_CATALOG_ENTRIES.map((c) => c.domain));

  const contextsAligned = COLLABORATION_CONTEXT_CATALOG_ENTRIES.every(
    (c) =>
      scopeIds.has(c.scopeRef) &&
      policyIds.has(c.policyRef) &&
      inventoryContextIds.has(c.inventoryContextRef) &&
      validationIds.has(c.validation) &&
      c.inputs.every((i) => inputIds.has(i)) &&
      c.outputs.every((o) => outputIds.has(o)) &&
      c.dependencies.every((d) => depIds.has(d)) &&
      c.ownership.length > 0 &&
      c.boundary.length > 0 &&
      c.readWriteRule.length > 0 &&
      c.provenance.length > 0,
  );

  const validationsAligned = COLLABORATION_CONTEXT_VALIDATION_CATALOG.every((v) =>
    contextIds.has(v.contextRef),
  );

  const domainsComplete = REQUIRED_DOMAINS.every((d) => domains.has(d));

  return (
    contextsAligned &&
    validationsAligned &&
    domainsComplete &&
    COLLABORATION_CONTEXT_CATALOG_ENTRIES.length === 8
  );
}

export function buildCollaborationContextCatalogManifest(): CollaborationContextCatalogManifest {
  const contexts = COLLABORATION_CONTEXT_CATALOG_ENTRIES;
  const domains = new Set(contexts.map((c) => c.domain));
  const catalogComplete =
    contexts.length === 8 && REQUIRED_DOMAINS.every((d) => domains.has(d));

  return {
    version: V76_COLLABORATION_CONTEXT_VERSION,
    entryCount: contexts.length,
    domainCount: domains.size,
    catalogComplete,
    contexts,
    summary: [
      `collaboration-context-catalog count=${contexts.length}`,
      `domains=${domains.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildCollaborationContextValidationManifest(): CollaborationContextValidationManifest {
  const validations = COLLABORATION_CONTEXT_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V76_COLLABORATION_CONTEXT_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `collaboration-context-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getCollaborationContextCatalogEntryById(
  id: string,
): CollaborationContextCatalogEntry | undefined {
  return COLLABORATION_CONTEXT_CATALOG_ENTRIES.find((c) => c.id === id);
}

export function getCollaborationContextCatalogEntriesByDomain(
  domain: CollaborationContextDomainKind,
): CollaborationContextCatalogEntry[] {
  return COLLABORATION_CONTEXT_CATALOG_ENTRIES.filter((c) => c.domain === domain);
}

export function getCollaborationContextValidationByContextRef(
  contextRef: string,
): CollaborationContextValidation | undefined {
  return COLLABORATION_CONTEXT_VALIDATION_CATALOG.find((v) => v.contextRef === contextRef);
}

export function computeCollaborationDeclarativeContextValid(input: {
  domain: CollaborationContextDomainKind;
  validationKind: string;
}): boolean {
  return input.domain === "workspace" && input.validationKind === "no-runtime";
}
