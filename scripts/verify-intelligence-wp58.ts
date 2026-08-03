/**
 * WP-58 — Batch Engine verification.
 * Deterministic BatchItem[] from QueueItems (fixed size).
 */
import {
  addRenewal,
  clearAutomationDashboard,
  clearCustomerAnalytics,
  clearCustomerAutomations,
  clearCustomerEngagements,
  clearCustomerHealth,
  clearCustomerInsights,
  clearCustomerLifecycles,
  clearCustomerProfiles,
  clearCustomers,
  clearCustomerSuccessDashboard,
  clearExpansionInsights,
  clearExpansions,
  clearOptimizationDashboard,
  clearRenewals,
  clearRetentionDashboard,
  clearRetentionInsights,
  clearSupportCases,
  clearTasks,
  clearWorkflows,
  createCustomerProfile,
  openSupportCase,
  recordCustomerEngagement,
  registerCustomer,
  setCustomerHealth,
  setCustomerLifecycleStage,
} from "../lib/post-launch";
import {
  BATCH_ENGINE_CAPABILITY,
  BATCH_SIZE,
  buildAttention,
  buildBatch,
  buildInsights,
  buildIntelligenceContext,
  buildIntelligenceMetrics,
  buildPriorityItems,
  buildQueue,
  buildRecommendations,
  buildSignals,
  clearAttention,
  clearBatch,
  clearInsights,
  clearIntelligenceContext,
  clearIntelligenceDashboard,
  clearIntelligenceMetrics,
  clearIntelligenceSnapshots,
  clearPriorityItems,
  clearQueue,
  clearRecommendations,
  clearSignals,
  createIntelligenceSnapshot,
  FEAT_59_ID,
  getBatch,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
  clearBatch();
  clearQueue();
  clearAttention();
  clearSignals();
  clearPriorityItems();
  clearInsights();
  clearRecommendations();
  clearIntelligenceDashboard();
  clearIntelligenceMetrics();
  clearIntelligenceSnapshots();
  clearIntelligenceContext();
  clearAutomationDashboard();
  clearTasks();
  clearWorkflows();
  clearCustomerAutomations();
  clearOptimizationDashboard();
  clearExpansionInsights();
  clearRetentionInsights();
  clearCustomerInsights();
  clearRetentionDashboard();
  clearExpansions();
  clearRenewals();
  clearCustomerAnalytics();
  clearCustomerSuccessDashboard();
  clearSupportCases();
  clearCustomerEngagements();
  clearCustomerHealth();
  clearCustomerLifecycles();
  clearCustomerProfiles();
  clearCustomers();
}

function seedCustomer(input: {
  customerId: string;
  name: string;
  stage: "ACTIVE" | "RISK";
  health: "GOOD" | "WARNING";
  score: number;
}) {
  registerCustomer({
    customerId: input.customerId,
    name: input.name,
    organization: `Org ${input.customerId}`,
    email: `${input.customerId}@wp58.example`,
  });
  createCustomerProfile({
    customerId: input.customerId,
    displayName: input.name,
  });
  setCustomerLifecycleStage({
    customerId: input.customerId,
    stage: input.stage,
  });
  setCustomerHealth({
    customerId: input.customerId,
    score: input.score,
    level: input.health,
  });
  recordCustomerEngagement({
    customerId: input.customerId,
    type: "CALL",
    notes: "wp58 seed",
  });
}

function main() {
  console.log("=== WP-58 / Batch Engine ===");

  resetAll();

  seedCustomer({
    customerId: "cust-wp58-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp58-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp58-1",
    customerId: "cust-wp58-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp58-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp58-1",
    version: "v1",
  });
  buildIntelligenceMetrics();
  const recommendations = buildRecommendations();
  const insights = buildInsights({ recommendations });
  const priorityItems = buildPriorityItems({ insights, recommendations });
  const signals = buildSignals({ insights, recommendations, priorityItems });
  const attention = buildAttention({ signals });
  const queue = buildQueue({ attention });

  const first = buildBatch({ queue });
  assert(FEAT_59_ID === "FEAT-59", "FEAT-59");
  assert(BATCH_ENGINE_CAPABILITY === "BatchEngine", "BatchEngine");
  assert(BATCH_SIZE === 5, "BATCH_SIZE");
  const expectedBatches = Math.ceil(queue.length / BATCH_SIZE);
  assert(first.length === expectedBatches, "batch count");
  assert(
    first.every(
      (b) =>
        b.id &&
        b.position >= 1 &&
        Array.isArray(b.queueIds) &&
        b.queueIds.length > 0 &&
        b.queueIds.length <= BATCH_SIZE,
    ),
    "shape",
  );
  assert(
    first.every((b, i) => b.id === `batch-${i + 1}` && b.position === i + 1),
    "stable batch ids/positions",
  );

  // Flat queueIds follow queue position order
  const flat = first.flatMap((b) => b.queueIds);
  assert(
    flat.join("|") ===
      queue
        .slice()
        .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id))
        .map((q) => q.id)
        .join("|"),
    "stable order by queue position",
  );
  console.log("PASS Build");

  for (let i = 1; i < first.length; i++) {
    assert(first[i - 1]!.position < first[i]!.position, `order at ${i}`);
  }
  console.log("PASS Ordering");

  const second = buildBatch({ queue });
  assert(
    second.map((b) => `${b.id}:${b.queueIds.join(",")}`).join("|") ===
      first.map((b) => `${b.id}:${b.queueIds.join(",")}`).join("|"),
    "deterministic",
  );
  console.log("PASS Deterministic");

  // Smaller fixed size for multi-batch coverage when queue is large enough
  const sized = buildBatch({ queue, batchSize: 2 });
  assert(sized.length === Math.ceil(queue.length / 2), "custom batchSize");
  assert(sized.every((b) => b.queueIds.length <= 2), "custom size cap");

  const viaDefault = buildBatch();
  assert(viaDefault.length === Math.ceil(queue.length / BATCH_SIZE), "default");
  const got = getBatch();
  assert(got.length === viaDefault.length, "get length");
  assert(got[0]?.id === viaDefault[0]?.id, "get first id");
  console.log("PASS Get");

  resetAll();
  console.log("");
  console.log("PASS WP-58 Batch Engine");
  console.log("WP-58 verification complete");
}

main();
