/**
 * E02-P7 — Knowledge Delivery entry
 */

export {
  assertKnowledgeDeliveryKernelPass,
  buildEnterpriseKnowledgePackage,
  buildKnowledgeDeliveryKernel,
  buildKnowledgeDeliveryLifecycle,
} from "./delivery.builder";

export {
  assertValidEnterpriseKnowledgePackage,
  KNOWLEDGE_DELIVERY_LIFECYCLE_STAGES,
  KNOWLEDGE_PACKAGE_SECTION_KINDS,
  KNOWLEDGE_PACKAGE_STATUSES,
  validateEnterpriseKnowledgePackage,
  validateKnowledgeDeliveryKernelInput,
  validateMemoryRecommendationInput,
} from "./delivery.schema";

export type { SchemaIssue, SchemaResult } from "./delivery.schema";

export {
  V102_KNOWLEDGE_DELIVERY_FREEZE_VERSION,
  V102_KNOWLEDGE_DELIVERY_VERSION,
} from "./delivery.types";

export type {
  EnterpriseKnowledgePackage,
  KnowledgeDeliveryKernelInput,
  KnowledgeDeliveryKernelResult,
  KnowledgeDeliveryLifecycle,
  KnowledgeDeliveryLifecycleStage,
  KnowledgeDeliveryLifecycleTransition,
  KnowledgePackageChecklistItem,
  KnowledgePackageChecklistStatus,
  KnowledgePackageSeal,
  KnowledgePackageSection,
  KnowledgePackageSectionKind,
  KnowledgePackageStatus,
} from "./delivery.types";

import {
  assertKnowledgeDeliveryKernelPass,
  buildKnowledgeDeliveryKernel,
} from "./delivery.builder";
import type {
  KnowledgeDeliveryKernelInput,
  KnowledgeDeliveryKernelResult,
} from "./delivery.types";

export function runKnowledgeDeliveryKernel(
  input: KnowledgeDeliveryKernelInput,
): KnowledgeDeliveryKernelResult {
  return buildKnowledgeDeliveryKernel(input);
}

export function runKnowledgeDeliveryKernelOrThrow(
  input: KnowledgeDeliveryKernelInput,
): KnowledgeDeliveryKernelResult & {
  ready: true;
  package: NonNullable<KnowledgeDeliveryKernelResult["package"]> & {
    status: "sealed";
    seal: NonNullable<
      NonNullable<KnowledgeDeliveryKernelResult["package"]>["seal"]
    >;
  };
} {
  const result = buildKnowledgeDeliveryKernel(input);
  assertKnowledgeDeliveryKernelPass(result);
  return result;
}

export function formatKnowledgeDeliveryKernelSummary(
  result: KnowledgeDeliveryKernelResult,
): string {
  const lines = [
    "V102 Knowledge Delivery Intelligence",
    `  ready: ${result.ready}`,
    `  score: ${result.readinessScore}/100`,
    `  version: ${result.version}`,
    `  freeze: ${result.freezeVersion}`,
    `  recommendation: ${result.recommendation.id} status=${result.recommendation.status}`,
    `  package: ${
      result.package
        ? `status=${result.package.status} sections=${result.package.sectionCount} recs=${result.package.recommendationCount} completeness=${result.package.completenessRatio}`
        : "none"
    }`,
    `  seal: ${result.package?.seal ? result.package.seal.packageHash : "none"}`,
    `  lifecycle: ${result.lifecycle.current} complete=${result.lifecycle.complete}`,
    `  transitions: ${result.lifecycle.transitions.length}`,
  ];
  return lines.join("\n");
}
