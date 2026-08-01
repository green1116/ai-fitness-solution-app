/**
 * AE-4 — Application integration policy contract.
 * Declarative invariants — no business / deployment / monitoring.
 */

export const AE4_POLICY_ID = "application-integration-ae4-policy-v1" as const;

export type Ae4PolicyInvariantId =
  | "INV-REUSE-AE3"
  | "INV-INTEGRATION-ONLY"
  | "INV-NO-BUSINESS"
  | "INV-NO-DEPLOYMENT"
  | "INV-NO-MONITORING"
  | "INV-NO-REDESIGN"
  | "INV-PATH-REFS"
  | "INV-BASE-FREEZE";

export const AE4_POLICY_INVARIANT_IDS = [
  "INV-REUSE-AE3",
  "INV-INTEGRATION-ONLY",
  "INV-NO-BUSINESS",
  "INV-NO-DEPLOYMENT",
  "INV-NO-MONITORING",
  "INV-NO-REDESIGN",
  "INV-PATH-REFS",
  "INV-BASE-FREEZE",
] as const satisfies readonly Ae4PolicyInvariantId[];

export type Ae4PolicyRule = Readonly<{
  invariantId: Ae4PolicyInvariantId;
  statement: string;
}>;

export const AE4_POLICY_RULES = [
  {
    invariantId: "INV-REUSE-AE3",
    statement: "Reuse AE-3 workflow plan / registry / policy only",
  },
  {
    invariantId: "INV-INTEGRATION-ONLY",
    statement: "AE-4 is integration seam / binding / endpoint catalogue only",
  },
  {
    invariantId: "INV-NO-BUSINESS",
    statement: "AE-4 contains no business logic",
  },
  {
    invariantId: "INV-NO-DEPLOYMENT",
    statement: "AE-4 contains no deployment",
  },
  {
    invariantId: "INV-NO-MONITORING",
    statement: "AE-4 contains no monitoring",
  },
  {
    invariantId: "INV-NO-REDESIGN",
    statement:
      "Do not redesign AE-1…AE-3, Product Definition, Governance, or PI",
  },
  {
    invariantId: "INV-PATH-REFS",
    statement: "Endpoints use path/ID refs only — no layer module imports",
  },
  {
    invariantId: "INV-BASE-FREEZE",
    statement: "Base freeze remains ae-3-application-workflow-v1",
  },
] as const satisfies readonly Ae4PolicyRule[];

export type ApplicationIntegrationPolicy = Readonly<{
  policyId: typeof AE4_POLICY_ID;
  invariants: typeof AE4_POLICY_INVARIANT_IDS;
  rules: typeof AE4_POLICY_RULES;
  hasBusinessLogic: false;
  hasDeployment: false;
  hasMonitoring: false;
}>;

export const APPLICATION_INTEGRATION_POLICY = {
  policyId: AE4_POLICY_ID,
  invariants: AE4_POLICY_INVARIANT_IDS,
  rules: AE4_POLICY_RULES,
  hasBusinessLogic: false,
  hasDeployment: false,
  hasMonitoring: false,
} as const satisfies ApplicationIntegrationPolicy;
