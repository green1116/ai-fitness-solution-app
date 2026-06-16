import { buildEquipmentIntelligenceProfiles } from "@/lib/brand-catalog-intelligence/equipment-intelligence";
import { buildRequirementRegistryRecords } from "@/lib/requirement-intelligence";
import { EPI_CANONICAL_ID } from "../shared/constants";
import type { SpecificationRecord, SpecificationRegistry } from "./product-spec-types";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function resolveRequirementSpecCategory(input: {
  requirementKind: string;
  title: string;
  description: string;
  requirementType: string;
}): string {
  const text = `${input.title} ${input.description} ${input.requirementType}`.toLowerCase();

  if (input.requirementKind === "equipment") {
    if (text.includes("cardio") || text.includes("treadmill") || text.includes("bike")) {
      return "cardio";
    }
    if (text.includes("strength") || text.includes("weight")) return "strength";
    if (text.includes("functional") || text.includes("synrgy")) return "functional";
    if (text.includes("group") || text.includes("cycle")) return "group-training";
    if (text.includes("recovery") || text.includes("stretch")) return "recovery";
    return "equipment";
  }

  return input.requirementKind;
}

function buildRequirementSpecifications(): SpecificationRecord[] {
  return buildRequirementRegistryRecords().map((requirement) => ({
    id: `epi-spec-req-${requirement.requirementId}`,
    code: slugify(`${requirement.requirementKind}-${requirement.requirementType}`),
    name: requirement.title,
    category: resolveRequirementSpecCategory({
      requirementKind: requirement.requirementKind,
      title: requirement.title,
      description: requirement.description,
      requirementType: requirement.requirementType,
    }),
    source: "requirement" as const,
    mode: EPI_CANONICAL_ID,
  }));
}

function buildEquipmentIntelligenceSpecifications(): SpecificationRecord[] {
  return buildEquipmentIntelligenceProfiles().map((profile) => ({
    id: `epi-spec-eq-${slugify(profile.profileId)}`,
    code: slugify(`eq-${profile.category}-${profile.modelName}`),
    name: `${profile.modelName} Specification`,
    category: profile.category,
    source: "equipment-intelligence" as const,
    mode: EPI_CANONICAL_ID,
  }));
}

let cachedRegistry: SpecificationRegistry | undefined;

export function buildSpecificationRegistry(): SpecificationRegistry {
  if (cachedRegistry) return cachedRegistry;

  const byId = new Map<string, SpecificationRecord>();

  for (const spec of buildRequirementSpecifications()) {
    byId.set(spec.id, spec);
  }

  for (const spec of buildEquipmentIntelligenceSpecifications()) {
    byId.set(spec.id, spec);
  }

  cachedRegistry = {
    registryId: "epi-specification-registry-v42-p1",
    specifications: [...byId.values()],
    mode: EPI_CANONICAL_ID,
  };

  return cachedRegistry;
}

export function findSpecificationById(specificationId: string): SpecificationRecord | undefined {
  return buildSpecificationRegistry().specifications.find(
    (specification) => specification.id === specificationId,
  );
}
