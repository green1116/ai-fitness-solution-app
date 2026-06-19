export const P2_TEST_TENANT_A = "p2-test-tenant-a";
export const P2_TEST_TENANT_B = "p2-test-tenant-b";

export function buildWorkspaceName(suffix: string): string {
  return `p2-workspace-${suffix}`;
}

export function buildQuoteTitle(suffix: string): string {
  return `p2-quote-${suffix}`;
}
