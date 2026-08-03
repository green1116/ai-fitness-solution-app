/**
 * WP-37 / FEAT-41 — Customer Insights verification.
 * Build / Get (reuses Analytics + RetentionDashboard).
 */
import {
  buildCustomerInsights,
  clearCustomerAnalytics,
  clearCustomerEngagements,
  clearCustomerHealth,
  clearCustomerInsights,
  clearCustomerLifecycles,
  clearCustomerProfiles,
  clearCustomers,
  clearCustomerSuccessDashboard,
  clearExpansions,
  clearRenewals,
  clearRetentionDashboard,
  clearSupportCases,
  createCustomerProfile,
  CUSTOMER_INSIGHTS_CAPABILITY,
  FEAT_41_ID,
  getCustomerInsights,
  recordCustomerEngagement,
  registerCustomer,
  setCustomerHealth,
  setCustomerLifecycleStage,
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
    email: `${input.customerId}@wp37.example`,
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
    type: "EMAIL",
    notes: "insights seed",
  });
}

function main() {
  console.log("=== WP-37 FEAT-41 / Customer Insights ===");

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

  seedFullCustomer({
    customerId: "cust-wp37-1",
    name: "Ada",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  seedFullCustomer({
    customerId: "cust-wp37-2",
    name: "Bob",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedFullCustomer({
    customerId: "cust-wp37-3",
    name: "Cara",
    stage: "CHURNED",
    health: "WARNING",
    score: 20,
  });

  const built = buildCustomerInsights();
  assert(FEAT_41_ID === "FEAT-41", "FEAT-41");
  assert(
    CUSTOMER_INSIGHTS_CAPABILITY === "CustomerInsights",
    "CustomerInsights",
  );
  assert(built.totalCustomers === 3, "totalCustomers");
  assert(built.activeCustomers === 3, "activeCustomers");
  assert(built.atRiskCustomers === 1, "atRiskCustomers");
  assert(built.healthyCustomers === 1, "healthyCustomers");
  assert(built.churnedCustomers === 1, "churnedCustomers");
  assert(built.updatedAt.includes("T"), "updatedAt");
  console.log("PASS Build");

  const got = getCustomerInsights();
  assert(got.churnedCustomers === built.churnedCustomers, "Get churned");
  assert(got.healthyCustomers === built.healthyCustomers, "Get healthy");
  assert(got.updatedAt === built.updatedAt, "Get cached updatedAt");
  console.log("PASS Get");

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
  console.log("PASS FEAT-41 Customer Insights");
  console.log("WP-37 verification complete");
}

main();
