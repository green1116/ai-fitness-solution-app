/**
 * WP-56 — Attention Engine verification.
 * Deterministic AttentionItem[] from Signals.
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
  ATTENTION_ENGINE_CAPABILITY,
  buildAttention,
  buildInsights,
  buildIntelligenceContext,
  buildIntelligenceMetrics,
  buildPriorityItems,
  buildRecommendations,
  buildSignals,
  clearAttention,
  clearInsights,
  clearIntelligenceContext,
  clearIntelligenceDashboard,
  clearIntelligenceMetrics,
  clearIntelligenceSnapshots,
  clearPriorityItems,
  clearRecommendations,
  clearSignals,
  createIntelligenceSnapshot,
  FEAT_57_ID,
  getAttention,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function resetAll() {
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
    email: `${input.customerId}@wp56.example`,
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
    notes: "wp56 seed",
  });
}

function main() {
  console.log("=== WP-56 / Attention Engine ===");

  resetAll();

  seedCustomer({
    customerId: "cust-wp56-1",
    name: "Ada",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedCustomer({
    customerId: "cust-wp56-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  openSupportCase({
    caseId: "case-wp56-1",
    customerId: "cust-wp56-1",
    subject: "Need help",
  });
  addRenewal({
    customerId: "cust-wp56-1",
    renewalDate: "2026-12-01",
    value: 8000,
  });

  buildIntelligenceContext();
  createIntelligenceSnapshot({
    snapshotId: "snap-wp56-1",
    version: "v1",
  });
  buildIntelligenceMetrics();
  const recommendations = buildRecommendations();
  const insights = buildInsights({ recommendations });
  const priorityItems = buildPriorityItems({ insights, recommendations });
  const signals = buildSignals({ insights, recommendations, priorityItems });

  const first = buildAttention({ signals });
  assert(FEAT_57_ID === "FEAT-57", "FEAT-57");
  assert(ATTENTION_ENGINE_CAPABILITY === "AttentionEngine", "AttentionEngine");
  assert(first.length === signals.length, "count");
  assert(
    first.every(
      (a) => a.id && a.signalId && a.level && a.title && a.reason,
    ),
    "shape",
  );
  assert(
    first.every((a) => a.id === `att-${a.signalId}`),
    "stable id mapping",
  );

  const highSignal = signals.find((s) => s.intensity === "HIGH");
  if (highSignal) {
    const att = first.find((a) => a.signalId === highSignal.id);
    assert(att?.level === "CRITICAL", "HIGH -> CRITICAL");
  }
  const mediumSignal = signals.find((s) => s.intensity === "MEDIUM");
  if (mediumSignal) {
    const att = first.find((a) => a.signalId === mediumSignal.id);
    assert(att?.level === "HIGH", "MEDIUM -> HIGH");
  }
  const lowSignal = signals.find((s) => s.intensity === "LOW");
  if (lowSignal) {
    const att = first.find((a) => a.signalId === lowSignal.id);
    assert(att?.level === "NORMAL", "LOW -> NORMAL");
  }
  console.log("PASS Build");

  const rank = { CRITICAL: 0, HIGH: 1, NORMAL: 2 } as const;
  for (let i = 1; i < first.length; i++) {
    assert(
      rank[first[i - 1]!.level] <= rank[first[i]!.level],
      `level order at ${i}`,
    );
  }
  console.log("PASS Ordering");

  const second = buildAttention({ signals });
  assert(
    second.map((a) => a.id).join("|") === first.map((a) => a.id).join("|"),
    "deterministic ids",
  );
  assert(
    second.map((a) => a.reason).join("|") ===
      first.map((a) => a.reason).join("|"),
    "deterministic reasons",
  );
  console.log("PASS Deterministic");

  const viaDefault = buildAttention();
  assert(viaDefault.length === first.length, "default path count");
  const got = getAttention();
  assert(got.length === viaDefault.length, "get length");
  assert(got[0]?.id === viaDefault[0]?.id, "get first id");
  console.log("PASS Get");

  resetAll();
  console.log("");
  console.log("PASS WP-56 Attention Engine");
  console.log("WP-56 verification complete");
}

main();
