import type { RealCatalogBundle } from "@/lib/real-catalog-foundation/bridge/catalog-bridge";
import type { ProposalSection } from "../types";

function formatSpecs(catalog: RealCatalogBundle): string {
  const eq = catalog.equipment;
  if (!eq) return "";
  return [
    `类别: ${eq.category} / ${eq.subCategory}`,
    `尺寸: ${eq.dimensionsCm.length}×${eq.dimensionsCm.width}×${eq.dimensionsCm.height} cm`,
    `重量: ${eq.weightKg} kg`,
    `功率: ${eq.powerRequirement}`,
    `最大承重: ${eq.maxUserWeightKg} kg`,
    `连接: ${eq.connectivity.join(", ")}`,
    `质保: ${eq.warrantyYears} 年`,
  ].join("; ");
}

export function buildEquipmentSection(catalog: RealCatalogBundle | null): ProposalSection {
  if (!catalog) {
    return {
      id: "equipment-section",
      title: "设备章节",
      content: "设备目录数据不可用。",
      source: "v20-real-catalog",
      readinessScore: 0,
    };
  }

  const brand = catalog.brand?.brandName ?? catalog.equipment?.brandName ?? "—";
  const model = catalog.equipment?.modelName ?? "—";
  const specs = formatSpecs(catalog);
  const pricing = catalog.pricing
    ? `挂牌价 ¥${catalog.pricing.listPrice.toLocaleString()} · 经销商价 ¥${catalog.pricing.dealerPrice.toLocaleString()} · 项目价 ¥${catalog.pricing.projectPriceMin.toLocaleString()}–¥${catalog.pricing.projectPriceMax.toLocaleString()}`
    : "定价数据不可用";
  const maintenance = catalog.maintenance
    ? `维护间隔 ${catalog.maintenance.serviceIntervalDays} 天 · 年维护成本 ¥${catalog.maintenance.annualMaintenanceCost.toLocaleString()} · SLA ${catalog.maintenance.slaResponseHours}h · 备件 ${catalog.maintenance.sparePartsAvailability}`
    : "维护数据不可用";
  const replacement = catalog.replacement
    ? `替换周期 ${catalog.replacement.replacementCycleYears} 年 · 预期寿命 ${catalog.replacement.expectedLifespanYears} 年 · 升级路径 ${catalog.replacement.upgradePath}`
    : "替换周期数据不可用";

  const content = [
    `品牌: ${brand}`,
    `型号: ${model} (${catalog.equipment?.sku ?? "—"})`,
    `规格: ${specs}`,
    `定价: ${pricing}`,
    `维护: ${maintenance}`,
    `替换周期: ${replacement}`,
  ].join("\n");

  const checks = [
    brand !== "—",
    model !== "—",
    specs.length > 0,
    catalog.pricing !== undefined,
    catalog.maintenance !== undefined,
    catalog.replacement !== undefined,
  ];
  const readinessScore = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return {
    id: "equipment-section",
    title: "设备章节",
    content,
    source: "v20-real-catalog",
    readinessScore,
  };
}
