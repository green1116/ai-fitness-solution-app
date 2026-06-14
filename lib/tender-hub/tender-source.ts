import type { TenderSource, TenderSourceType } from "./shared/types";

export const TENDER_SOURCE_REGISTRY: TenderSource[] = [
  {
    sourceId: "th-source-government",
    sourceType: "government",
    sourceName: "Government Procurement Portal",
    region: "national",
    channel: "public-procurement",
    mode: "tender-hub",
  },
  {
    sourceId: "th-source-enterprise",
    sourceType: "enterprise",
    sourceName: "Enterprise Direct Procurement",
    region: "national",
    channel: "enterprise-portal",
    mode: "tender-hub",
  },
  {
    sourceId: "th-source-school",
    sourceType: "school",
    sourceName: "School & Campus Procurement Network",
    region: "East China",
    channel: "education-procurement",
    mode: "tender-hub",
  },
  {
    sourceId: "th-source-hospital",
    sourceType: "hospital",
    sourceName: "Hospital Rehabilitation Procurement Board",
    region: "national",
    channel: "healthcare-procurement",
    mode: "tender-hub",
  },
  {
    sourceId: "th-source-factory",
    sourceType: "factory",
    sourceName: "Industrial Factory Wellness Procurement",
    region: "South China",
    channel: "industrial-procurement",
    mode: "tender-hub",
  },
  {
    sourceId: "th-source-commercial-building",
    sourceType: "commercial-building",
    sourceName: "Commercial Building Operator Network",
    region: "East China",
    channel: "commercial-operator",
    mode: "tender-hub",
  },
  {
    sourceId: "th-source-sports-center",
    sourceType: "sports-center",
    sourceName: "Sports Center Facility Exchange",
    region: "national",
    channel: "sports-facility",
    mode: "tender-hub",
  },
];

export function getAllTenderSources(): TenderSource[] {
  return [...TENDER_SOURCE_REGISTRY];
}

export function getTenderSourceByType(sourceType: TenderSourceType): TenderSource | undefined {
  return TENDER_SOURCE_REGISTRY.find((source) => source.sourceType === sourceType);
}

export function getTenderSourceById(sourceId: string): TenderSource | undefined {
  return TENDER_SOURCE_REGISTRY.find((source) => source.sourceId === sourceId);
}
