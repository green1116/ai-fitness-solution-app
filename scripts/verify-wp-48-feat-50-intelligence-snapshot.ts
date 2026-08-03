/**
 * WP-48 / FEAT-50 — Intelligence Snapshot verification.
 * Create / Get / List (reuses IntelligenceContext).
 */
import {
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
  clearAutomationDashboard,
  createCustomerProfile,
  recordCustomerEngagement,
  registerCustomer,
  setCustomerHealth,
  setCustomerLifecycleStage,
} from "../lib/post-launch";
import {
  buildIntelligenceContext,
  clearIntelligenceContext,
  clearIntelligenceSnapshots,
  createIntelligenceSnapshot,
  FEAT_50_ID,
  getIntelligenceSnapshot,
  INTELLIGENCE_SNAPSHOT_CAPABILITY,
  listIntelligenceSnapshots,
} from "../lib/intelligence";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function seedFullCustomer(customerId: string, name: string) {
  registerCustomer({
    customerId,
    name,
    organization: `Org ${customerId}`,
    email: `${customerId}@wp48.example`,
  });
  createCustomerProfile({ customerId, displayName: name });
  setCustomerLifecycleStage({ customerId, stage: "ACTIVE" });
  setCustomerHealth({ customerId, score: 80, level: "GOOD" });
  recordCustomerEngagement({
    customerId,
    type: "EMAIL",
    notes: "snapshot seed",
  });
}

function resetAll() {
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

function main() {
  console.log("=== WP-48 FEAT-50 / Intelligence Snapshot ===");

  resetAll();
  seedFullCustomer("cust-wp48-1", "Ada");
  seedFullCustomer("cust-wp48-2", "Bob");

  const context = buildIntelligenceContext();

  const created = createIntelligenceSnapshot({
    snapshotId: "snap-wp48-1",
    version: "v1",
  });
  assert(FEAT_50_ID === "FEAT-50", "FEAT-50");
  assert(
    INTELLIGENCE_SNAPSHOT_CAPABILITY === "IntelligenceSnapshot",
    "IntelligenceSnapshot",
  );
  assert(created.snapshotId === "snap-wp48-1", "Create snapshotId");
  assert(created.contextId === context.contextId, "Create contextId");
  assert(created.version === "v1", "Create version");
  assert(created.createdAt.includes("T"), "Create createdAt");
  assert(created.summary.includes("customers=2"), "Create summary");
  console.log("PASS Create");

  const got = getIntelligenceSnapshot("snap-wp48-1");
  assert(got !== undefined, "Get found");
  assert(got?.summary === created.summary, "Get summary");
  assert(getIntelligenceSnapshot("missing") === undefined, "Get missing");
  console.log("PASS Get");

  createIntelligenceSnapshot({
    snapshotId: "snap-wp48-2",
    version: "v2",
  });
  const all = listIntelligenceSnapshots();
  assert(all.length === 2, "List all");
  const byContext = listIntelligenceSnapshots({
    contextId: context.contextId,
  });
  assert(byContext.length === 2, "List by contextId");
  const byVersion = listIntelligenceSnapshots({ version: "v1" });
  assert(byVersion.length === 1, "List by version");
  assert(byVersion[0]?.snapshotId === "snap-wp48-1", "List version id");
  console.log("PASS List");

  resetAll();
  console.log("");
  console.log("PASS FEAT-50 Intelligence Snapshot");
  console.log("WP-48 verification complete");
}

main();
