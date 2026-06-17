import { findEvidenceByBrand } from "@/lib/evidence-intelligence-network";
import { findSpecificationsByRequirement } from "../product-foundation/product-spec-context";
import { resolveProductWithSpecifications } from "./substitution-context";
import { EPI_CANONICAL_ID } from "../shared/constants";
import { buildCompatibilityMatrix, getSpecificationLabel } from "./compatibility-matrix";
import type {
  CompatibilityGap,
  CompatibilityGapSeverity,
  CompatibilityGapType,
} from "./substitution-types";

function resolveSeverity(scoreImpact: number): CompatibilityGapSeverity {
  if (scoreImpact >= 70) return "high";
  if (scoreImpact >= 40) return "medium";
  return "low";
}

function buildGap(input: {
  specId: string;
  specName: string;
  gapType: CompatibilityGapType;
  severity: CompatibilityGapSeverity;
  explanation: string;
  sourceSpecRef?: string;
  targetSpecRef?: string;
}): CompatibilityGap {
  return {
    gapId: `epi-gap-${input.gapType}-${input.specId}`,
    specId: input.specId,
    specName: input.specName,
    gapType: input.gapType,
    severity: input.severity,
    explanation: input.explanation,
    sourceSpecRef: input.sourceSpecRef,
    targetSpecRef: input.targetSpecRef,
    mode: EPI_CANONICAL_ID,
  };
}

export function buildCompatibilityGaps(
  sourceProductId: string,
  targetProductId: string,
  requirementId?: string,
): CompatibilityGap[] {
  const source = resolveProductWithSpecifications(sourceProductId);
  const target = resolveProductWithSpecifications(targetProductId);
  if (!source || !target) return [];

  const matrix = buildCompatibilityMatrix(sourceProductId, targetProductId, requirementId);
  const gaps: CompatibilityGap[] = [];
  const targetSpecSet = new Set(target.specifications);

  const baselineSpecs = requirementId
    ? findSpecificationsByRequirement(requirementId)
    : source.specifications.map((specId) => ({
        id: specId,
        name: getSpecificationLabel(specId),
      }));

  for (const spec of baselineSpecs) {
    const specId = spec.id;
    const specName = spec.name;

    if (!targetSpecSet.has(specId)) {
      gaps.push(
        buildGap({
          specId,
          specName,
          gapType: "missing-spec",
          severity: resolveSeverity(80),
          explanation: `Target product "${target.name}" does not cover specification "${specName}" required by the substitution baseline.`,
          sourceSpecRef: specId,
        }),
      );
      continue;
    }

    if (source.category !== target.category) {
      gaps.push(
        buildGap({
          specId,
          specName,
          gapType: "weaker-spec",
          severity: resolveSeverity(55),
          explanation: `Specification "${specName}" aligns nominally, but category shift ${source.category}->${target.category} may weaken performance fit.`,
          sourceSpecRef: specId,
          targetSpecRef: specId,
        }),
      );
    }
  }

  if (source.brandId && target.brandId && source.brandId !== target.brandId) {
    gaps.push(
      buildGap({
        specId: `brand-${source.brandId}`,
        specName: "Brand alignment",
        gapType: "brand-mismatch",
        severity: resolveSeverity(60),
        explanation: `Substitution crosses brands (${source.brandId} -> ${target.brandId}), introducing authorization and positioning risk.`,
        sourceSpecRef: source.brandId,
        targetSpecRef: target.brandId,
      }),
    );
  }

  const targetEvidence = target.brandId ? findEvidenceByBrand(target.brandId) : [];
  if (targetEvidence.length === 0) {
    gaps.push(
      buildGap({
        specId: `evidence-${target.id}`,
        specName: "Evidence readiness",
        gapType: "evidence-missing",
        severity: resolveSeverity(75),
        explanation: `Target brand lacks ready evidence records to support tender-grade substitution for "${target.name}".`,
        targetSpecRef: target.brandId,
      }),
    );
  }

  if (matrix.specExcess > matrix.specMatches && target.category === "functional") {
    gaps.push(
      buildGap({
        specId: `install-${target.id}`,
        specName: "Installation footprint",
        gapType: "installation-incompatible",
        severity: resolveSeverity(50),
        explanation: `Functional target "${target.name}" introduces installation complexity beyond the source footprint.`,
        sourceSpecRef: source.id,
        targetSpecRef: target.id,
      }),
    );
  }

  if (source.category === "recovery" && target.category !== "recovery") {
    gaps.push(
      buildGap({
        specId: `maint-${target.id}`,
        specName: "Maintenance profile",
        gapType: "maintenance-incompatible",
        severity: resolveSeverity(45),
        explanation: `Recovery-zone maintenance expectations are not preserved when substituting with "${target.name}".`,
        sourceSpecRef: source.id,
        targetSpecRef: target.id,
      }),
    );
  }

  const baselineIds = new Set(baselineSpecs.map((spec: { id: string }) => spec.id));
  for (const specId of target.specifications) {
    if (!baselineIds.has(specId)) {
      gaps.push(
        buildGap({
          specId,
          specName: getSpecificationLabel(specId),
          gapType: "unsupported-spec",
          severity: resolveSeverity(35),
          explanation: `Target product adds specification "${getSpecificationLabel(specId)}" outside the baseline requirement scope.`,
          targetSpecRef: specId,
        }),
      );
    }
  }

  return gaps;
}
