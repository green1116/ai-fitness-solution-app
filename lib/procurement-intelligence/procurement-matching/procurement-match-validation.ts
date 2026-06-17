import { buildProcurementMatches } from "./procurement-match-builder";
import { buildProcurementMatchContext } from "./procurement-match-context";
import type { ProcurementMatchingValidation } from "./procurement-match-types";
import { buildProcurementRequirementLinks } from "./procurement-requirement-link";
import { buildProcurementSupplierLinks } from "./procurement-supplier-link";

const PI_P1B_MIN_MATCH_COUNT = 20;

let cachedValidation: ProcurementMatchingValidation | undefined;

export function validateProcurementMatching(): ProcurementMatchingValidation {
  if (cachedValidation) return cachedValidation;

  const requirementLinks = buildProcurementRequirementLinks();
  const supplierLinks = buildProcurementSupplierLinks();
  const context = buildProcurementMatchContext();
  const matches = buildProcurementMatches();

  const requirementLinksReady =
    requirementLinks.length > 0 &&
    requirementLinks.every(
      (link) =>
        link.requirementId.length > 0 &&
        link.decisionId.length > 0 &&
        link.productId.length > 0,
    );

  const supplierLinksReady =
    supplierLinks.length > 0 &&
    supplierLinks.every(
      (link) =>
        link.supplierId.length > 0 &&
        (link.linkType === "supplier-capability"
          ? Boolean(link.capabilityTag)
          : Boolean(link.productId)),
    );

  const matchContextReady =
    context.requirements.length > 0 &&
    context.decisions.length > 0 &&
    context.suppliers.length > 0 &&
    context.capabilities.length > 0;

  const requirementLinkCount = requirementLinks.length;
  const supplierLinkCount = supplierLinks.length;
  const matchCount = matches.length;

  const valid =
    requirementLinksReady &&
    supplierLinksReady &&
    matchContextReady &&
    matchCount >= PI_P1B_MIN_MATCH_COUNT;

  cachedValidation = {
    valid,
    requirementLinksReady,
    supplierLinksReady,
    matchContextReady,
    requirementLinkCount,
    supplierLinkCount,
    matchCount,
    summary: `procurement-matching reqLinks=${requirementLinkCount} supplierLinks=${supplierLinkCount} matches=${matchCount} valid=${valid}`,
  };

  return cachedValidation;
}
