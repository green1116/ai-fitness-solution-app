import type { TenderResponseBlock } from "./types";

/** 禁止单独出现的空泛表述 */
const VAGUE_PHRASES = [
  /^符合要求[。.]?$/,
  /^满足条件[。.]?$/,
  /^将按招标要求执行[。.]?$/,
  /^完全满足[。.]?$/,
];

/** 过度承诺用语 → 投标克制表述 */
const OVER_PROMISE_REPLACEMENTS: [RegExp, string][] = [
  [/一定/g, "原则上可"],
  [/保证/g, "可提供"],
  [/绝对/g, "原则上"],
  [/完全无条件/g, "在合同约定范围内"],
  [/完全响应并承诺严格执行/g, "逐条响应并纳入合同履约"],
  [/完全满足强制性条款/g, "满足招标强制性条款要求"],
  [/承诺在招标期限内完成/g, "可按招标期限组织交付"],
  [/不存在重大漏项/g, "报价分项力求闭合"],
];

export function softenOverPromise(text: string): string {
  let out = text;
  for (const [pattern, replacement] of OVER_PROMISE_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

export function isVagueOnly(text: string): boolean {
  const t = text.trim();
  return VAGUE_PHRASES.some((p) => p.test(t));
}

/**
 * 空泛句后追加可核验说明（避免“符合要求”裸句）
 */
export function enrichIfVague(text: string, hint: string): string {
  if (!isVagueOnly(text)) return text;
  return `${text.replace(/[。.]$/, "")}，${hint}。`;
}

export function applyResponseQuality(
  content: string,
  concreteHint?: string,
): string {
  let out = softenOverPromise(content.trim());
  if (concreteHint && isVagueOnly(out)) {
    out = enrichIfVague(out, concreteHint);
  }
  return out;
}

export function ensureBlockTraceability(block: TenderResponseBlock): TenderResponseBlock {
  const hasLink =
    !!block.sectionId ||
    (block.relatedRequirementIds?.length ?? 0) > 0 ||
    (block.relatedScoringItemIds?.length ?? 0) > 0 ||
    (block.relatedRiskIds?.length ?? 0) > 0;

  if (hasLink) return block;

  return {
    ...block,
    relatedRequirementIds: block.relatedRequirementIds?.length
      ? block.relatedRequirementIds
      : [`UNLINKED-${block.id}`],
    confidence: block.confidence === "high" ? "medium" : block.confidence,
  };
}

export function finalizeBlock(
  block: TenderResponseBlock,
  concreteHint?: string,
): TenderResponseBlock {
  return ensureBlockTraceability({
    ...block,
    content: applyResponseQuality(block.content, concreteHint),
  });
}
