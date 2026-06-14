import { getAllRealEquipment } from "@/lib/real-catalog-foundation";
import {
  getAllCertificationProfiles,
  getCertificationProfilesByBrandId,
} from "@/lib/brand-portal/certification-profile/data";
import {
  getCaseStudyProfilesByBrandId,
} from "@/lib/brand-portal/case-study-profile/data";
import { getSupplierLinksByBrandId } from "../brand-mapping/supplier-link-registry";
import { getSkuLinksByBrandId } from "../brand-mapping/sku-link-registry";
import { buildBrandRegistryRecords, findBrandById } from "../brand-registry";
import { findManufacturerByBrandId } from "../manufacturer-registry";
import type { BrandEvidenceLink } from "../shared/types";

function mapCertType(certificateType: string): BrandEvidenceLink["evidenceKind"] {
  if (certificateType.toLowerCase().includes("test")) return "test-report";
  return "certificate";
}

export function buildBrandEvidenceLinksForBrand(brandId: string): BrandEvidenceLink[] {
  const brand = findBrandById(brandId);
  if (!brand) return [];

  const manufacturer = findManufacturerByBrandId(brandId);
  const links: BrandEvidenceLink[] = [];

  for (const cert of getCertificationProfilesByBrandId(brandId)) {
    links.push({
      linkId: `evidence-link-${brandId}-cert-${cert.certificateType.toLowerCase()}`,
      brandId,
      manufacturerId: manufacturer?.manufacturerId,
      evidenceRef: cert.documentRef,
      evidenceKind: mapCertType(cert.certificateType),
      sourceLayer: "v26-brand-portal",
      documentRef: cert.documentRef,
      validUntil: cert.validUntil,
      linkStatus: "active",
      mode: "brand-intelligence-network",
    });
  }

  const equipment = getAllRealEquipment().filter((e) => e.brandId === brandId);
  for (const item of equipment.slice(0, 2)) {
    links.push({
      linkId: `evidence-link-${brandId}-ds-${item.sku}`,
      brandId,
      manufacturerId: manufacturer?.manufacturerId,
      sku: item.sku,
      evidenceRef: item.datasheetRef,
      evidenceKind: "datasheet",
      sourceLayer: "v20-real-catalog",
      documentRef: item.datasheetRef,
      linkStatus: "active",
      mode: "brand-intelligence-network",
    });
  }

  for (const study of getCaseStudyProfilesByBrandId(brandId)) {
    links.push({
      linkId: `evidence-link-${brandId}-case-${study.documentRef}`,
      brandId,
      manufacturerId: manufacturer?.manufacturerId,
      evidenceRef: study.documentRef,
      evidenceKind: "case-study",
      sourceLayer: "v26-brand-portal",
      documentRef: study.documentRef,
      linkStatus: "active",
      mode: "brand-intelligence-network",
    });
    links.push({
      linkId: `evidence-link-${brandId}-proj-${study.documentRef}`,
      brandId,
      manufacturerId: manufacturer?.manufacturerId,
      evidenceRef: `project-ref-${study.documentRef}`,
      evidenceKind: "project-reference",
      sourceLayer: "v26-brand-portal",
      documentRef: study.documentRef,
      linkStatus: "active",
      mode: "brand-intelligence-network",
    });
  }

  if (getSupplierLinksByBrandId(brandId).length > 0) {
    links.push({
      linkId: `evidence-link-${brandId}-auth-letter`,
      brandId,
      manufacturerId: manufacturer?.manufacturerId,
      evidenceRef: `auth-letter-${brandId}`,
      evidenceKind: "authorization",
      sourceLayer: "v38-brand-intelligence-network",
      documentRef: `auth-letter-${brandId}`,
      linkStatus: "active",
      mode: "brand-intelligence-network",
    });
  }

  return links;
}

export function buildBrandEvidenceLinkRecords(): BrandEvidenceLink[] {
  void getAllCertificationProfiles();
  return buildBrandRegistryRecords().flatMap((brand) =>
    buildBrandEvidenceLinksForBrand(brand.brandId),
  );
}

export function getEvidenceLinksByBrandId(brandId: string): BrandEvidenceLink[] {
  return buildBrandEvidenceLinkRecords().filter((link) => link.brandId === brandId);
}

export function getEvidenceCoverageStats() {
  const links = buildBrandEvidenceLinkRecords();
  const byBrand = new Map<string, number>();
  const byKind = new Map<string, number>();

  for (const link of links) {
    byBrand.set(link.brandId, (byBrand.get(link.brandId) ?? 0) + 1);
    byKind.set(link.evidenceKind, (byKind.get(link.evidenceKind) ?? 0) + 1);
  }

  return {
    totalLinks: links.length,
    brandCoverage: byBrand.size,
    kindBreakdown: Object.fromEntries(byKind),
    averagePerBrand: byBrand.size === 0 ? 0 : Math.round(links.length / byBrand.size),
  };
}

export function validateEvidenceRefUniqueness(): { valid: boolean; duplicates: string[] } {
  const links = buildBrandEvidenceLinkRecords();
  const seen = new Map<string, string>();
  const duplicates: string[] = [];

  for (const link of links) {
    const existing = seen.get(link.evidenceRef);
    if (existing && existing !== link.linkId) {
      duplicates.push(link.evidenceRef);
    } else {
      seen.set(link.evidenceRef, link.linkId);
    }
  }

  return { valid: duplicates.length === 0, duplicates };
}
