/**
 * V59 SaaS — Billing orchestration
 */

import { getStripeClient } from "@/lib/billing/stripe.client";
import { createInvoice, markInvoicePaid } from "@/lib/billing/invoice.service";
import {
  createSubscription,
  getActiveSubscription,
  upgradePlan,
  type SubscriptionPlan,
} from "@/lib/billing/subscription.service";

export async function startBillingCheckout(input: {
  organizationId: string;
  plan: SubscriptionPlan;
  ownerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = getStripeClient();
  const active = await getActiveSubscription(input.organizationId);

  let customerId = active?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.createCustomer({
      email: input.ownerEmail,
      organizationId: input.organizationId,
    });
    customerId = customer.customerId;
  }

  const session = await stripe.createCheckoutSession({
    customerId,
    plan: input.plan,
    successUrl: input.successUrl,
    cancelUrl: input.cancelUrl,
  });

  return session;
}

export async function activatePlanAfterPayment(input: {
  organizationId: string;
  plan: SubscriptionPlan;
  ownerEmail: string;
  amountCents: number;
}) {
  const subscription = await upgradePlan({
    organizationId: input.organizationId,
    plan: input.plan,
    ownerEmail: input.ownerEmail,
  });

  const invoice = await createInvoice({
    organizationId: input.organizationId,
    subscriptionId: subscription.id,
    amount: input.amountCents,
    currency: "usd",
  });

  await markInvoicePaid(invoice.id);

  return { subscription, invoice };
}

export { createSubscription, upgradePlan, getActiveSubscription };
