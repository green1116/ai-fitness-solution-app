/**
 * V59 Product Engine — Quote (V58 Lifecycle + Job + Async)
 */

import type { ProductPlaceholder } from "@/lib/domain/tender";
import { buildPlan } from "@/lib/plan/builder";
import {
  createQuoteOrchestrator,
  type QuoteOrchestrationResult,
} from "@/lib/quote-lifecycle";

import { describeEquipmentFocus, resolveEquipmentFocus } from "./configuration-strategy";
import type { CompanyInfoInput, QuoteProposal } from "./types";
import {
  applyQuoteRevisionOverrides,
  hasBasementNoVentilationConstraint,
} from "./quote-revision";

export type QuoteEngineInput = {
  quoteId: string;
  workspaceId: string;
  action?: string;
  companyInfo: CompanyInfoInput;
  /** Configured placeholders (selections applied) that also feed PDF / PI.1 / Budget. */
  equipment?: ProductPlaceholder[];
};

function placeholderEquipmentLine(p: ProductPlaceholder): string {
  const name = p.subCategory?.trim() || p.category;
  const candidate =
    p.brand?.trim() && p.model?.trim() ? `（${p.brand.trim()} ${p.model.trim()}）` : "";
  return `${p.category}：${name}${candidate} ×${p.quantity}（${p.recommendationReason}）`;
}

export type QuoteEngineResult = {
  proposal: QuoteProposal;
  runtime: QuoteOrchestrationResult;
};

export {
  applyQuoteRevisionOverrides,
  hasBasementNoVentilationConstraint,
  hasStrengthEquipmentEmphasis,
  parseExplicitAreaM2FromNotes,
} from "./quote-revision";

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
  const knownAreaSize =
    typeof companyInfo.areaM2 === "number" &&
    Number.isFinite(companyInfo.areaM2) &&
    companyInfo.areaM2 > 0
      ? companyInfo.areaM2
      : null;
  const equipmentFocus = resolveEquipmentFocus(companyInfo.notes);
  const strengthEmphasis = equipmentFocus.strengthPrimary;
  // buildPlan requires numeric companySize/areaSize; when unknown, overwrite that copy below.
  const plan = buildPlan(
    {
      planId: input.quoteId,
      industry,
      companySize: knownCompanySize ?? 0,
      areaSize: knownAreaSize ?? 0,
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

  if (knownAreaSize == null && plan.executiveSummary.length > 1) {
    plan.executiveSummary[1] =
      "空间面积待确认，同时使用人数与分区规模需在面积确认后评估";
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
  const equipmentBody = input.equipment?.length
    ? input.equipment.map(placeholderEquipmentLine).join(" ")
    : Object.entries(plan.equipments)
        .flatMap(([zone, items]) =>
          items.map(
            (item) => `${zone}：${item.name} ×${item.qty}（${item.rationale}）`,
          ),
        )
        .join(" ");
  const focusText = describeEquipmentFocus(equipmentFocus);

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
        knownAreaSize != null ? `面积：${knownAreaSize}㎡` : "面积：待确认",
        focusText ? `配置侧重：${focusText}` : null,
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
