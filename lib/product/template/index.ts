/**
 * Product Template — Template Management public exports
 * Isolated namespace: lib/product/template
 */

export {
  PRODUCT_TEMPLATE_FREEZE_VERSION,
  PRODUCT_TEMPLATE_MANAGEMENT_BASE,
  PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_TEMPLATE_MANAGEMENT_ID,
  PRODUCT_TEMPLATE_MANAGEMENT_VERSION,
  TEMPLATE_DEFINITION_KINDS,
  TEMPLATE_DEFINITION_STATUSES,
  TEMPLATE_MANAGER_STATUSES,
  TEMPLATE_PUBLISH_STATUSES,
  TEMPLATE_READINESS_VERDICTS,
  TEMPLATE_VARIABLE_TYPES,
  TEMPLATE_VARIANT_LOCALES,
} from "./management/management.constants";

export type {
  TemplateManagerStatus,
  TemplateReadinessCheck,
  TemplateReadinessResult,
  TemplateReadinessVerdict,
  TemplateRegistryManifest,
} from "./management/management.types";

export type {
  DefineTemplateInput,
  DefinitionMetadata,
  TemplateDefinition,
  TemplateDefinitionKind,
  TemplateDefinitionStatus,
  UpdateTemplateDefinitionStatusInput,
} from "./definition/definition.types";

export {
  clearTemplateDefinitions,
  defineTemplate,
  getTemplateDefinition,
  listTemplateDefinitions,
  updateTemplateDefinitionStatus,
} from "./definition/definition.registry";

export type {
  RegisterTemplateVariantInput,
  TemplateVariant,
  TemplateVariantLocale,
  VariantMetadata,
} from "./variant/variant.types";

export {
  clearTemplateVariants,
  getTemplateVariant,
  listTemplateVariants,
  registerTemplateVariant,
} from "./variant/variant.registry";

export type {
  DeclareTemplateVariableInput,
  TemplateVariable,
  TemplateVariableType,
  VariableMetadata,
} from "./variable/variable.types";

export {
  clearTemplateVariables,
  declareTemplateVariable,
  getTemplateVariable,
  listTemplateVariables,
} from "./variable/variable.registry";

export type {
  CreateTemplatePublishInput,
  PublishMetadata,
  TemplatePublish,
  TemplatePublishStatus,
  UpdateTemplatePublishStatusInput,
} from "./publish/publish.types";

export {
  clearTemplatePublishes,
  createTemplatePublish,
  getTemplatePublish,
  listTemplatePublishes,
  updateTemplatePublishStatus,
} from "./publish/publish.registry";

export {
  assertTemplateManagementReadinessReady,
  evaluateTemplateManagementReadiness,
} from "./management/management.readiness";

export {
  clearTemplateManagementLayer,
  createTemplateManager,
  getTemplateRegistryManifest,
  type TemplateManager,
  type TemplateManagerSnapshot,
} from "./template.manager";

export {
  assertProductTemplateReleaseGatePass,
  checkProductTemplateReleaseGate,
  PRODUCT_TEMPLATE_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
