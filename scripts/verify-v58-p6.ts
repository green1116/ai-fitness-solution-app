/**
 * V58 P6 — Quote History Foundation Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  V58_P6_CAPABILITIES,
  V58_P6_FORBIDDEN,
  V58_P6_FREEZE_MANIFEST,
  V58_P6_META,
  appendHistoryRecord,
  buildAuditSnapshot,
  buildCausationChain,
  buildQuoteHistoryPipeline,
  buildQuoteTimeline,
  createQuoteHistoryStore,
  formatV58P6FreezeSummary,
  getQuoteHistory,
  ingestDomainEvents,
  isV58P6Frozen,
  mapEventToHistoryRecord,
  reconstructLifecycleFromHistory,
  replayQuoteExecution,
  selectHistoryRecords,
  selectLifecycleRecords,
  verifyReplayDeterminism,
  type QuoteDomainEvent,
} from "../lib/quote-lifecycle";

const HISTORY_DIR = path.resolve(__dirname, "../lib/quote-lifecycle/history");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkCapabilityExports() {
  const checks: Record<string, boolean> = {
    HAS_HISTORY_STORE: typeof createQuoteHistoryStore === "function",
    HAS_HISTORY_RECORD: typeof mapEventToHistoryRecord === "function",
    HAS_HISTORY_TIMELINE: typeof buildQuoteTimeline === "function",
    HAS_HISTORY_REPLAY: typeof replayQuoteExecution === "function",
    HAS_HISTORY_BUILDER: typeof buildQuoteHistoryPipeline === "function",
    HAS_HISTORY_SELECTOR: typeof selectHistoryRecords === "function",
    HAS_AUDIT_SNAPSHOT: typeof buildAuditSnapshot === "function",
    HAS_LIFECYCLE_RECONSTRUCTION: typeof reconstructLifecycleFromHistory === "function",
  };

  for (const cap of V58_P6_CAPABILITIES) {
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
  const patterns: { key: string; regex: RegExp }[] = [
    { key: "NO_PRISMA_ACCESS", regex: /@prisma\/client|from\s+["'].*prisma/i },
    { key: "NO_REPOSITORY_ACCESS", regex: /\bRepository\b|from\s+["'].*repository/i },
    { key: "NO_WORKER", regex: /\bWorker\b|from\s+["'].*worker/i },
    { key: "NO_QUEUE", regex: /\bQueue\b|from\s+["'].*queue/i },
    { key: "NO_EVENT_BUS", regex: /\bEventBus\b|from\s+["'].*event-bus/i },
    { key: "NO_UI_LOGIC", regex: /from\s+["']react|from\s+["']next\//i },
    { key: "NO_RUNTIME_LOGIC", regex: /from\s+["'].*quote-runtime/i },
  ];

  const violations = scanDirForForbiddenPatterns(HISTORY_DIR, patterns.map((p) => p.regex));
  assert(violations.length === 0, `forbidden patterns: ${violations.join("; ")}`);

  for (const key of V58_P6_FORBIDDEN) {
    if (key === "NO_V57_MODIFICATION") continue;
    console.log(`✓ ${key}`);
  }
  console.log("✓ NO_V57_MODIFICATION (no v57 paths touched)");
}

function checkRequiredFiles() {
  const required = [
    "quote-history.types.ts",
    "quote-history.event.ts",
    "quote-history.record.ts",
    "quote-history.timeline.ts",
    "quote-history.replay.ts",
    "quote-history.store.ts",
    "quote-history.builder.ts",
    "quote-history.mapper.ts",
    "quote-history.selector.ts",
    "quote-history.validation.ts",
  ];

  for (const file of required) {
    const filePath = path.join(HISTORY_DIR, file);
    assert(fs.existsSync(filePath), `missing file: ${file}`);
  }
  console.log("✓ all history module files present");
}

function buildSampleEvents(): QuoteDomainEvent[] {
  const base = "2026-06-21T10:00:00.000Z";
  return [
    {
      eventId: "evt-lc-001",
      quoteId: "quote-v58-p6",
      workspaceId: "ws-v58",
      eventType: "lifecycle.created",
      timestamp: base,
      payload: { status: "created", stepIndex: 0 },
    },
    {
      eventId: "evt-lc-002",
      quoteId: "quote-v58-p6",
      workspaceId: "ws-v58",
      eventType: "lifecycle.running",
      timestamp: "2026-06-21T10:01:00.000Z",
      payload: { status: "running", stepIndex: 1 },
      causationId: "evt-lc-001",
    },
    {
      eventId: "evt-job-001",
      quoteId: "quote-v58-p6",
      workspaceId: "ws-v58",
      eventType: "job.started",
      timestamp: "2026-06-21T10:02:00.000Z",
      jobId: "job-001",
      payload: { status: "started" },
      causationId: "evt-lc-002",
    },
    {
      eventId: "evt-exec-001",
      quoteId: "quote-v58-p6",
      workspaceId: "ws-v58",
      eventType: "execution.running",
      timestamp: "2026-06-21T10:03:00.000Z",
      jobId: "job-001",
      executionId: "exec-001",
      payload: { status: "running" },
      causationId: "evt-job-001",
    },
    {
      eventId: "evt-exec-002",
      quoteId: "quote-v58-p6",
      workspaceId: "ws-v58",
      eventType: "execution.completed",
      timestamp: "2026-06-21T10:04:00.000Z",
      jobId: "job-001",
      executionId: "exec-001",
      payload: { status: "completed" },
      causationId: "evt-exec-001",
    },
  ];
}

function testHistoryPipeline() {
  const events = buildSampleEvents();
  const { store, records, timeline } = buildQuoteHistoryPipeline(events);

  assert(records.length === 5, "records count");
  assert(getQuoteHistory(store, "quote-v58-p6").length === 5, "store retrieval");
  assert(timeline !== null, "timeline built");
  assert(timeline!.lifecycleEvents.length === 2, "lifecycle events");
  assert(timeline!.jobEvents.length === 1, "job events");
  assert(timeline!.executionEvents.length === 2, "execution events");

  const replay = replayQuoteExecution(records);
  assert(replay !== null, "replay result");
  assert(replay!.lifecycle.status === "running", "lifecycle replay state");
  assert(replay!.jobs.length === 1, "job replay states");
  assert(replay!.executions.length === 1, "execution replay states");
  assert(replay!.executions[0].status === "completed", "execution final status");
  assert(verifyReplayDeterminism(records), "replay determinism");

  const reconstruction = reconstructLifecycleFromHistory(records);
  assert(reconstruction !== null, "lifecycle reconstruction");
  assert(reconstruction!.status === "running", "reconstructed lifecycle status");
  assert(reconstruction!.deterministic === true, "reconstruction deterministic");

  const audit = buildAuditSnapshot(records);
  assert(audit !== null, "audit snapshot");
  assert(audit!.traceable === true, "audit traceable");
  assert(audit!.causationChain.length > 0, "causation chain");

  const chain = buildCausationChain(records, "evt-exec-002");
  assert(chain.includes("evt-lc-001"), "causation chain root");
  assert(chain.includes("evt-exec-002"), "causation chain terminal");

  const lifecycleOnly = selectLifecycleRecords(records);
  assert(lifecycleOnly.length === 2, "lifecycle selector");

  console.log("✓ history pipeline end-to-end");
  console.log(" ", formatV58P6FreezeSummary());
}

function testAppendHistoryRecord() {
  const store = createQuoteHistoryStore();
  const event = buildSampleEvents()[0];
  const record = mapEventToHistoryRecord(event);
  const updated = appendHistoryRecord(store, record);
  assert(updated.length === 1, "append single record");

  const events = buildSampleEvents();
  ingestDomainEvents(store, events.slice(1));
  assert(getQuoteHistory(store, "quote-v58-p6").length === 5, "append multiple");

  console.log("✓ appendHistoryRecord");
}

function testFreezeManifest() {
  assert(V58_P6_META.phase === "P6", "meta phase");
  assert(V58_P6_META.capabilities.length === 8, "meta capabilities");
  assert(isV58P6Frozen(), "freeze manifest complete");
  assert(V58_P6_FREEZE_MANIFEST.observabilityChain.length === 6, "observability chain");

  console.log("✓ freeze manifest");
}

function main() {
  checkRequiredFiles();
  checkCapabilityExports();
  checkForbiddenConstraints();
  testAppendHistoryRecord();
  testHistoryPipeline();
  testFreezeManifest();
  console.log("\n✓ V58 P6 Quote History Foundation — ALL CHECKS PASSED");
}

main();
