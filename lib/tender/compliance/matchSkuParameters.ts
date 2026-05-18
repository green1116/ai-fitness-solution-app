import type { ProductSKU } from "@/lib/tender/sku/skuTypes";

import type {
  ComplianceResult,
  ComplianceStatus,
  TechnicalRequirement,
} from "./types";

type ParameterBinding = {
  paramName: string;
  getActual: (sku: ProductSKU) => number | string | undefined;
  formatActual: (v: number | string) => string;
};

const BINDINGS: ParameterBinding[] = [
  {
    paramName: "speed",
    getActual: (s) => s.parameters.speed ?? s.specs.maxSpeedKmH,
    formatActual: (v) => `${v}km/h`,
  },
  {
    paramName: "loadCapacity",
    getActual: (s) => s.parameters.loadCapacity ?? s.specs.maxLoadKg,
    formatActual: (v) => `${v}kg`,
  },
  {
    paramName: "incline",
    getActual: (s) => s.parameters.incline ?? s.specs.incline,
    formatActual: (v) => `${v}%`,
  },
  {
    paramName: "warrantyYears",
    getActual: (s) => s.parameters.warrantyYears ?? s.warrantyYears,
    formatActual: (v) => `${v}年`,
  },
  {
    paramName: "motorPower",
    getActual: (s) => s.parameters.motorPower,
    formatActual: (v) => `${v}HP`,
  },
  {
    paramName: "leadTimeDays",
    getActual: (s) => s.parameters.leadTimeDays ?? s.leadTimeDays,
    formatActual: (v) => `${v}天`,
  },
];

function compareNumeric(
  operator: TechnicalRequirement["operator"],
  required: number,
  actual: number,
): ComplianceStatus {
  switch (operator) {
    case ">=":
      if (actual >= required) return "covered";
      if (actual >= required * 0.95) return "partial";
      return "failed";
    case "<=":
      if (actual <= required) return "covered";
      if (actual <= required * 1.05) return "partial";
      return "failed";
    case "=":
      if (actual === required) return "covered";
      if (Math.abs(actual - required) / Math.max(required, 1) <= 0.05)
        return "partial";
      return "failed";
    default:
      if (actual >= required) return "covered";
      return "failed";
  }
}

function matchCertification(
  req: TechnicalRequirement,
  sku: ProductSKU,
): ComplianceResult["matchedParameters"][0] | null {
  const required = req.requirementText;
  const certs = sku.certifications || [];
  const hit = certs.some((c) =>
    required.toUpperCase().includes(c.toUpperCase().replace(/\s/g, "")),
  );
  const actual = certs.join("、") || "—";
  return {
    parameter: "certification",
    required: required.slice(0, 40),
    actual,
  };
}

/**
 * requirement × SKU → ComplianceResult
 */
export function matchSkuParameters(
  req: TechnicalRequirement,
  sku: ProductSKU,
): ComplianceResult {
  const paramName = req.parameterName || "general";
  const binding = BINDINGS.find((b) => b.paramName === paramName);

  if (paramName === "certification" || req.category === "certification") {
    const row = matchCertification(req, sku);
    const hasCert = sku.certifications?.length;
    return {
      requirementId: req.id,
      skuId: sku.id,
      status: hasCert ? "covered" : "failed",
      matchedParameters: row ? [row] : [],
      missingParameters: hasCert ? undefined : ["资质/认证材料"],
      evidenceRequired: true,
    };
  }

  if (!binding || req.targetValue == null) {
    return {
      requirementId: req.id,
      skuId: sku.id,
      status: "partial",
      matchedParameters: [
        {
          parameter: paramName,
          required: req.requirementText.slice(0, 48),
          actual: `${sku.brand} ${sku.model}`,
        },
      ],
      riskNotes: ["非数值参数，建议人工核对"],
      evidenceRequired: /证明|报告|材料/.test(req.requirementText),
    };
  }

  const requiredNum = Number(req.targetValue);
  const actualRaw = binding.getActual(sku);
  const requiredStr = req.unit
    ? `${req.operator || "≥"}${req.targetValue}${req.unit === "km/h" ? "km/h" : req.unit}`
    : `${req.operator || "≥"}${req.targetValue}`;

  if (actualRaw == null || Number.isNaN(requiredNum)) {
    return {
      requirementId: req.id,
      skuId: sku.id,
      status: "risky",
      matchedParameters: [
        { parameter: paramName, required: requiredStr, actual: "—" },
      ],
      missingParameters: [paramName],
      riskNotes: ["SKU 缺少可比对参数"],
      evidenceRequired: true,
    };
  }

  const actualNum = Number(actualRaw);
  const actualStr = binding.formatActual(actualNum);
  let status = compareNumeric(req.operator || ">=", requiredNum, actualNum);

  const riskNotes: string[] = [];
  if (
    paramName === "leadTimeDays" &&
    req.operator === "<=" &&
    actualNum > requiredNum
  ) {
    status = "risky";
    riskNotes.push("交期可能超出招标要求");
  }

  return {
    requirementId: req.id,
    skuId: sku.id,
    status,
    matchedParameters: [
      { parameter: paramName, required: requiredStr, actual: actualStr },
    ],
    missingParameters: status === "failed" ? [paramName] : undefined,
    riskNotes: riskNotes.length ? riskNotes : undefined,
    evidenceRequired: /检测|报告|证明/.test(req.requirementText),
  };
}

export function formatRequiredDisplay(req: TechnicalRequirement): string {
  if (req.targetValue && req.unit) {
    const u = req.unit === "km/h" ? "km/h" : req.unit;
    return `${req.operator || "≥"}${req.targetValue}${u}`;
  }
  return req.requirementText.slice(0, 48);
}
