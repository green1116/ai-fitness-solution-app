/**
 * E04-P6 — Business Knowledge Runtime verification
 * Knowledge layer above business memory
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import { buildBusinessAgentFoundation } from "../lib/business-agent/e04/core/business-agent.lifecycle";
import {
  E04_BUSINESS_AGENT_PLATFORM_ID,
  E04_BUSINESS_AGENT_VERSION,
} from "../lib/business-agent/e04/core/business-agent.constants";
import { buildWorkflowRegistryManifest } from "../lib/business-agent/e04/workflow/workflow.registry";
import {
  E04_WORKFLOW_RUNTIME_ID,
  E04_WORKFLOW_VERSION,
} from "../lib/business-agent/e04/workflow/workflow.constants";
import { buildProcessRegistryManifest } from "../lib/business-agent/e04/process/process.registry";
import {
  E04_PROCESS_ORCHESTRATION_ID,
  E04_PROCESS_VERSION,
} from "../lib/business-agent/e04/process/process.constants";
import { buildDecisionRegistryManifest } from "../lib/business-agent/e04/decision/decision.registry";
import {
  E04_DECISION_RUNTIME_ID,
  E04_DECISION_VERSION,
} from "../lib/business-agent/e04/decision/decision.constants";
import { buildMemoryRuntimeManifest } from "../lib/business-agent/e04/memory/memory.store";
import {
  E04_MEMORY_RUNTIME_ID,
  E04_MEMORY_VERSION,
} from "../lib/business-agent/e04/memory/memory.constants";
import {
  resetBusinessMemoryStore,
  writeMemoryRecord,
} from "../lib/business-agent/e04/memory/memory.store";
import {
  E04_KNOWLEDGE_BASE,
  E04_KNOWLEDGE_RUNTIME_ID,
  E04_KNOWLEDGE_VERSION,
  KNOWLEDGE_ENTITY_KINDS,
  KNOWLEDGE_RELATION_KINDS,
} from "../lib/business-agent/e04/knowledge/knowledge.constants";
import {
  getKnowledgeEntityById,
  linkKnowledgeRelation,
  listNeighbors,
  snapshotKnowledgeGraph,
  upsertKnowledgeEntity,
} from "../lib/business-agent/e04/knowledge/knowledge.graph";
import {
  KNOWLEDGE_SEED,
  buildKnowledgeRegistryManifest,
  getKnowledgeCatalogEntity,
} from "../lib/business-agent/e04/knowledge/knowledge.registry";
import { retrieveKnowledge } from "../lib/business-agent/e04/knowledge/knowledge.retriever";
import {
  assertKnowledgeGraphValid,
  validateKnowledgeGraph,
} from "../lib/business-agent/e04/knowledge/knowledge.validator";
import {
  appendKnowledgeTraceEvent,
  createKnowledgeRuntimeTrace,
} from "../lib/business-agent/e04/knowledge/knowledge.trace";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E04_P1 = [
  "lib/business-agent/e04/core/business-agent.types.ts",
  "lib/business-agent/e04/core/business-agent.constants.ts",
  "lib/business-agent/e04/core/business-agent.lifecycle.ts",
  "lib/business-agent/e04/core/business-agent.registry.ts",
  "lib/business-agent/e04/capability/capability.types.ts",
  "lib/business-agent/e04/capability/capability.registry.ts",
  "lib/business-agent/e04/runtime/business-agent.context.ts",
  "lib/business-agent/e04/runtime/business-agent.executor.ts",
  "lib/business-agent/e04/index.ts",
] as const;

const FROZEN_E04_P2 = [
  "lib/business-agent/e04/workflow/workflow.types.ts",
  "lib/business-agent/e04/workflow/workflow.constants.ts",
  "lib/business-agent/e04/workflow/workflow.registry.ts",
  "lib/business-agent/e04/workflow/workflow.lifecycle.ts",
  "lib/business-agent/e04/workflow/workflow.executor.ts",
  "lib/business-agent/e04/workflow/workflow.trace.ts",
] as const;

const FROZEN_E04_P3 = [
  "lib/business-agent/e04/process/process.types.ts",
  "lib/business-agent/e04/process/process.constants.ts",
  "lib/business-agent/e04/process/process.registry.ts",
  "lib/business-agent/e04/process/process.lifecycle.ts",
  "lib/business-agent/e04/process/process.executor.ts",
  "lib/business-agent/e04/process/process.graph.ts",
] as const;

const FROZEN_E04_P4 = [
  "lib/business-agent/e04/decision/decision.types.ts",
  "lib/business-agent/e04/decision/decision.constants.ts",
  "lib/business-agent/e04/decision/decision.registry.ts",
  "lib/business-agent/e04/decision/decision.policy.ts",
  "lib/business-agent/e04/decision/decision.engine.ts",
  "lib/business-agent/e04/decision/decision.trace.ts",
] as const;

const FROZEN_E04_P5 = [
  "lib/business-agent/e04/memory/memory.types.ts",
  "lib/business-agent/e04/memory/memory.constants.ts",
  "lib/business-agent/e04/memory/memory.store.ts",
  "lib/business-agent/e04/memory/memory.index.ts",
  "lib/business-agent/e04/memory/memory.retriever.ts",
  "lib/business-agent/e04/memory/memory.trace.ts",
] as const;

const FROZEN_E03 = [
  "lib/agent-platform/e03/core/agent.types.ts",
  "lib/agent-platform/e03/core/agent.constants.ts",
  "lib/agent-platform/e03/core/agent.registry.ts",
  "lib/agent-platform/e03/core/agent.lifecycle.ts",
  "lib/agent-platform/e03/runtime/agent.context.ts",
  "lib/agent-platform/e03/runtime/agent.executor.ts",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function sha1(rel: string): string {
  return createHash("sha1")
    .update(fs.readFileSync(path.join(ROOT, rel)))
    .digest("hex");
}

function checkModules() {
  const required = [
    "lib/business-agent/e04/knowledge/knowledge.types.ts",
    "lib/business-agent/e04/knowledge/knowledge.constants.ts",
    "lib/business-agent/e04/knowledge/knowledge.graph.ts",
    "lib/business-agent/e04/knowledge/knowledge.registry.ts",
    "lib/business-agent/e04/knowledge/knowledge.retriever.ts",
    "lib/business-agent/e04/knowledge/knowledge.validator.ts",
    "lib/business-agent/e04/knowledge/knowledge.trace.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkFrozen(
  label: string,
  files: readonly string[],
  baseline: Record<string, string>,
) {
  for (const rel of files) {
    check(sha1(rel) === baseline[rel], `${label} modified: ${rel}`);
  }
}

function checkBasesIntact() {
  const foundation = buildBusinessAgentFoundation();
  check(foundation.ready === true, "P1 ready");
  check(foundation.platformId === E04_BUSINESS_AGENT_PLATFORM_ID, "P1 id");
  check(foundation.version === E04_BUSINESS_AGENT_VERSION, "P1 version");

  const workflows = buildWorkflowRegistryManifest();
  check(workflows.catalogComplete === true, "P2 ready");
  check(workflows.runtimeId === E04_WORKFLOW_RUNTIME_ID, "P2 id");
  check(workflows.version === E04_WORKFLOW_VERSION, "P2 version");

  const processes = buildProcessRegistryManifest();
  check(processes.catalogComplete === true, "P3 ready");
  check(processes.orchestrationId === E04_PROCESS_ORCHESTRATION_ID, "P3 id");
  check(processes.version === E04_PROCESS_VERSION, "P3 version");

  const decisions = buildDecisionRegistryManifest();
  check(decisions.catalogComplete === true, "P4 ready");
  check(decisions.runtimeId === E04_DECISION_RUNTIME_ID, "P4 id");
  check(decisions.version === E04_DECISION_VERSION, "P4 version");

  const memory = buildMemoryRuntimeManifest();
  check(memory.ready === true, "P5 ready");
  check(memory.runtimeId === E04_MEMORY_RUNTIME_ID, "P5 id");
  check(memory.version === E04_MEMORY_VERSION, "P5 version");

  check(
    E04_KNOWLEDGE_BASE === "enterprise-e04-p5-business-memory-runtime-v1",
    "knowledge base",
  );
  console.log("✓ E03 + E04 P1-P5 unmodified / bases intact");
}

function testKnowledgeRuntime() {
  let trace = createKnowledgeRuntimeTrace({ operationId: "verify-e04-p6" });

  const manifest = buildKnowledgeRegistryManifest();
  check(manifest.catalogComplete === true, "catalog complete");
  check(manifest.runtimeId === E04_KNOWLEDGE_RUNTIME_ID, "runtime id");
  check(manifest.version === E04_KNOWLEDGE_VERSION, "version");
  check(manifest.base === E04_KNOWLEDGE_BASE, "base");
  check(manifest.entityCount === KNOWLEDGE_SEED.entities.length, "entities");
  check(
    manifest.relationCount === KNOWLEDGE_SEED.relations.length,
    "relations",
  );
  check(KNOWLEDGE_ENTITY_KINDS.length === 7, "entity kinds");
  check(KNOWLEDGE_RELATION_KINDS.length === 6, "relation kinds");
  trace = appendKnowledgeTraceEvent(trace, "register", "seed registered", {
    entityCount: String(manifest.entityCount),
    relationCount: String(manifest.relationCount),
  });

  // Link knowledge entity to a memory record (reuse P5 store, no P5 edits)
  resetBusinessMemoryStore();
  const mem = writeMemoryRecord({
    scope: "shared",
    kind: "context",
    ownerId: "e04.know.project.xinghe",
    title: "项目记忆锚点",
    content: "星河科技园企业健身中心上下文",
    tags: ["xinghe", "knowledge"],
  });
  const linked = upsertKnowledgeEntity({
    id: "e04.know.project.xinghe",
    kind: "project",
    name: "星河科技园企业健身中心",
    description: "企业健身中心招采与交付项目",
    tags: ["xinghe", "fitness"],
    memoryRef: mem.id,
    attributes: { region: "华南" },
  });
  check(linked.memoryRef === mem.id, "memoryRef linked");
  trace = appendKnowledgeTraceEvent(trace, "link", "memoryRef attached", {
    memoryRef: mem.id,
  });

  const project = getKnowledgeCatalogEntity("e04.know.project.xinghe");
  check(Boolean(project), "project entity");
  check(getKnowledgeEntityById(project!.id)?.memoryRef === mem.id, "graph get");

  const neighbors = listNeighbors("e04.know.project.xinghe");
  check(neighbors.length >= 3, "project neighbors");

  const byText = retrieveKnowledge({ text: "星河科技园" });
  check(byText.hitCount >= 1, "retrieve text");

  const byKind = retrieveKnowledge({ kind: "equipment" });
  check(byKind.hitCount === 1, "retrieve kind");
  check(byKind.hits[0]!.entity.id === "e04.know.equip.treadmill", "equip");

  const byNeighbor = retrieveKnowledge({
    neighborOf: "e04.know.project.xinghe",
    relationKind: "requires",
  });
  check(byNeighbor.hitCount === 1, "neighbor requires");
  check(byNeighbor.hits[0]!.entity.id === "e04.know.req.zone-split", "req");
  trace = appendKnowledgeTraceEvent(trace, "retrieve", "queries ok", {
    textHits: String(byText.hitCount),
    neighborHits: String(byNeighbor.hitCount),
  });

  const snap = snapshotKnowledgeGraph();
  check(snap.entityCount >= 6, "snapshot entities");
  check(snap.relationCount >= 5, "snapshot relations");

  const validation = validateKnowledgeGraph();
  check(validation.valid === true, "graph valid");
  check(validation.issueCount === 0, "no issues");
  assertKnowledgeGraphValid();
  trace = appendKnowledgeTraceEvent(trace, "validate", "graph valid");

  // broken relation should fail validation
  upsertKnowledgeEntity({
    id: "e04.know.tmp.orphan-target",
    kind: "artifact",
    name: "tmp",
    description: "tmp",
  });
  linkKnowledgeRelation({
    id: "e04.krel.tmp.bad",
    kind: "derived_from",
    fromId: "e04.know.tmp.orphan-target",
    toId: "e04.know.tmp.orphan-target",
    label: "self",
  });
  const bad = validateKnowledgeGraph();
  check(bad.valid === false, "self-loop invalid");
  check(bad.issues.some((i) => i.code === "self_loop"), "self_loop issue");

  // restore clean seed for frozen re-check
  buildKnowledgeRegistryManifest();
  assertKnowledgeGraphValid();

  trace = appendKnowledgeTraceEvent(trace, "result", "knowledge verify complete");
  check(trace.eventCount >= 5, "trace events");
  check(Boolean(trace.finishedAt), "trace finished");

  console.log("✓ registry + graph + retrieve + validate + trace");
}

function main() {
  console.log("E04-P6 — Business Knowledge Runtime Verification\n");

  const baseline: Record<string, string> = {};
  for (const rel of [
    ...FROZEN_E04_P1,
    ...FROZEN_E04_P2,
    ...FROZEN_E04_P3,
    ...FROZEN_E04_P4,
    ...FROZEN_E04_P5,
    ...FROZEN_E03,
  ]) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E04 P1", FROZEN_E04_P1, baseline);
  checkFrozen("E04 P2", FROZEN_E04_P2, baseline);
  checkFrozen("E04 P3", FROZEN_E04_P3, baseline);
  checkFrozen("E04 P4", FROZEN_E04_P4, baseline);
  checkFrozen("E04 P5", FROZEN_E04_P5, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();
  testKnowledgeRuntime();
  checkFrozen("E04 P1", FROZEN_E04_P1, baseline);
  checkFrozen("E04 P2", FROZEN_E04_P2, baseline);
  checkFrozen("E04 P3", FROZEN_E04_P3, baseline);
  checkFrozen("E04 P4", FROZEN_E04_P4, baseline);
  checkFrozen("E04 P5", FROZEN_E04_P5, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();

  console.log("\nPASS — E04 P6 business knowledge runtime");
}

main();
