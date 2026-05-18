import type { SemanticRequirement } from "@/lib/tender/semantic/types";

import type {
  ProductSKU,
  SkuComplianceStatus,
  SkuSpecs,
} from "./skuTypes";

export type ParsedRequirementSpec = {
  minSpeedKmH?: number;
  minLoadKg?: number;
  minWarrantyYears?: number;
  maxLeadTimeDays?: number;
  keywords: string[];
};

export function parseRequirementSpec(
  req: SemanticRequirement,
): ParsedRequirementSpec {
  const text = `${req.title} ${req.requirement}`;
  const spec: ParsedRequirementSpec = { keywords: [] };

  const speed = text.match(
    /(?:≥|>=|不低于|不小于|至少)\s*(\d+(?:\.\d+)?)\s*(?:km\/h|公里\/小时|千米\/小时)/i,
  );
  if (speed) spec.minSpeedKmH = Number(speed[1]);

  const load = text.match(
    /(?:≥|>=|不低于|不小于|至少)\s*(\d+)\s*(?:kg|公斤|千克)/i,
  );
  if (load) spec.minLoadKg = Number(load[1]);

  const warranty = text.match(/(?:质保|保修)\s*(\d+)\s*年/);
  if (warranty) spec.minWarrantyYears = Number(warranty[1]);

  const lead = text.match(/(?:交付|供货|工期).*?(\d+)\s*(?:天|日|calendar)/i);
  if (lead) spec.maxLeadTimeDays = Number(lead[1]);

  if (/跑步机|跑步機/.test(text)) spec.keywords.push("treadmill");
  if (/椭圆|elliptical/i.test(text)) spec.keywords.push("elliptical");
  if (/动感单车|单车|bike/i.test(text)) spec.keywords.push("bike");
  if (/力量|器械|strength/i.test(text)) spec.keywords.push("strength");
  if (/康复|恢复|拉伸|recovery/i.test(text)) spec.keywords.push("recovery");

  return spec;
}

function checkSpeed(
  spec: ParsedRequirementSpec,
  skuSpecs: SkuSpecs,
): { ok: boolean; field?: string; missing?: string } {
  if (spec.minSpeedKmH == null) return { ok: true };
  const actual = skuSpecs.maxSpeedKmH;
  if (actual == null) {
    return { ok: false, missing: `maxSpeedKmH≥${spec.minSpeedKmH}` };
  }
  if (actual >= spec.minSpeedKmH) {
    return { ok: true, field: `maxSpeedKmH=${actual}km/h` };
  }
  return {
    ok: false,
    missing: `需≥${spec.minSpeedKmH}km/h，SKU为${actual}km/h`,
  };
}

function checkLoad(
  spec: ParsedRequirementSpec,
  skuSpecs: SkuSpecs,
): { ok: boolean; field?: string; missing?: string } {
  if (spec.minLoadKg == null) return { ok: true };
  const actual = skuSpecs.maxLoadKg;
  if (actual == null) return { ok: false, missing: `maxLoadKg≥${spec.minLoadKg}` };
  if (actual >= spec.minLoadKg) {
    return { ok: true, field: `maxLoadKg=${actual}kg` };
  }
  return { ok: false, missing: `需≥${spec.minLoadKg}kg，SKU为${actual}kg` };
}

/**
 * requirement × SKU → compliance
 */
export function evaluateSkuCompliance(
  req: SemanticRequirement,
  sku: ProductSKU,
): {
  compliance: SkuComplianceStatus;
  matchedFields: string[];
  missingFields: string[];
  riskNotes: string[];
} {
  const spec = parseRequirementSpec(req);
  const matchedFields: string[] = [];
  const missingFields: string[] = [];
  const riskNotes: string[] = [];

  const speed = checkSpeed(spec, sku.specs);
  if (speed.field) matchedFields.push(speed.field);
  if (speed.missing) missingFields.push(speed.missing);

  const load = checkLoad(spec, sku.specs);
  if (load.field) matchedFields.push(load.field);
  if (load.missing) missingFields.push(load.missing);

  if (
    spec.minWarrantyYears != null &&
    (sku.warrantyYears ?? 0) < spec.minWarrantyYears
  ) {
    missingFields.push(
      `质保需≥${spec.minWarrantyYears}年，SKU为${sku.warrantyYears ?? 0}年`,
    );
  } else if (spec.minWarrantyYears != null && sku.warrantyYears) {
    matchedFields.push(`warrantyYears=${sku.warrantyYears}`);
  }

  if (
    spec.maxLeadTimeDays != null &&
    (sku.leadTimeDays ?? 999) > spec.maxLeadTimeDays
  ) {
    riskNotes.push(
      `供货周期 ${sku.leadTimeDays} 天可能超出招标 ${spec.maxLeadTimeDays} 天要求`,
    );
  } else if (sku.leadTimeDays != null) {
    matchedFields.push(`leadTimeDays=${sku.leadTimeDays}`);
  }

  if (sku.leadTimeDays != null && sku.leadTimeDays > 60) {
    riskNotes.push("lead time medium");
  }

  let compliance: SkuComplianceStatus;
  if (missingFields.length === 0 && riskNotes.length === 0) {
    compliance = matchedFields.length > 0 ? "covered" : "partial";
  } else if (missingFields.length > 0) {
    compliance = missingFields.some((m) => /需≥/.test(m)) ? "missing" : "partial";
  } else {
    compliance = "risky";
  }

  if (
    missingFields.length === 0 &&
    riskNotes.length > 0 &&
    compliance !== "missing"
  ) {
    compliance = "risky";
  }

  return { compliance, matchedFields, missingFields, riskNotes };
}
