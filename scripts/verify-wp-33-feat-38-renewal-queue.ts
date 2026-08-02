/**
 * WP-33 / FEAT-38 — Renewal Queue verification.
 * Add / Get / List / Update Status (Registry→Analytics stack).
 */
import {
  addRenewal,
  buildCustomerAnalytics,
  buildCustomerSuccessDashboard,
  clearCustomerAnalytics,
  clearCustomerEngagements,
  clearCustomerHealth,
  clearCustomerLifecycles,
  clearCustomerProfiles,
  clearCustomers,
  clearCustomerSuccessDashboard,
  clearRenewals,
  clearSupportCases,
  createCustomerProfile,
  FEAT_38_ID,
  getRenewal,
  listRenewals,
  recordCustomerEngagement,
  registerCustomer,
  RENEWAL_QUEUE_CAPABILITY,
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
    email: `${customerId}@wp33.example`,
  });
  createCustomerProfile({ customerId, displayName: name });
  setCustomerLifecycleStage({ customerId, stage: "ACTIVE" });
  setCustomerHealth({ customerId, score: 80, level: "GOOD" });
  recordCustomerEngagement({ customerId, type: "MEETING", notes: "renewal seed" });
}

function main() {
  console.log("=== WP-33 FEAT-38 / Renewal Queue ===");

  clearRenewals();
  clearCustomerAnalytics();
  clearCustomerSuccessDashboard();
  clearSupportCases();
  clearCustomerEngagements();
  clearCustomerHealth();
  clearCustomerLifecycles();
  clearCustomerProfiles();
  clearCustomers();

  seedFullCustomer("cust-wp33-1", "Ada");
  buildCustomerSuccessDashboard();
  buildCustomerAnalytics();

  const added = addRenewal({
    customerId: "cust-wp33-1",
    renewalDate: "2026-12-31",
    value: 12000,
  });
  assert(FEAT_38_ID === "FEAT-38", "FEAT-38");
  assert(RENEWAL_QUEUE_CAPABILITY === "RenewalQueue", "RenewalQueue");
  assert(added.customerId === "cust-wp33-1", "Add customerId");
  assert(added.renewalStatus === "OPEN", "Add status OPEN");
  assert(added.renewalDate === "2026-12-31", "Add renewalDate");
  assert(added.value === 12000, "Add value");
  assert(added.updatedAt.includes("T"), "Add updatedAt");
  console.log("PASS Add");

  const got = getRenewal("cust-wp33-1");
  assert(got !== undefined, "Get found");
  assert(got?.value === 12000, "Get value");
  assert(getRenewal("missing") === undefined, "Get missing");
  console.log("PASS Get");

  seedFullCustomer("cust-wp33-2", "Bob");
  buildCustomerSuccessDashboard();
  buildCustomerAnalytics();
  addRenewal({
    customerId: "cust-wp33-2",
    renewalDate: "2026-11-01",
    value: 8000,
    renewalStatus: "CONTACTED",
  });

  const all = listRenewals();
  assert(all.length === 2, "List all");
  const open = listRenewals({ renewalStatus: "OPEN" });
  assert(open.length === 1, "List OPEN");
  assert(open[0]?.customerId === "cust-wp33-1", "List OPEN id");
  console.log("PASS List");

  const updated = updateRenewalStatus({
    customerId: "cust-wp33-1",
    renewalStatus: "NEGOTIATING",
  });
  assert(updated.renewalStatus === "NEGOTIATING", "Update NEGOTIATING");
  const renewed = updateRenewalStatus({
    customerId: "cust-wp33-1",
    renewalStatus: "RENEWED",
  });
  assert(renewed.renewalStatus === "RENEWED", "Update RENEWED");
  console.log("PASS Update Status");

  let noEngagementRejected = false;
  try {
    registerCustomer({
      customerId: "cust-wp33-3",
      name: "No Eng",
      organization: "Org",
      email: "ne@wp33.example",
    });
    createCustomerProfile({
      customerId: "cust-wp33-3",
      displayName: "No Eng",
    });
    setCustomerLifecycleStage({
      customerId: "cust-wp33-3",
      stage: "ACTIVE",
    });
    setCustomerHealth({
      customerId: "cust-wp33-3",
      score: 70,
      level: "GOOD",
    });
    addRenewal({
      customerId: "cust-wp33-3",
      renewalDate: "2027-01-01",
      value: 1000,
    });
  } catch {
    noEngagementRejected = true;
  }
  assert(noEngagementRejected, "rejects missing engagement");

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
  console.log("PASS FEAT-38 Renewal Queue");
  console.log("WP-33 verification complete");
}

main();
