/**
 * E01-P7 — Enterprise Delivery entry
 */

export {
  assertDeliveryKernelPass,
  buildDeliveryKernel,
  buildDeliveryLifecycle,
  buildEnterpriseDeliveryPackage,
} from "./delivery.builder";

export {
  assertValidOrchestration,
  DELIVERY_ARTIFACT_KINDS,
  DELIVERY_CHECKLIST_STATUSES,
  DELIVERY_LIFECYCLE_STAGES,
  DELIVERY_PACKAGE_STATUSES,
  validateDeliveryKernelInput,
  validateDeliveryPackage,
  validateOrchestrationInput,
} from "./delivery.schema";

export type { SchemaIssue, SchemaResult } from "./delivery.schema";

export {
  V101_ENTERPRISE_DELIVERY_FREEZE_VERSION,
  V101_ENTERPRISE_DELIVERY_VERSION,
} from "./delivery.types";

export type {
  DeliveryArtifactKind,
  DeliveryChecklistItem,
  DeliveryChecklistStatus,
  DeliveryKernelInput,
  DeliveryKernelResult,
  DeliveryLayer,
  DeliveryLifecycle,
  DeliveryLifecycleStage,
  DeliveryLifecycleTransition,
  DeliveryPackageItem,
  DeliveryPackageStatus,
  DeliverySeal,
  EnterpriseDeliveryPackage,
} from "./delivery.types";

import {
  assertDeliveryKernelPass,
  buildDeliveryKernel,
} from "./delivery.builder";
import type {
  DeliveryKernelInput,
  DeliveryKernelResult,
} from "./delivery.types";

export function runDeliveryKernel(input: DeliveryKernelInput): DeliveryKernelResult {
  return buildDeliveryKernel(input);
}

export function runDeliveryKernelOrThrow(
  input: DeliveryKernelInput,
): DeliveryKernelResult & {
  ready: true;
  package: NonNullable<DeliveryKernelResult["package"]> & {
    status: "sealed";
    seal: NonNullable<NonNullable<DeliveryKernelResult["package"]>["seal"]>;
  };
} {
  const result = buildDeliveryKernel(input);
  assertDeliveryKernelPass(result);
  return result;
}

export function formatDeliveryKernelSummary(result: DeliveryKernelResult): string {
  const lines = [
    "V101 Enterprise Delivery Intelligence",
    `  ready: ${result.ready}`,
    `  score: ${result.readinessScore}/100`,
    `  version: ${result.version}`,
    `  freeze: ${result.freezeVersion}`,
    `  orchestration: ${result.orchestration.reportId} ready=${result.orchestration.ready}`,
    `  package: ${
      result.package
        ? `status=${result.package.status} items=${result.package.presentCount}/${result.package.itemCount} completeness=${result.package.completenessRatio}`
        : "none"
    }`,
    `  seal: ${result.package?.seal ? result.package.seal.packageHash : "none"}`,
    `  lifecycle: ${result.lifecycle.current} complete=${result.lifecycle.complete}`,
    `  transitions: ${result.lifecycle.transitions.length}`,
  ];
  return lines.join("\n");
}
