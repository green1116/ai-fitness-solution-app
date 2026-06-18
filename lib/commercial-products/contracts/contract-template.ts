import type { ProductSku } from "../shared/constants";
import type {
  ContractTemplate,
  PricingQuote,
  ProductDeliverable,
  SlaAssignment,
} from "../shared/types";

const ACCEPTANCE_BY_SKU: Record<ProductSku, string[]> = {
  "kickstart-package": [
    "Plan PDF 与 Budget PDF 可下载",
    "Brand Summary 与 Risk Summary 已交付",
    "客户书面确认验收",
  ],
  "tender-ready-package": [
    "Kickstart 全部交付物验收通过",
    "Procurement Summary 与 Tender Summary 已交付",
    "1 轮修订完成",
  ],
  "delivery-intelligence-package": [
    "Tender Ready 全部交付物验收通过",
    "Delivery Report 已交付",
    "交付里程碑与优化建议已确认",
  ],
};

export function buildContractTemplate(input: {
  projectName: string;
  sku: ProductSku;
  pricing: PricingQuote;
  sla: SlaAssignment;
  deliverables: ProductDeliverable[];
}): ContractTemplate {
  const depositAmount = Math.round(input.pricing.suggestedPriceCny * 0.5);
  const acceptanceAmount = input.pricing.suggestedPriceCny - depositAmount;

  return {
    contractId: `cp-contract-${input.sku}-${input.projectName.replace(/\s+/g, "-").toLowerCase()}`,
    projectName: input.projectName,
    sku: input.sku,
    scope: input.deliverables.map((deliverable) => deliverable.name),
    priceCny: input.pricing.suggestedPriceCny,
    paymentSchedule: [
      {
        milestone: "deposit",
        ratio: 0.5,
        amountCny: depositAmount,
        trigger: "合同签署后 3 个工作日内",
      },
      {
        milestone: "acceptance",
        ratio: 0.5,
        amountCny: acceptanceAmount,
        trigger: "全部交付物验收通过后",
      },
    ],
    acceptanceCriteria: ACCEPTANCE_BY_SKU[input.sku],
    sla: input.sla,
    summary: `contract project=${input.projectName} sku=${input.sku} price=${input.pricing.suggestedPriceCny} sla=${input.sla.tier}`,
  };
}
