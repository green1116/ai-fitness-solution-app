/**
 * V3.5 packaging compat barrel.
 * Minimal pass-through for index.ts `export * from "./packaging/index"`.
 */

export {
  PACKAGING_FOUNDATION_VERSION,
  runPackagingFoundation,
  formatPackagingRuntimeHook,
  formatDeliveryRuntimeHook,
  type PackagingFoundationInput,
  type PackagingFoundationResult,
} from "../packaging";
