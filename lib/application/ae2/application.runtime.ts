/**
 * AE-2 — Application Runtime definition + plan.
 * Runtime bindings over AE-1 assembly — invents no business / workflow / deployment.
 */
import {
  AE1_ASSEMBLY_ID,
  AE1_MODULE_PATH,
  AE1_PACKAGE_ID,
} from "../ae1/application.definition";
import {
  resolveApplicationRuntimeContext,
  type ApplicationRuntimeContext,
} from "./runtime.context";
import {
  AE2_DEFAULT_ENVIRONMENT,
  AE2_RUNTIME_ENVIRONMENTS,
  type Ae2EnvironmentId,
  type Ae2RuntimeEnvironment,
} from "./runtime.environment";
import {
  AE2_LIFECYCLE_CHAIN,
  AE2_LIFECYCLE_PHASES,
  type Ae2LifecyclePhase,
} from "./runtime.lifecycle";
import {
  APPLICATION_RUNTIME_POLICY,
  type ApplicationRuntimePolicy,
} from "./runtime.policy";
import {
  AE2_DEFAULT_BOUND_STATE,
  AE2_INITIAL_RUNTIME_STATE,
  AE2_RUNTIME_STATES,
  type Ae2RuntimeState,
  type Ae2RuntimeStateId,
} from "./runtime.state";

export const AE2_RUNTIME_ID = "application-runtime-ae2-v1" as const;

export const AE2_RUNTIME_GATE = "application-runtime-ae2-gate" as const;

export const AE2_PACKAGE_ID = "AE-2" as const;

/** Frozen base — AE-1 Application Assembly. */
export const AE2_BASE_FREEZE_REF = "ae-1-application-assembly-v1" as const;

export const AE2_ASSEMBLY_REF = AE1_ASSEMBLY_ID;

export const AE2_ASSEMBLY_PACKAGE_REF = AE1_PACKAGE_ID;

export const AE2_ASSEMBLY_MODULE_REF = AE1_MODULE_PATH;

export const AE2_MODULE_PATH = "lib/application/ae2" as const;

export const AE2_PURPOSE =
  "Bind AE-1 application assembly into a declarative application runtime plan" as const;

export const AE2_NON_GOALS = [
  "business-logic",
  "workflow",
  "integration",
  "deployment",
  "product-definition-redesign",
  "governance-redesign",
  "pi-redesign",
  "ae1-redesign",
  "new-architecture",
] as const;

export type Ae2NonGoal = (typeof AE2_NON_GOALS)[number];

export type ApplicationRuntimeDefinition = Readonly<{
  runtimeId: typeof AE2_RUNTIME_ID;
  packageId: typeof AE2_PACKAGE_ID;
  baseFreezeRef: typeof AE2_BASE_FREEZE_REF;
  assemblyRef: typeof AE2_ASSEMBLY_REF;
  purpose: typeof AE2_PURPOSE;
  nonGoals: readonly Ae2NonGoal[];
  modulePath: typeof AE2_MODULE_PATH;
}>;

export const APPLICATION_RUNTIME_DEFINITION = {
  runtimeId: AE2_RUNTIME_ID,
  packageId: AE2_PACKAGE_ID,
  baseFreezeRef: AE2_BASE_FREEZE_REF,
  assemblyRef: AE2_ASSEMBLY_REF,
  purpose: AE2_PURPOSE,
  nonGoals: AE2_NON_GOALS,
  modulePath: AE2_MODULE_PATH,
} as const satisfies ApplicationRuntimeDefinition;

export type ApplicationRuntimePlan = Readonly<{
  runtimeId: typeof AE2_RUNTIME_ID;
  baseFreezeRef: typeof AE2_BASE_FREEZE_REF;
  definition: typeof APPLICATION_RUNTIME_DEFINITION;
  context: ApplicationRuntimeContext;
  state: Ae2RuntimeState;
  stateId: Ae2RuntimeStateId;
  states: typeof AE2_RUNTIME_STATES;
  lifecycle: readonly Ae2LifecyclePhase[];
  lifecycleChain: typeof AE2_LIFECYCLE_CHAIN;
  environment: Ae2RuntimeEnvironment;
  environmentId: Ae2EnvironmentId;
  environments: typeof AE2_RUNTIME_ENVIRONMENTS;
  policy: ApplicationRuntimePolicy;
  matchesAssembly: boolean;
  runtimeOnly: boolean;
}>;

/**
 * Resolve declarative AE-2 runtime plan from AE-1 context + catalogues.
 */
export function resolveApplicationRuntimePlan(
  environmentId: Ae2EnvironmentId = AE2_DEFAULT_ENVIRONMENT,
  stateId: Ae2RuntimeStateId = AE2_DEFAULT_BOUND_STATE,
): ApplicationRuntimePlan {
  const context = resolveApplicationRuntimeContext();

  const state =
    AE2_RUNTIME_STATES.find((s) => s.stateId === stateId) ??
    AE2_RUNTIME_STATES.find((s) => s.stateId === AE2_INITIAL_RUNTIME_STATE)!;

  const environment =
    AE2_RUNTIME_ENVIRONMENTS.find((e) => e.environmentId === environmentId) ??
    AE2_RUNTIME_ENVIRONMENTS.find(
      (e) => e.environmentId === AE2_DEFAULT_ENVIRONMENT,
    )!;

  const runtimeOnly =
    APPLICATION_RUNTIME_POLICY.hasBusinessLogic === false &&
    APPLICATION_RUNTIME_POLICY.hasWorkflow === false &&
    APPLICATION_RUNTIME_POLICY.hasIntegration === false &&
    APPLICATION_RUNTIME_POLICY.hasDeployment === false &&
    APPLICATION_RUNTIME_DEFINITION.nonGoals.includes("workflow") &&
    APPLICATION_RUNTIME_DEFINITION.nonGoals.includes("integration") &&
    APPLICATION_RUNTIME_DEFINITION.nonGoals.includes("deployment");

  return {
    runtimeId: AE2_RUNTIME_ID,
    baseFreezeRef: AE2_BASE_FREEZE_REF,
    definition: APPLICATION_RUNTIME_DEFINITION,
    context,
    state,
    stateId: state.stateId,
    states: AE2_RUNTIME_STATES,
    lifecycle: AE2_LIFECYCLE_PHASES,
    lifecycleChain: AE2_LIFECYCLE_CHAIN,
    environment,
    environmentId: environment.environmentId,
    environments: AE2_RUNTIME_ENVIRONMENTS,
    policy: APPLICATION_RUNTIME_POLICY,
    matchesAssembly: context.matchesAssembly,
    runtimeOnly,
  };
}
