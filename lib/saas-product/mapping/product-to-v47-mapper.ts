import { PRODUCT_ERROR_CODES, SaasProductError } from "../shared/product-errors";
import type { ProductCode } from "../shared/product-types";
import { resolveWorkflowStage } from "../registry/workflow-stage-catalog";

const PRODUCT_TO_V47_MODULE: Record<ProductCode, string> = {
  "kickstart-package": "access-layer/quote",
  "tender-ready-package": "access-layer/quote",
  "delivery-intelligence-package": "access-layer/quote",
};

export function mapProductToV47Module(productCode: ProductCode): string {
  const modulePath = PRODUCT_TO_V47_MODULE[productCode];
  if (!modulePath) {
    throw new SaasProductError(
      PRODUCT_ERROR_CODES.V47_MODULE_NOT_MAPPED,
      `V47 module not mapped for product: ${productCode}`,
    );
  }
  return modulePath;
}

export function mapWorkflowToV47Module(workflowKey: string): string {
  return resolveWorkflowStage(workflowKey).v47Module;
}
