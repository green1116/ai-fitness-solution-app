import { buildBrandRegistryRecords } from "@/lib/brand-intelligence-network";
import { PI_CANONICAL_ID } from "../shared/constants";
import type { SupplierRegistry, SupplierRegistryRecord } from "./supplier-types";

const STUB_SUPPLIERS: SupplierRegistryRecord[] = [
  {
    id: "pi-supplier-stub-fitness-east",
    name: "East China Fitness Supply",
    brandIds: [],
    capabilityTags: [
      "capability-gym-equipment",
      "capability-fitness-center",
      "capability-procurement-channel",
    ],
    region: "east-china",
    availabilityStatus: "in-stock",
    reliabilityScore: 72,
    source: "v43-procurement-stub",
  },
  {
    id: "pi-supplier-stub-sports-hall",
    name: "Sports Hall Procurement Partner",
    brandIds: [],
    capabilityTags: [
      "capability-sports-hall",
      "capability-sports-flooring",
      "capability-procurement-channel",
    ],
    region: "national",
    availabilityStatus: "limited",
    reliabilityScore: 68,
    source: "v43-procurement-stub",
  },
];

function toCapabilityTag(sector: string): string {
  return sector.startsWith("capability-") ? sector : `capability-${sector}`;
}

function buildSupplierFromBrand(
  brand: ReturnType<typeof buildBrandRegistryRecords>[number],
): SupplierRegistryRecord {
  return {
    id: `pi-supplier-${brand.brandId}`,
    name: `${brand.brandName} Procurement Channel`,
    brandIds: [brand.brandId],
    capabilityTags: [
      ...brand.industrySectors.map(toCapabilityTag),
      "capability-procurement-channel",
    ],
    region: brand.metadata.region,
    availabilityStatus: "in-stock",
    reliabilityScore: Math.min(100, Math.round(brand.score.totalBrandScore)),
    source: "v38-brand-intelligence-network",
  };
}

let cachedRegistry: SupplierRegistry | undefined;

export function buildSupplierRegistry(): SupplierRegistry {
  if (cachedRegistry) return cachedRegistry;

  const brandRecords = buildBrandRegistryRecords().map(buildSupplierFromBrand);
  const seen = new Set(brandRecords.map((record) => record.id));
  const records = [
    ...brandRecords,
    ...STUB_SUPPLIERS.filter((stub) => !seen.has(stub.id)),
  ];

  cachedRegistry = {
    registryId: "pi-supplier-registry-v43-p1a",
    records,
    count: records.length,
    mode: PI_CANONICAL_ID,
  };

  return cachedRegistry;
}
