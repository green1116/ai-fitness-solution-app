import { buildBidCommercialBundle } from "@/lib/bid-commercial-integration";
import type { ProposalIntelligenceInput, ProposalRisk } from "../shared/types";

export function buildRiskAnalysis(input: ProposalIntelligenceInput): ProposalRisk[] {
  const bundle = buildBidCommercialBundle(input);
  const risks: ProposalRisk[] = [];

  const totalInventory = bundle.supplierNetwork.inventory.reduce(
    (sum, entry) => sum + entry.availableQuantity,
    0,
  );
  const inventoryRatio = input.quantity > 0 ? totalInventory / input.quantity : 0;

  if (inventoryRatio < 1) {
    risks.push({
      category: "inventory",
      level: "high",
      description: "Insufficient inventory to fulfill order quantity",
    });
  } else if (inventoryRatio < 1.5) {
    risks.push({
      category: "inventory",
      level: "medium",
      description: "Limited inventory buffer above order quantity",
    });
  } else {
    risks.push({
      category: "inventory",
      level: "low",
      description: "Inventory available with adequate buffer",
    });
  }

  const supplierCount = bundle.supplierNetwork.supplier.length;
  if (supplierCount <= 1) {
    risks.push({
      category: "supplier-concentration",
      level: "medium",
      description: "Regional concentration risk — single authorized supplier",
    });
  } else if (supplierCount === 2) {
    risks.push({
      category: "supplier-concentration",
      level: "low",
      description: "Dual supplier coverage reduces concentration risk",
    });
  } else {
    risks.push({
      category: "supplier-concentration",
      level: "low",
      description: "Multiple suppliers available for the brand",
    });
  }

  const leadDays = bundle.leadTime?.leadTimeDays ?? 30;
  if (leadDays > 21) {
    risks.push({
      category: "lead-time",
      level: "high",
      description: `Extended lead time of ${leadDays} days may impact delivery schedule`,
    });
  } else if (leadDays > 14) {
    risks.push({
      category: "lead-time",
      level: "medium",
      description: `Lead time of ${leadDays} days requires schedule planning`,
    });
  } else {
    risks.push({
      category: "lead-time",
      level: "low",
      description: `Fast delivery — ${leadDays}-day lead time`,
    });
  }

  const serviceCount = bundle.supplierNetwork.service.filter((s) => s.status === "active").length;
  if (serviceCount === 0) {
    risks.push({
      category: "service-coverage",
      level: "high",
      description: "No active service providers in target city",
    });
  } else if (serviceCount === 1) {
    risks.push({
      category: "service-coverage",
      level: "medium",
      description: "Single service provider — limited maintenance redundancy",
    });
  } else {
    risks.push({
      category: "service-coverage",
      level: "low",
      description: "Strong service coverage with multiple active providers",
    });
  }

  const listPrice = bundle.procurement.channelPricing.listPrice;
  const savingsRate = listPrice > 0 ? bundle.savings / listPrice : 0;
  if (savingsRate < 0.05) {
    risks.push({
      category: "pricing",
      level: "high",
      description: "Pricing near list — limited discount leverage",
    });
  } else if (savingsRate < 0.1) {
    risks.push({
      category: "pricing",
      level: "medium",
      description: "Moderate savings — consider bulk or project pricing rules",
    });
  } else {
    risks.push({
      category: "pricing",
      level: "low",
      description: "Competitive pricing with meaningful savings vs list price",
    });
  }

  return risks;
}
