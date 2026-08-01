/**
 * AE-2 — Declarative runtime environment catalogue.
 * Environment labels only — not deployment / infra provisioning.
 */

export const AE2_ENVIRONMENT_IDS = [
  "LOCAL",
  "DEVELOPMENT",
  "STAGING",
  "PRODUCTION",
] as const;

export type Ae2EnvironmentId = (typeof AE2_ENVIRONMENT_IDS)[number];

export type Ae2RuntimeEnvironment = Readonly<{
  environmentId: Ae2EnvironmentId;
  order: number;
  notes: string;
}>;

/**
 * Closed environment catalogue — reused readiness labels, no deploy actions.
 */
export const AE2_RUNTIME_ENVIRONMENTS = [
  {
    environmentId: "LOCAL",
    order: 1,
    notes: "Local assembly / runtime planning",
  },
  {
    environmentId: "DEVELOPMENT",
    order: 2,
    notes: "Development readiness label",
  },
  {
    environmentId: "STAGING",
    order: 3,
    notes: "Staging readiness label",
  },
  {
    environmentId: "PRODUCTION",
    order: 4,
    notes: "Production readiness label",
  },
] as const satisfies readonly Ae2RuntimeEnvironment[];

export const AE2_DEFAULT_ENVIRONMENT = "LOCAL" as const;

export function getAe2RuntimeEnvironment(
  environmentId: Ae2EnvironmentId,
): Ae2RuntimeEnvironment | undefined {
  return AE2_RUNTIME_ENVIRONMENTS.find(
    (e) => e.environmentId === environmentId,
  );
}
