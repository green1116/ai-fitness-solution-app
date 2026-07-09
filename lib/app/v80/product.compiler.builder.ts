/**
 * V80 APP P1 — Product compiler builder (read-only kernel consumer)
 */
import { buildSystemClosure } from "@/lib/system/v80/system.closure.builder";
import { V80_SYSTEM_FREEZE_VERSION } from "@/lib/system/v80/system.closure";

import { isProductApiMapComplete, PRODUCT_API_MAP } from "./product.api.map";
import {
  V80_APP_PRODUCT_COMPILER_FREEZE_VERSION,
  V80_APP_PRODUCT_COMPILER_VERSION,
  type ProductCompilerManifest,
  type ProductCompilerReport,
} from "./product.compiler";
import { isProductModuleMapComplete, PRODUCT_MODULE_MAP } from "./product.module.map";
import { isProductOutputCatalogComplete, PRODUCT_OUTPUT_CATALOG } from "./product.outputs";
import { isProductWorkflowMapComplete, PRODUCT_WORKFLOW_MAP } from "./product.workflow.map";

export function buildProductCompilerManifest(input: {
  kernelSealed: boolean;
}): ProductCompilerManifest {
  const moduleComplete = isProductModuleMapComplete();
  const apiComplete = isProductApiMapComplete();
  const workflowComplete = isProductWorkflowMapComplete();
  const outputComplete = isProductOutputCatalogComplete();

  const compilerComplete =
    input.kernelSealed && moduleComplete && apiComplete && workflowComplete && outputComplete;

  return {
    version: V80_APP_PRODUCT_COMPILER_VERSION,
    kernelSeal: V80_SYSTEM_FREEZE_VERSION,
    moduleCount: PRODUCT_MODULE_MAP.length,
    apiCount: PRODUCT_API_MAP.length,
    workflowCount: PRODUCT_WORKFLOW_MAP.length,
    outputCount: PRODUCT_OUTPUT_CATALOG.length,
    compilerComplete,
    summary: `product-compiler complete=${compilerComplete} modules=${PRODUCT_MODULE_MAP.length} apis=${PRODUCT_API_MAP.length}`,
  };
}

export function buildProductCompiler(input?: {
  deploymentId?: string;
}): ProductCompilerReport {
  const deploymentId = input?.deploymentId ?? "v80-app-product-compiler-default";
  const closure = buildSystemClosure({ deploymentId });
  const manifest = buildProductCompilerManifest({ kernelSealed: closure.freeze.sealed });

  const compilerReady = closure.closureReady && manifest.compilerComplete;

  return {
    version: V80_APP_PRODUCT_COMPILER_VERSION,
    freezeVersion: V80_APP_PRODUCT_COMPILER_FREEZE_VERSION,
    reportId: `product-compiler-${deploymentId}`,
    generatedId: new Date().toISOString(),
    kernelVersionLock: closure.freeze.lockVersion,
    kernelSealed: closure.freeze.sealed,
    manifest,
    modules: PRODUCT_MODULE_MAP,
    apis: PRODUCT_API_MAP,
    workflows: PRODUCT_WORKFLOW_MAP,
    outputs: PRODUCT_OUTPUT_CATALOG,
    compilerReady,
    readinessScore: compilerReady ? 100 : 0,
    summary: [
      `product-compiler ready=${compilerReady}`,
      `kernelSealed=${closure.freeze.sealed}`,
      `modules=${manifest.moduleCount}`,
      `workflows=${manifest.workflowCount}`,
    ].join(" "),
  };
}

export function assertProductCompilerPass(
  report: ProductCompilerReport,
): asserts report is ProductCompilerReport & { compilerReady: true } {
  if (!report.compilerReady) {
    throw new Error(`V80 APP product compiler not ready: ${report.summary}`);
  }
}
