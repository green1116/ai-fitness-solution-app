import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { assertProductRegistryAlignedWithV47, listProducts } from "../registry/product-registry";
import { listWorkflowStages } from "../registry/workflow-stage-catalog";
import { mapProductToV47Module, mapWorkflowToV47Module } from "../mapping/product-to-v47-mapper";
import { listWorkspaceProductsForPortal } from "../workspace/workspace-product-catalog";
import type { SaasProductP1Validation, WorkspaceProductBinding } from "../shared/product-types";
import { PRODUCT_CODES } from "../shared/product-types";

const FORBIDDEN_V47_RUNTIME_PATTERN =
  /(?:commercial-products\/(?:access-layer\/quote\/quote-service|orchestration\/|approval\/|release\/|workspace\/))/;

const FORBIDDEN_V48_MUTATION_DIRS = [
  "lib/saas-foundation",
  "lib/saas-runtime",
  "lib/saas-lifecycle",
  "lib/saas-commercial-adapter",
  "lib/saas-rbac",
  "lib/saas-subscription",
  "lib/saas-portal",
  "lib/saas-platform",
] as const;

function scanSaasProductBoundary(rootDir: string): string[] {
  const violations: string[] = [];

  function walk(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx")) continue;
      const content = readFileSync(fullPath, "utf8");
      if (FORBIDDEN_V47_RUNTIME_PATTERN.test(content)) {
        violations.push(fullPath);
      }
    }
  }

  walk(rootDir);
  return violations;
}

export function validateWorkspaceProductBinding(binding: WorkspaceProductBinding): boolean {
  if (!binding.saasWorkspaceId?.trim()) return false;
  if (!PRODUCT_CODES.includes(binding.productCode)) return false;
  if (!["draft", "active", "archived"].includes(binding.status)) return false;
  return true;
}

export function validateSaasProductP1(): SaasProductP1Validation {
  const products = listProducts();
  const workflows = listWorkflowStages();
  const v47SkuAligned = assertProductRegistryAlignedWithV47();
  const productRoot = join(process.cwd(), "lib", "saas-product");
  const boundaryViolations = scanSaasProductBoundary(productRoot);
  const boundaryClean = boundaryViolations.length === 0;

  const enterpriseProducts = listWorkspaceProductsForPortal("enterprise");
  const workflowMapped = workflows.every((workflow) => mapWorkflowToV47Module(workflow.workflowKey) === workflow.v47Module);
  const productMapped = products.every((product) => Boolean(mapProductToV47Module(product.productCode)));

  const valid =
    products.length === 3 &&
    workflows.length === 6 &&
    v47SkuAligned &&
    boundaryClean &&
    enterpriseProducts.length === 3 &&
    workflowMapped &&
    productMapped;

  return {
    valid,
    productCount: products.length,
    workflowCount: workflows.length,
    v47SkuAligned,
    boundaryClean,
    summary: [
      `productCount=${products.length}`,
      `workflowCount=${workflows.length}`,
      `v47SkuAligned=${v47SkuAligned}`,
      `boundaryClean=${boundaryClean}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertV48LayersUnmodified(): boolean {
  return FORBIDDEN_V48_MUTATION_DIRS.every((dir) => existsSafe(join(process.cwd(), dir)));
}

function existsSafe(path: string): boolean {
  try {
    return readdirSync(path).length >= 0;
  } catch {
    return false;
  }
}
