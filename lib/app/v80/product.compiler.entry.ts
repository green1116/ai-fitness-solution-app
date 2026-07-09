/**
 * V80 APP P1 — Product compiler entry (read-only)
 */
export {
  PRODUCT_API_MAP,
  getProductApiByRoute,
  isProductApiMapComplete,
} from "./product.api.map";
export { assertProductCompilerPass, buildProductCompiler } from "./product.compiler.builder";
export {
  V80_APP_PRODUCT_COMPILER_FREEZE_VERSION,
  V80_APP_PRODUCT_COMPILER_VERSION,
} from "./product.compiler";
export type {
  ProductApiEntry,
  ProductCompilerReport,
  ProductModuleEntry,
  ProductOutputEntry,
  ProductWorkflowEntry,
} from "./product.compiler";
export {
  PRODUCT_MODULE_MAP,
  getProductModuleByClosureRef,
  isProductModuleMapComplete,
} from "./product.module.map";
export {
  PRODUCT_OUTPUT_CATALOG,
  getProductOutputsByKind,
  isProductOutputCatalogComplete,
} from "./product.outputs";
export {
  PRODUCT_WORKFLOW_MAP,
  getProductWorkflowByKey,
  isProductWorkflowMapComplete,
} from "./product.workflow.map";

import { buildProductCompiler } from "./product.compiler.builder";
import type { ProductCompilerReport } from "./product.compiler";

export function runProductCompiler(input?: {
  deploymentId?: string;
}): ProductCompilerReport {
  return buildProductCompiler(input);
}

export function formatProductCompilerSummary(report: ProductCompilerReport): string {
  return [
    "V80 APP Product Compiler",
    `  ready: ${report.compilerReady}`,
    `  score: ${report.readinessScore}/100`,
    `  kernelSealed: ${report.kernelSealed}`,
    `  modules: ${report.manifest.moduleCount}`,
    `  apis: ${report.manifest.apiCount}`,
    `  workflows: ${report.manifest.workflowCount}`,
    `  outputs: ${report.manifest.outputCount}`,
  ].join("\n");
}
