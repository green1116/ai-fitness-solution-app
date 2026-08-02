/**
 * WP-26 / FEAT-32 — Customer Lifecycle verification.
 * Set Stage / Get / List / At Risk (Registry + Profile).
 */
import {
  clearCustomerLifecycles,
  clearCustomerProfiles,
  clearCustomers,
  createCustomerProfile,
  CUSTOMER_LIFECYCLE_CAPABILITY,
  FEAT_32_ID,
  getCustomerLifecycle,
  isCustomerAtRisk,
  listCustomerLifecycle,
  registerCustomer,
  setCustomerLifecycleStage,
} from "../lib/post-launch";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== WP-26 FEAT-32 / Customer Lifecycle ===");

  clearCustomerLifecycles();
  clearCustomerProfiles();
  clearCustomers();

  registerCustomer({
    customerId: "cust-wp26-1",
    name: "Ada Customer",
    organization: "Org WP26",
    email: "ada@wp26.example",
  });
  createCustomerProfile({
    customerId: "cust-wp26-1",
    displayName: "Ada Fitness",
    industry: "Fitness",
    country: "SG",
  });

  const setLead = setCustomerLifecycleStage({
    customerId: "cust-wp26-1",
    stage: "LEAD",
  });
  assert(FEAT_32_ID === "FEAT-32", "FEAT-32");
  assert(
    CUSTOMER_LIFECYCLE_CAPABILITY === "CustomerLifecycle",
    "CustomerLifecycle",
  );
  assert(setLead.stage === "LEAD", "Set Stage LEAD");
  assert(setLead.status === "OPEN", "Set Stage OPEN");
  assert(setLead.endedAt === null, "Set Stage endedAt null");
  assert(setLead.startedAt.includes("T"), "Set Stage startedAt");

  const setRisk = setCustomerLifecycleStage({
    customerId: "cust-wp26-1",
    stage: "RISK",
  });
  assert(setRisk.stage === "RISK", "Set Stage RISK");
  assert(setRisk.startedAt === setLead.startedAt, "keeps startedAt");
  console.log("PASS Set Stage");

  const got = getCustomerLifecycle("cust-wp26-1");
  assert(got !== undefined, "Get found");
  assert(got?.stage === "RISK", "Get stage");
  assert(getCustomerLifecycle("missing") === undefined, "Get missing");
  console.log("PASS Get");

  registerCustomer({
    customerId: "cust-wp26-2",
    name: "Bob Customer",
    organization: "Org WP26-B",
    email: "bob@wp26.example",
  });
  createCustomerProfile({
    customerId: "cust-wp26-2",
    displayName: "Bob Gym",
  });
  setCustomerLifecycleStage({
    customerId: "cust-wp26-2",
    stage: "ACTIVE",
  });

  const all = listCustomerLifecycle();
  assert(all.length === 2, "List all");
  const riskRows = listCustomerLifecycle({ stage: "RISK" });
  assert(riskRows.length === 1, "List RISK");
  assert(riskRows[0]?.customerId === "cust-wp26-1", "List RISK id");
  const openRows = listCustomerLifecycle({ status: "OPEN" });
  assert(openRows.length === 2, "List OPEN");
  console.log("PASS List");

  assert(isCustomerAtRisk("cust-wp26-1") === true, "At Risk true");
  assert(isCustomerAtRisk("cust-wp26-2") === false, "At Risk false");
  assert(isCustomerAtRisk("missing") === false, "At Risk missing");
  console.log("PASS At Risk");

  const churned = setCustomerLifecycleStage({
    customerId: "cust-wp26-2",
    stage: "CHURNED",
  });
  assert(churned.status === "CLOSED", "CHURNED CLOSED");
  assert(typeof churned.endedAt === "string", "CHURNED endedAt");

  let noProfileRejected = false;
  try {
    registerCustomer({
      customerId: "cust-wp26-3",
      name: "No Profile",
      organization: "Org",
      email: "noprofile@wp26.example",
    });
    setCustomerLifecycleStage({
      customerId: "cust-wp26-3",
      stage: "LEAD",
    });
  } catch {
    noProfileRejected = true;
  }
  assert(noProfileRejected, "rejects missing profile");

  clearCustomerLifecycles();
  clearCustomerProfiles();
  clearCustomers();
  console.log("");
  console.log("PASS FEAT-32 Customer Lifecycle");
  console.log("WP-26 verification complete");
}

main();
