import { validateTenderDiscovery } from "./tender-discovery";
import { validateTenderFeed } from "./tender-feed";
import { validateTenderHub } from "./tender-hub";
import { validateTenderQueryRegistry } from "./tender-query";
import { validateTenderRegistry } from "./tender-registry";
import { validateTenderSourceRegistry } from "./tender-source-validation";
import type { TenderHubValidation } from "./shared/types";

export function validateTenderHubFoundation(): TenderHubValidation {
  const sourceRegistry = validateTenderSourceRegistry();
  const tenderRegistry = validateTenderRegistry();
  const tenderFeed = validateTenderFeed();
  const tenderDiscovery = validateTenderDiscovery();
  const tenderHub = validateTenderHub();
  const tenderQuery = validateTenderQueryRegistry();

  return {
    valid:
      sourceRegistry.valid &&
      tenderRegistry.valid &&
      tenderFeed.valid &&
      tenderDiscovery.valid &&
      tenderHub.valid &&
      tenderQuery.valid,
    sourceRegistry,
    tenderRegistry,
    tenderFeed,
    tenderDiscovery,
    tenderHub,
    tenderQuery,
  };
}
