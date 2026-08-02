/**
 * WP-30 / FEAT-36 — Customer Success Dashboard verification.
 * Build / Get (aggregates Registry→SupportCase).
 */
import {
  buildCustomerSuccessDashboard,
  clearCustomerEngagements,
  clearCustomerHealth,
  clearCustomerLifecycles,
  clearCustomerProfiles,
  clearCustomers,
  clearCustomerSuccessDashboard,
  clearSupportCases,
  createCustomerProfile,
  CUSTOMER_SUCCESS_DASHBOARD_CAPABILITY,
  FEAT_36_ID,
  getCustomerSuccessDashboard,
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
  status?: "ACTIVE" | "INACTIVE";
  stage: "ACTIVE" | "RISK";
  health: "GOOD" | "WARNING";
  score: number;
}) {
  registerCustomer({
    customerId: input.customerId,
    name: input.name,
    organization: `Org ${input.customerId}`,
    email: `${input.customerId}@wp30.example`,
    status: input.status ?? "ACTIVE",
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
    notes: "dashboard seed",
  });
}

function main() {
  console.log("=== WP-30 FEAT-36 / Customer Success Dashboard ===");

  clearCustomerSuccessDashboard();
  clearSupportCases();
  clearCustomerEngagements();
  clearCustomerHealth();
  clearCustomerLifecycles();
  clearCustomerProfiles();
  clearCustomers();

  seedFullCustomer({
    customerId: "cust-wp30-1",
    name: "Ada",
    stage: "ACTIVE",
    health: "GOOD",
    score: 90,
  });
  seedFullCustomer({
    customerId: "cust-wp30-2",
    name: "Bob",
    stage: "RISK",
    health: "WARNING",
    score: 45,
  });
  openSupportCase({
    caseId: "case-wp30-1",
    customerId: "cust-wp30-1",
    subject: "Help",
    priority: "MEDIUM",
  });

  const built = buildCustomerSuccessDashboard();
  assert(FEAT_36_ID === "FEAT-36", "FEAT-36");
  assert(
    CUSTOMER_SUCCESS_DASHBOARD_CAPABILITY === "CustomerSuccessDashboard",
    "CustomerSuccessDashboard",
  );
  assert(built.totalCustomers === 2, "totalCustomers");
  assert(built.activeCustomers === 2, "activeCustomers");
  assert(built.atRiskCustomers === 1, "atRiskCustomers");
  assert(built.healthyCustomers === 1, "healthyCustomers");
  assert(built.openSupportCases === 1, "openSupportCases");
  assert(built.recentEngagements === 2, "recentEngagements");
  assert(built.updatedAt.includes("T"), "updatedAt");
  console.log("PASS Build");

  const got = getCustomerSuccessDashboard();
  assert(got.totalCustomers === built.totalCustomers, "Get totalCustomers");
  assert(got.updatedAt === built.updatedAt, "Get cached updatedAt");
  console.log("PASS Get");

  clearCustomerSuccessDashboard();
  clearSupportCases();
  clearCustomerEngagements();
  clearCustomerHealth();
  clearCustomerLifecycles();
  clearCustomerProfiles();
  clearCustomers();
  console.log("");
  console.log("PASS FEAT-36 Customer Success Dashboard");
  console.log("WP-30 verification complete");
}

main();
