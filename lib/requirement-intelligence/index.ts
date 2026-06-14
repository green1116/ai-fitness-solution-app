/**
 * V40 Requirement Intelligence — Phase 1.
 * Read-only extension over V39 Evidence Intelligence Network.
 * No V28–V39 frozen module modifications.
 */
export * from "./shared/types";
export * from "./requirement-engine-compat";
export {
  buildRequirementRegistryRecords,
  buildRequirementRegistry,
  registerRequirement,
  updateRequirement,
  resolveRequirementRef,
  resolveRequirementId,
  findRequirementById,
  findRequirementByTender,
  findRequirementByBrand,
  findRequirementByKind,
  findRequirementByPriority,
  executeRequirementQuery,
  findTopRequirementRecords,
  validateRequirementRegistry,
} from "./requirement-registry";
export * from "./requirement-context";
export {
  findRequirements,
  findRequirementsByTender,
  findRequirementsByBrand,
  findRequirementsByKind,
  findRequirementsByPriority,
  findTopRequirements,
  validateRequirementQueryRegistry,
} from "./requirement-query";
export * from "./requirement-validation";
