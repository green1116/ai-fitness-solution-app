/**
 * V60 P2 — Customer service
 */

import { prisma } from "@/lib/prisma";
import { crmDb, type CustomerRow } from "../types";
import { normalizeCustomerStatus } from "./customer.model";
import { logCRMActivity } from "../activity/activity.tracker";

function normalizeCustomerName(name: string): string {
  return name.trim();
}

function customerIdentityLockKey(organizationId: string, name: string): string {
  return `crm:customer:${organizationId}:${name}`;
}

export async function createCustomer(input: {
  organizationId: string;
  name: string;
  industry?: string;
  userId?: string;
}): Promise<CustomerRow> {
  const customer = await crmDb().customer.create({
    data: {
      organizationId: input.organizationId,
      name: normalizeCustomerName(input.name),
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

/**
 * Application-layer identity: organizationId + trimmed company name.
 * Concurrent callers are serialized with a transaction advisory lock.
 * No email-based Customer identity.
 */
export async function findOrCreateCustomer(input: {
  organizationId: string;
  name: string;
  industry?: string;
  userId?: string;
}): Promise<CustomerRow> {
  const name = normalizeCustomerName(input.name);
  const lockKey = customerIdentityLockKey(input.organizationId, name);

  return prisma.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

      const existing = await tx.customer.findFirst({
        where: { organizationId: input.organizationId, name },
      });
      if (existing) return existing;

      const customer = await tx.customer.create({
        data: {
          organizationId: input.organizationId,
          name,
          industry: input.industry?.trim() ?? "",
          status: "ACTIVE",
        },
      });

      await tx.cRMActivity.create({
        data: {
          customerId: customer.id,
          type: "customer.created",
          meta: { name: customer.name, userId: input.userId },
        },
      });

      return customer;
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
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
      name: input.name !== undefined ? normalizeCustomerName(input.name) : undefined,
      industry: input.industry?.trim(),
      status: input.status ? normalizeCustomerStatus(input.status) : undefined,
    },
  });
}
