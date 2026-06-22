/**
 * V60 P2 — Customer service
 */

import { crmDb, type CustomerRow } from "../types";
import { normalizeCustomerStatus } from "./customer.model";
import { logCRMActivity } from "../activity/activity.tracker";

export async function createCustomer(input: {
  organizationId: string;
  name: string;
  industry?: string;
  userId?: string;
}): Promise<CustomerRow> {
  const customer = await crmDb().customer.create({
    data: {
      organizationId: input.organizationId,
      name: input.name.trim(),
      industry: input.industry?.trim() ?? "",
      status: "ACTIVE",
    },
  });

  await logCRMActivity({
    customerId: customer.id,
    type: "customer.created",
    meta: { name: customer.name, userId: input.userId },
  });

  return customer;
}

export async function getCustomerById(customerId: string, organizationId: string) {
  return crmDb().customer.findFirst({
    where: { id: customerId, organizationId },
  });
}

export async function listCustomers(organizationId: string, take = 50) {
  return crmDb().customer.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function findOrCreateCustomer(input: {
  organizationId: string;
  name: string;
  industry?: string;
  userId?: string;
}): Promise<CustomerRow> {
  const existing = await crmDb().customer.findFirst({
    where: { organizationId: input.organizationId, name: input.name.trim() },
  });
  if (existing) return existing;
  return createCustomer(input);
}

export async function updateCustomer(input: {
  customerId: string;
  organizationId: string;
  name?: string;
  industry?: string;
  status?: string;
}) {
  const customer = await crmDb().customer.findFirst({
    where: { id: input.customerId, organizationId: input.organizationId },
  });
  if (!customer) throw new Error("Customer not found");

  return crmDb().customer.update({
    where: { id: input.customerId },
    data: {
      name: input.name?.trim(),
      industry: input.industry?.trim(),
      status: input.status ? normalizeCustomerStatus(input.status) : undefined,
    },
  });
}
