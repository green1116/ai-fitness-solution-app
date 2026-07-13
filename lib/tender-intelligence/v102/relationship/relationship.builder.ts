/**
 * E02-P3 — Knowledge Relationship builder
 * Transforms entity candidates into knowledge relationships
 */

import { createHash, randomUUID } from "node:crypto";

import type { KnowledgeEdgeKind, KnowledgeSeedEdge } from "../knowledge/knowledge.types";
import type {
  EntityRelationCandidate,
  ExtractedEntity,
} from "../extraction/extraction.types";
import {
  assertValidRelationshipNetwork,
  RELATIONSHIP_LIFECYCLE_STAGES,
  validateKnowledgeRelationship,
  validateRelationshipKernelInput,
} from "./relationship.schema";
import type {
  KnowledgeRelationship,
  RelationshipKernelInput,
  RelationshipKernelResult,
  RelationshipLifecycle,
  RelationshipLifecycleStage,
  RelationshipLifecycleTransition,
  RelationshipNetwork,
  RelationshipStrength,
} from "./relationship.types";
import {
  V102_KNOWLEDGE_RELATIONSHIP_FREEZE_VERSION,
  V102_KNOWLEDGE_RELATIONSHIP_VERSION,
} from "./relationship.types";

function nowIso(): string {
  return new Date().toISOString();
}

function stableId(prefix: string, seed: string): string {
  const hash = createHash("sha1").update(seed).digest("hex").slice(0, 12);
  return `${prefix}_${hash}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function normalizeLabel(label: string): string {
  return label.trim().replace(/\s+/g, " ");
}

export function scoreRelationshipStrength(
  confidence: number,
  weight: number,
): RelationshipStrength {
  const score = confidence * 0.7 + Math.min(1, weight) * 0.3;
  if (score >= 0.85) return "strong";
  if (score >= 0.65) return "moderate";
  return "weak";
}

export function buildKnowledgeRelationship(input: {
  kind: KnowledgeEdgeKind;
  from: ExtractedEntity;
  to: ExtractedEntity;
  label?: string;
  weight?: number;
  confidence?: number;
  evidence?: string;
  sourceCandidateId?: string;
  derived?: boolean;
}): KnowledgeRelationship {
  const confidence = round2(Math.min(1, Math.max(0, input.confidence ?? 0.8)));
  const weight = round2(Math.max(0, input.weight ?? 1));

  const relationship: KnowledgeRelationship = {
    id: stableId("krel", `${input.kind}|${input.from.id}|${input.to.id}`),
    kind: input.kind,
    fromEntityId: input.from.id,
    toEntityId: input.to.id,
    fromLabel: input.from.label,
    toLabel: input.to.label,
    fromKind: input.from.kind,
    toKind: input.to.kind,
    label: normalizeLabel(input.label ?? `${input.from.label} → ${input.to.label}`),
    weight,
    confidence,
    strength: scoreRelationshipStrength(confidence, weight),
    evidence: normalizeLabel(
      input.evidence ?? `${input.from.sourceHint}+${input.to.sourceHint}`,
    ),
    sourceCandidateId: input.sourceCandidateId,
    derived: input.derived ?? false,
    readOnly: true,
  };

  const validated = validateKnowledgeRelationship(relationship);
  if (!validated.ok) {
    throw new Error(
      `Invalid KnowledgeRelationship: ${validated.issues
        .map((i) => `${i.path}: ${i.message}`)
        .join("; ")}`,
    );
  }
  return relationship;
}

function resolveEntities(input: RelationshipKernelInput): {
  entities: ExtractedEntity[];
  relationCandidates: EntityRelationCandidate[];
} {
  if (input.candidates) {
    return {
      entities: input.candidates.entities,
      relationCandidates: input.candidates.relations,
    };
  }
  return {
    entities: input.entities ?? [],
    relationCandidates: input.relationCandidates ?? [],
  };
}

function buildDerivedRelationships(
  entities: ExtractedEntity[],
  existing: KnowledgeRelationship[],
): KnowledgeRelationship[] {
  const derived: KnowledgeRelationship[] = [];
  const existingKeys = new Set(
    existing.map((r) => `${r.kind}|${r.fromEntityId}|${r.toEntityId}`),
  );

  const byKind = (kind: ExtractedEntity["kind"]) =>
    entities.filter((e) => e.kind === kind);

  const projects = byKind("project");
  const standards = byKind("standard");
  const deliverables = byKind("deliverable");
  const budgets = byKind("budget");
  const clauses = byKind("clause");

  // Derive: deliverable constrained by budget / clause if both exist with a project
  for (const project of projects) {
    for (const deliverable of deliverables) {
      for (const budget of budgets) {
        const key = `constrains|${budget.id}|${deliverable.id}`;
        if (existingKeys.has(key)) continue;
        const rel = buildKnowledgeRelationship({
          kind: "constrains",
          from: budget,
          to: deliverable,
          label: "预算约束交付成果",
          confidence: 0.72,
          weight: 0.7,
          evidence: `derived via project ${project.label}`,
          derived: true,
        });
        existingKeys.add(`${rel.kind}|${rel.fromEntityId}|${rel.toEntityId}`);
        derived.push(rel);
      }
      for (const clause of clauses) {
        const key = `constrains|${clause.id}|${deliverable.id}`;
        if (existingKeys.has(key)) continue;
        const rel = buildKnowledgeRelationship({
          kind: "constrains",
          from: clause,
          to: deliverable,
          label: "条款约束交付成果",
          confidence: 0.7,
          weight: 0.65,
          evidence: `derived via project ${project.label}`,
          derived: true,
        });
        existingKeys.add(`${rel.kind}|${rel.fromEntityId}|${rel.toEntityId}`);
        derived.push(rel);
      }
    }

    for (const standard of standards) {
      const key = `references|${project.id}|${standard.id}`;
      if (existingKeys.has(key)) continue;
      const rel = buildKnowledgeRelationship({
        kind: "references",
        from: project,
        to: standard,
        label: "项目引用标准",
        confidence: 0.74,
        weight: 0.75,
        evidence: "derived project→standard",
        derived: true,
      });
      existingKeys.add(`${rel.kind}|${rel.fromEntityId}|${rel.toEntityId}`);
      derived.push(rel);
    }
  }

  return derived;
}

export function transformCandidatesToRelationships(input: {
  entities: ExtractedEntity[];
  relationCandidates: EntityRelationCandidate[];
  minConfidence?: number;
}): KnowledgeRelationship[] {
  const minConfidence = input.minConfidence ?? 0.5;
  const byId = new Map(input.entities.map((e) => [e.id, e]));
  const relationships: KnowledgeRelationship[] = [];
  const seen = new Set<string>();

  for (const candidate of input.relationCandidates) {
    if (candidate.confidence < minConfidence) continue;
    const from = byId.get(candidate.fromEntityId);
    const to = byId.get(candidate.toEntityId);
    if (!from || !to) continue;

    const rel = buildKnowledgeRelationship({
      kind: candidate.kind,
      from,
      to,
      label: candidate.label,
      weight: candidate.weight,
      confidence: candidate.confidence,
      evidence: candidate.evidence,
      sourceCandidateId: candidate.id,
      derived: false,
    });

    if (seen.has(rel.id)) continue;
    seen.add(rel.id);
    relationships.push(rel);
  }

  const derived = buildDerivedRelationships(input.entities, relationships);
  for (const rel of derived) {
    if (seen.has(rel.id)) continue;
    seen.add(rel.id);
    relationships.push(rel);
  }

  if (relationships.length < 1) {
    throw new Error("Relationship engine produced no relationships");
  }

  return relationships;
}

export function relationshipsToEdgeSeeds(
  relationships: KnowledgeRelationship[],
): KnowledgeSeedEdge[] {
  return relationships.map((r) => ({
    kind: r.kind,
    fromLabel: r.fromLabel,
    toLabel: r.toLabel,
    label: r.label,
    weight: r.weight,
    properties: {
      confidence: String(r.confidence),
      strength: r.strength,
      evidence: r.evidence,
      derived: r.derived ? "true" : "false",
    },
  }));
}

export function buildRelationshipNetwork(input: {
  relationships: KnowledgeRelationship[];
  titleHint?: string;
}): RelationshipNetwork {
  const createdAt = nowIso();
  const edgeSeeds = relationshipsToEdgeSeeds(input.relationships);
  const kindCoverage = [...new Set(input.relationships.map((r) => r.kind))];
  const strongCount = input.relationships.filter((r) => r.strength === "strong").length;
  const title = input.titleHint?.trim() || "Knowledge Relationship Network";

  const status: RelationshipNetwork["status"] =
    input.relationships.length >= 3 && strongCount >= 1 ? "ready" : "linked";

  const network: RelationshipNetwork = {
    id: stableId(
      "net",
      `${title}|${input.relationships.map((r) => r.id).join("|")}`,
    ),
    status,
    title,
    relationshipCount: input.relationships.length,
    strongCount,
    kindCoverage,
    relationships: input.relationships,
    edgeSeeds,
    summary: [
      `relationships=${input.relationships.length}`,
      `strong=${strongCount}`,
      `kinds=${kindCoverage.length}`,
      `derived=${input.relationships.filter((r) => r.derived).length}`,
      `status=${status}`,
    ].join(" "),
    createdAt,
    updatedAt: createdAt,
    readOnly: true,
  };

  assertValidRelationshipNetwork(network);
  return network;
}

function pushTransition(
  transitions: RelationshipLifecycleTransition[],
  from: RelationshipLifecycleStage,
  to: RelationshipLifecycleStage,
  note?: string,
): void {
  transitions.push({
    from,
    to,
    at: nowIso(),
    note,
    readOnly: true,
  });
}

export function buildRelationshipLifecycle(input: {
  candidateCount: number;
  relationships: KnowledgeRelationship[];
  network: RelationshipNetwork | null;
}): RelationshipLifecycle {
  const transitions: RelationshipLifecycleTransition[] = [];
  let current: RelationshipLifecycleStage = "candidates";

  if (input.candidateCount > 0 && input.relationships.length > 0) {
    pushTransition(
      transitions,
      "candidates",
      "relationships",
      `relationships=${input.relationships.length}`,
    );
    current = "relationships";
  }

  if (input.network) {
    pushTransition(
      transitions,
      current,
      "network",
      `status=${input.network.status}|strong=${input.network.strongCount}`,
    );
    current = "network";
  }

  const complete =
    input.network !== null &&
    input.network.status === "ready" &&
    input.relationships.length >= 3 &&
    current === "network";

  return {
    current,
    stages: [...RELATIONSHIP_LIFECYCLE_STAGES],
    transitions,
    complete,
    readOnly: true,
  };
}

export function buildRelationshipKernel(
  input: RelationshipKernelInput,
): RelationshipKernelResult {
  const validated = validateRelationshipKernelInput(input);
  if (!validated.ok) {
    throw new Error(
      `Invalid relationship kernel input: ${validated.issues
        .map((i) => `${i.path}: ${i.message}`)
        .join("; ")}`,
    );
  }

  const deploymentId = input.deploymentId?.trim() || "v102-p3-relationship-default";
  const generatedAt = nowIso();
  const { entities, relationCandidates } = resolveEntities(input);

  const relationships = transformCandidatesToRelationships({
    entities,
    relationCandidates,
    minConfidence: input.minConfidence,
  });

  const network = buildRelationshipNetwork({
    relationships,
    titleHint: input.titleHint ?? input.candidates?.title,
  });

  const lifecycle = buildRelationshipLifecycle({
    candidateCount: relationCandidates.length,
    relationships,
    network,
  });

  const ready = lifecycle.complete;

  return {
    version: V102_KNOWLEDGE_RELATIONSHIP_VERSION,
    freezeVersion: V102_KNOWLEDGE_RELATIONSHIP_FREEZE_VERSION,
    reportId: `knowledge-relationship-${deploymentId}-${randomUUID().slice(0, 8)}`,
    deploymentId,
    generatedAt,
    relationships,
    network,
    lifecycle,
    ready,
    readinessScore: ready
      ? 100
      : Math.min(90, Math.round(relationships.length * 8 + network.strongCount * 5)),
    summary: [
      `knowledge-relationship ready=${ready}`,
      `relationships=${relationships.length}`,
      `strong=${network.strongCount}`,
      `network=${network.status}`,
      `lifecycle=${lifecycle.current}`,
      `freeze=${V102_KNOWLEDGE_RELATIONSHIP_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertRelationshipKernelPass(
  result: RelationshipKernelResult,
): asserts result is RelationshipKernelResult & {
  ready: true;
  network: RelationshipNetwork;
} {
  if (!result.ready || !result.network) {
    throw new Error(
      `V102 knowledge relationship kernel not ready: ${result.summary}`,
    );
  }
}
