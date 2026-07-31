/**
 * PI-6.1 — Closed environment catalogue (PD-5.7 / PD-7.2).
 * Reuses existing ENV-* — invents no new environment family.
 */
export const DELIVERY_ENVIRONMENT_IDS = [
  "ENV-LOCAL",
  "ENV-DEV",
  "ENV-STAGING",
  "ENV-PROD",
] as const;

export type DeliveryEnvironmentId = (typeof DELIVERY_ENVIRONMENT_IDS)[number];

export type DeliveryEnvironmentRecord = Readonly<{
  envId: DeliveryEnvironmentId;
  order: number;
  readinessBar: string;
  role: string;
}>;

export const DELIVERY_ENVIRONMENT_CATALOGUE = [
  {
    envId: "ENV-LOCAL",
    order: 1,
    readinessBar: "Buildable; synthetic data; no prod secrets",
    role: "Local development",
  },
  {
    envId: "ENV-DEV",
    order: 2,
    readinessBar: "Isolated stores; FE+BE against existing APIs",
    role: "Shared development",
  },
  {
    envId: "ENV-STAGING",
    order: 3,
    readinessBar: "READY_STAGING (PD-6.7); AC-REL-* PASS",
    role: "Pre-production validation",
  },
  {
    envId: "ENV-PROD",
    order: 4,
    readinessBar: "PD-7.1 GO + DEPLOY_READY_PROD",
    role: "Production",
  },
] as const satisfies readonly DeliveryEnvironmentRecord[];

/** Golden Paths reused by delivery / pilot (PD-2.6 / PD-7.6). */
export const DELIVERY_GOLDEN_PATH_IDS = [
  "GP-01",
  "GP-01R",
  "GP-02",
  "GP-03",
  "GP-04",
] as const;

export type DeliveryGoldenPathId = (typeof DELIVERY_GOLDEN_PATH_IDS)[number];
