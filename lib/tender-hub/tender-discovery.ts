import { buildTenderRegistryRecords } from "./tender-registry";
import type {
  RegistryValidation,
  TenderDiscovery,
  TenderHubStatus,
  TenderSourceType,
} from "./shared/types";
import { TENDER_HUB_VERSION } from "./shared/types";

function buildSourceBreakdown(
  tenders: ReturnType<typeof buildTenderRegistryRecords>,
): Record<TenderSourceType, number> {
  const breakdown: Record<TenderSourceType, number> = {
    government: 0,
    enterprise: 0,
    school: 0,
    hospital: 0,
    factory: 0,
    "commercial-building": 0,
    "sports-center": 0,
  };

  for (const tender of tenders) {
    breakdown[tender.sourceType] += 1;
  }

  return breakdown;
}

function buildStatusBreakdown(
  tenders: ReturnType<typeof buildTenderRegistryRecords>,
): Record<TenderHubStatus, number> {
  const breakdown: Record<TenderHubStatus, number> = {
    discovered: 0,
    registered: 0,
    qualified: 0,
    tracked: 0,
    matched: 0,
    proposed: 0,
    submitted: 0,
    awarded: 0,
    closed: 0,
  };

  for (const tender of tenders) {
    breakdown[tender.tenderStatus] += 1;
  }

  return breakdown;
}

export function buildTenderDiscovery(): TenderDiscovery {
  const discoveredTenders = buildTenderRegistryRecords().filter(
    (tender) =>
      tender.tenderStatus === "discovered" ||
      tender.tenderStatus === "registered" ||
      tender.tenderStatus === "qualified",
  );

  return {
    discoveryId: `tender-discovery-${TENDER_HUB_VERSION}`,
    discoveredTenders,
    sourceBreakdown: buildSourceBreakdown(buildTenderRegistryRecords()),
    statusBreakdown: buildStatusBreakdown(buildTenderRegistryRecords()),
    discoveryReady: discoveredTenders.length >= 3,
    mode: "tender-hub",
  };
}

export function validateTenderDiscovery(): RegistryValidation {
  const discovery = buildTenderDiscovery();

  const valid =
    discovery.discoveryReady &&
    discovery.discoveredTenders.length >= 3 &&
    Object.values(discovery.sourceBreakdown).every((count) => count > 0) &&
    Object.values(discovery.statusBreakdown).every((count) => count > 0);

  return {
    valid,
    count: discovery.discoveredTenders.length,
    summary: `tender-discovery discovered=${discovery.discoveredTenders.length} sources=7/7 statuses=9/9 valid=${valid}`,
  };
}
