/**
 * WP-25 / FEAT-31 — Customer Profile verification.
 * Create / Get / Update / List (built on Customer Registry).
 */
import {
  clearCustomerProfiles,
  clearCustomers,
  createCustomerProfile,
  CUSTOMER_PROFILE_CAPABILITY,
  FEAT_31_ID,
  getCustomerProfile,
  listCustomerProfiles,
  registerCustomer,
  updateCustomerProfile,
} from "../lib/post-launch";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== WP-25 FEAT-31 / Customer Profile ===");

  clearCustomerProfiles();
  clearCustomers();

  registerCustomer({
    customerId: "cust-wp25-1",
    name: "Ada Customer",
    organization: "Org WP25",
    email: "ada@wp25.example",
  });

  const created = createCustomerProfile({
    customerId: "cust-wp25-1",
    displayName: "Ada Fitness",
    industry: "Fitness",
    companySize: "50-100",
    country: "SG",
    timezone: "Asia/Singapore",
    contactName: "Ada",
    contactPhone: "+65-1000",
    notes: "initial",
  });

  assert(FEAT_31_ID === "FEAT-31", "FEAT-31");
  assert(
    CUSTOMER_PROFILE_CAPABILITY === "CustomerProfile",
    "CustomerProfile",
  );
  assert(created.customerId === "cust-wp25-1", "Create customerId");
  assert(created.displayName === "Ada Fitness", "Create displayName");
  assert(created.industry === "Fitness", "Create industry");
  assert(created.updatedAt.includes("T"), "Create updatedAt");
  console.log("PASS Create");

  const got = getCustomerProfile("cust-wp25-1");
  assert(got !== undefined, "Get found");
  assert(got?.displayName === "Ada Fitness", "Get displayName");
  assert(getCustomerProfile("missing") === undefined, "Get missing");
  console.log("PASS Get");

  const beforeUpdate = got!.updatedAt;
  const updated = updateCustomerProfile({
    customerId: "cust-wp25-1",
    notes: "updated-note",
    companySize: "100-200",
  });
  assert(updated.notes === "updated-note", "Update notes");
  assert(updated.companySize === "100-200", "Update companySize");
  assert(updated.displayName === "Ada Fitness", "Update keeps displayName");
  assert(updated.updatedAt >= beforeUpdate, "Update updatedAt");
  console.log("PASS Update");

  registerCustomer({
    customerId: "cust-wp25-2",
    name: "Bob Customer",
    organization: "Org WP25-B",
    email: "bob@wp25.example",
  });
  createCustomerProfile({
    customerId: "cust-wp25-2",
    displayName: "Bob Gym",
    industry: "Hospitality",
    country: "US",
  });

  const all = listCustomerProfiles();
  assert(all.length === 2, "List all");
  const byIndustry = listCustomerProfiles({ industry: "Fitness" });
  assert(byIndustry.length === 1, "List industry");
  assert(byIndustry[0]?.customerId === "cust-wp25-1", "List industry id");
  const byCountry = listCustomerProfiles({ country: "US" });
  assert(byCountry.length === 1, "List country");
  console.log("PASS List");

  let unregisteredRejected = false;
  try {
    createCustomerProfile({
      customerId: "cust-missing",
      displayName: "Ghost",
    });
  } catch {
    unregisteredRejected = true;
  }
  assert(unregisteredRejected, "rejects unregistered customer");

  clearCustomerProfiles();
  clearCustomers();
  console.log("");
  console.log("PASS FEAT-31 Customer Profile");
  console.log("WP-25 verification complete");
}

main();
