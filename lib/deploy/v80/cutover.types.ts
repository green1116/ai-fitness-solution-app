/**
 * V80 DEPLOY P2 — Go-live cutover types
 */
export const V80_DEPLOY_CUTOVER_VERSION = "v80-deploy-cutover-1" as const;
export const V80_DEPLOY_CUTOVER_FREEZE_VERSION = "v80-deploy-cutover-freeze-1" as const;

export type CutoverStep = {
  id: string;
  order: number;
  phase: "preflight" | "freeze" | "switch" | "validate" | "announce";
  action: string;
  owner: string;
  rollbackPoint: boolean;
  command?: string;
  required: boolean;
};

export type FirstTenantLiveStep = {
  id: string;
  order: number;
  action: string;
  apiRoute: string;
  expected: string;
  billingCheck?: string;
  required: boolean;
};

export type SmokeTestCase = {
  id: string;
  category: "api" | "workflow" | "pdf" | "ops" | "billing";
  name: string;
  routeOrFn: string;
  assert: string;
  critical: boolean;
  required: boolean;
};

export type RollbackAction = {
  id: string;
  trigger: string;
  action: string;
  killSwitch?: string;
  rtoMinutes: number;
  required: boolean;
};

export type CutoverManifest = {
  version: typeof V80_DEPLOY_CUTOVER_VERSION;
  launchVersion: string;
  cutoverSteps: number;
  firstTenantSteps: number;
  smokeTests: number;
  rollbackActions: number;
  cutoverComplete: boolean;
  summary: string;
};

export type CutoverReport = {
  version: typeof V80_DEPLOY_CUTOVER_VERSION;
  freezeVersion: typeof V80_DEPLOY_CUTOVER_FREEZE_VERSION;
  reportId: string;
  launchReady: boolean;
  manifest: CutoverManifest;
  cutoverPlan: CutoverStep[];
  firstTenantFlow: FirstTenantLiveStep[];
  smokeSuite: SmokeTestCase[];
  rollbackPlan: RollbackAction[];
  cutoverReady: boolean;
  readinessScore: number;
  summary: string;
};
