import { getV20BrandEntries } from "@/lib/data-asset-loader";
import { getAllBrandProfiles } from "../brand-profile";
import { getAllCaseStudyProfiles } from "../case-study-profile";
import { getAllCertificationProfiles } from "../certification-profile";
import { getAllProductProfiles } from "../product-profile";
import type { BrandPortalValidation } from "../shared/types";
import { CANONICAL_BRAND_PORTAL_QUERY } from "../shared/types";

function validateV20CatalogCompatibility(): boolean {
  const v20Brands = getV20BrandEntries();
  const portalBrands = getAllBrandProfiles();
  const v20BrandIds = new Set(v20Brands.map((b) => b.brandId));
  return portalBrands.every((profile) => v20BrandIds.has(profile.brandId));
}

export function validateBrandPortal(): BrandPortalValidation {
  const brands = getAllBrandProfiles();
  const products = getAllProductProfiles();
  const certifications = getAllCertificationProfiles();
  const caseStudies = getAllCaseStudyProfiles();
  const brandIds = new Set(brands.map((b) => b.brandId));
  const canonicalBrand = brands.find((b) => b.brandId === CANONICAL_BRAND_PORTAL_QUERY.brandId);

  const brandExists =
    brands.length >= 3 &&
    brands.every(
      (b) =>
        b.brandId.length > 0 &&
        b.brandName.length > 0 &&
        b.status === "active" &&
        b.mode === "brand-portal",
    ) &&
    canonicalBrand !== undefined;

  const productExists =
    products.length >= 3 &&
    products.every(
      (p) =>
        brandIds.has(p.brandId) &&
        p.sku.length > 0 &&
        p.documentRefs.length > 0 &&
        p.mode === "brand-portal",
    );

  const certificationExists =
    certifications.length >= 3 &&
    certifications.every(
      (c) => brandIds.has(c.brandId) && c.certificateType.length > 0 && c.mode === "brand-portal",
    );

  const caseStudyExists =
    caseStudies.length >= 3 &&
    caseStudies.every(
      (c) => brandIds.has(c.brandId) && c.projectName.length > 0 && c.mode === "brand-portal",
    );

  const v20CatalogCompatible = validateV20CatalogCompatibility();

  return {
    valid: brandExists && productExists && certificationExists && caseStudyExists && v20CatalogCompatible,
    brandExists,
    productExists,
    certificationExists,
    caseStudyExists,
    v20CatalogCompatible,
  };
}
