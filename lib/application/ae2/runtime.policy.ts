/**
 * AE-2 — Application runtime policy contract.
 * Declarative invariants — no executable business / workflow / integration / deploy.
 */

export const AE2_POLICY_ID = "application-runtime-ae2-policy-v1" as const;

export type Ae2PolicyInvariantId =
  | "INV-REUSE-AE1"
  | "INV-RUNTIME-ONLY"
  | "INV-NO-BUSINESS"
  | "INV-NO-WORKFLOW"
  | "INV-NO-INTEGRATION"
  | "INV-NO-DEPLOYMENT"
  | "INV-NO-REDESIGN"
  | "INV-BASE-FREEZE";

export const AE2_POLICY_INVARIANT_IDS = [
  "INV-REUSE-AE1",
  "INV-RUNTIME-ONLY",
  "INV-NO-BUSINESS",
  "INV-NO-WORKFLOW",
  "INV-NO-INTEGRATION",
  "INV-NO-DEPLOYMENT",
  "INV-NO-REDESIGN",
  "INV-BASE-FREEZE",
] as const satisfies readonly Ae2PolicyInvariantId[];

export type Ae2PolicyRule = Readonly<{
  invariantId: Ae2PolicyInvariantId;
  statement: string;
}>;

export const AE2_POLICY_RULES = [
  {
    invariantId: "INV-REUSE-AE1",
    statement: "Reuse AE-1 assembly registry / composition / manifest only",
  },
  {
    invariantId: "INV-RUNTIME-ONLY",
    statement: "AE-2 is runtime binding / catalogue only",
  },
  {
    invariantId: "INV-NO-BUSINESS",
    statement: "AE-2 contains no business logic",
  },
  {
    invariantId: "INV-NO-WORKFLOW",
    statement: "AE-2 contains no workflow",
  },
  {
    invariantId: "INV-NO-INTEGRATION",
    statement: "AE-2 contains no integration seams",
  },
  {
    invariantId: "INV-NO-DEPLOYMENT",
    statement: "AE-2 contains no deployment",
  },
  {
    invariantId: "INV-NO-REDESIGN",
    statement: "Do not redesign AE-1, Product Definition, Governance, or PI",
  },
  {
    invariantId: "INV-BASE-FREEZE",
    statement: "Base freeze remains ae-1-application-assembly-v1",
  },
] as const satisfies readonly Ae2PolicyRule[];

export type ApplicationRuntimePolicy = Readonly<{
  policyId: typeof AE2_POLICY_ID;
  invariants: typeof AE2_POLICY_INVARIANT_IDS;
  rules: typeof AE2_POLICY_RULES;
  hasBusinessLogic: false;
  hasWorkflow: false;
  hasIntegration: false;
  hasDeployment: false;
}>;

export const APPLICATION_RUNTIME_POLICY = {
  policyId: AE2_POLICY_ID,
  invariants: AE2_POLICY_INVARIANT_IDS,
  rules: AE2_POLICY_RULES,
  hasBusinessLogic: false,
  hasWorkflow: false,
  hasIntegration: false,
  hasDeployment: false,
} as const satisfies ApplicationRuntimePolicy;
