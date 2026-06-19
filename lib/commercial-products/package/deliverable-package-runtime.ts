import { DELIVERABLE_PACKAGE_VERSION } from "./deliverable-package-types";
import type { DeliverablePackageRequest, DeliverablePackageResult } from "./deliverable-package-types";

export async function runDeliverablePackageRuntime(
  request: DeliverablePackageRequest,
): Promise<DeliverablePackageResult> {
  const { buildDeliverablePackage } = await import("./deliverable-package-builder");
  return buildDeliverablePackage(request);
}

export function getDeliverablePackageRuntimeMeta() {
  return {
    runtimeId: "cp-deliverable-package-runtime-v47-p2-s5",
    version: DELIVERABLE_PACKAGE_VERSION,
    mode: "commercial-products-package" as const,
  };
}
