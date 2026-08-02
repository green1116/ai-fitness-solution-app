/**
 * FEAT-30 — Customer Registry
 * In-memory customer registry for post-launch domain (no DB / Prisma / API / UI).
 */

export const FEAT_30_ID = "FEAT-30" as const;
export const CUSTOMER_REGISTRY_CAPABILITY = "CustomerRegistry" as const;

export const CUSTOMER_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "ARCHIVED",
] as const;

export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

export type Customer = Readonly<{
  customerId: string;
  name: string;
  organization: string;
  email: string;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}>;

export type RegisterCustomerInput = Readonly<{
  customerId?: string;
  name: string;
  organization: string;
  email: string;
  status?: CustomerStatus;
}>;

export type ListCustomersFilter = Readonly<{
  status?: CustomerStatus;
  organization?: string;
}>;

const customers = new Map<string, Customer>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCustomer(customer: Customer): Customer {
  return { ...customer };
}

function requireTrimmed(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`customer.${field} is required`);
  return trimmed;
}

function assertStatus(status: string): asserts status is CustomerStatus {
  if (!(CUSTOMER_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid customer status: ${status}`);
  }
}

/**
 * Register a new customer in the in-memory registry.
 */
export function registerCustomer(input: RegisterCustomerInput): Customer {
  const name = requireTrimmed(input.name, "name");
  const organization = requireTrimmed(input.organization, "organization");
  const email = requireTrimmed(input.email, "email");
  const status = input.status ?? "ACTIVE";
  assertStatus(status);

  const customerId =
    input.customerId?.trim() || createId("cust");
  if (customers.has(customerId)) {
    throw new Error(`customer already exists: ${customerId}`);
  }

  const now = nowIso();
  const customer: Customer = {
    customerId,
    name,
    organization,
    email,
    status,
    createdAt: now,
    updatedAt: now,
  };
  customers.set(customerId, customer);
  return cloneCustomer(customer);
}

/**
 * Get a customer by id.
 */
export function getCustomer(customerId: string): Customer | undefined {
  const id = customerId.trim();
  if (!id) return undefined;
  const customer = customers.get(id);
  return customer ? cloneCustomer(customer) : undefined;
}

/**
 * List customers with optional status / organization filters.
 */
export function listCustomers(
  filter: ListCustomersFilter = {},
): Customer[] {
  let rows = [...customers.values()];
  if (filter.status) {
    assertStatus(filter.status);
    rows = rows.filter((c) => c.status === filter.status);
  }
  if (filter.organization) {
    const org = filter.organization.trim();
    rows = rows.filter((c) => c.organization === org);
  }
  return rows
    .slice()
    .sort((a, b) => a.customerId.localeCompare(b.customerId))
    .map(cloneCustomer);
}

/**
 * Check whether a customer exists.
 */
export function existsCustomer(customerId: string): boolean {
  const id = customerId.trim();
  if (!id) return false;
  return customers.has(id);
}

/** Test helper — clears in-memory registry. */
export function clearCustomers(): void {
  customers.clear();
}
