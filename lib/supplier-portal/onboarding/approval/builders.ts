import type {
  SupplierOnboardingApprovalGate,
  SupplierOnboardingSubmission,
} from "../../shared/types";
import { validateSupplierOnboardingSubmission } from "../validation/validators";

export function buildSupplierOnboardingApprovalGate(
  submission: SupplierOnboardingSubmission,
): SupplierOnboardingApprovalGate {
  const validation = validateSupplierOnboardingSubmission(submission);
  const decision = validation.valid ? "approved" : "rejected";

  const reasons: string[] = [];
  if (validation.valid) {
    reasons.push("Supplier profile complete");
    reasons.push(`${submission.inventoryProfiles.length} inventory records verified`);
    reasons.push(`${submission.pricingProfiles.length} pricing records verified`);
    reasons.push(`${submission.serviceProfiles.length} service records verified`);
    reasons.push(`${submission.coverageProfiles.length} coverage records verified`);
  } else {
    if (!validation.supplierExists) reasons.push("Supplier profile missing or invalid");
    if (!validation.inventoryExists) reasons.push("Inventory missing or invalid");
    if (!validation.pricingExists) reasons.push("Pricing missing or invalid");
    if (!validation.serviceExists) reasons.push("Service missing or invalid");
    if (!validation.coverageExists) reasons.push("Coverage missing or invalid");
  }

  return {
    submissionId: submission.submissionId,
    decision,
    reasons,
    validatedAt: new Date().toISOString(),
  };
}
