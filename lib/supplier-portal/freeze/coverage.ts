import { getAllCoverageProfiles } from "../coverage-profile";
import { getAllInventoryProfiles } from "../inventory-profile";
import { buildSupplierOnboardingApprovalGate } from "../onboarding/approval/builders";
import { buildSupplierOnboardingIntake } from "../onboarding/intake/builders";
import { buildSupplierOnboardingReport } from "../onboarding/report/builders";
import { advanceSupplierOnboardingWorkflow } from "../onboarding/workflow/builders";
import { getAllPricingProfiles } from "../pricing-profile";
import { getAllServiceProfiles } from "../service-profile";
import { getAllSupplierProfiles } from "../supplier-profile";
import type { SupplierPortalCoverageStats } from "../shared/types";
import { CANONICAL_SUPPLIER_ONBOARDING_QUERY } from "../shared/types";
import { SUPPLIER_PORTAL_WORKFLOW_SUPPLIERS } from "./constants";

export function buildSupplierPortalCoverageStats(): SupplierPortalCoverageStats {
  const suppliers = getAllSupplierProfiles();
  const supplierProfileChecks = [
    suppliers.length >= 10,
    suppliers.every((s) => s.supplierId.length > 0 && s.status === "active"),
    suppliers.every((s) => s.mode === "supplier-portal"),
    suppliers.some((s) => s.supplierId === CANONICAL_SUPPLIER_ONBOARDING_QUERY.supplierId),
  ];
  const supplierProfileCoverage = Math.round(
    (supplierProfileChecks.filter(Boolean).length / supplierProfileChecks.length) * 100,
  );

  const inventory = getAllInventoryProfiles();
  const inventoryProfileChecks = [
    inventory.length >= 10,
    inventory.every((i) => i.sku.length > 0 && i.warehouse.length > 0),
    inventory.every((i) => i.mode === "supplier-portal"),
    inventory.every((i) => i.quantity >= 0),
  ];
  const inventoryProfileCoverage = Math.round(
    (inventoryProfileChecks.filter(Boolean).length / inventoryProfileChecks.length) * 100,
  );

  const pricing = getAllPricingProfiles();
  const pricingProfileChecks = [
    pricing.length >= 5,
    pricing.every((p) => p.listPrice > 0 && p.bulkPrice <= p.projectPrice),
    pricing.every((p) => p.mode === "supplier-portal"),
    new Set(pricing.map((p) => p.sku)).size >= 5,
  ];
  const pricingProfileCoverage = Math.round(
    (pricingProfileChecks.filter(Boolean).length / pricingProfileChecks.length) * 100,
  );

  const services = getAllServiceProfiles();
  const serviceProfileChecks = [
    services.length >= 5,
    services.every((s) => s.city.length > 0 && s.engineerCount > 0),
    services.every((s) => s.mode === "supplier-portal"),
    new Set(services.map((s) => s.city)).size >= 5,
  ];
  const serviceProfileCoverage = Math.round(
    (serviceProfileChecks.filter(Boolean).length / serviceProfileChecks.length) * 100,
  );

  const coverage = getAllCoverageProfiles();
  const coverageProfileChecks = [
    coverage.length >= 5,
    coverage.every((c) => c.leadTime.length > 0 && c.sla.length > 0),
    coverage.every((c) => c.mode === "supplier-portal"),
    new Set(coverage.map((c) => c.city)).size >= 5,
  ];
  const coverageProfileCoverage = Math.round(
    (coverageProfileChecks.filter(Boolean).length / coverageProfileChecks.length) * 100,
  );

  const onboardingReport = buildSupplierOnboardingReport();
  const canonicalIntake = buildSupplierOnboardingIntake({
    supplierId: CANONICAL_SUPPLIER_ONBOARDING_QUERY.supplierId,
  });
  const onboardingChecks = [
    onboardingReport.submissionCount >= 3,
    onboardingReport.validation.valid,
    canonicalIntake !== null,
    (canonicalIntake?.inventoryProfiles.length ?? 0) >= 1,
  ];
  const onboardingCoverage = Math.round(
    (onboardingChecks.filter(Boolean).length / onboardingChecks.length) * 100,
  );

  const workflowChecks = SUPPLIER_PORTAL_WORKFLOW_SUPPLIERS.map((supplierId) => {
    let submission = buildSupplierOnboardingIntake({ supplierId });
    if (!submission) return false;
    while (submission.status !== "published") {
      if (submission.status === "review") {
        const gate = buildSupplierOnboardingApprovalGate(submission);
        if (gate.decision !== "approved") return false;
      }
      const next = advanceSupplierOnboardingWorkflow(submission);
      if (next.status === submission.status) return false;
      submission = next;
    }
    return submission.status === "published";
  });
  const approvalWorkflowCoverage = Math.round(
    (workflowChecks.filter(Boolean).length / workflowChecks.length) * 100,
  );

  const coverageScore = Math.round(
    (supplierProfileCoverage +
      inventoryProfileCoverage +
      pricingProfileCoverage +
      serviceProfileCoverage +
      coverageProfileCoverage +
      onboardingCoverage +
      approvalWorkflowCoverage) /
      7,
  );

  return {
    supplierProfileCoverage,
    inventoryProfileCoverage,
    pricingProfileCoverage,
    serviceProfileCoverage,
    coverageProfileCoverage,
    onboardingCoverage,
    approvalWorkflowCoverage,
    coverageScore,
  };
}
