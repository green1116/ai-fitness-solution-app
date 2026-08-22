/**
 * CRM tenant guard — entity ownership via customer.organizationId
 */

import { getCustomerById } from "./customer/customer.service";
import { crmDb } from "./types";

export const CRM_TENANT_BLOCKED_MESSAGE = "Tenant blocked: entity not in organization";

export type CrmTenantEntity = "lead" | "opp" | "deal";

export class CrmTenantIsolationError extends Error {
  readonly status = 403;

  constructor(message = CRM_TENANT_BLOCKED_MESSAGE) {
    super(message);
    this.name = "CrmTenantIsolationError";
  }
}

async function resolveCustomerIdForCrmEntity(
  entity: CrmTenantEntity,
  entityId: string,
): Promise<string | null> {
  if (entity === "lead") {
    const lead = await crmDb().crmLead.findFirst({ where: { id: entityId } });
    return lead?.customerId ?? null;
  }

  if (entity === "opp") {
    const opportunity = await crmDb().opportunity.findFirst({ where: { id: entityId } });
    return opportunity?.customerId ?? null;
  }

  const deal = await crmDb().deal.findFirst({ where: { id: entityId } });
  if (!deal) return null;

  const opportunity = await crmDb().opportunity.findFirst({
    where: { id: deal.opportunityId },
  });
  return opportunity?.customerId ?? null;
}

export async function isCrmEntityOwnedByOrg(input: {
  entity: CrmTenantEntity;
  entityId: string;
  organizationId: string;
}): Promise<boolean> {
  const customerId = await resolveCustomerIdForCrmEntity(input.entity, input.entityId);
  if (!customerId) return false;
  const customer = await getCustomerById(customerId, input.organizationId);
  return customer != null;
}

export async function assertCrmEntityOwnedByOrg(input: {
  entity: CrmTenantEntity;
  entityId: string;
  organizationId: string;
}): Promise<void> {
  if (!(await isCrmEntityOwnedByOrg(input))) {
    throw new CrmTenantIsolationError();
  }
}
