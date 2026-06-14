import { getAllRealBrands } from "@/lib/real-catalog-foundation";
import type { RealBrandTier } from "@/lib/real-catalog-foundation";
import type {
  ManufacturerAuthorizationStatus,
  ManufacturerRecord,
  ManufacturerRegistry,
  ManufacturerStatus,
  RegistryValidation,
} from "./shared/types";

function slugifyManufacturerId(name: string): string {
  return `mfr-${name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48)}`;
}

function mapAuthorizationStatus(brandCount: number): ManufacturerAuthorizationStatus {
  if (brandCount >= 2) return "authorized";
  if (brandCount === 1) return "authorized";
  return "pending";
}

const manufacturerOverrides = new Map<string, ManufacturerRecord>();

export function buildManufacturerRegistryRecords(): ManufacturerRecord[] {
  const brands = getAllRealBrands();
  const grouped = new Map<string, { name: string; region: string; brandIds: string[] }>();

  for (const brand of brands) {
    const key = brand.manufacturer.trim();
    const existing = grouped.get(key);
    if (existing) {
      existing.brandIds.push(brand.brandId);
    } else {
      grouped.set(key, {
        name: brand.manufacturer,
        region: brand.originCountry,
        brandIds: [brand.brandId],
      });
    }
  }

  if (!grouped.has("Relax Fitness Equipment Co., Ltd.")) {
    grouped.set("Relax Fitness Equipment Co., Ltd.", {
      name: "Relax Fitness Equipment Co., Ltd.",
      region: "China",
      brandIds: ["brand-relax"],
    });
  }

  const seeded = [...grouped.values()].map((entry) => {
    const manufacturerId = slugifyManufacturerId(entry.name);
    return {
      manufacturerId,
      manufacturerName: entry.name,
      region: entry.region,
      status: "active" as ManufacturerStatus,
      brandIds: entry.brandIds,
      authorizationStatus: mapAuthorizationStatus(entry.brandIds.length),
      metadata: {
        headquarters: brands.find((b) => b.manufacturer === entry.name)?.headquarters ?? "",
        brandCount: String(entry.brandIds.length),
      },
      mode: "brand-intelligence-network" as const,
    };
  });

  const merged: ManufacturerRecord[] = [...seeded];

  if (!merged.some((m) => m.brandIds.includes("brand-relax"))) {
    merged.push({
      manufacturerId: "mfr-relax-fitness-equipment-co-ltd",
      manufacturerName: "Relax Fitness Equipment Co., Ltd.",
      region: "China",
      status: "active",
      brandIds: ["brand-relax"],
      authorizationStatus: "authorized",
      metadata: {
        headquarters: "Shanghai, China",
        brandCount: "1",
      },
      mode: "brand-intelligence-network",
    });
  }

  for (const override of manufacturerOverrides.values()) {
    const index = merged.findIndex((m) => m.manufacturerId === override.manufacturerId);
    if (index >= 0) merged[index] = override;
    else merged.push(override);
  }

  return merged;
}

export function buildManufacturerRegistry(): ManufacturerRegistry {
  const manufacturers = buildManufacturerRegistryRecords();
  return {
    registryId: "manufacturer-registry-v38",
    manufacturers,
    manufacturerCount: manufacturers.length,
    registryReady: manufacturers.length >= 6,
    mode: "brand-intelligence-network",
  };
}

export function registerManufacturer(record: ManufacturerRecord): ManufacturerRecord {
  manufacturerOverrides.set(record.manufacturerId, { ...record, mode: "brand-intelligence-network" });
  return record;
}

export function findManufacturerById(manufacturerId: string): ManufacturerRecord | undefined {
  return buildManufacturerRegistryRecords().find((m) => m.manufacturerId === manufacturerId);
}

export function findManufacturersByRegion(region: string): ManufacturerRecord[] {
  return buildManufacturerRegistryRecords().filter(
    (m) => m.region.toLowerCase() === region.toLowerCase(),
  );
}

export function findManufacturerByBrandId(brandId: string): ManufacturerRecord | undefined {
  return buildManufacturerRegistryRecords().find((m) => m.brandIds.includes(brandId));
}

export function validateManufacturerRegistry(): RegistryValidation {
  const manufacturers = buildManufacturerRegistryRecords();
  const ids = new Set(manufacturers.map((m) => m.manufacturerId));
  const unique = ids.size === manufacturers.length;
  const allBrandsLinked =
    getAllRealBrands().every((brand) =>
      manufacturers.some((m) => m.brandIds.includes(brand.brandId)),
    ) && manufacturers.some((m) => m.brandIds.includes("brand-relax"));

  const valid = manufacturers.length >= 6 && unique && allBrandsLinked;

  return {
    valid,
    count: manufacturers.length,
    summary: `manufacturer-registry count=${manufacturers.length} unique=${unique} brandsLinked=${allBrandsLinked} valid=${valid}`,
  };
}

export type { RealBrandTier };
