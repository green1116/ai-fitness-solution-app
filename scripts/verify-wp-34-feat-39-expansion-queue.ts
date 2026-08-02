/**
 * WP-34 / FEAT-39 — Expansion Queue verification.
 * Add / Get / List / Update Status (Registry→RenewalQueue stack).
 */
import {
  addExpansion,
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
  clearExpansions,
  clearRenewals,
  clearSupportCases,
  createCustomerProfile,
  EXPANSION_QUEUE_CAPABILITY,
  FEAT_39_ID,
  getExpansion,
  listExpansions,
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
    email: `${customerId}@wp34.example`,
  });
  createCustomerProfile({ customerId, displayName: name });
  setCustomerLifecycleStage({ customerId, stage: "ACTIVE" });
  setCustomerHealth({ customerId, score: 85, level: "GOOD" });
  recordCustomerEngagement({
    customerId,
    type: "MESSAGE",
    notes: "expansion seed",
  });
}

function main() {
  console.log("=== WP-34 FEAT-39 / Expansion Queue ===");

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

  seedFullCustomer("cust-wp34-1", "Ada");
  buildCustomerSuccessDashboard();
  buildCustomerAnalytics();
  addRenewal({
    customerId: "cust-wp34-1",
    renewalDate: "2026-12-01",
    value: 5000,
  });

  const added = addExpansion({
    customerId: "cust-wp34-1",
    expansionDate: "2026-10-15",
    value: 15000,
  });
  assert(FEAT_39_ID === "FEAT-39", "FEAT-39");
  assert(EXPANSION_QUEUE_CAPABILITY === "ExpansionQueue", "ExpansionQueue");
  assert(added.customerId === "cust-wp34-1", "Add customerId");
  assert(added.expansionStatus === "OPEN", "Add status OPEN");
  assert(added.expansionDate === "2026-10-15", "Add expansionDate");
  assert(added.value === 15000, "Add value");
  assert(added.updatedAt.includes("T"), "Add updatedAt");
  console.log("PASS Add");

  const got = getExpansion("cust-wp34-1");
  assert(got !== undefined, "Get found");
  assert(got?.value === 15000, "Get value");
  assert(getExpansion("missing") === undefined, "Get missing");
  console.log("PASS Get");

  seedFullCustomer("cust-wp34-2", "Bob");
  buildCustomerSuccessDashboard();
  buildCustomerAnalytics();
  addExpansion({
    customerId: "cust-wp34-2",
    expansionDate: "2026-11-20",
    value: 9000,
    expansionStatus: "CONTACTED",
  });

  const all = listExpansions();
  assert(all.length === 2, "List all");
  const open = listExpansions({ expansionStatus: "OPEN" });
  assert(open.length === 1, "List OPEN");
  assert(open[0]?.customerId === "cust-wp34-1", "List OPEN id");
  console.log("PASS List");

  const updated = updateExpansionStatus({
    customerId: "cust-wp34-1",
    expansionStatus: "NEGOTIATING",
  });
  assert(updated.expansionStatus === "NEGOTIATING", "Update NEGOTIATING");
  const won = updateExpansionStatus({
    customerId: "cust-wp34-1",
    expansionStatus: "WON",
  });
  assert(won.expansionStatus === "WON", "Update WON");
  console.log("PASS Update Status");

  let noEngagementRejected = false;
  try {
    registerCustomer({
      customerId: "cust-wp34-3",
      name: "No Eng",
      organization: "Org",
      email: "ne@wp34.example",
    });
    createCustomerProfile({
      customerId: "cust-wp34-3",
      displayName: "No Eng",
    });
    setCustomerLifecycleStage({
      customerId: "cust-wp34-3",
      stage: "ACTIVE",
    });
    setCustomerHealth({
      customerId: "cust-wp34-3",
      score: 70,
      level: "GOOD",
    });
    addExpansion({
      customerId: "cust-wp34-3",
      expansionDate: "2027-01-01",
      value: 1000,
    });
  } catch {
    noEngagementRejected = true;
  }
  assert(noEngagementRejected, "rejects missing engagement");

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
  console.log("PASS FEAT-39 Expansion Queue");
  console.log("WP-34 verification complete");
}

main();
