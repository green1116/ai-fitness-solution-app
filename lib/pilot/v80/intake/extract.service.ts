/**
 * V80 Pilot P1 — AI requirement extraction (structured JSON via tender-parser, no duplicate engine)
 */

import { buildParsedTenderResult } from "@/lib/tender-parser/buildParsedTenderResult";
import type { TenderParseResult } from "@/lib/tender/types";

import type {
  RequirementItem,
  TenderRequirements,
  PageRef,
} from "./requirements.schema";
import { EMPTY_TENDER_REQUIREMENTS } from "./requirements.schema";

function pageRefFromHint(hint?: string, pages?: TenderParseResult["pages"]): string | undefined {
  if (!hint) return undefined;
  const n = Number.parseInt(hint.replace(/\D/g, ""), 10);
  if (Number.isFinite(n) && n > 0) return `p.${n}`;
  return pages?.[0] ? `p.${pages[0].page}` : undefined;
}

function toItem(
  id: string,
  text: string,
  priority?: RequirementItem["priority"],
  pageRef?: string,
): RequirementItem {
  return { id, text: text.trim(), priority, pageRef };
}

function extractBudgetNotes(text: string): { min?: number; max?: number; notes: string } {
  const nums = [...text.matchAll(/(\d+(?:\.\d+)?)\s*(?:万|万元|w)/gi)].map((m) => Number(m[1]) * 10_000);
  return {
    min: nums[0],
    max: nums[1] ?? nums[0],
    notes: text.slice(0, 500),
  };
}

function sectionText(sections: { title: string; content: string }[], keywords: RegExp): string {
  const hit = sections.find((s) => keywords.test(`${s.title} ${s.content}`));
  return hit?.content?.trim() ?? "";
}

/**
 * Deterministic structured extraction from parsed tender text.
 * Uses lib/tender-parser semantic pipeline — output is JSON-only TenderRequirements.
 */
export function extractRequirementsFromParsedTender(input: {
  parseResult: TenderParseResult;
  sourceName?: string;
}): TenderRequirements {
  const { parseResult, sourceName } = input;
  const parsed = buildParsedTenderResult({
    rawText: parseResult.rawText,
    sourceName,
  });

  const meta = parseResult.metadata;
  const projectName =
    meta.projectName?.trim() ||
    parsed.sections.find((s) => /项目名称|工程名称/.test(s.title))?.text.slice(0, 120) ||
    sourceName?.replace(/\.[^.]+$/, "") ||
    "招标项目";

  const organization =
    meta.tenderCompany?.trim() ||
    sectionText(parseResult.sections, /招标人|采购人|业主/) ||
    "";

  const location =
    sectionText(parseResult.sections, /地点|地址|城市|区域/) ||
    parseResult.rawText.match(/(?:地点|地址)[:：]\s*([^\n]+)/)?.[1]?.trim() ||
    "";

  const industry =
    sectionText(parseResult.sections, /行业|领域/) ||
    (/健身|gym|体育/.test(parseResult.rawText) ? "fitness" : "");

  const scope =
    sectionText(parseResult.sections, /范围|概况|概述|建设内容/) ||
    parsed.sections.find((s) => s.category === "technical")?.text.slice(0, 800) ||
    parseResult.rawText.slice(0, 600);

  const objectives = parsed.sections
    .filter((s) => /目标|目的/.test(s.title))
    .map((s) => s.text.trim())
    .filter(Boolean)
    .slice(0, 8);

  const technicalRequirements: RequirementItem[] = parsed.technicalRequirements.map((r) =>
    toItem(
      r.id,
      r.text,
      r.priority === "optional" ? "optional" : r.priority === "preferred" ? "preferred" : "must",
      pageRefFromHint(r.sourceSectionId, parseResult.pages),
    ),
  );

  if (technicalRequirements.length === 0) {
    parseResult.rawText
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => /^\d+[.、)]\s/.test(line) || /^[一二三四五六七八九十]+[、.]/.test(line))
      .slice(0, 20)
      .forEach((line, i) => {
        technicalRequirements.push(toItem(`tech-line-${i}`, line, "must"));
      });
  }

  const functionalRequirements: RequirementItem[] = parsed.sections
    .filter((s) => s.category === "technical" || /功能/.test(s.title))
    .map((s, i) => toItem(`fn-${i}`, `${s.title}: ${s.text}`.slice(0, 500), "must", s.pageHint));

  const equipment = technicalRequirements.filter((r) =>
    /器械|设备|器材|equipment/i.test(r.text),
  );
  const space = technicalRequirements.filter((r) =>
    /面积|空间|场地|㎡|楼层/.test(r.text),
  );
  const quantity = technicalRequirements.filter((r) =>
    /数量|人数|套|台|件/.test(r.text),
  );

  const compliance: RequirementItem[] = parsed.sections
    .filter((s) => s.category === "qualification" || /资质|合规/.test(s.title))
    .map((s, i) => toItem(`cmp-${i}`, s.text.slice(0, 500), "must", s.pageHint));

  const standards: RequirementItem[] = parsed.sections
    .filter((s) => /标准|规范|GB|ISO/.test(`${s.title} ${s.text}`))
    .map((s, i) => toItem(`std-${i}`, s.text.slice(0, 400), "must", s.pageHint));

  const evaluation: RequirementItem[] = parsed.scoreCriteria.map((s, i) =>
    toItem(`eval-${i}`, `${s.scoreItem}: ${s.criteria}`.slice(0, 500), "must"),
  );

  const constraints: RequirementItem[] = parsed.businessRequirements
    .filter((r) => r.requirementType !== "pricing")
    .map((r) =>
      toItem(r.id, r.text, r.priority === "optional" ? "optional" : "must"),
    );

  const budgetSection = sectionText(parseResult.sections, /预算|报价|金额|限价/);
  const budgetParsed = extractBudgetNotes(budgetSection || parseResult.rawText.slice(0, 3000));

  const deliverables = parsed.sections
    .filter((s) => /交付|成果|提交|投标文件/.test(s.title))
    .flatMap((s) => s.text.split(/[；;\n]/).map((x) => x.trim()).filter((x) => x.length > 4))
    .slice(0, 12);

  const risks = (parsed.warnings ?? []).map((w) => w.trim()).filter(Boolean);

  const optionalItems = [
    ...parsed.technicalRequirements.filter((r) => r.priority === "optional"),
    ...parsed.businessRequirements.filter((r) => r.priority === "optional"),
  ].map((r) => toItem(r.id, r.text, "optional"));

  const sourceRefs: PageRef[] = parseResult.pages.slice(0, 12).map((p) => ({
    page: p.page,
    excerpt: p.text.slice(0, 160).replace(/\s+/g, " "),
  }));

  return {
    ...EMPTY_TENDER_REQUIREMENTS,
    projectName,
    organization,
    industry,
    location,
    objectives: objectives.length ? objectives : scope ? [scope.slice(0, 200)] : [],
    scope,
    functionalRequirements,
    technicalRequirements,
    equipment,
    space,
    quantity,
    constraints,
    compliance,
    standards,
    budget: {
      currency: "CNY",
      min: budgetParsed.min,
      max: budgetParsed.max,
      notes: budgetParsed.notes,
    },
    schedule: {
      deadline: meta.deadline,
      milestones: meta.publishDate ? [`发布：${meta.publishDate}`] : [],
    },
    evaluation,
    deliverables,
    risks,
    optionalItems,
    sourceRefs,
  };
}
