/**
 * V73 P1 — Knowledge catalog (declarative)
 */
import type { KnowledgeCatalogManifest, KnowledgeItem } from "./knowledge.types";
import { V73_KNOWLEDGE_VERSION } from "./knowledge.types";

export const KNOWLEDGE_CATALOG: KnowledgeItem[] = [
  {
    id: "KNW-001",
    document: "operational-intelligence-baseline",
    topic: "intelligence-signoff",
    category: "foundation",
    tag: "v72-freeze",
    owner: "platform-engineering",
    status: "active",
    source: "v72-intelligence-freeze-1",
    version: "v72-intelligence-signoff-1",
    confidence: "high",
    access: "internal",
    required: true,
    description: "V72 operational intelligence baseline knowledge document",
  },
  {
    id: "KNW-002",
    document: "signal-dependency-graph",
    topic: "dependency-acyclic",
    category: "architecture",
    tag: "signal-graph",
    owner: "release-engineering",
    status: "active",
    source: "v72-signal-dependency-1",
    version: "v72-signal-dependency-1",
    confidence: "high",
    access: "internal",
    required: true,
    description: "Signal dependency graph acyclic knowledge reference",
  },
  {
    id: "KNW-003",
    document: "intelligence-policy-gates",
    topic: "policy-enforcement",
    category: "governance",
    tag: "policy-gate",
    owner: "governance",
    status: "active",
    source: "v72-intelligence-policy-1",
    version: "v72-intelligence-policy-1",
    confidence: "high",
    access: "restricted",
    required: true,
    description: "Intelligence policy gate declarative rules knowledge",
  },
  {
    id: "KNW-004",
    document: "compatibility-matrix-guide",
    topic: "version-compatibility",
    category: "architecture",
    tag: "compatibility",
    owner: "platform-engineering",
    status: "active",
    source: "v72-intelligence-compatibility-1",
    version: "v72-intelligence-compatibility-1",
    confidence: "medium",
    access: "internal",
    required: true,
    description: "Intelligence compatibility matrix coverage knowledge",
  },
  {
    id: "KNW-005",
    document: "governance-risk-escalation",
    topic: "risk-escalation",
    category: "governance",
    tag: "governance",
    owner: "governance",
    status: "active",
    source: "v72-intelligence-governance-1",
    version: "v72-intelligence-governance-1",
    confidence: "medium",
    access: "restricted",
    required: true,
    description: "Intelligence governance risk escalation knowledge",
  },
  {
    id: "KNW-006",
    document: "lifecycle-state-reference",
    topic: "lifecycle-management",
    category: "operations",
    tag: "lifecycle",
    owner: "product-engineering",
    status: "active",
    source: "v72-intelligence-lifecycle-1",
    version: "v72-intelligence-lifecycle-1",
    confidence: "high",
    access: "internal",
    required: true,
    description: "Intelligence lifecycle state transition knowledge",
  },
  {
    id: "KNW-007",
    document: "compliance-checklist-reference",
    topic: "compliance-audit",
    category: "governance",
    tag: "compliance",
    owner: "governance",
    status: "active",
    source: "v72-intelligence-compliance-1",
    version: "v72-intelligence-compliance-1",
    confidence: "high",
    access: "restricted",
    required: true,
    description: "Intelligence compliance checklist pass knowledge",
  },
  {
    id: "KNW-008",
    document: "knowledge-foundation-catalog",
    topic: "knowledge-retrieval",
    category: "foundation",
    tag: "v73-catalog",
    owner: "platform-engineering",
    status: "draft",
    source: "v73-knowledge-catalog-1",
    version: "v73-knowledge-catalog-1",
    confidence: "low",
    access: "public",
    required: true,
    description: "V73 P1 knowledge retrieval foundation catalog entry",
  },
];

export function buildKnowledgeCatalogManifest(): KnowledgeCatalogManifest {
  const items = KNOWLEDGE_CATALOG;
  const categories = new Set(items.map((i) => i.category));
  const sources = new Set(items.map((i) => i.source));
  const catalogComplete =
    items.length >= 6 && categories.size >= 4 && sources.size >= 4;

  return {
    version: V73_KNOWLEDGE_VERSION,
    entryCount: items.length,
    categoryCount: categories.size,
    sourceCount: sources.size,
    catalogComplete,
    items,
    summary: [
      `knowledge-catalog count=${items.length}`,
      `categories=${categories.size}`,
      `sources=${sources.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getKnowledgeById(id: string): KnowledgeItem | undefined {
  return KNOWLEDGE_CATALOG.find((i) => i.id === id);
}

export function getKnowledgeBySource(source: string): KnowledgeItem[] {
  return KNOWLEDGE_CATALOG.filter((i) => i.source === source);
}

export function getKnowledgeByCategory(category: KnowledgeItem["category"]): KnowledgeItem[] {
  return KNOWLEDGE_CATALOG.filter((i) => i.category === category);
}

export function getKnowledgeByAccess(access: KnowledgeItem["access"]): KnowledgeItem[] {
  return KNOWLEDGE_CATALOG.filter((i) => i.access === access);
}
