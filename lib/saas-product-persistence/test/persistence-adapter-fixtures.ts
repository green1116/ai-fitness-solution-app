export const P5_TEST_TENANT_A = "p5-test-tenant-a";
export const P5_TEST_TENANT_B = "p5-test-tenant-b";

export function buildP5WorkspaceName(suffix: string): string {
  return `p5-workspace-${suffix}`;
}

export function buildP5QuoteTitle(suffix: string): string {
  return `p5-quote-${suffix}`;
}
