/**
 * WP-24 / FEAT-30 — Customer Registry verification.
 * Register / Get / List / Exists (in-memory, no DB).
 */
import {
  clearCustomers,
  CUSTOMER_REGISTRY_CAPABILITY,
  existsCustomer,
  FEAT_30_ID,
  getCustomer,
  listCustomers,
  registerCustomer,
} from "../lib/post-launch";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== WP-24 FEAT-30 / Customer Registry ===");

  clearCustomers();

  const created = registerCustomer({
    customerId: "cust-wp24-1",
    name: "Ada Customer",
    organization: "Org WP24",
    email: "ada@wp24.example",
    status: "ACTIVE",
  });

  assert(FEAT_30_ID === "FEAT-30", "FEAT-30");
  assert(
    CUSTOMER_REGISTRY_CAPABILITY === "CustomerRegistry",
    "CustomerRegistry",
  );
  assert(created.customerId === "cust-wp24-1", "Register customerId");
  assert(created.name === "Ada Customer", "Register name");
  assert(created.organization === "Org WP24", "Register organization");
  assert(created.email === "ada@wp24.example", "Register email");
  assert(created.status === "ACTIVE", "Register status");
  assert(created.createdAt.includes("T"), "Register createdAt");
  assert(created.updatedAt.includes("T"), "Register updatedAt");
  console.log("PASS Register");

  const got = getCustomer("cust-wp24-1");
  assert(got !== undefined, "Get found");
  assert(got?.customerId === "cust-wp24-1", "Get customerId");
  assert(got?.email === "ada@wp24.example", "Get email");
  assert(getCustomer("missing") === undefined, "Get missing");
  console.log("PASS Get");

  registerCustomer({
    name: "Bob Customer",
    organization: "Org WP24-B",
    email: "bob@wp24.example",
    status: "INACTIVE",
  });

  const all = listCustomers();
  assert(all.length === 2, "List all");
  const active = listCustomers({ status: "ACTIVE" });
  assert(active.length === 1, "List ACTIVE");
  assert(active[0]?.customerId === "cust-wp24-1", "List ACTIVE id");
  const byOrg = listCustomers({ organization: "Org WP24-B" });
  assert(byOrg.length === 1, "List organization");
  console.log("PASS List");

  assert(existsCustomer("cust-wp24-1") === true, "Exists true");
  assert(existsCustomer("missing") === false, "Exists false");
  console.log("PASS Exists");

  let dupRejected = false;
  try {
    registerCustomer({
      customerId: "cust-wp24-1",
      name: "Dup",
      organization: "Org",
      email: "dup@wp24.example",
    });
  } catch {
    dupRejected = true;
  }
  assert(dupRejected, "rejects duplicate customerId");

  clearCustomers();
  console.log("");
  console.log("PASS FEAT-30 Customer Registry");
  console.log("WP-24 verification complete");
}

main();
