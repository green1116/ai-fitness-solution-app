/**
 * E04-P7 — Enterprise Agent Collaboration Runtime verification
 * Multi business-agent collaboration layer
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
import { buildKnowledgeRegistryManifest } from "../lib/business-agent/e04/knowledge/knowledge.registry";
import {
  E04_KNOWLEDGE_RUNTIME_ID,
  E04_KNOWLEDGE_VERSION,
} from "../lib/business-agent/e04/knowledge/knowledge.constants";
import {
  E04_COLLABORATION_BASE,
  E04_COLLABORATION_RUNTIME_ID,
  E04_COLLABORATION_VERSION,
  COLLABORATION_MESSAGE_KINDS,
  COLLABORATION_PROTOCOL_PHASES,
} from "../lib/business-agent/e04/collaboration/collaboration.constants";
import {
  COLLABORATION_CATALOG,
  buildCollaborationRegistryManifest,
  getCollaborationById,
  listRequiredCollaborations,
} from "../lib/business-agent/e04/collaboration/collaboration.registry";
import {
  advanceCollaborationPhase,
  canAdvanceCollaborationPhase,
  createCollaborationSession,
  listMessagesByPhase,
  postCollaborationMessage,
} from "../lib/business-agent/e04/collaboration/collaboration.protocol";
import { executeCollaborationOrThrow } from "../lib/business-agent/e04/collaboration/collaboration.executor";
import {
  appendCollaborationTraceEvent,
  createCollaborationRuntimeTrace,
} from "../lib/business-agent/e04/collaboration/collaboration.trace";

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

const FROZEN_E04_P6 = [
  "lib/business-agent/e04/knowledge/knowledge.types.ts",
  "lib/business-agent/e04/knowledge/knowledge.constants.ts",
  "lib/business-agent/e04/knowledge/knowledge.graph.ts",
  "lib/business-agent/e04/knowledge/knowledge.registry.ts",
  "lib/business-agent/e04/knowledge/knowledge.retriever.ts",
  "lib/business-agent/e04/knowledge/knowledge.validator.ts",
  "lib/business-agent/e04/knowledge/knowledge.trace.ts",
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
    "lib/business-agent/e04/collaboration/collaboration.types.ts",
    "lib/business-agent/e04/collaboration/collaboration.constants.ts",
    "lib/business-agent/e04/collaboration/collaboration.registry.ts",
    "lib/business-agent/e04/collaboration/collaboration.protocol.ts",
    "lib/business-agent/e04/collaboration/collaboration.executor.ts",
    "lib/business-agent/e04/collaboration/collaboration.trace.ts",
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

  const knowledge = buildKnowledgeRegistryManifest();
  check(knowledge.catalogComplete === true, "P6 ready");
  check(knowledge.runtimeId === E04_KNOWLEDGE_RUNTIME_ID, "P6 id");
  check(knowledge.version === E04_KNOWLEDGE_VERSION, "P6 version");

  check(
    E04_COLLABORATION_BASE ===
      "enterprise-e04-p6-business-knowledge-runtime-v1",
    "collaboration base",
  );
  console.log("✓ E03 + E04 P1-P6 unmodified / bases intact");
}

function testRegistryAndProtocol() {
  check(COLLABORATION_CATALOG.length === 2, "catalog size");
  check(COLLABORATION_MESSAGE_KINDS.length === 6, "message kinds");
  check(COLLABORATION_PROTOCOL_PHASES.length === 4, "phases");
  check(canAdvanceCollaborationPhase("open", "exchange"), "open→exchange");
  check(!canAdvanceCollaborationPhase("open", "closed"), "skip blocked");

  const manifest = buildCollaborationRegistryManifest();
  check(manifest.catalogComplete === true, "catalog complete");
  check(manifest.runtimeId === E04_COLLABORATION_RUNTIME_ID, "runtime id");
  check(manifest.version === E04_COLLABORATION_VERSION, "version");
  check(manifest.base === E04_COLLABORATION_BASE, "base");
  check(listRequiredCollaborations().length === 1, "required");

  const roundtable = getCollaborationById("e04.collab.tender-roundtable");
  check(Boolean(roundtable), "roundtable");
  check(roundtable!.participants.length === 4, "participants");

  let session = createCollaborationSession({
    collaboration: roundtable!,
    input: { goal: "protocol probe" },
  });
  check(session.phase === "open", "session open");

  const posted = postCollaborationMessage(session, {
    kind: "announce",
    fromAgentId: "e04.business.tender",
    body: "kickoff",
  });
  session = posted.session;
  check(session.messages.length === 1, "message posted");
  check(listMessagesByPhase(session, "open").length === 1, "by phase");

  session = advanceCollaborationPhase(session, "exchange");
  session = advanceCollaborationPhase(session, "consolidate");
  session = advanceCollaborationPhase(session, "closed");
  check(session.phase === "closed", "closed");

  console.log("✓ registry + protocol");
}

function testExecutorAndTrace() {
  const roundtable = getCollaborationById("e04.collab.tender-roundtable");
  check(Boolean(roundtable), "roundtable present");

  const run = executeCollaborationOrThrow(roundtable!, {
    input: {
      goal: "星河科技园健身中心招采协作",
      projectHint: "星河科技园企业健身中心",
    },
    metadata: { source: "verify-e04-p7" },
  });

  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(run.session.phase === "closed", "session closed");
  check(run.result.phase === "closed", "result phase");
  // open(1 lead) + exchange(4) + consolidate(reviewer+lead=2) = 7
  check(run.result.turns.length === 7, "turns");
  check(run.result.messages.length === 7, "messages");
  check(run.trace.eventCount >= 5, "trace events");
  check(run.result.traceId === run.trace.traceId, "trace linked");
  check(
    run.result.messages.some((m) => m.kind === "announce"),
    "has announce",
  );
  check(run.result.messages.some((m) => m.kind === "vote"), "has vote");
  check(run.result.messages.some((m) => m.kind === "commit"), "has commit");

  const handoff = getCollaborationById("e04.collab.delivery-handoff");
  check(Boolean(handoff), "handoff");
  const handoffRun = executeCollaborationOrThrow(handoff!, {
    input: { goal: "delivery handoff probe" },
  });
  check(handoffRun.result.success === true, "handoff success");
  // open(1) + exchange(2) + consolidate(reviewer+lead=2) = 5
  check(handoffRun.result.turns.length === 5, "handoff turns");

  let probe = createCollaborationRuntimeTrace({
    sessionId: "s",
    collaborationId: "c",
    taskId: "t",
  });
  probe = appendCollaborationTraceEvent(probe, "register", "boot");
  check(probe.eventCount === 1, "manual trace");

  console.log("✓ collaboration executor → business agents + trace");
}

function main() {
  console.log("E04-P7 — Enterprise Agent Collaboration Verification\n");

  const baseline: Record<string, string> = {};
  for (const rel of [
    ...FROZEN_E04_P1,
    ...FROZEN_E04_P2,
    ...FROZEN_E04_P3,
    ...FROZEN_E04_P4,
    ...FROZEN_E04_P5,
    ...FROZEN_E04_P6,
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
  checkFrozen("E04 P6", FROZEN_E04_P6, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();
  testRegistryAndProtocol();
  testExecutorAndTrace();
  checkFrozen("E04 P1", FROZEN_E04_P1, baseline);
  checkFrozen("E04 P2", FROZEN_E04_P2, baseline);
  checkFrozen("E04 P3", FROZEN_E04_P3, baseline);
  checkFrozen("E04 P4", FROZEN_E04_P4, baseline);
  checkFrozen("E04 P5", FROZEN_E04_P5, baseline);
  checkFrozen("E04 P6", FROZEN_E04_P6, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();

  console.log("\nPASS — E04 P7 enterprise agent collaboration");
}

main();
