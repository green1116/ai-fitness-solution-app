/**
 * AE-5 — Application verification policy contract.
 * Declarative invariants — no business / workflow / integration changes / deployment.
 */

export const AE5_POLICY_ID = "application-verification-ae5-policy-v1" as const;

export type Ae5PolicyInvariantId =
  | "INV-REUSE-AE4"
  | "INV-VERIFICATION-ONLY"
  | "INV-NO-BUSINESS"
  | "INV-NO-WORKFLOW"
  | "INV-NO-INTEGRATION-CHANGES"
  | "INV-NO-DEPLOYMENT"
  | "INV-NO-REDESIGN"
  | "INV-BASE-FREEZE";

export const AE5_POLICY_INVARIANT_IDS = [
  "INV-REUSE-AE4",
  "INV-VERIFICATION-ONLY",
  "INV-NO-BUSINESS",
  "INV-NO-WORKFLOW",
  "INV-NO-INTEGRATION-CHANGES",
  "INV-NO-DEPLOYMENT",
  "INV-NO-REDESIGN",
  "INV-BASE-FREEZE",
] as const satisfies readonly Ae5PolicyInvariantId[];

export type Ae5PolicyRule = Readonly<{
  invariantId: Ae5PolicyInvariantId;
  statement: string;
}>;

export const AE5_POLICY_RULES = [
  {
    invariantId: "INV-REUSE-AE4",
    statement: "Reuse AE-4 integration plan / registry / policy only",
  },
  {
    invariantId: "INV-VERIFICATION-ONLY",
    statement: "AE-5 is verification check / report catalogue only",
  },
  {
    invariantId: "INV-NO-BUSINESS",
    statement: "AE-5 contains no business logic",
  },
  {
    invariantId: "INV-NO-WORKFLOW",
    statement: "AE-5 contains no workflow",
  },
  {
    invariantId: "INV-NO-INTEGRATION-CHANGES",
    statement: "AE-5 does not change AE-4 integration",
  },
  {
    invariantId: "INV-NO-DEPLOYMENT",
    statement: "AE-5 contains no deployment",
  },
  {
    invariantId: "INV-NO-REDESIGN",
    statement:
      "Do not redesign AE-1…AE-4, Product Definition, Governance, or PI",
  },
  {
    invariantId: "INV-BASE-FREEZE",
    statement: "Base freeze remains ae-4-application-integration-v1",
  },
] as const satisfies readonly Ae5PolicyRule[];

export type ApplicationVerificationPolicy = Readonly<{
  policyId: typeof AE5_POLICY_ID;
  invariants: typeof AE5_POLICY_INVARIANT_IDS;
  rules: typeof AE5_POLICY_RULES;
  hasBusinessLogic: false;
  hasWorkflow: false;
  hasIntegrationChanges: false;
  hasDeployment: false;
}>;

export const APPLICATION_VERIFICATION_POLICY = {
  policyId: AE5_POLICY_ID,
  invariants: AE5_POLICY_INVARIANT_IDS,
  rules: AE5_POLICY_RULES,
  hasBusinessLogic: false,
  hasWorkflow: false,
  hasIntegrationChanges: false,
  hasDeployment: false,
} as const satisfies ApplicationVerificationPolicy;
