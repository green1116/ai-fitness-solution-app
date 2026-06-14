import type { LeadTimeIntelligenceEntry } from "@/lib/procurement-intelligence/shared/types";
import type {
  InventoryEntry,
  ServiceEntry,
} from "@/lib/regional-supplier-foundation/shared/types";
import type { ProposalSection } from "../types";

export function buildDeliverySection(input: {
  leadTime: LeadTimeIntelligenceEntry | undefined;
  service: ServiceEntry[];
  inventory: InventoryEntry[];
}): ProposalSection {
  const { leadTime, service, inventory } = input;

  const inventoryStatus = inventory.length
    ? inventory
        .map(
          (i) =>
            `${i.warehouseLocation}: ${i.stockStatus} · 可用 ${i.availableQuantity} 台`,
        )
        .join("; ")
    : "库存数据不可用";

  const leadTimeText = leadTime
    ? `交货周期 ${leadTime.leadTimeDays} 天 · 来源 ${leadTime.source} · 可用性 ${leadTime.availability} · 优先级 ${leadTime.priority}`
    : "交货周期数据不可用";

  const installation = service.length
    ? service
        .map(
          (s) =>
            `${s.serviceProvider}: 响应 ${s.responseTime} · 到场 ${s.onsiteTime} · ${s.sla}`,
        )
        .join("; ")
    : "安装服务数据不可用";

  const maintenance = service.length
    ? service
        .map(
          (s) =>
            `${s.serviceProvider}: ${s.engineerCount} 工程师 · 备件 ${s.sparePartsAvailable ? "可用" : "不可用"} · ${s.sla}`,
        )
        .join("; ")
    : "维保能力数据不可用";

  const content = [
    `库存状态: ${inventoryStatus}`,
    `交货周期: ${leadTimeText}`,
    `安装服务: ${installation}`,
    `维保能力: ${maintenance}`,
  ].join("\n");

  const checks = [
    inventory.length > 0,
    leadTime !== undefined,
    service.length > 0,
    leadTime?.leadTimeDays !== undefined && leadTime.leadTimeDays > 0,
  ];
  const readinessScore = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return {
    id: "delivery-section",
    title: "交付章节",
    content,
    source: "v21-v22-delivery",
    readinessScore,
  };
}
