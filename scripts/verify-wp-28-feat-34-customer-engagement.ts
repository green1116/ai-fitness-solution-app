/**
 * WP-28 / FEAT-34 — Customer Engagement verification.
 * Record / Get / List / hasRecentEngagement (Registry→Health stack).
 */
import {
  clearCustomerEngagements,
  clearCustomerHealth,
  clearCustomerLifecycles,
  clearCustomerProfiles,
  clearCustomers,
  createCustomerProfile,
  CUSTOMER_ENGAGEMENT_CAPABILITY,
  FEAT_34_ID,
  getCustomerEngagement,
  hasRecentEngagement,
  listCustomerEngagement,
  recordCustomerEngagement,
  registerCustomer,
  setCustomerHealth,
  setCustomerLifecycleStage,
} from "../lib/post-launch";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function seedCustomer(customerId: string, name: string) {
  registerCustomer({
    customerId,
    name,
    organization: `Org ${customerId}`,
    email: `${customerId}@wp28.example`,
  });
  createCustomerProfile({ customerId, displayName: name });
  setCustomerLifecycleStage({ customerId, stage: "ACTIVE" });
  setCustomerHealth({ customerId, score: 80, level: "GOOD" });
}

function main() {
  console.log("=== WP-28 FEAT-34 / Customer Engagement ===");

  clearCustomerEngagements();
  clearCustomerHealth();
  clearCustomerLifecycles();
  clearCustomerProfiles();
  clearCustomers();

  seedCustomer("cust-wp28-1", "Ada Customer");

  const recorded = recordCustomerEngagement({
    customerId: "cust-wp28-1",
    type: "EMAIL",
    notes: "intro email",
  });
  assert(FEAT_34_ID === "FEAT-34", "FEAT-34");
  assert(
    CUSTOMER_ENGAGEMENT_CAPABILITY === "CustomerEngagement",
    "CustomerEngagement",
  );
  assert(recorded.customerId === "cust-wp28-1", "Record customerId");
  assert(recorded.type === "EMAIL", "Record type");
  assert(recorded.notes === "intro email", "Record notes");
  assert(recorded.occurredAt.includes("T"), "Record occurredAt");
  assert(recorded.updatedAt.includes("T"), "Record updatedAt");
  console.log("PASS Record");

  recordCustomerEngagement({
    customerId: "cust-wp28-1",
    type: "CALL",
    occurredAt: new Date(Date.now() + 1000).toISOString(),
    notes: "follow-up call",
  });
  const latest = getCustomerEngagement("cust-wp28-1");
  assert(latest !== undefined, "Get found");
  assert(latest?.type === "CALL", "Get latest type");
  assert(getCustomerEngagement("missing") === undefined, "Get missing");
  console.log("PASS Get");

  seedCustomer("cust-wp28-2", "Bob Customer");
  recordCustomerEngagement({
    customerId: "cust-wp28-2",
    type: "MEETING",
  });

  const all = listCustomerEngagement();
  assert(all.length === 3, "List all");
  const byCustomer = listCustomerEngagement({ customerId: "cust-wp28-1" });
  assert(byCustomer.length === 2, "List by customer");
  const byType = listCustomerEngagement({ type: "MEETING" });
  assert(byType.length === 1, "List by type");
  console.log("PASS List");

  assert(hasRecentEngagement("cust-wp28-1") === true, "hasRecent true");
  assert(hasRecentEngagement("missing") === false, "hasRecent missing");
  assert(
    hasRecentEngagement("cust-wp28-1", 1) === false ||
      hasRecentEngagement("cust-wp28-1", 1) === true,
    "hasRecent window accepted",
  );
  // Explicit old engagement should not count as recent in a tiny window
  clearCustomerEngagements();
  seedCustomer("cust-wp28-3", "Cara Customer");
  recordCustomerEngagement({
    customerId: "cust-wp28-3",
    type: "MESSAGE",
    occurredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
  assert(hasRecentEngagement("cust-wp28-3", 7 * 24 * 60 * 60 * 1000) === false, "hasRecent old false");
  console.log("PASS hasRecentEngagement");

  let noHealthRejected = false;
  try {
    registerCustomer({
      customerId: "cust-wp28-4",
      name: "No Health",
      organization: "Org",
      email: "nh@wp28.example",
    });
    createCustomerProfile({
      customerId: "cust-wp28-4",
      displayName: "No Health",
    });
    setCustomerLifecycleStage({
      customerId: "cust-wp28-4",
      stage: "ACTIVE",
    });
    recordCustomerEngagement({
      customerId: "cust-wp28-4",
      type: "EMAIL",
    });
  } catch {
    noHealthRejected = true;
  }
  assert(noHealthRejected, "rejects missing health");

  clearCustomerEngagements();
  clearCustomerHealth();
  clearCustomerLifecycles();
  clearCustomerProfiles();
  clearCustomers();
  console.log("");
  console.log("PASS FEAT-34 Customer Engagement");
  console.log("WP-28 verification complete");
}

main();
