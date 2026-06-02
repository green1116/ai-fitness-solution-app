import type { NormalizedParameter, ParameterOperator } from "./types";

const UNIT_ALIASES: Record<string, string> = {
  "km/h": "km/h",
  kmh: "km/h",
  "公里/小时": "km/h",
  "千米/小时": "km/h",
  kg: "kg",
  公斤: "kg",
  千克: "kg",
  年: "year",
  year: "year",
  天: "day",
  day: "day",
  日: "day",
  hp: "HP",
  马力: "HP",
};

export function normalizeUnit(raw?: string): string | undefined {
  if (!raw) return undefined;
  const key = raw.trim().toLowerCase().replace(/\s+/g, "");
  return UNIT_ALIASES[key] || raw.trim();
}

export function parseOperator(text: string): ParameterOperator | undefined {
  if (/≥|>=|不低于|不小于|不少于|至少/.test(text)) return ">=";
  if (/≤|<=|不超过|至多|不高于/.test(text)) return "<=";
  if (/=|等于|为/.test(text)) return "=";
  if (/包含|具备|具有|应提供|须提供/.test(text)) return "contains";
  return undefined;
}

/**
 * 从文本片段解析可机读参数
 */
export function parseParameterFromText(
  text: string,
  nameHint?: string,
): NormalizedParameter | null {
  const t = text.replace(/\s+/g, " ").trim();

  const numeric = t.match(
    /(?:≥|<=|≤|>=|>|<|=)?\s*(\d+(?:\.\d+)?)\s*(km\/h|kmh|kg|HP|hp|年|天|日|%|％)?/i,
  );
  if (numeric) {
    const value = Number(numeric[1]);
    const unit = normalizeUnit(numeric[2]);
    const operator = parseOperator(t) || ">=";
    const display = unit ? `${value}${unit === "km/h" ? "km/h" : unit}` : String(value);
    return {
      name: nameHint || inferParameterName(t),
      value,
      unit,
      operator,
      display,
    };
  }

  if (/ISO|CE|认证|证书/.test(t)) {
    return {
      name: nameHint || "certification",
      value: t.slice(0, 80),
      operator: "contains",
      display: t.slice(0, 80),
    };
  }

  return null;
}

export function inferParameterName(text: string): string {
  if (/速度|km\/h|公里/.test(text)) return "speed";
  if (/承重|载荷|load|kg/i.test(text)) return "loadCapacity";
  if (/坡度|incline/i.test(text)) return "incline";
  if (/功率|马力|HP/i.test(text)) return "motorPower";
  if (/质保|保修|warranty/i.test(text)) return "warrantyYears";
  if (/交付|工期|lead/i.test(text)) return "leadTimeDays";
  if (/ISO|认证|证书/.test(text)) return "certification";
  if (/SLA|售后|响应/.test(text)) return "service";
  return "general";
}

export function formatParameterDisplay(p: NormalizedParameter): string {
  if (p.unit === "km/h") return `${p.value}km/h`;
  if (p.unit === "kg") return `${p.value}kg`;
  if (p.unit === "year") return `${p.value}年`;
  if (p.unit === "day") return `${p.value}天`;
  return String(p.display || p.value);
}
