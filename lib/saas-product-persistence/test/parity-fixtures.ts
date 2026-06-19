export const P6_PARITY_TENANT = "p6-parity-tenant";

export function buildP6WorkspaceName(suffix: string): string {
  return `p6-workspace-${suffix}`;
}

export function buildP6QuoteTitle(suffix: string): string {
  return `p6-quote-${suffix}`;
}
