import type { TenderSourceType } from "./shared/types";
import { TENDER_SOURCE_REGISTRY } from "./tender-source";
import type { RegistryValidation } from "./shared/types";

export function validateTenderSourceRegistry(): RegistryValidation {
  const requiredSources: TenderSourceType[] = [
    "government",
    "enterprise",
    "school",
    "hospital",
    "factory",
    "commercial-building",
    "sports-center",
  ];

  const valid =
    TENDER_SOURCE_REGISTRY.length === 7 &&
    requiredSources.every((source) =>
      TENDER_SOURCE_REGISTRY.some((entry) => entry.sourceType === source),
    );

  return {
    valid,
    count: TENDER_SOURCE_REGISTRY.length,
    summary: `tender-source count=${TENDER_SOURCE_REGISTRY.length} types=7/7 valid=${valid}`,
  };
}
