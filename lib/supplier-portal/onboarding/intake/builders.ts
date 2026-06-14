import { getCoverageProfilesByCity } from "../../coverage-profile";
import { getAllInventoryProfiles } from "../../inventory-profile";
import { getAllPricingProfiles } from "../../pricing-profile";
import { getServiceProfilesByCity } from "../../service-profile";
import { getSupplierProfileById } from "../../supplier-profile";
import type {
  SupplierOnboardingIntakeInput,
  SupplierOnboardingSubmission,
} from "../../shared/types";

const SUPPLIER_INVENTORY_SLUG: Record<string, string> = {
  "supplier-life-fitness-cn": "life-fitness",
  "supplier-technogym-cn": "technogym",
  "supplier-matrix-cn": "matrix",
  "supplier-relax-cn": "relax",
  "supplier-shuhua": "shuhua",
  "supplier-precor-cn": "precor",
  "supplier-impulse-cn": "impulse",
  "supplier-dhz-cn": "dhz",
  "supplier-bodystrength-cn": "bodystrength",
  "supplier-sportsart-cn": "sportsart",
};

function getInventoryProfilesForSupplier(supplierId: string) {
  const slug = SUPPLIER_INVENTORY_SLUG[supplierId];
  if (!slug) return [];
  return getAllInventoryProfiles().filter((entry) => entry.inventoryId.includes(slug));
}

function getPricingProfilesForInventory(
  inventoryProfiles: ReturnType<typeof getAllInventoryProfiles>,
) {
  const skus = new Set(inventoryProfiles.map((entry) => entry.sku));
  return getAllPricingProfiles().filter((entry) => skus.has(entry.sku));
}

export function buildSupplierOnboardingIntake(
  input: SupplierOnboardingIntakeInput,
): SupplierOnboardingSubmission | null {
  const supplierProfile = getSupplierProfileById(input.supplierId);
  if (!supplierProfile) return null;

  const inventoryProfiles = getInventoryProfilesForSupplier(input.supplierId);
  const pricingProfiles = getPricingProfilesForInventory(inventoryProfiles);
  const serviceProfiles = getServiceProfilesByCity(supplierProfile.city);
  const coverageProfiles = getCoverageProfilesByCity(supplierProfile.city);

  return {
    submissionId: `onboarding-${input.supplierId.replace("supplier-", "")}-draft`,
    supplierProfile,
    inventoryProfiles,
    pricingProfiles,
    serviceProfiles,
    coverageProfiles,
    submittedAt: null,
    status: "draft",
    mode: "supplier-portal",
  };
}

export function buildSupplierOnboardingIntakeFromSubmission(
  submission: SupplierOnboardingSubmission,
): SupplierOnboardingSubmission {
  return {
    ...submission,
    submittedAt: submission.submittedAt ?? new Date().toISOString(),
    status: submission.status === "draft" ? "submitted" : submission.status,
  };
}
