export const P3_TEST_TENANT_A = "p3-test-tenant-a";
export const P3_TEST_TENANT_B = "p3-test-tenant-b";

export function buildP3WorkspaceName(suffix: string): string {
  return `p3-workspace-${suffix}`;
}
