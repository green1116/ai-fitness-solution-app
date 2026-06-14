import type {
  SupplierOnboardingSubmission,
  SupplierOnboardingSubmissionValidation,
} from "../../shared/types";

export function validateSupplierOnboardingSubmission(
  submission: SupplierOnboardingSubmission,
): SupplierOnboardingSubmissionValidation {
  const supplierExists =
    submission.supplierProfile.supplierId.length > 0 &&
    submission.supplierProfile.supplierName.length > 0 &&
    submission.supplierProfile.status === "active" &&
    submission.supplierProfile.mode === "supplier-portal";

  const inventoryExists =
    submission.inventoryProfiles.length > 0 &&
    submission.inventoryProfiles.every(
      (entry) =>
        entry.inventoryId.length > 0 &&
        entry.sku.length > 0 &&
        entry.warehouse.length > 0 &&
        entry.quantity >= 0 &&
        entry.mode === "supplier-portal",
    );

  const pricingExists =
    submission.pricingProfiles.length > 0 &&
    submission.pricingProfiles.every(
      (entry) =>
        entry.listPrice > 0 &&
        entry.dealerPrice > 0 &&
        entry.projectPrice > 0 &&
        entry.bulkPrice > 0 &&
        entry.bulkPrice <= entry.projectPrice &&
        entry.mode === "supplier-portal",
    );

  const serviceExists =
    submission.serviceProfiles.length > 0 &&
    submission.serviceProfiles.every(
      (entry) =>
        entry.city.length > 0 &&
        entry.responseTime.length > 0 &&
        entry.engineerCount > 0 &&
        entry.mode === "supplier-portal",
    );

  const coverageExists =
    submission.coverageProfiles.length > 0 &&
    submission.coverageProfiles.every(
      (entry) =>
        entry.city.length > 0 &&
        entry.leadTime.length > 0 &&
        entry.sla.length > 0 &&
        entry.mode === "supplier-portal",
    );

  return {
    valid:
      supplierExists &&
      inventoryExists &&
      pricingExists &&
      serviceExists &&
      coverageExists,
    supplierExists,
    inventoryExists,
    pricingExists,
    serviceExists,
    coverageExists,
  };
}
