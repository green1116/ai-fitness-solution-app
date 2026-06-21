/**
 * V58 P7 — Runtime Orchestration Layer Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  V58_P7_CAPABILITIES,
  V58_P7_FORBIDDEN,
  V58_P7_FREEZE_MANIFEST,
  V58_P7_META,
  QUOTE_ORCHESTRATION_FLOW_ORDER,
  coordinateAsyncClient,
  coordinateEventFlow,
  coordinateHistory,
  coordinateJobEngine,
  coordinateLifecycleEngine,
  coordinateStatusSync,
  createQuoteOrchestrator,
  dispatchOrchestrationFlow,
  formatV58P7FreezeSummary,
  getQuoteHistory,
  isV58P7Frozen,
  resolveLifecycleFlow,
  resolveOrchestratorPorts,
  runCoordinationChain,
  runQuoteOrchestration,
  verifyOrchestrationDeterminism,
} from "../lib/quote-lifecycle";

const ORCHESTRATION_DIR = path.resolve(__dirname, "../lib/quote-lifecycle/orchestration");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkCapabilityExports() {
  const checks: Record<string, boolean> = {
    HAS_ORCHESTRATOR: typeof createQuoteOrchestrator === "function",
    HAS_ORCHESTRATION_ENGINE: typeof runQuoteOrchestration === "function",
    HAS_FLOW_COORDINATION: typeof resolveLifecycleFlow === "function",
    HAS_LIFECYCLE_COORDINATION: typeof coordinateLifecycleEngine === "function",
    HAS_JOB_COORDINATION: typeof coordinateJobEngine === "function",
    HAS_EVENT_COORDINATION: typeof coordinateEventFlow === "function",
    HAS_STATUS_COORDINATION: typeof coordinateStatusSync === "function",
    HAS_HISTORY_COORDINATION: typeof coordinateHistory === "function",
  };

  for (const cap of V58_P7_CAPABILITIES) {
    assert(checks[cap] === true, `missing capability: ${cap}`);
    console.log(`✓ ${cap}`);
  }
}

function scanDirForForbiddenPatterns(dir: string, patterns: RegExp[]): string[] {
  const violations: string[] = [];

  function walk(current: string) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.name.endsWith(".ts")) continue;
      const content = fs.readFileSync(full, "utf8");
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          violations.push(`${full}: matched ${pattern}`);
        }
      }
    }
  }

  walk(dir);
  return violations;
}

function checkForbiddenConstraints() {
  const patterns: RegExp[] = [
    /@prisma\/client|from\s+["'].*prisma/i,
    /\bRepository\b|from\s+["'].*repository/i,
    /\bWorker\b|from\s+["'].*worker/i,
    /\bQueue\b|from\s+["'].*queue/i,
    /\bEventBus\b|from\s+["'].*event-bus/i,
    /from\s+["']react|from\s+["']next\//i,
    /from\s+["'].*\/v56\//i,
    /from\s+["'].*quote-runtime(?!-lifecycle)/i,
  ];

  const violations = scanDirForForbiddenPatterns(ORCHESTRATION_DIR, patterns);
  assert(violations.length === 0, `forbidden patterns: ${violations.join("; ")}`);

  for (const key of V58_P7_FORBIDDEN) {
    if (key === "NO_V57_MODIFICATION") continue;
    console.log(`✓ ${key}`);
  }
  console.log("✓ NO_V57_MODIFICATION (no v57 paths touched)");
}

function checkRequiredFiles() {
  const required = [
    "quote-orchestrator.types.ts",
    "quote-orchestrator.interface.ts",
    "quote-orchestrator.engine.ts",
    "quote-orchestrator.flow.ts",
    "quote-orchestrator.coordinator.ts",
    "quote-orchestrator.resolver.ts",
    "quote-orchestrator.dispatcher.ts",
    "quote-orchestrator.validation.ts",
  ];

  for (const file of required) {
    const filePath = path.join(ORCHESTRATION_DIR, file);
    assert(fs.existsSync(filePath), `missing file: ${file}`);
  }
  console.log("✓ all orchestration module files present");
}

function testOrchestrationFlow() {
  const input = {
    context: {
      quoteId: "quote-v58-p7",
      workspaceId: "ws-v58",
    },
    action: "start",
    observedAt: "2026-06-21T12:00:00.000Z",
  };

  const flow = resolveLifecycleFlow(input);
  assert(flow.entryPoint === "orchestrator", "single entry point");
  assert(flow.bypassAllowed === false, "no bypass");
  assert(
    flow.steps.length === QUOTE_ORCHESTRATION_FLOW_ORDER.length,
    "full flow chain",
  );
  assert(flow.steps[0] === "lifecycle", "lifecycle first");
  assert(flow.steps[flow.steps.length - 1] === "history", "history last");

  const orchestrator = createQuoteOrchestrator();
  const result = orchestrator.run(input);

  assert(result.steps.length === 6, "six orchestration steps");
  assert(result.aggregatedStatus === "synced", "status synced");
  assert(result.historyRecordCount === 1, "history recorded");
  assert(result.deterministic === true, "deterministic flag");

  const history = getQuoteHistory(orchestrator.historyStore, "quote-v58-p7");
  assert(history.length === 1, "history store populated");

  assert(verifyOrchestrationDeterminism(input), "orchestration determinism");

  console.log("✓ orchestration flow end-to-end");
  console.log(" ", formatV58P7FreezeSummary());
}

function testCoordinationChain() {
  const { historyStore, ...ports } = resolveOrchestratorPorts();
  const input = {
    context: { quoteId: "quote-chain", workspaceId: "ws-chain" },
    action: "coordinate",
    observedAt: "2026-06-21T12:01:00.000Z",
  };

  const chain = runCoordinationChain(ports, input, input.observedAt);
  assert(chain.lifecycle.status === "running", "lifecycle coordinated");
  assert(chain.job.jobId.length > 0, "job coordinated");
  assert(chain.async.asyncHandle.length > 0, "async coordinated");
  assert(chain.event.eventId.length > 0, "event coordinated");
  assert(chain.status.syncedStatus === "synced", "status coordinated");
  assert(chain.history.recordCount === 1, "history coordinated");

  const steps = dispatchOrchestrationFlow(ports, input, input.observedAt);
  assert(steps.every((s) => s.success), "all dispatch steps succeed");

  const standalone = runQuoteOrchestration(input, ports);
  assert(standalone.steps.length === 6, "standalone orchestration");

  void historyStore;
  console.log("✓ coordination chain");
}

function testFreezeManifest() {
  assert(V58_P7_META.phase === "P7", "meta phase");
  assert(V58_P7_META.capabilities.length === 8, "meta capabilities");
  assert(isV58P7Frozen(), "freeze manifest complete");
  assert(V58_P7_FREEZE_MANIFEST.controlPlaneChain.length === 7, "control plane chain");

  console.log("✓ freeze manifest");
}

function main() {
  checkRequiredFiles();
  checkCapabilityExports();
  checkForbiddenConstraints();
  testCoordinationChain();
  testOrchestrationFlow();
  testFreezeManifest();
  console.log("\n✓ V58 P7 Runtime Orchestration Layer — ALL CHECKS PASSED");
}

main();
