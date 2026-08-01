/**
 * AE-1 — Application assembly metadata (identity / stage only).
 */
import {
  AE1_ASSEMBLY_ID,
  AE1_BASE_FREEZE_REF,
  AE1_CLOSURE_BASELINE_REF,
  AE1_MODULE_PATH,
  AE1_PACKAGE_ID,
  AE1_PIG_REF,
  AE1_PRODUCT_DEFINITION_REF,
} from "./application.definition";

export const AE1_STAGE = "application-assembly" as const;

export const AE1_VERSION = "1" as const;

export type ApplicationMetadata = Readonly<{
  assemblyId: typeof AE1_ASSEMBLY_ID;
  packageId: typeof AE1_PACKAGE_ID;
  stage: typeof AE1_STAGE;
  version: typeof AE1_VERSION;
  modulePath: typeof AE1_MODULE_PATH;
  baseFreezeRef: typeof AE1_BASE_FREEZE_REF;
  productDefinitionRef: typeof AE1_PRODUCT_DEFINITION_REF;
  pigRef: typeof AE1_PIG_REF;
  closureBaselineRef: typeof AE1_CLOSURE_BASELINE_REF;
  kind: "assembly";
  hasBusinessLogic: false;
  hasRuntime: false;
  hasWorkflow: false;
  hasDeployment: false;
}>;

export const APPLICATION_METADATA = {
  assemblyId: AE1_ASSEMBLY_ID,
  packageId: AE1_PACKAGE_ID,
  stage: AE1_STAGE,
  version: AE1_VERSION,
  modulePath: AE1_MODULE_PATH,
  baseFreezeRef: AE1_BASE_FREEZE_REF,
  productDefinitionRef: AE1_PRODUCT_DEFINITION_REF,
  pigRef: AE1_PIG_REF,
  closureBaselineRef: AE1_CLOSURE_BASELINE_REF,
  kind: "assembly",
  hasBusinessLogic: false,
  hasRuntime: false,
  hasWorkflow: false,
  hasDeployment: false,
} as const satisfies ApplicationMetadata;
