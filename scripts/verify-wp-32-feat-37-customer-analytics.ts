/**
 * WP-32 / FEAT-37 — Customer Analytics verification.
 * Build / Get (reuses Registry→Dashboard).
 */
import {
  buildCustomerAnalytics,
  clearCustomerAnalytics,
  clearCustomerEngagements,
  clearCustomerHealth,
  clearCustomerLifecycles,
  clearCustomerProfiles,
  clearCustomers,
  clearCustomerSuccessDashboard,
  clearSupportCases,
  createCustomerProfile,
  CUSTOMER_ANALYTICS_CAPABILITY,
  FEAT_37_ID,
  getCustomerAnalytics,
  openSupportCase,
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
    email: `${input.customerId}@wp32.example`,
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
    notes: "analytics seed",
  });
}

function main() {
  console.log("=== WP-32 FEAT-37 / Customer Analytics ===");

  clearCustomerAnalytics();
  clearCustomerSuccessDashboard();
  clearSupportCases();
  clearCustomerEngagements();
  clearCustomerHealth();
  clearCustomerLifecycles();
  clearCustomerProfiles();
  clearCustomers();

  seedFullCustomer({
    customerId: "cust-wp32-1",
    name: "Ada",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  seedFullCustomer({
    customerId: "cust-wp32-2",
    name: "Bob",
    stage: "RISK",
    health: "WARNING",
    score: 40,
  });
  seedFullCustomer({
    customerId: "cust-wp32-3",
    name: "Cara",
    stage: "CHURNED",
    health: "WARNING",
    score: 20,
  });
  openSupportCase({
    caseId: "case-wp32-1",
    customerId: "cust-wp32-1",
    subject: "Analytics help",
  });

  const built = buildCustomerAnalytics();
  assert(FEAT_37_ID === "FEAT-37", "FEAT-37");
  assert(
    CUSTOMER_ANALYTICS_CAPABILITY === "CustomerAnalytics",
    "CustomerAnalytics",
  );
  assert(built.totalCustomers === 3, "totalCustomers");
  assert(built.activeCustomers === 3, "activeCustomers");
  assert(built.atRiskCustomers === 1, "atRiskCustomers");
  assert(built.churnedCustomers === 1, "churnedCustomers");
  assert(built.healthyCustomers === 1, "healthyCustomers");
  assert(built.openSupportCases === 1, "openSupportCases");
  assert(built.recentEngagements === 3, "recentEngagements");
  assert(built.updatedAt.includes("T"), "updatedAt");
  console.log("PASS Build");

  const got = getCustomerAnalytics();
  assert(got.churnedCustomers === built.churnedCustomers, "Get churned");
  assert(got.updatedAt === built.updatedAt, "Get cached updatedAt");
  console.log("PASS Get");

  clearCustomerAnalytics();
  clearCustomerSuccessDashboard();
  clearSupportCases();
  clearCustomerEngagements();
  clearCustomerHealth();
  clearCustomerLifecycles();
  clearCustomerProfiles();
  clearCustomers();
  console.log("");
  console.log("PASS FEAT-37 Customer Analytics");
  console.log("WP-32 verification complete");
}

main();
