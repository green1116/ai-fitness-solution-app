import type { ProductSKU } from "@/lib/tender/sku/skuTypes";
import { getSkuById } from "@/lib/tender/sku/skuDatabase";

import type { ComplianceMatrixRow, ComplianceResult } from "./types";
import type { TechnicalRequirement } from "./types";
import { formatRequiredDisplay } from "./matchSkuParameters";

function mapStatusToMatrix(
  status: ComplianceResult["status"],
): ComplianceMatrixRow["result"] {
  if (status === "covered") return "covered";
  if (status === "partial" || status === "risky") return "partial";
  return "failed";
}

/**
 * ComplianceResult[] → 技术符合性矩阵
 */
export function buildComplianceMatrix(
  requirements: TechnicalRequirement[],
  results: ComplianceResult[],
): ComplianceMatrixRow[] {
  const resultByReq = new Map(results.map((r) => [r.requirementId, r]));

  return requirements.map((req) => {
    const res = resultByReq.get(req.id);
    const sku = res?.skuId ? getSkuById(res.skuId) : undefined;
    const match = res?.matchedParameters[0];

    return {
      requirementText: req.requirementText,
      skuName: sku ? `${sku.brand} ${sku.model}` : undefined,
      requiredValue: match?.required || formatRequiredDisplay(req),
      actualValue: match?.actual,
      result: res ? mapStatusToMatrix(res.status) : "failed",
      notes: res?.riskNotes?.join("；") || res?.missingParameters?.join("；"),
    };
  });
}
