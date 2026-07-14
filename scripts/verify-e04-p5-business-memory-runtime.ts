/**
 * E04-P5 — Business Memory Runtime verification
 * Memory layer for agents, workflows, processes and decisions
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
import {
  E04_MEMORY_BASE,
  E04_MEMORY_RUNTIME_ID,
  E04_MEMORY_VERSION,
  MEMORY_KINDS,
  MEMORY_SCOPES,
} from "../lib/business-agent/e04/memory/memory.constants";
import {
  buildMemoryRuntimeManifest,
  getMemoryRecordById,
  getMemoryRecordCount,
  resetBusinessMemoryStore,
  writeMemoryRecord,
} from "../lib/business-agent/e04/memory/memory.store";
import {
  buildMemoryIndex,
  snapshotMemoryIndex,
} from "../lib/business-agent/e04/memory/memory.index";
import { retrieveMemory } from "../lib/business-agent/e04/memory/memory.retriever";
import {
  appendMemoryTraceEvent,
  createMemoryRuntimeTrace,
} from "../lib/business-agent/e04/memory/memory.trace";

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
    "lib/business-agent/e04/memory/memory.types.ts",
    "lib/business-agent/e04/memory/memory.constants.ts",
    "lib/business-agent/e04/memory/memory.store.ts",
    "lib/business-agent/e04/memory/memory.index.ts",
    "lib/business-agent/e04/memory/memory.retriever.ts",
    "lib/business-agent/e04/memory/memory.trace.ts",
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

  check(
    E04_MEMORY_BASE === "enterprise-e04-p4-business-decision-runtime-v1",
    "memory base",
  );
  console.log("✓ E03 + E04 P1-P4 unmodified / bases intact");
}

function testManifestStoreIndexRetrieve() {
  resetBusinessMemoryStore();
  check(getMemoryRecordCount() === 0, "store empty");

  const manifest = buildMemoryRuntimeManifest();
  check(manifest.ready === true, "manifest ready");
  check(manifest.runtimeId === E04_MEMORY_RUNTIME_ID, "runtime id");
  check(manifest.version === E04_MEMORY_VERSION, "version");
  check(manifest.base === E04_MEMORY_BASE, "base");
  check(MEMORY_SCOPES.length === 5, "scopes");
  check(MEMORY_KINDS.length === 5, "kinds");

  let trace = createMemoryRuntimeTrace({ operationId: "verify-write" });

  const agentNote = writeMemoryRecord({
    scope: "agent",
    kind: "note",
    ownerId: "e04.business.tender",
    title: "招采要点",
    content: "星河科技园健身中心招采响应需覆盖设备与预算",
    tags: ["tender", "xinghe"],
    payload: { projectHint: "星河科技园企业健身中心" },
  });
  trace = appendMemoryTraceEvent(trace, "write", `wrote ${agentNote.id}`, {
    scope: agentNote.scope,
    ownerId: agentNote.ownerId,
  });

  const workflowFact = writeMemoryRecord({
    scope: "workflow",
    kind: "fact",
    ownerId: "e04.workflow.tender-response",
    title: "workflow checkpoint",
    content: "tender response workflow completed intake",
    tags: ["workflow", "intake"],
  });
  trace = appendMemoryTraceEvent(trace, "write", `wrote ${workflowFact.id}`);

  const decisionOutcome = writeMemoryRecord({
    scope: "decision",
    kind: "outcome",
    ownerId: "e04.decision.tender-gate",
    title: "gate outcome",
    content: "approve for enterprise response",
    tags: ["decision", "approve"],
    payload: { outcome: "approve" },
  });
  trace = appendMemoryTraceEvent(
    trace,
    "write",
    `wrote ${decisionOutcome.id}`,
  );

  check(getMemoryRecordCount() === 3, "three records");
  check(Boolean(getMemoryRecordById(agentNote.id)), "get by id");

  const index = buildMemoryIndex();
  const snap = snapshotMemoryIndex(index);
  check(snap.recordCount === 3, "index count");
  check(snap.byScope.agent === 1, "scope agent");
  check(snap.byScope.workflow === 1, "scope workflow");
  check(snap.byScope.decision === 1, "scope decision");
  check((snap.byTag.tender ?? 0) === 1, "tag tender");
  trace = appendMemoryTraceEvent(trace, "index", "index built", {
    recordCount: String(snap.recordCount),
  });

  const byOwner = retrieveMemory(
    { ownerId: "e04.business.tender" },
    index,
  );
  check(byOwner.hitCount === 1, "retrieve by owner");
  check(byOwner.hits[0]!.record.id === agentNote.id, "owner hit");

  const byText = retrieveMemory({ text: "星河科技园" }, index);
  check(byText.hitCount === 1, "retrieve by text");

  const byTags = retrieveMemory({ tags: ["approve"] }, index);
  check(byTags.hitCount === 1, "retrieve by tag");
  check(byTags.hits[0]!.record.scope === "decision", "decision hit");

  const byScopeKind = retrieveMemory(
    { scope: "workflow", kind: "fact" },
    index,
  );
  check(byScopeKind.hitCount === 1, "scope+kind");

  trace = appendMemoryTraceEvent(trace, "retrieve", "queries ok", {
    ownerHits: String(byOwner.hitCount),
    textHits: String(byText.hitCount),
  });
  trace = appendMemoryTraceEvent(trace, "result", "memory verify complete");
  check(trace.eventCount >= 5, "trace events");
  check(Boolean(trace.finishedAt), "trace finished");

  console.log("✓ store + index + retrieve + trace");
}

function main() {
  console.log("E04-P5 — Business Memory Runtime Verification\n");

  const baseline: Record<string, string> = {};
  for (const rel of [
    ...FROZEN_E04_P1,
    ...FROZEN_E04_P2,
    ...FROZEN_E04_P3,
    ...FROZEN_E04_P4,
    ...FROZEN_E03,
  ]) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E04 P1", FROZEN_E04_P1, baseline);
  checkFrozen("E04 P2", FROZEN_E04_P2, baseline);
  checkFrozen("E04 P3", FROZEN_E04_P3, baseline);
  checkFrozen("E04 P4", FROZEN_E04_P4, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();
  testManifestStoreIndexRetrieve();
  checkFrozen("E04 P1", FROZEN_E04_P1, baseline);
  checkFrozen("E04 P2", FROZEN_E04_P2, baseline);
  checkFrozen("E04 P3", FROZEN_E04_P3, baseline);
  checkFrozen("E04 P4", FROZEN_E04_P4, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();

  console.log("\nPASS — E04 P5 business memory runtime");
}

main();
