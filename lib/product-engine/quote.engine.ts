/**
 * V59 Product Engine — Quote (V58 Lifecycle + Job + Async)
 */

import { buildPlan } from "@/lib/plan/builder";
import {
  createQuoteOrchestrator,
  type QuoteOrchestrationResult,
} from "@/lib/quote-lifecycle";

import type { CompanyInfoInput, QuoteProposal } from "./types";

export type QuoteEngineInput = {
  quoteId: string;
  workspaceId: string;
  action?: string;
  companyInfo: CompanyInfoInput;
};

export type QuoteEngineResult = {
  proposal: QuoteProposal;
  runtime: QuoteOrchestrationResult;
};

/** Explicit area only — e.g. "100平米" / "100㎡". No invented defaults. */
export function parseExplicitAreaM2FromNotes(
  notes: string | null | undefined,
): number | undefined {
  const text = notes?.trim() || "";
  if (!text) return undefined;
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:平方米|平米|㎡|m²|m2)/i);
  if (!match) return undefined;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return Math.round(value);
}

export function hasStrengthEquipmentEmphasis(
  notes: string | null | undefined,
): boolean {
  const text = notes?.trim() || "";
  return /偏重力量|力量为主/.test(text);
}

export function hasBasementNoVentilationConstraint(
  notes: string | null | undefined,
): boolean {
  const text = notes?.trim() || "";
  if (!text) return false;
  if (/地下室无通风/.test(text)) return true;
  return /地下室/.test(text) && /无通风/.test(text);
}

/** Preserve notes; fill/override areaM2 only when notes contain an explicit area. */
export function applyQuoteRevisionOverrides(
  companyInfo: CompanyInfoInput,
): CompanyInfoInput {
  const notes = companyInfo.notes?.trim() || undefined;
  const fromNotes = parseExplicitAreaM2FromNotes(notes);
  const fromField =
    typeof companyInfo.areaM2 === "number" &&
    Number.isFinite(companyInfo.areaM2) &&
    companyInfo.areaM2 > 0
      ? companyInfo.areaM2
      : undefined;
  // Explicit area in notes overrides stale project/default areaM2.
  const areaM2 = fromNotes ?? fromField;
  return {
    ...companyInfo,
    ...(notes ? { notes } : {}),
    ...(areaM2 != null ? { areaM2 } : {}),
  };
}

function joinLines(lines: Array<string | null | undefined>): string {
  return lines.filter((line): line is string => Boolean(line && line.trim())).join(" · ");
}

function buildProposalFromOrchestration(
  input: QuoteEngineInput,
  runtime: QuoteOrchestrationResult,
): QuoteProposal {
  const companyInfo = applyQuoteRevisionOverrides(input.companyInfo);
  const company = companyInfo.companyName;
  const industry = companyInfo.industry?.trim() || "互联网";
  const knownCompanySize =
    typeof companyInfo.targetUsers === "number" &&
    Number.isFinite(companyInfo.targetUsers) &&
    companyInfo.targetUsers > 0
      ? companyInfo.targetUsers
      : null;
  const areaSize =
    typeof companyInfo.areaM2 === "number" &&
    Number.isFinite(companyInfo.areaM2) &&
    companyInfo.areaM2 > 0
      ? companyInfo.areaM2
      : 120;
  const strengthEmphasis = hasStrengthEquipmentEmphasis(companyInfo.notes);
  // buildPlan requires a numeric companySize; when unknown, overwrite size copy below.
  const plan = buildPlan(
    {
      planId: input.quoteId,
      industry,
      companySize: knownCompanySize ?? 0,
      areaSize,
      budgetRange: "10-20万",
    },
    "standard",
  );

  if (knownCompanySize == null) {
    plan.positioning = `面向${industry}企业的办公健身空间建设方案`;
    if (plan.executiveSummary.length > 0) {
      plan.executiveSummary = [
        "适用于企业办公健身与员工健康支持场景（服务人数待确认）",
        ...plan.executiveSummary.slice(1),
      ];
    }
  }

  if (strengthEmphasis) {
    for (const [zone, items] of Object.entries(plan.equipments)) {
      for (const item of items) {
        if (zone === "有氧") {
          item.qty = Math.max(1, Math.round(item.qty * 0.65));
        } else if (zone === "力量" || zone === "自由力量") {
          item.qty = Math.max(1, Math.round(item.qty * 1.5));
        }
      }
    }
  }

  const lifecycleStep = runtime.steps.find((s) => s.step === "lifecycle");
  const jobStep = runtime.steps.find((s) => s.step === "job");
  const equipmentBody = Object.entries(plan.equipments)
    .flatMap(([zone, items]) =>
      items.map(
        (item) => `${zone}：${item.name} ×${item.qty}（${item.rationale}）`,
      ),
    )
    .join(" ");

  const customerRequirements = companyInfo.notes?.trim() || "";
  const siteConstraintGuidance = hasBasementNoVentilationConstraint(
    companyInfo.notes,
  )
    ? "场地条件提示：客户注明地下室且无通风，方案需将通风换气与空气质量复核列入现场踏勘与实施前确认项（具体工程参数以现场与专业设计为准）。"
    : null;

  const sections: QuoteProposal["sections"] = [
    {
      title: "企业概况",
      body: joinLines([
        `企业：${company}`,
        `行业：${industry}`,
        companyInfo.city ? `城市：${companyInfo.city}` : null,
        knownCompanySize != null
          ? `目标用户：${knownCompanySize} 人`
          : "目标用户：人数待确认",
        `面积：${areaSize}㎡`,
        strengthEmphasis ? "配置侧重：力量器械优先" : null,
      ]),
    },
  ];

  if (customerRequirements) {
    sections.push({
      title: "客户与项目要求",
      body: customerRequirements,
    });
  }

  sections.push(
    {
      title: "方案定位",
      body: `${plan.title}。${plan.positioning}`,
    },
    {
      title: "执行摘要",
      body: plan.executiveSummary.join(" "),
    },
    {
      title: "推荐说明",
      body: plan.recommendation,
    },
    {
      title: "使用模型",
      body: joinLines([
        `同时使用：${plan.usage.concurrentUsers}`,
        `参与率：${plan.usage.participationRate}`,
        `高峰：${plan.usage.peakHours}`,
        `人群：${plan.usage.mainUsers}`,
      ]),
    },
    {
      title: "器材配置",
      body: equipmentBody,
    },
    {
      title: "实施路径",
      body: plan.implementation
        .map((step) => `${step.name}（${step.duration}）：${step.desc}`)
        .join(" "),
    },
    {
      title: "增值模块",
      body: plan.addOnModules
        .map(
          (mod) =>
            `${mod.name}${mod.enabled ? "（启用）" : "（未启用）"}：${mod.value}`,
        )
        .join(" "),
    },
    {
      title: "方案卖点",
      body: `${plan.salesCopy.oneLine} ${plan.salesCopy.hrPitch} ${plan.salesCopy.objectionHandling.join(" ")}`,
    },
    {
      title: "风险与前提",
      body: [
        `前提：${plan.risks.prerequisites.join(" ")}`,
        `不适用：${plan.risks.notSuitable.join(" ")}`,
        `缓解：${plan.risks.mitigations.join(" ")}`,
        plan.risks.disclaimer,
        siteConstraintGuidance,
      ]
        .filter(Boolean)
        .join(" "),
    },
    {
      title: "方案生成状态",
      body: `Lifecycle=${lifecycleStep?.status ?? "unknown"}, Job=${jobStep?.status ?? "unknown"}`,
    },
    {
      title: "编排轨迹",
      body: runtime.steps.map((s) => `${s.step}:${s.status}`).join(" → "),
    },
  );

  return {
    summary: `${company} ${plan.positioning}`,
    sections,
    generatedAt: runtime.completedAt,
  };
}

export function runQuoteEngine(input: QuoteEngineInput): QuoteEngineResult {
  const companyInfo = applyQuoteRevisionOverrides(input.companyInfo);
  const orchestrator = createQuoteOrchestrator();
  const runtime = orchestrator.run({
    context: {
      quoteId: input.quoteId,
      workspaceId: input.workspaceId,
    },
    action: input.action ?? "generate",
    payload: companyInfo,
    observedAt: new Date().toISOString(),
  });

  return {
    proposal: buildProposalFromOrchestration(
      { ...input, companyInfo },
      runtime,
    ),
    runtime,
  };
}
