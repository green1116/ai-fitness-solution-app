/**
 * AE-3 — Application workflow policy contract.
 * Declarative invariants — no business / integration / deployment / UI.
 */

export const AE3_POLICY_ID = "application-workflow-ae3-policy-v1" as const;

export type Ae3PolicyInvariantId =
  | "INV-REUSE-AE2"
  | "INV-WORKFLOW-ONLY"
  | "INV-NO-BUSINESS"
  | "INV-NO-INTEGRATION"
  | "INV-NO-DEPLOYMENT"
  | "INV-NO-UI"
  | "INV-NO-REDESIGN"
  | "INV-BASE-FREEZE";

export const AE3_POLICY_INVARIANT_IDS = [
  "INV-REUSE-AE2",
  "INV-WORKFLOW-ONLY",
  "INV-NO-BUSINESS",
  "INV-NO-INTEGRATION",
  "INV-NO-DEPLOYMENT",
  "INV-NO-UI",
  "INV-NO-REDESIGN",
  "INV-BASE-FREEZE",
] as const satisfies readonly Ae3PolicyInvariantId[];

export type Ae3PolicyRule = Readonly<{
  invariantId: Ae3PolicyInvariantId;
  statement: string;
}>;

export const AE3_POLICY_RULES = [
  {
    invariantId: "INV-REUSE-AE2",
    statement: "Reuse AE-2 runtime plan / context / policy only",
  },
  {
    invariantId: "INV-WORKFLOW-ONLY",
    statement: "AE-3 is workflow stage / transition catalogue only",
  },
  {
    invariantId: "INV-NO-BUSINESS",
    statement: "AE-3 contains no business logic",
  },
  {
    invariantId: "INV-NO-INTEGRATION",
    statement: "AE-3 contains no integration seams",
  },
  {
    invariantId: "INV-NO-DEPLOYMENT",
    statement: "AE-3 contains no deployment",
  },
  {
    invariantId: "INV-NO-UI",
    statement: "AE-3 contains no UI",
  },
  {
    invariantId: "INV-NO-REDESIGN",
    statement: "Do not redesign AE-1, AE-2, Product Definition, Governance, or PI",
  },
  {
    invariantId: "INV-BASE-FREEZE",
    statement: "Base freeze remains ae-2-application-runtime-v1",
  },
] as const satisfies readonly Ae3PolicyRule[];

export type ApplicationWorkflowPolicy = Readonly<{
  policyId: typeof AE3_POLICY_ID;
  invariants: typeof AE3_POLICY_INVARIANT_IDS;
  rules: typeof AE3_POLICY_RULES;
  hasBusinessLogic: false;
  hasIntegration: false;
  hasDeployment: false;
  hasUi: false;
}>;

export const APPLICATION_WORKFLOW_POLICY = {
  policyId: AE3_POLICY_ID,
  invariants: AE3_POLICY_INVARIANT_IDS,
  rules: AE3_POLICY_RULES,
  hasBusinessLogic: false,
  hasIntegration: false,
  hasDeployment: false,
  hasUi: false,
} as const satisfies ApplicationWorkflowPolicy;
