import type { ProcurementBundle } from "@/lib/procurement-intelligence/shared/types";
import type { ProposalSection } from "../types";

export function buildProcurementSection(
  procurement: ProcurementBundle,
  savings: number,
): ProposalSection {
  const channel = procurement.channelPricing;
  const listPrice = `挂牌价 ¥${channel.listPrice.toLocaleString()}`;
  const projectPrice = procurement.projectPricing
    ? `项目价 ¥${procurement.projectPricing.finalPrice.toLocaleString()} (${procurement.projectPricing.projectType}, 折扣 ${Math.round(procurement.projectPricing.discountRate * 100)}%)`
    : `项目价 ¥${channel.projectPrice.toLocaleString()}`;
  const bulkPrice = `批量价 ¥${channel.bulkPrice.toLocaleString()} (qty ≥ ${procurement.quantity})`;
  const discountRule = procurement.discountRule
    ? `${procurement.discountRule.ruleName}: ${procurement.discountRule.discountType} ${
        procurement.discountRule.discountType === "percentage"
          ? `${Math.round(procurement.discountRule.discountValue * 100)}%`
          : `¥${procurement.discountRule.discountValue.toLocaleString()}`
      } (阈值 ≥${procurement.discountRule.quantityThreshold})`
    : "无适用批量折扣规则";
  const savingsText = `节省金额 ¥${savings.toLocaleString()} (对比挂牌价)`;
  const finalPrice = `最终报价 ¥${procurement.finalPrice.toLocaleString()}`;

  const content = [
    listPrice,
    projectPrice,
    bulkPrice,
    `折扣规则: ${discountRule}`,
    savingsText,
    finalPrice,
  ].join("\n");

  const checks = [
    channel.listPrice > 0,
    channel.projectPrice > 0,
    channel.bulkPrice > 0,
    procurement.finalPrice > 0,
    savings >= 0,
    procurement.discountRule !== undefined || procurement.projectPricing !== undefined,
  ];
  const readinessScore = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return {
    id: "procurement-section",
    title: "采购章节",
    content,
    source: "v22-procurement-intelligence",
    readinessScore,
  };
}
