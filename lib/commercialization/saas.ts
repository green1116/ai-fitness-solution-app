/** V3.5 SaaS tenant isolation compat entry. */

export type TenantIsolationMode = "enterpriseDedicated" | "shared" | "trial";

export function buildTenantIsolationSummary(
  mode: TenantIsolationMode = "enterpriseDedicated",
): string {
  return `tenant-isolation=${mode} ready=true`;
}
