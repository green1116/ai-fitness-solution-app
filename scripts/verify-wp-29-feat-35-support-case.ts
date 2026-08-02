/**
 * WP-29 / FEAT-35 — Support Case verification.
 * Open / Get / List / Update Status / Close (Registry→Engagement stack).
 */
import {
  clearCustomerEngagements,
  clearCustomerHealth,
  clearCustomerLifecycles,
  clearCustomerProfiles,
  clearCustomers,
  clearSupportCases,
  closeSupportCase,
  createCustomerProfile,
  FEAT_35_ID,
  getSupportCase,
  listSupportCase,
  openSupportCase,
  recordCustomerEngagement,
  registerCustomer,
  setCustomerHealth,
  setCustomerLifecycleStage,
  SUPPORT_CASE_CAPABILITY,
  updateSupportCaseStatus,
} from "../lib/post-launch";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function seedCustomer(customerId: string, name: string) {
  registerCustomer({
    customerId,
    name,
    organization: `Org ${customerId}`,
    email: `${customerId}@wp29.example`,
  });
  createCustomerProfile({ customerId, displayName: name });
  setCustomerLifecycleStage({ customerId, stage: "ACTIVE" });
  setCustomerHealth({ customerId, score: 75, level: "GOOD" });
  recordCustomerEngagement({ customerId, type: "EMAIL", notes: "seed" });
}

function main() {
  console.log("=== WP-29 FEAT-35 / Support Case ===");

  clearSupportCases();
  clearCustomerEngagements();
  clearCustomerHealth();
  clearCustomerLifecycles();
  clearCustomerProfiles();
  clearCustomers();

  seedCustomer("cust-wp29-1", "Ada Customer");

  const opened = openSupportCase({
    caseId: "case-wp29-1",
    customerId: "cust-wp29-1",
    priority: "HIGH",
    subject: "Login issue",
    description: "Cannot sign in",
  });
  assert(FEAT_35_ID === "FEAT-35", "FEAT-35");
  assert(SUPPORT_CASE_CAPABILITY === "SupportCase", "SupportCase");
  assert(opened.caseId === "case-wp29-1", "Open caseId");
  assert(opened.status === "OPEN", "Open status");
  assert(opened.priority === "HIGH", "Open priority");
  assert(opened.closedAt === null, "Open closedAt null");
  console.log("PASS Open");

  const got = getSupportCase("case-wp29-1");
  assert(got !== undefined, "Get found");
  assert(got?.subject === "Login issue", "Get subject");
  assert(getSupportCase("missing") === undefined, "Get missing");
  console.log("PASS Get");

  seedCustomer("cust-wp29-2", "Bob Customer");
  openSupportCase({
    caseId: "case-wp29-2",
    customerId: "cust-wp29-2",
    priority: "LOW",
    subject: "Question",
  });

  const all = listSupportCase();
  assert(all.length === 2, "List all");
  const byCustomer = listSupportCase({ customerId: "cust-wp29-1" });
  assert(byCustomer.length === 1, "List by customer");
  const byPriority = listSupportCase({ priority: "HIGH" });
  assert(byPriority.length === 1, "List by priority");
  console.log("PASS List");

  const progressed = updateSupportCaseStatus({
    caseId: "case-wp29-1",
    status: "IN_PROGRESS",
  });
  assert(progressed.status === "IN_PROGRESS", "Update IN_PROGRESS");
  const resolved = updateSupportCaseStatus({
    caseId: "case-wp29-1",
    status: "RESOLVED",
  });
  assert(resolved.status === "RESOLVED", "Update RESOLVED");
  console.log("PASS Update Status");

  const closed = closeSupportCase("case-wp29-1");
  assert(closed.status === "CLOSED", "Close status");
  assert(typeof closed.closedAt === "string", "Close closedAt");
  console.log("PASS Close");

  let noEngagementRejected = false;
  try {
    registerCustomer({
      customerId: "cust-wp29-3",
      name: "No Eng",
      organization: "Org",
      email: "ne@wp29.example",
    });
    createCustomerProfile({
      customerId: "cust-wp29-3",
      displayName: "No Eng",
    });
    setCustomerLifecycleStage({
      customerId: "cust-wp29-3",
      stage: "ACTIVE",
    });
    setCustomerHealth({
      customerId: "cust-wp29-3",
      score: 70,
      level: "GOOD",
    });
    openSupportCase({
      customerId: "cust-wp29-3",
      subject: "Should fail",
    });
  } catch {
    noEngagementRejected = true;
  }
  assert(noEngagementRejected, "rejects missing engagement");

  clearSupportCases();
  clearCustomerEngagements();
  clearCustomerHealth();
  clearCustomerLifecycles();
  clearCustomerProfiles();
  clearCustomers();
  console.log("");
  console.log("PASS FEAT-35 Support Case");
  console.log("WP-29 verification complete");
}

main();
