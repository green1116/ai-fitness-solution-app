import type { ScoreProfile, ScoreRuleItem } from "@/lib/tender/scoreEngine";

function normalizeLine(s: string) {
  return String(s || "")
    .replace(/[：:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickMaxScore(line: string): number | null {
  const m = line.match(/(\d+(?:\.\d+)?)\s*分/);
  return m ? Number(m[1]) : null;
}

function inferKeyFromLine(line: string): ScoreRuleItem["key"] | null {
  if (/技术|参数|性能|配置|功能|指标/.test(line)) return "technical";
  if (/商务|资质|业绩|案例|信誉|综合实力/.test(line)) return "business";
  if (/实施|服务|售后|培训|交付|安装|调试|运维/.test(line))
    return "implementation";
  if (/价格|报价|投标报价|评标价/.test(line)) return "price";
  return null;
}

function defaultLabelForKey(key: ScoreRuleItem["key"]) {
  switch (key) {
    case "technical":
      return "技术评分";
    case "business":
      return "商务评分";
    case "implementation":
      return "实施与服务评分";
    case "price":
      return "价格与报价评分";
    default:
      return "评分项";
  }
}

function defaultKeywordsForKey(key: ScoreRuleItem["key"]) {
  switch (key) {
    case "technical":
      return ["技术", "参数", "性能", "配置", "功能", "指标"];
    case "business":
      return ["商务", "资质", "业绩", "案例", "信誉", "综合实力"];
    case "implementation":
      return ["实施", "服务", "售后", "培训", "交付", "安装", "调试", "运维"];
    case "price":
      return ["价格", "报价", "投标报价", "评标价"];
    default:
      return [];
  }
}

function mergeByKey(items: ScoreRuleItem[]) {
  const map = new Map<string, ScoreRuleItem>();

  for (const item of items) {
    const prev = map.get(item.key);
    if (!prev) {
      map.set(item.key, item);
      continue;
    }

    map.set(item.key, {
      ...prev,
      maxScore: Math.max(prev.maxScore, item.maxScore),
    });
  }

  return Array.from(map.values());
}

function fixToHundred(items: ScoreRuleItem[]) {
  const total = items.reduce((s, x) => s + x.maxScore, 0);
  if (!items.length || total <= 0) return items;

  if (Math.abs(total - 100) < 0.01) return items;

  if (total >= 60 && total <= 120) {
    const scaled = items.map((x) => ({
      ...x,
      maxScore: Math.round((x.maxScore / total) * 100),
    }));

    const scaledTotal = scaled.reduce((s, x) => s + x.maxScore, 0);
    const diff = 100 - scaledTotal;

    if (scaled.length && diff !== 0) {
      scaled[0] = {
        ...scaled[0],
        maxScore: scaled[0].maxScore + diff,
      };
    }

    return scaled;
  }

  return items;
}

export function extractScoreItemsFromTenderText(text: string): ScoreRuleItem[] {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(Boolean);

  const items: ScoreRuleItem[] = [];

  for (const line of lines) {
    const score = pickMaxScore(line);
    if (score == null) continue;

    const key = inferKeyFromLine(line);
    if (!key) continue;

    items.push({
      key,
      label: defaultLabelForKey(key),
      maxScore: score,
      keywords: defaultKeywordsForKey(key),
    });
  }

  return fixToHundred(mergeByKey(items));
}

export function buildScoreProfileFromTenderText(text: string): ScoreProfile | null {
  const items = extractScoreItemsFromTenderText(text);
  if (!items.length) return null;

  return {
    profileId: "tender-extracted",
    profileName: "招标文件提取评分模型",
    items,
    penalty: {
      techPendingPenalty: 1.2,
      bizPendingPenalty: 1.2,
      deviationPenalty: 2.5,
      missingAttachmentPenalty: 2,
      cautionImplPenalty: 3,
      highImplPenalty: 8,
    },
  };
}
