/**
 * WP-39 / FEAT-43 — Expansion Insights verification.
 * Build / Get (reuses RetentionDashboard + ExpansionQueue).
 */
import {
  addExpansion,
  buildCustomerAnalytics,
  buildCustomerSuccessDashboard,
  buildExpansionInsights,
  clearCustomerAnalytics,
  clearCustomerEngagements,
  clearCustomerHealth,
  clearCustomerLifecycles,
  clearCustomerProfiles,
  clearCustomers,
  clearCustomerSuccessDashboard,
  clearExpansionInsights,
  clearExpansions,
  clearRenewals,
  clearRetentionDashboard,
  clearSupportCases,
  createCustomerProfile,
  EXPANSION_INSIGHTS_CAPABILITY,
  FEAT_43_ID,
  getExpansionInsights,
  recordCustomerEngagement,
  registerCustomer,
  setCustomerHealth,
  setCustomerLifecycleStage,
  updateExpansionStatus,
} from "../lib/post-launch";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function seedFullCustomer(customerId: string, name: string) {
  registerCustomer({
    customerId,
    name,
    organization: `Org ${customerId}`,
    email: `${customerId}@wp39.example`,
  });
  createCustomerProfile({ customerId, displayName: name });
  setCustomerLifecycleStage({ customerId, stage: "ACTIVE" });
  setCustomerHealth({ customerId, score: 80, level: "GOOD" });
  recordCustomerEngagement({
    customerId,
    type: "MEETING",
    notes: "expansion insights seed",
  });
}

function main() {
  console.log("=== WP-39 FEAT-43 / Expansion Insights ===");

  clearExpansionInsights();
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

  seedFullCustomer("cust-wp39-1", "Ada");
  seedFullCustomer("cust-wp39-2", "Bob");
  seedFullCustomer("cust-wp39-3", "Cara");
  buildCustomerSuccessDashboard();
  buildCustomerAnalytics();

  addExpansion({
    customerId: "cust-wp39-1",
    expansionDate: "2026-12-01",
    value: 5000,
  });
  addExpansion({
    customerId: "cust-wp39-2",
    expansionDate: "2026-11-01",
    value: 7000,
  });
  addExpansion({
    customerId: "cust-wp39-3",
    expansionDate: "2026-10-01",
    value: 3000,
  });
  updateExpansionStatus({
    customerId: "cust-wp39-1",
    expansionStatus: "WON",
  });
  updateExpansionStatus({
    customerId: "cust-wp39-2",
    expansionStatus: "LOST",
  });
  // cust-wp39-3 remains OPEN

  const built = buildExpansionInsights();
  assert(FEAT_43_ID === "FEAT-43", "FEAT-43");
  assert(
    EXPANSION_INSIGHTS_CAPABILITY === "ExpansionInsights",
    "ExpansionInsights",
  );
  assert(built.wonExpansions === 1, "wonExpansions");
  assert(built.lostExpansions === 1, "lostExpansions");
  assert(built.openExpansions === 1, "openExpansions");
  assert(built.expansionRate === 0.5, "expansionRate");
  assert(built.updatedAt.includes("T"), "updatedAt");
  console.log("PASS Build");

  const got = getExpansionInsights();
  assert(got.wonExpansions === built.wonExpansions, "Get won");
  assert(got.expansionRate === built.expansionRate, "Get expansionRate");
  assert(got.updatedAt === built.updatedAt, "Get cached updatedAt");
  console.log("PASS Get");

  clearExpansionInsights();
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
  console.log("PASS FEAT-43 Expansion Insights");
  console.log("WP-39 verification complete");
}

main();
