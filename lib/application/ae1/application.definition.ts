/**
 * AE-1 — Application Assembly definition.
 * Registry / composition only — reuses frozen Product Closure; invents no runtime.
 */
export const AE1_ASSEMBLY_ID = "application-assembly-ae1-v1" as const;

export const AE1_ASSEMBLY_GATE = "application-assembly-ae1-gate" as const;

export const AE1_PACKAGE_ID = "AE-1" as const;

/** Frozen base — Product Closure complete. */
export const AE1_BASE_FREEZE_REF = "pi-8-product-closure-v1" as const;

export const AE1_PRODUCT_DEFINITION_REF = "product-definition-v1" as const;

export const AE1_PIG_REF = "product-implementation-governance-v1" as const;

export const AE1_CLOSURE_BASELINE_REF = "product-closure-baseline-v1" as const;

export const AE1_CLOSURE_FREEZE_REF = "product-closure-freeze-1" as const;

export const AE1_MODULE_PATH = "lib/application/ae1" as const;

/**
 * What AE-1 is — application assembly over frozen surfaces.
 */
export const AE1_PURPOSE =
  "Assemble frozen Product Definition, PIG, PI-1…PI-8, and Product Closure into an application registry" as const;

/**
 * Explicit non-goals — assembly must not become these.
 */
export const AE1_NON_GOALS = [
  "business-logic",
  "runtime",
  "workflow",
  "deployment",
  "product-definition-redesign",
  "governance-redesign",
  "pi-redesign",
  "new-architecture",
] as const;

export type Ae1NonGoal = (typeof AE1_NON_GOALS)[number];

export type ApplicationDefinition = Readonly<{
  assemblyId: typeof AE1_ASSEMBLY_ID;
  packageId: typeof AE1_PACKAGE_ID;
  baseFreezeRef: typeof AE1_BASE_FREEZE_REF;
  productDefinitionRef: typeof AE1_PRODUCT_DEFINITION_REF;
  pigRef: typeof AE1_PIG_REF;
  purpose: typeof AE1_PURPOSE;
  nonGoals: readonly Ae1NonGoal[];
  modulePath: typeof AE1_MODULE_PATH;
}>;

export const APPLICATION_DEFINITION = {
  assemblyId: AE1_ASSEMBLY_ID,
  packageId: AE1_PACKAGE_ID,
  baseFreezeRef: AE1_BASE_FREEZE_REF,
  productDefinitionRef: AE1_PRODUCT_DEFINITION_REF,
  pigRef: AE1_PIG_REF,
  purpose: AE1_PURPOSE,
  nonGoals: AE1_NON_GOALS,
  modulePath: AE1_MODULE_PATH,
} as const satisfies ApplicationDefinition;
