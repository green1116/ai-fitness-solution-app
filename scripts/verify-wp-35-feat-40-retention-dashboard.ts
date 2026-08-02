/**
 * WP-35 / FEAT-40 — Retention Dashboard verification.
 * Build / Get (reuses Registry→ExpansionQueue).
 */
import {
  addExpansion,
  addRenewal,
  buildCustomerAnalytics,
  buildCustomerSuccessDashboard,
  buildRetentionDashboard,
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
  clearSupportCases,
  createCustomerProfile,
  FEAT_40_ID,
  getRetentionDashboard,
  openSupportCase,
  recordCustomerEngagement,
  registerCustomer,
  RETENTION_DASHBOARD_CAPABILITY,
  setCustomerHealth,
  setCustomerLifecycleStage,
  updateExpansionStatus,
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
    email: `${customerId}@wp35.example`,
  });
  createCustomerProfile({ customerId, displayName: name });
  setCustomerLifecycleStage({ customerId, stage: "ACTIVE" });
  setCustomerHealth({ customerId, score: 80, level: "GOOD" });
  recordCustomerEngagement({
    customerId,
    type: "CALL",
    notes: "retention seed",
  });
}

function main() {
  console.log("=== WP-35 FEAT-40 / Retention Dashboard ===");

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

  seedFullCustomer("cust-wp35-1", "Ada");
  seedFullCustomer("cust-wp35-2", "Bob");
  seedFullCustomer("cust-wp35-3", "Cara");
  seedFullCustomer("cust-wp35-4", "Dan");
  seedFullCustomer("cust-wp35-5", "Eve");
  buildCustomerSuccessDashboard();
  buildCustomerAnalytics();
  openSupportCase({
    caseId: "case-wp35-1",
    customerId: "cust-wp35-1",
    subject: "Retention help",
  });

  addRenewal({
    customerId: "cust-wp35-1",
    renewalDate: "2026-12-01",
    value: 10000,
  });
  addRenewal({
    customerId: "cust-wp35-2",
    renewalDate: "2026-11-01",
    value: 8000,
  });
  addRenewal({
    customerId: "cust-wp35-3",
    renewalDate: "2026-10-01",
    value: 6000,
  });
  updateRenewalStatus({
    customerId: "cust-wp35-1",
    renewalStatus: "RENEWED",
  });
  updateRenewalStatus({
    customerId: "cust-wp35-2",
    renewalStatus: "LOST",
  });
  // cust-wp35-3 remains OPEN

  addExpansion({
    customerId: "cust-wp35-4",
    expansionDate: "2026-09-01",
    value: 5000,
  });
  addExpansion({
    customerId: "cust-wp35-5",
    expansionDate: "2026-08-01",
    value: 7000,
  });
  updateExpansionStatus({
    customerId: "cust-wp35-5",
    expansionStatus: "WON",
  });
  // cust-wp35-4 remains OPEN

  const built = buildRetentionDashboard();
  assert(FEAT_40_ID === "FEAT-40", "FEAT-40");
  assert(
    RETENTION_DASHBOARD_CAPABILITY === "RetentionDashboard",
    "RetentionDashboard",
  );
  assert(built.totalRenewals === 3, "totalRenewals");
  assert(built.renewedCustomers === 1, "renewedCustomers");
  assert(built.lostCustomers === 1, "lostCustomers");
  assert(built.openRenewals === 1, "openRenewals");
  assert(built.openExpansions === 1, "openExpansions");
  assert(built.wonExpansions === 1, "wonExpansions");
  assert(built.retentionRate === 0.5, "retentionRate");
  assert(built.updatedAt.includes("T"), "updatedAt");
  console.log("PASS Build");

  const got = getRetentionDashboard();
  assert(got.totalRenewals === built.totalRenewals, "Get totalRenewals");
  assert(got.retentionRate === built.retentionRate, "Get retentionRate");
  assert(got.updatedAt === built.updatedAt, "Get cached updatedAt");
  console.log("PASS Get");

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
  console.log("PASS FEAT-40 Retention Dashboard");
  console.log("WP-35 verification complete");
}

main();
