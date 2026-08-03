/**
 * WP-40 / FEAT-44 — Optimization Dashboard verification.
 * Build / Get (reuses Customer / Retention / Expansion Insights).
 */
import {
  addExpansion,
  addRenewal,
  buildOptimizationDashboard,
  clearCustomerAnalytics,
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
  createCustomerProfile,
  FEAT_44_ID,
  getOptimizationDashboard,
  OPTIMIZATION_DASHBOARD_CAPABILITY,
  recordCustomerEngagement,
  registerCustomer,
  setCustomerHealth,
  setCustomerLifecycleStage,
  updateExpansionStatus,
  updateRenewalStatus,
} from "../lib/post-launch";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function seedFullCustomer(input: {
  customerId: string;
  name: string;
  stage: "ACTIVE" | "RISK" | "CHURNED";
  health: "GOOD" | "WARNING";
  score: number;
}) {
  registerCustomer({
    customerId: input.customerId,
    name: input.name,
    organization: `Org ${input.customerId}`,
    email: `${input.customerId}@wp40.example`,
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
    notes: "optimization seed",
  });
}

function main() {
  console.log("=== WP-40 FEAT-44 / Optimization Dashboard ===");

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

  // 2 healthy of 4 total → customerScore = 50
  seedFullCustomer({
    customerId: "cust-wp40-1",
    name: "Ada",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  seedFullCustomer({
    customerId: "cust-wp40-2",
    name: "Bob",
    stage: "ACTIVE",
    health: "GOOD",
    score: 85,
  });
  seedFullCustomer({
    customerId: "cust-wp40-3",
    name: "Cara",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedFullCustomer({
    customerId: "cust-wp40-4",
    name: "Dan",
    stage: "CHURNED",
    health: "WARNING",
    score: 20,
  });

  addRenewal({
    customerId: "cust-wp40-1",
    renewalDate: "2026-12-01",
    value: 10000,
  });
  addRenewal({
    customerId: "cust-wp40-2",
    renewalDate: "2026-11-01",
    value: 8000,
  });
  updateRenewalStatus({
    customerId: "cust-wp40-1",
    renewalStatus: "RENEWED",
  });
  updateRenewalStatus({
    customerId: "cust-wp40-2",
    renewalStatus: "LOST",
  });
  // retentionRate = 0.5 → retentionScore = 50

  addExpansion({
    customerId: "cust-wp40-3",
    expansionDate: "2026-10-01",
    value: 5000,
  });
  addExpansion({
    customerId: "cust-wp40-4",
    expansionDate: "2026-09-01",
    value: 7000,
  });
  updateExpansionStatus({
    customerId: "cust-wp40-3",
    expansionStatus: "WON",
  });
  updateExpansionStatus({
    customerId: "cust-wp40-4",
    expansionStatus: "LOST",
  });
  // expansionRate = 0.5 → expansionScore = 50
  // optimizationScore = round((50+50+50)/3) = 50

  const built = buildOptimizationDashboard();
  assert(FEAT_44_ID === "FEAT-44", "FEAT-44");
  assert(
    OPTIMIZATION_DASHBOARD_CAPABILITY === "OptimizationDashboard",
    "OptimizationDashboard",
  );
  assert(built.customerInsights.totalCustomers === 4, "customerInsights");
  assert(built.customerInsights.healthyCustomers === 2, "healthyCustomers");
  assert(built.retentionInsights.retentionRate === 0.5, "retentionInsights");
  assert(built.expansionInsights.expansionRate === 0.5, "expansionInsights");
  assert(built.optimizationScore === 50, "optimizationScore");
  assert(built.updatedAt.includes("T"), "updatedAt");
  console.log("PASS Build");

  const got = getOptimizationDashboard();
  assert(
    got.optimizationScore === built.optimizationScore,
    "Get optimizationScore",
  );
  assert(
    got.customerInsights.totalCustomers ===
      built.customerInsights.totalCustomers,
    "Get nested customerInsights",
  );
  assert(got.updatedAt === built.updatedAt, "Get cached updatedAt");
  console.log("PASS Get");

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
  console.log("");
  console.log("PASS FEAT-44 Optimization Dashboard");
  console.log("WP-40 verification complete");
}

main();
