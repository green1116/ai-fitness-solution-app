import { getAllBrandProfiles } from "../brand-profile";
import { getAllCaseStudyProfiles } from "../case-study-profile";
import { getAllCertificationProfiles } from "../certification-profile";
import { getAllProductProfiles } from "../product-profile";
import type { BrandPortalReport } from "../shared/types";
import { BRAND_PORTAL_VERSION, CANONICAL_BRAND_PORTAL_QUERY } from "../shared/types";
import { validateBrandPortal } from "../validation/validators";

export function buildBrandPortalReport(): BrandPortalReport {
  const brands = getAllBrandProfiles();
  const products = getAllProductProfiles();
  const certifications = getAllCertificationProfiles();
  const caseStudies = getAllCaseStudyProfiles();
  const validation = validateBrandPortal();

  return {
    version: BRAND_PORTAL_VERSION,
    reportId: `brand-portal-report-${Date.now()}`,
    brandCount: brands.length,
    productCount: products.length,
    certificationCount: certifications.length,
    caseStudyCount: caseStudies.length,
    validation,
    summary: [
      "brand-portal-report",
      `brands=${brands.length}`,
      `products=${products.length}`,
      `certifications=${certifications.length}`,
      `caseStudies=${caseStudies.length}`,
      `valid=${validation.valid}`,
      `v20Compatible=${validation.v20CatalogCompatible}`,
      `canonical=${CANONICAL_BRAND_PORTAL_QUERY.brandId}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
