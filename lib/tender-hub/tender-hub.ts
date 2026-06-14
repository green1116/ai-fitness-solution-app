import { getAllTenderSources } from "./tender-source";
import { buildTenderDiscovery } from "./tender-discovery";
import { buildTenderFeed } from "./tender-feed";
import { buildTenderRegistryRecords, validateTenderRegistry } from "./tender-registry";
import type { RegistryValidation, TenderHub, TenderRegistry } from "./shared/types";
import { TENDER_HUB_VERSION } from "./shared/types";

function buildRegistrySnapshot(): TenderRegistry {
  const tenders = buildTenderRegistryRecords();

  return {
    registryId: `tender-registry-${TENDER_HUB_VERSION}`,
    tenders,
    tenderCount: tenders.length,
    sourceBreakdown: buildTenderDiscovery().sourceBreakdown,
    statusBreakdown: buildTenderDiscovery().statusBreakdown,
    registryReady: tenders.length > 0,
    mode: "tender-hub",
  };
}

export function buildTenderHub(): TenderHub {
  const sources = getAllTenderSources();
  const registry = buildRegistrySnapshot();
  const feed = buildTenderFeed(10);
  const discovery = buildTenderDiscovery();

  return {
    hubId: `tender-hub-${TENDER_HUB_VERSION}`,
    sources,
    registry,
    feed,
    discovery,
    hubReady:
      sources.length === 7 &&
      registry.registryReady &&
      feed.feedReady &&
      discovery.discoveryReady,
    mode: "tender-hub",
  };
}

export function validateTenderHub(): RegistryValidation {
  const hub = buildTenderHub();
  const registryValidation = validateTenderRegistry();

  const valid =
    hub.hubReady &&
    hub.sources.length === 7 &&
    registryValidation.valid &&
    hub.feed.feedCount >= 5 &&
    hub.discovery.discoveredTenders.length >= 3;

  return {
    valid,
    count: hub.registry.tenderCount,
    summary: `tender-hub tenders=${hub.registry.tenderCount} sources=${hub.sources.length}/7 feed=${hub.feed.feedCount} discovery=${hub.discovery.discoveredTenders.length} valid=${valid}`,
  };
}
