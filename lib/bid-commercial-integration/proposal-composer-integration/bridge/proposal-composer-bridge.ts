import { buildBidCommercialBundle } from "../../bridge/commercial-bid-bridge";
import type { BidCommercialBundle } from "../../shared/types";
import { buildCommercialProposalSections } from "../../proposal-sections/builders";
import type { ProposalSection, ProposalSectionId } from "../../proposal-sections/types";
import type {
  CommercialProposalPack,
  ProposalComposerSimulation,
  TenderResponsePackCompatibility,
} from "../shared/types";
import type { ProjectType } from "@/lib/procurement-intelligence/shared/types";

function findSection(sections: ProposalSection[], id: ProposalSectionId): ProposalSection {
  const section = sections.find((s) => s.id === id);
  if (!section) {
    throw new Error(`Missing proposal section: ${id}`);
  }
  return section;
}

export function composeProposalPackFromSections(
  bundle: BidCommercialBundle,
  sections: ProposalSection[],
): CommercialProposalPack {
  const equipmentSection = findSection(sections, "equipment-section");
  const supplyChainSection = findSection(sections, "supply-chain-section");
  const procurementSection = findSection(sections, "procurement-section");
  const deliverySection = findSection(sections, "delivery-section");

  const integrationReadiness = Math.round(
    (equipmentSection.readinessScore +
      supplyChainSection.readinessScore +
      procurementSection.readinessScore +
      deliverySection.readinessScore) /
      4,
  );

  return {
    packId: `commercial-proposal-pack-${bundle.sku}-${bundle.city}-${bundle.projectType}-q${bundle.quantity}`
      .replace(/\s+/g, "-")
      .toLowerCase(),
    sku: bundle.sku,
    city: bundle.city,
    quantity: bundle.quantity,
    projectType: bundle.projectType,
    bundleId: bundle.bundleId,
    equipmentSection,
    supplyChainSection,
    procurementSection,
    deliverySection,
    integrationReadiness,
  };
}

export function simulateProposalComposer(input: {
  bundle: BidCommercialBundle;
  sections: ProposalSection[];
}): ProposalComposerSimulation {
  const pack = composeProposalPackFromSections(input.bundle, input.sections);

  return {
    composerId: `proposal-composer-sim-${pack.packId}`,
    inputSectionCount: input.sections.length,
    outputPackId: pack.packId,
    mappedSections: [
      "equipmentSection",
      "supplyChainSection",
      "procurementSection",
      "deliverySection",
    ],
    composerReadiness: pack.integrationReadiness,
  };
}

export function validateTenderResponsePackCompatibility(
  pack: CommercialProposalPack,
): TenderResponsePackCompatibility {
  const equipmentAttachmentCompatible =
    pack.equipmentSection.content.includes("品牌") &&
    pack.equipmentSection.content.includes("型号") &&
    pack.equipmentSection.readinessScore > 0;

  const commercialAttachmentCompatible =
    pack.procurementSection.content.includes("最终报价") &&
    pack.procurementSection.content.includes("挂牌价") &&
    pack.procurementSection.readinessScore > 0;

  const deliveryScheduleCompatible =
    pack.deliverySection.content.includes("交货周期") &&
    pack.deliverySection.content.includes("库存状态") &&
    pack.deliverySection.readinessScore > 0;

  const supplyChainCompatible =
    pack.supplyChainSection.content.includes("供应商") &&
    pack.supplyChainSection.readinessScore > 0;

  const checks = [
    equipmentAttachmentCompatible,
    commercialAttachmentCompatible,
    deliveryScheduleCompatible,
    supplyChainCompatible,
  ];
  const compatibilityScore = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return {
    compatible: checks.every(Boolean),
    equipmentAttachmentCompatible,
    commercialAttachmentCompatible,
    deliveryScheduleCompatible,
    supplyChainCompatible,
    compatibilityScore,
  };
}

export function buildCommercialProposalPack(input: {
  sku: string;
  city: string;
  quantity: number;
  projectType: ProjectType;
}): CommercialProposalPack {
  const bundle = buildBidCommercialBundle(input);
  const sections = buildCommercialProposalSections(bundle);
  return composeProposalPackFromSections(bundle, sections);
}
