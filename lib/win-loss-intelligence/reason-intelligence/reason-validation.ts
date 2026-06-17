import { buildBrandReasonAnalysis } from "./brand-reason-analysis";
import { buildOutcomeReasons, buildRootCauseAnalysis } from "./outcome-reason-builder";
import { buildProcurementReasonAnalysis } from "./procurement-reason-analysis";
import { buildProductReasonAnalysis } from "./product-reason-analysis";
import { buildSupplierReasonAnalysis } from "./supplier-reason-analysis";
import type { ReasonIntelligenceValidation } from "./reason-types";

function isReasonRecordReady(record: {
  tenderId: string;
  reasonCode: string;
  reasonWeight: number;
  reasonText: string;
}): boolean {
  return (
    record.tenderId.length > 0 &&
    record.reasonCode.length > 0 &&
    record.reasonText.length > 0 &&
    record.reasonWeight >= 0 &&
    record.reasonWeight <= 100
  );
}

let cachedValidation: ReasonIntelligenceValidation | undefined;

export function validateReasonIntelligence(): ReasonIntelligenceValidation {
  if (cachedValidation) return cachedValidation;

  const brandReasons = buildBrandReasonAnalysis();
  const productReasons = buildProductReasonAnalysis();
  const supplierReasons = buildSupplierReasonAnalysis();
  const procurementReasons = buildProcurementReasonAnalysis();
  const reasons = buildOutcomeReasons();
  const rootCauses = buildRootCauseAnalysis();

  const brandReasonReady =
    brandReasons.length > 0 && brandReasons.every((record) => isReasonRecordReady(record));
  const productReasonReady =
    productReasons.length > 0 && productReasons.every((record) => isReasonRecordReady(record));
  const supplierReasonReady =
    supplierReasons.length > 0 && supplierReasons.every((record) => isReasonRecordReady(record));
  const procurementReasonReady =
    procurementReasons.length > 0 &&
    procurementReasons.every((record) => isReasonRecordReady(record));
  const rootCauseReady =
    rootCauses.length > 0 &&
    rootCauses.every(
      (record) =>
        record.tenderId.length > 0 &&
        record.rootCause.length > 0 &&
        record.topReasons.length > 0 &&
        record.confidence >= 0,
    );

  const valid =
    brandReasonReady &&
    productReasonReady &&
    supplierReasonReady &&
    procurementReasonReady &&
    rootCauseReady &&
    reasons.length > 0;

  cachedValidation = {
    valid,
    brandReasonReady,
    productReasonReady,
    supplierReasonReady,
    procurementReasonReady,
    rootCauseReady,
    reasonCount: reasons.length,
    rootCauseCount: rootCauses.length,
    summary: `reason-intelligence reasons=${reasons.length} rootCauses=${rootCauses.length} valid=${valid}`,
  };

  return cachedValidation;
}
