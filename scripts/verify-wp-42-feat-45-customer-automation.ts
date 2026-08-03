/**
 * WP-42 / FEAT-45 — Customer Automation verification.
 * Create / Get / List / Enable / Disable (reuses Insights→OptimizationDashboard).
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
  createCustomerAutomation,
  createCustomerProfile,
  CUSTOMER_AUTOMATION_CAPABILITY,
  disableCustomerAutomation,
  enableCustomerAutomation,
  FEAT_45_ID,
  getCustomerAutomation,
  listCustomerAutomation,
  recordCustomerEngagement,
  registerCustomer,
  setCustomerHealth,
  setCustomerLifecycleStage,
} from "../lib/post-launch";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function seedFullCustomer(customerId: string, name: string) {
  registerCustomer({
    customerId,
    name,
    organization: `Org ${customerId}`,
    email: `${customerId}@wp42.example`,
  });
  createCustomerProfile({ customerId, displayName: name });
  setCustomerLifecycleStage({ customerId, stage: "ACTIVE" });
  setCustomerHealth({ customerId, score: 80, level: "GOOD" });
  recordCustomerEngagement({
    customerId,
    type: "EMAIL",
    notes: "automation seed",
  });
}

function resetAll() {
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
  console.log("=== WP-42 FEAT-45 / Customer Automation ===");

  resetAll();
  seedFullCustomer("cust-wp42-1", "Ada");
  seedFullCustomer("cust-wp42-2", "Bob");

  const created = createCustomerAutomation({
    automationId: "auto-wp42-1",
    customerId: "cust-wp42-1",
    trigger: "AT_RISK",
    action: "CREATE_TASK",
  });
  assert(FEAT_45_ID === "FEAT-45", "FEAT-45");
  assert(
    CUSTOMER_AUTOMATION_CAPABILITY === "CustomerAutomation",
    "CustomerAutomation",
  );
  assert(created.automationId === "auto-wp42-1", "Create automationId");
  assert(created.customerId === "cust-wp42-1", "Create customerId");
  assert(created.trigger === "AT_RISK", "Create trigger");
  assert(created.action === "CREATE_TASK", "Create action");
  assert(created.enabled === true, "Create enabled default");
  assert(created.updatedAt.includes("T"), "Create updatedAt");
  console.log("PASS Create");

  const got = getCustomerAutomation("auto-wp42-1");
  assert(got !== undefined, "Get found");
  assert(got?.trigger === "AT_RISK", "Get trigger");
  assert(getCustomerAutomation("missing") === undefined, "Get missing");
  console.log("PASS Get");

  createCustomerAutomation({
    automationId: "auto-wp42-2",
    customerId: "cust-wp42-2",
    trigger: "RENEWAL_DUE",
    action: "SEND_NOTIFICATION",
  });
  createCustomerAutomation({
    automationId: "auto-wp42-3",
    customerId: "cust-wp42-1",
    trigger: "EXPANSION_READY",
    action: "START_WORKFLOW",
    enabled: false,
  });

  const all = listCustomerAutomation();
  assert(all.length === 3, "List all");
  const byCustomer = listCustomerAutomation({ customerId: "cust-wp42-1" });
  assert(byCustomer.length === 2, "List by customer");
  const byTrigger = listCustomerAutomation({ trigger: "RENEWAL_DUE" });
  assert(byTrigger.length === 1, "List by trigger");
  assert(byTrigger[0]?.automationId === "auto-wp42-2", "List trigger id");
  const enabledOnly = listCustomerAutomation({ enabled: true });
  assert(enabledOnly.length === 2, "List enabled");
  console.log("PASS List");

  const disabled = disableCustomerAutomation("auto-wp42-1");
  assert(disabled.enabled === false, "Disable");
  const reenabled = enableCustomerAutomation("auto-wp42-1");
  assert(reenabled.enabled === true, "Enable");
  const enabledThird = enableCustomerAutomation("auto-wp42-3");
  assert(enabledThird.enabled === true, "Enable previously disabled");
  console.log("PASS Enable/Disable");

  let missingCustomerRejected = false;
  try {
    createCustomerAutomation({
      customerId: "missing-customer",
      trigger: "AT_RISK",
      action: "CREATE_TASK",
    });
  } catch {
    missingCustomerRejected = true;
  }
  assert(missingCustomerRejected, "Reject missing customer");

  resetAll();
  console.log("");
  console.log("PASS FEAT-45 Customer Automation");
  console.log("WP-42 verification complete");
}

main();
