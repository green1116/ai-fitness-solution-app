import type { ComplianceNode, SemanticRequirement } from "@/lib/tender/semantic/types";

import { finalizeBlock } from "./responseQuality";
import type { TenderResponseBlock } from "./types";
import {
  extractEvidenceRefs,
  inferConfidence,
  nextBlockId,
  quoteRequirement,
} from "./responseUtils";

function composeCommercialParagraph(req: SemanticRequirement): string {
  const q = quoteRequirement(req.requirement);
  const t = req.requirement;

  if (/(付款|支付|结算)/.test(t)) {
    return `针对「${q}」付款安排，我方可按招标文件约定方式组织结算，按里程碑节点提交合法有效凭证并配合审核，具体节点以合同约定为准。`;
  }
  if (/(发票|税费)/.test(t)) {
    return `针对「${q}」发票要求，我方可按国家规定开具合法有效发票，税目、税率与合同清单一致，配合采购人财务入账。`;
  }
  if (/(质保|保修|维保)/.test(t)) {
    return `针对「${q}」质保条款，我方可提供符合招标约定的质保与维保服务，建立故障响应与备件保障机制，质保范围以合同附件界定。`;
  }
  if (/(交付|供货|工期|日历日|工作日)/.test(t)) {
    return `针对「${q}」交付周期，我方可制定供货与实施计划，明确里程碑与验收节点，原则上可按招标期限组织交付，具体工期以合同签订后计划为准。`;
  }
  if (/(验收)/.test(t)) {
    return `针对「${q}」验收口径，我方可按招标文件及国家标准组织自检与配合验收，验收资料、缺陷整改流程以合同约定执行。`;
  }
  if (/(售后|响应|SLA|服务)/.test(t)) {
    return `针对「${q}」售后响应，我方可建立服务台与分级响应机制，响应时效与升级路径写入售后服务承诺，具体 SLA 以合同为准。`;
  }
  if (/(报价|价格|单价|总价|商务)/.test(t)) {
    return `针对「${q}」商务事项，我方报价口径与招标清单一致，分项力求闭合、税费清晰，最终价格以投标函及合同为准。`;
  }
  return `针对「${q}」商务条款，我方逐条响应并纳入合同履约体系，实施过程接受采购人监督，未尽事宜以合同约定为准。`;
}

/**
 * 商务类要求 → 商务响应段落
 */
export function composeCommercialResponse(
  requirements: SemanticRequirement[],
  complianceByReq: Map<string, ComplianceNode>,
): TenderResponseBlock[] {
  const commercial = requirements.filter(
    (r) =>
      r.category === "commercial" ||
      (r.category !== "technical" &&
        r.category !== "attachment" &&
        /付款|质保|商务|报价|合同|交付|工期|发票|验收|售后/.test(
          r.requirement,
        )),
  );

  let seq = 0;
  return commercial.map((req) => {
    seq += 1;
    const compliance = complianceByReq.get(req.id);
    const evidenceRefs = extractEvidenceRefs(req.requirement);

    return finalizeBlock(
      {
        id: nextBlockId("CR", seq),
        title: req.title || `商务响应 ${seq}`,
        type: "commercial",
        sectionId: req.sourceSectionId,
        relatedRequirementIds: [req.id],
        relatedScoringItemIds: req.relatedScoringItems,
        relatedRiskIds: req.relatedRisks,
        content: composeCommercialParagraph(req),
        confidence: inferConfidence(req, compliance),
        evidenceRefs: evidenceRefs.length ? evidenceRefs : undefined,
        sectionRef: req.sourceSectionId
          ? `招标章节 ${req.sourceSectionId}`
          : "商务说明章节",
      },
      "具体商务条件以投标函及合同条款为准",
    );
  });
}
