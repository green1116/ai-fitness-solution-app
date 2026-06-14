import { buildCatalogRegistryRecords } from "@/lib/product-catalog";
import { findBrandByNameOrAlias } from "../brand-registry";
import type { RegistryValidation, TenderBrandStub } from "../shared/types";

function resolveBrandIdFromCatalogMetadata(metadata: Record<string, string>): string | undefined {
  const proposalType = metadata.proposalType;
  if (proposalType === "equipment") return "brand-life-fitness";
  if (proposalType === "commercial") return "brand-technogym";
  if (proposalType === "construction") return "brand-shuhua";
  return "brand-matrix";
}

export function buildTenderBrandStubRecords(): TenderBrandStub[] {
  const catalogs = buildCatalogRegistryRecords();

  return catalogs.map((catalog, index) => {
    const productBrandName = catalog.metadata.sourceType ?? "";
    void productBrandName;
    const brandId =
      findBrandByNameOrAlias("Life Fitness")?.brandId ??
      resolveBrandIdFromCatalogMetadata(catalog.metadata) ??
      "brand-matrix";

    const rank = index + 1;
    const matchScore = Math.min(
      100,
      Math.round(catalog.score.totalCatalogScore * 0.6 + catalog.score.matchingScore * 0.4),
    );

    return {
      stubId: `tender-brand-stub-${catalog.tenderId}-${brandId}`,
      brandId,
      tenderId: catalog.tenderId,
      proposalId: catalog.proposalId,
      catalogId: catalog.catalogId,
      matchScore,
      stubReady: matchScore >= 50 && Boolean(catalog.tenderId),
      mode: "brand-intelligence-network",
    };
  });
}

export function getTenderBrandStubByTenderId(tenderId: string): TenderBrandStub[] {
  return buildTenderBrandStubRecords().filter((stub) => stub.tenderId === tenderId);
}

export function getTenderBrandStubByBrandId(brandId: string): TenderBrandStub[] {
  return buildTenderBrandStubRecords().filter((stub) => stub.brandId === brandId);
}

export function validateTenderStubRegistry(): RegistryValidation {
  const stubs = buildTenderBrandStubRecords();
  const ready = stubs.filter((s) => s.stubReady);

  const valid = stubs.length >= 12 && ready.length >= 5;

  return {
    valid,
    count: ready.length,
    summary: `tender-stub-registry count=${stubs.length} ready=${ready.length} valid=${valid}`,
  };
}

export function validateTenderStubReadyStats(): RegistryValidation {
  const stubs = buildTenderBrandStubRecords();
  const readyRate =
    stubs.length === 0 ? 0 : Math.round((stubs.filter((s) => s.stubReady).length / stubs.length) * 100);

  return {
    valid: readyRate >= 30,
    count: stubs.filter((s) => s.stubReady).length,
    summary: `tender-stub-ready rate=${readyRate}% valid=${readyRate >= 30}`,
  };
}
