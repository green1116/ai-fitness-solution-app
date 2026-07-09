/**
 * V80 APP P1 — Product Compiler Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  PRODUCT_API_MAP,
  PRODUCT_MODULE_MAP,
  PRODUCT_OUTPUT_CATALOG,
  PRODUCT_WORKFLOW_MAP,
  V80_APP_PRODUCT_COMPILER_VERSION,
  assertProductCompilerPass,
  buildProductCompiler,
  formatProductCompilerSummary,
  getProductModuleByClosureRef,
  getProductOutputsByKind,
  getProductWorkflowByKey,
  isProductApiMapComplete,
  isProductModuleMapComplete,
  isProductOutputCatalogComplete,
  isProductWorkflowMapComplete,
  runProductCompiler,
} from "../lib/app/v80/product.compiler.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v80-app-p1-product-compiler";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/app/v80/product.compiler.ts",
    "lib/app/v80/product.module.map.ts",
    "lib/app/v80/product.api.map.ts",
    "lib/app/v80/product.workflow.map.ts",
    "lib/app/v80/product.outputs.ts",
    "lib/app/v80/product.compiler.builder.ts",
    "lib/app/v80/product.compiler.entry.ts",
    "docs/V80-APP-P1-PRODUCT-COMPILER.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ V80 APP product compiler module structure");
}

function testMaps() {
  check(PRODUCT_MODULE_MAP.length === 6, "module map");
  check(PRODUCT_API_MAP.length === 8, "api map");
  check(PRODUCT_WORKFLOW_MAP.length === 6, "workflow map");
  check(PRODUCT_OUTPUT_CATALOG.length === 8, "output catalog");
  check(isProductModuleMapComplete(), "modules complete");
  check(isProductApiMapComplete(), "apis complete");
  check(isProductWorkflowMapComplete(), "workflows complete");
  check(isProductOutputCatalogComplete(), "outputs complete");

  const mod = getProductModuleByClosureRef("SYS-CLS-001");
  check(mod?.saasModule === "enterprise-saas", "P1 → enterprise-saas");

  const wfl = getProductWorkflowByKey("budget-composition");
  check(wfl?.domain === "budget", "budget workflow");

  check(getProductOutputsByKind("pdf").length >= 3, "pdf outputs");

  console.log("✓ module, api, workflow & output maps");
}

function testReport() {
  const ready = buildProductCompiler({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V80_APP_PRODUCT_COMPILER_VERSION, "compiler version");
  check(ready.kernelSealed, "kernel sealed");
  check(ready.manifest.compilerComplete, "compiler complete");
  check(ready.compilerReady, "compiler ready");
  check(ready.readinessScore === 100, "readiness 100");
  assertProductCompilerPass(ready);

  const run = runProductCompiler({ deploymentId: DEPLOYMENT_ID });
  check(run.compilerReady, "run ready");

  console.log("✓ product compiler report");
  console.log(formatProductCompilerSummary(ready));
  console.log("\n✅ V80 APP P1 Product Compiler — verify PASS");
}

function main() {
  console.log("V80 APP P1 Product Compiler Verification\n");
  checkModuleStructure();
  testMaps();
  testReport();
}

main();
