import type {
  SupplierPortalFreezeValidation,
  SupplierPortalWorkflowPathResult,
} from "../shared/types";
import { buildSupplierOnboardingApprovalGate } from "../onboarding/approval/builders";
import { buildSupplierOnboardingIntake } from "../onboarding/intake/builders";
import { buildSupplierOnboardingReport } from "../onboarding/report/builders";
import { validateSupplierOnboardingSubmission } from "../onboarding/validation/validators";
import { advanceSupplierOnboardingWorkflow } from "../onboarding/workflow/builders";
import { validateSupplierPortal } from "../validation/validators";
import {
  SUPPLIER_PORTAL_VALIDATION_GATES,
  SUPPLIER_PORTAL_WORKFLOW_SUPPLIERS,
} from "./constants";

export function validateSupplierOnboardingWorkflowPath(
  supplierId: string,
): SupplierPortalWorkflowPathResult {
  const intake = buildSupplierOnboardingIntake({ supplierId });
  if (!intake) {
    return {
      supplierId,
      supplierName: supplierId,
      finalStatus: "draft",
      approvalDecision: "rejected",
      pathValid: false,
    };
  }

  let submission = intake;
  let approvalDecision: SupplierPortalWorkflowPathResult["approvalDecision"] = "approved";

  while (submission.status !== "published") {
    if (submission.status === "review") {
      const gate = buildSupplierOnboardingApprovalGate(submission);
      approvalDecision = gate.decision;
      if (gate.decision !== "approved") {
        return {
          supplierId,
          supplierName: submission.supplierProfile.supplierName,
          finalStatus: submission.status,
          approvalDecision,
          pathValid: false,
        };
      }
    }
    const next = advanceSupplierOnboardingWorkflow(submission);
    if (next.status === submission.status) {
      return {
        supplierId,
        supplierName: submission.supplierProfile.supplierName,
        finalStatus: submission.status,
        approvalDecision,
        pathValid: false,
      };
    }
    submission = next;
  }

  return {
    supplierId,
    supplierName: submission.supplierProfile.supplierName,
    finalStatus: "published",
    approvalDecision,
    pathValid: true,
  };
}

export function validateSupplierPortalFreeze(): SupplierPortalFreezeValidation {
  const phase1 = validateSupplierPortal();
  const onboardingReport = buildSupplierOnboardingReport();
  const canonicalIntake = buildSupplierOnboardingIntake({
    supplierId: "supplier-life-fitness-cn",
  });
  const canonicalValidation = canonicalIntake
    ? validateSupplierOnboardingSubmission(canonicalIntake)
    : {
        valid: false,
        supplierExists: false,
        inventoryExists: false,
        pricingExists: false,
        serviceExists: false,
        coverageExists: false,
      };

  const workflowPaths = SUPPLIER_PORTAL_WORKFLOW_SUPPLIERS.map(
    validateSupplierOnboardingWorkflowPath,
  );
  const workflowPathValid = workflowPaths.every((path) => path.pathValid);

  const phase2Valid =
    onboardingReport.validation.valid &&
    onboardingReport.submissionCount >= 3 &&
    canonicalValidation.valid;

  const networkProcurementCompatible =
    phase1.v21NetworkCompatible && phase1.v22ProcurementCompatible;

  const gates = [
    phase1.supplierExists,
    phase1.inventoryExists,
    phase1.pricingExists,
    phase1.serviceExists,
    phase1.coverageExists,
    networkProcurementCompatible,
    phase1.valid,
    phase2Valid,
    onboardingReport.validation.supplierExists,
    onboardingReport.validation.inventoryExists,
    onboardingReport.validation.pricingExists,
    workflowPathValid,
  ];

  const validationScore = Math.round(
    (gates.filter(Boolean).length / SUPPLIER_PORTAL_VALIDATION_GATES) * 100,
  );
  const valid = phase1.valid && phase2Valid && workflowPathValid && validationScore === 100;

  return {
    valid,
    phase1Valid: phase1.valid,
    phase2Valid,
    workflowPathValid,
    validationScore,
  };
}

export { SUPPLIER_PORTAL_VALIDATION_GATES };
