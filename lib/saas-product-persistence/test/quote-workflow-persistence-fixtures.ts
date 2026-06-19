export const P4_TEST_TENANT_A = "p4-test-tenant-a";
export const P4_TEST_TENANT_B = "p4-test-tenant-b";

export function buildP4WorkspaceName(suffix: string): string {
  return `p4-workspace-${suffix}`;
}

export function buildP4QuoteTitle(suffix: string): string {
  return `p4-quote-${suffix}`;
}
