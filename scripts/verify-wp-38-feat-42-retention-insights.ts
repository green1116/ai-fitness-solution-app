/**
 * WP-38 / FEAT-42 — Retention Insights verification.
 * Build / Get (reuses RetentionDashboard + RenewalQueue).
 */
import {
  addRenewal,
  buildCustomerAnalytics,
  buildCustomerSuccessDashboard,
  buildRetentionInsights,
  clearCustomerAnalytics,
  clearCustomerEngagements,
  clearCustomerHealth,
  clearCustomerLifecycles,
  clearCustomerProfiles,
  clearCustomers,
  clearCustomerSuccessDashboard,
  clearExpansions,
  clearRenewals,
  clearRetentionDashboard,
  clearRetentionInsights,
  clearSupportCases,
  createCustomerProfile,
  FEAT_42_ID,
  getRetentionInsights,
  recordCustomerEngagement,
  registerCustomer,
  RETENTION_INSIGHTS_CAPABILITY,
  setCustomerHealth,
  setCustomerLifecycleStage,
  updateRenewalStatus,
} from "../lib/post-launch";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function seedFullCustomer(customerId: string, name: string) {
  registerCustomer({
    customerId,
    name,
    organization: `Org ${customerId}`,
    email: `${customerId}@wp38.example`,
  });
  createCustomerProfile({ customerId, displayName: name });
  setCustomerLifecycleStage({ customerId, stage: "ACTIVE" });
  setCustomerHealth({ customerId, score: 80, level: "GOOD" });
  recordCustomerEngagement({
    customerId,
    type: "CALL",
    notes: "retention insights seed",
  });
}

function main() {
  console.log("=== WP-38 FEAT-42 / Retention Insights ===");

  clearRetentionInsights();
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

  seedFullCustomer("cust-wp38-1", "Ada");
  seedFullCustomer("cust-wp38-2", "Bob");
  seedFullCustomer("cust-wp38-3", "Cara");
  buildCustomerSuccessDashboard();
  buildCustomerAnalytics();

  addRenewal({
    customerId: "cust-wp38-1",
    renewalDate: "2026-12-01",
    value: 10000,
  });
  addRenewal({
    customerId: "cust-wp38-2",
    renewalDate: "2026-11-01",
    value: 8000,
  });
  addRenewal({
    customerId: "cust-wp38-3",
    renewalDate: "2026-10-01",
    value: 6000,
  });
  updateRenewalStatus({
    customerId: "cust-wp38-1",
    renewalStatus: "RENEWED",
  });
  updateRenewalStatus({
    customerId: "cust-wp38-2",
    renewalStatus: "LOST",
  });
  // cust-wp38-3 remains OPEN

  const built = buildRetentionInsights();
  assert(FEAT_42_ID === "FEAT-42", "FEAT-42");
  assert(
    RETENTION_INSIGHTS_CAPABILITY === "RetentionInsights",
    "RetentionInsights",
  );
  assert(built.renewedCustomers === 1, "renewedCustomers");
  assert(built.lostCustomers === 1, "lostCustomers");
  assert(built.openRenewals === 1, "openRenewals");
  assert(built.retentionRate === 0.5, "retentionRate");
  assert(built.updatedAt.includes("T"), "updatedAt");
  console.log("PASS Build");

  const got = getRetentionInsights();
  assert(got.renewedCustomers === built.renewedCustomers, "Get renewed");
  assert(got.retentionRate === built.retentionRate, "Get retentionRate");
  assert(got.updatedAt === built.updatedAt, "Get cached updatedAt");
  console.log("PASS Get");

  clearRetentionInsights();
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
  console.log("PASS FEAT-42 Retention Insights");
  console.log("WP-38 verification complete");
}

main();
