/**
 * WP-27 / FEAT-33 — Customer Health verification.
 * Set / Get / List / isHealthy (Registry + Profile + Lifecycle).
 */
import {
  clearCustomerHealth,
  clearCustomerLifecycles,
  clearCustomerProfiles,
  clearCustomers,
  createCustomerProfile,
  CUSTOMER_HEALTH_CAPABILITY,
  FEAT_33_ID,
  getCustomerHealth,
  isHealthy,
  listCustomerHealth,
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
    email: `${customerId}@wp27.example`,
  });
  createCustomerProfile({
    customerId,
    displayName: name,
  });
  setCustomerLifecycleStage({
    customerId,
    stage: "ACTIVE",
  });
}

function main() {
  console.log("=== WP-27 FEAT-33 / Customer Health ===");

  clearCustomerHealth();
  clearCustomerLifecycles();
  clearCustomerProfiles();
  clearCustomers();

  seedCustomer("cust-wp27-1", "Ada Customer");

  const set = setCustomerHealth({
    customerId: "cust-wp27-1",
    score: 88,
    level: "GOOD",
  });
  assert(FEAT_33_ID === "FEAT-33", "FEAT-33");
  assert(CUSTOMER_HEALTH_CAPABILITY === "CustomerHealth", "CustomerHealth");
  assert(set.customerId === "cust-wp27-1", "Set customerId");
  assert(set.score === 88, "Set score");
  assert(set.level === "GOOD", "Set level");
  assert(set.updatedAt.includes("T"), "Set updatedAt");
  console.log("PASS Set");

  const got = getCustomerHealth("cust-wp27-1");
  assert(got !== undefined, "Get found");
  assert(got?.score === 88, "Get score");
  assert(getCustomerHealth("missing") === undefined, "Get missing");
  console.log("PASS Get");

  seedCustomer("cust-wp27-2", "Bob Customer");
  setCustomerHealth({
    customerId: "cust-wp27-2",
    score: 40,
    level: "WARNING",
  });

  const all = listCustomerHealth();
  assert(all.length === 2, "List all");
  const good = listCustomerHealth({ level: "GOOD" });
  assert(good.length === 1, "List GOOD");
  assert(good[0]?.customerId === "cust-wp27-1", "List GOOD id");
  console.log("PASS List");

  assert(isHealthy("cust-wp27-1") === true, "isHealthy true");
  assert(isHealthy("cust-wp27-2") === false, "isHealthy false");
  assert(isHealthy("missing") === false, "isHealthy missing");
  console.log("PASS isHealthy");

  let noLifecycleRejected = false;
  try {
    registerCustomer({
      customerId: "cust-wp27-3",
      name: "No Lifecycle",
      organization: "Org",
      email: "nl@wp27.example",
    });
    createCustomerProfile({
      customerId: "cust-wp27-3",
      displayName: "No Lifecycle",
    });
    setCustomerHealth({
      customerId: "cust-wp27-3",
      score: 70,
      level: "GOOD",
    });
  } catch {
    noLifecycleRejected = true;
  }
  assert(noLifecycleRejected, "rejects missing lifecycle");

  clearCustomerHealth();
  clearCustomerLifecycles();
  clearCustomerProfiles();
  clearCustomers();
  console.log("");
  console.log("PASS FEAT-33 Customer Health");
  console.log("WP-27 verification complete");
}

main();
