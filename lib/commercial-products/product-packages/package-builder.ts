import type { ProductSku } from "../shared/constants";
import type { ProductPackageResult, ProductPackagingInput } from "../shared/types";
import { buildDeliveryPackage } from "./delivery-package";
import { buildKickstartPackage } from "./kickstart-package";
import { buildTenderReadyPackage } from "./tender-ready-package";

export function buildProductPackage(
  sku: ProductSku,
  input: ProductPackagingInput,
): ProductPackageResult {
  if (sku === "kickstart-package") return buildKickstartPackage(input);
  if (sku === "tender-ready-package") return buildTenderReadyPackage(input);
  return buildDeliveryPackage(input);
}

export { buildKickstartPackage } from "./kickstart-package";
export { buildTenderReadyPackage } from "./tender-ready-package";
export { buildDeliveryPackage } from "./delivery-package";
