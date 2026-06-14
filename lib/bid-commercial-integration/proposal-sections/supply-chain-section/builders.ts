import type { SupplierNetworkBundle } from "@/lib/regional-supplier-foundation/shared/types";
import type { ProposalSection } from "../types";

export function buildSupplyChainSection(supplierNetwork: SupplierNetworkBundle): ProposalSection {
  const suppliers = supplierNetwork.supplier
    .map((s) => `${s.supplierName} (${s.authorizationLevel}, ${s.region})`)
    .join("; ");
  const dealers = supplierNetwork.dealer
    .map((d) => `${d.dealerName} · ${d.city} · ${d.serviceLevel}${d.warehouseCapability ? " · 仓储" : ""}`)
    .join("; ");
  const inventory = supplierNetwork.inventory
    .map(
      (i) =>
        `${i.warehouseLocation}: ${i.stockStatus} · 可用 ${i.availableQuantity} · 补货 ${i.replenishmentLeadTime}`,
    )
    .join("; ");
  const coverage = supplierNetwork.coverage
    ? `覆盖等级 ${supplierNetwork.coverage.coverageLevel} · 响应 ${supplierNetwork.coverage.responseTime} · 安装 ${supplierNetwork.coverage.installationLeadTime} · SLA ${supplierNetwork.coverage.maintenanceSla}`
    : "区域覆盖数据不可用";
  const services = supplierNetwork.service
    .map(
      (s) =>
        `${s.serviceProvider}: 响应 ${s.responseTime} · 到场 ${s.onsiteTime} · ${s.engineerCount} 工程师`,
    )
    .join("; ");

  const content = [
    `供应商: ${suppliers || "无"}`,
    `经销商: ${dealers || "无"}`,
    `库存: ${inventory || "无"}`,
    `服务覆盖: ${coverage}`,
    `服务网络: ${services || "无"}`,
  ].join("\n");

  const checks = [
    supplierNetwork.supplier.length > 0,
    supplierNetwork.dealer.length > 0,
    supplierNetwork.inventory.length > 0,
    supplierNetwork.coverage !== undefined,
    supplierNetwork.service.length > 0,
  ];
  const readinessScore = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return {
    id: "supply-chain-section",
    title: "供应链章节",
    content,
    source: "v21-supplier-network",
    readinessScore,
  };
}
