/**
 * AE-1 — Application assembly contract (invariants).
 * Declarative guarantees — no executable business / runtime / workflow / deploy behavior.
 */

export const AE1_CONTRACT_ID = "application-assembly-ae1-contract-v1" as const;

export type Ae1ContractInvariantId =
  | "INV-REGISTRY"
  | "INV-COMPOSITION"
  | "INV-NO-BUSINESS"
  | "INV-NO-RUNTIME"
  | "INV-NO-WORKFLOW"
  | "INV-NO-DEPLOYMENT"
  | "INV-REUSE"
  | "INV-NO-REDESIGN"
  | "INV-BASE-FREEZE";

export const AE1_CONTRACT_INVARIANT_IDS = [
  "INV-REGISTRY",
  "INV-COMPOSITION",
  "INV-NO-BUSINESS",
  "INV-NO-RUNTIME",
  "INV-NO-WORKFLOW",
  "INV-NO-DEPLOYMENT",
  "INV-REUSE",
  "INV-NO-REDESIGN",
  "INV-BASE-FREEZE",
] as const satisfies readonly Ae1ContractInvariantId[];

export type Ae1ContractRule = Readonly<{
  invariantId: Ae1ContractInvariantId;
  statement: string;
}>;

export const AE1_CONTRACT_RULES = [
  {
    invariantId: "INV-REGISTRY",
    statement: "Assembly is registry-based over existing frozen surfaces only",
  },
  {
    invariantId: "INV-COMPOSITION",
    statement: "Assembly is composition only — no orchestration engine",
  },
  {
    invariantId: "INV-NO-BUSINESS",
    statement: "AE-1 contains no business logic",
  },
  {
    invariantId: "INV-NO-RUNTIME",
    statement: "AE-1 contains no runtime",
  },
  {
    invariantId: "INV-NO-WORKFLOW",
    statement: "AE-1 contains no workflow",
  },
  {
    invariantId: "INV-NO-DEPLOYMENT",
    statement: "AE-1 contains no deployment",
  },
  {
    invariantId: "INV-REUSE",
    statement:
      "Reuse Frontend, Backend, Data, Integration, Delivery, Implementation, Domain, Closure",
  },
  {
    invariantId: "INV-NO-REDESIGN",
    statement:
      "Do not redesign Product Definition, Governance, PI, or Runtime",
  },
  {
    invariantId: "INV-BASE-FREEZE",
    statement: "Base freeze remains pi-8-product-closure-v1",
  },
] as const satisfies readonly Ae1ContractRule[];

export type ApplicationContract = Readonly<{
  contractId: typeof AE1_CONTRACT_ID;
  invariants: typeof AE1_CONTRACT_INVARIANT_IDS;
  rules: typeof AE1_CONTRACT_RULES;
}>;

export const APPLICATION_CONTRACT = {
  contractId: AE1_CONTRACT_ID,
  invariants: AE1_CONTRACT_INVARIANT_IDS,
  rules: AE1_CONTRACT_RULES,
} as const satisfies ApplicationContract;
