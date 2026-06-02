/**
 * V8.8 Subscription & Billing Foundation — verification
 */
import {
  SUBSCRIPTION_BILLING_VERSION,
  buildSubscriptionPlans,
  buildSubscriptionPlan,
  buildSubscription,
  buildSubscriptions,
  buildInvoice,
  buildInvoices,
  buildEntitlements,
  buildEntitlementForTier,
  buildBillingSummary,
  buildBillingResponse,
  validateSubscriptionBilling,
} from "../lib/productization/billing";

const DEPLOYMENT_ID = "v88-subscription-billing-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testPlans() {
  const plans = buildSubscriptionPlans();
  assert(plans.length === 3, "plans count");
  const tiers = plans.map((p) => p.tier);
  assert(tiers.includes("starter"), "starter plan");
  assert(tiers.includes("professional"), "professional plan");
  assert(tiers.includes("enterprise"), "enterprise plan");

  for (const plan of plans) {
    assert(plan.customPricing, "custom pricing");
    assert(plan.billingPeriods.includes("monthly"), "monthly period");
    assert(plan.billingPeriods.includes("quarterly"), "quarterly period");
    assert(plan.billingPeriods.includes("annual"), "annual period");
  }

  const starter = buildSubscriptionPlan("starter");
  assert(starter.planId === "subscription-plan-starter", "buildSubscriptionPlan");
  console.log("✓ plans valid");
}

function testSubscription() {
  const subscription = buildSubscription({ deploymentId: DEPLOYMENT_ID, tier: "professional" });
  assert(subscription.subscriptionId.length > 0, "subscription id");
  assert(subscription.planId.length > 0, "plan id");
  assert(subscription.status === "active", "subscription status");
  assert(["monthly", "quarterly", "annual"].includes(subscription.billingPeriod), "billing period");

  const subscriptions = buildSubscriptions({ deploymentId: DEPLOYMENT_ID });
  assert(subscriptions.length === 3, "subscriptions count");
  console.log("✓ subscription valid");
}

function testInvoice() {
  const invoice = buildInvoice({ deploymentId: DEPLOYMENT_ID });
  assert(invoice.invoiceId.length > 0, "invoice id");
  assert(invoice.currency === "CNY", "currency");

  const invoices = buildInvoices({ deploymentId: DEPLOYMENT_ID });
  const statuses = invoices.map((i) => i.status);
  assert(statuses.includes("draft"), "draft invoice");
  assert(statuses.includes("issued"), "issued invoice");
  assert(statuses.includes("paid"), "paid invoice");
  assert(statuses.includes("overdue"), "overdue invoice");
  assert(statuses.includes("cancelled"), "cancelled invoice");
  console.log("✓ invoice valid");
}

function testEntitlements() {
  const entitlements = buildEntitlements();
  assert(entitlements.length === 3, "entitlements count");

  const starter = buildEntitlementForTier("starter");
  assert(starter.planGeneration === 10, "starter plan generation");
  assert(starter.tenderPackage === false, "starter no tender");

  const enterprise = buildEntitlementForTier("enterprise");
  assert(enterprise.planGeneration === "unlimited", "enterprise unlimited");
  assert(enterprise.tenderPackage === true, "enterprise tender");
  console.log("✓ entitlement valid");
}

function testSummaryAndResponse() {
  const summary = buildBillingSummary({ deploymentId: DEPLOYMENT_ID });
  assert(summary.version === SUBSCRIPTION_BILLING_VERSION, "summary version");
  assert(summary.activeSubscriptions === 3, "active subscriptions");
  assert(summary.totalInvoices >= 5, "total invoices");

  const response = buildBillingResponse({ deploymentId: DEPLOYMENT_ID });
  assert(response.plans.length === 3, "response plans");
  assert(response.subscriptions.length === 3, "response subscriptions");
  assert(response.invoices.length >= 5, "response invoices");
  assert(response.entitlements.length === 3, "response entitlements");

  const validation = validateSubscriptionBilling({ deploymentId: DEPLOYMENT_ID });
  assert(validation.plansValid, "plans valid");
  assert(validation.subscriptionValid, "subscription valid");
  assert(validation.invoiceValid, "invoice valid");
  assert(validation.entitlementValid, "entitlement valid");
  assert(validation.summaryValid, "summary valid");

  console.log("✓ summary valid");
  console.log(" ", summary.summary);
  console.log("");
  console.log("SUBSCRIPTION BILLING VERIFY PASS");
}

function main() {
  testPlans();
  testSubscription();
  testInvoice();
  testEntitlements();
  testSummaryAndResponse();
}

main();
