import { validateActivationContextRegistry } from "./activation-context";
import {
  buildIndustryOpportunityActivations,
  getActivationsBySubject,
  getActivationsByType,
  validateActivationRegistry,
} from "./activation-registry";
import type {
  IndustryOpportunityActivation,
  IndustryOpportunityActivationValidation,
  OpportunityActivationQuery,
  OpportunityActivationQueryResult,
  RegistryValidation,
} from "./shared/types";
import {
  CANONICAL_ACTIVATION_QUERY,
  CANONICAL_ACTIVATION_SUBJECT_ID,
  TOP_ACTIVATION_SCORE_THRESHOLD,
} from "./shared/types";

function applyActivationQuery(
  input: OpportunityActivationQuery,
  source: IndustryOpportunityActivation[],
): IndustryOpportunityActivation[] {
  let activations = [...source];

  if (input.subjectId) {
    activations = activations.filter((activation) => activation.subjectId === input.subjectId);
  }

  if (input.opportunityType) {
    activations = activations.filter(
      (activation) => activation.opportunityType === input.opportunityType,
    );
  }

  if (input.activationStatus) {
    activations = activations.filter(
      (activation) => activation.activationStatus === input.activationStatus,
    );
  }

  if (input.minActivationScore !== undefined) {
    activations = activations.filter(
      (activation) => activation.score.totalActivationScore >= input.minActivationScore!,
    );
  }

  if (input.limit !== undefined) {
    activations = activations.slice(0, input.limit);
  }

  return activations;
}

function toQueryResult(
  query: OpportunityActivationQuery,
  activations: IndustryOpportunityActivation[],
): OpportunityActivationQueryResult {
  const queryParts = [
    query.subjectId ?? "all-subjects",
    query.opportunityType ?? "all-types",
    query.activationStatus ?? "all-status",
    query.minActivationScore?.toString() ?? "no-min-score",
    query.limit?.toString() ?? "no-limit",
  ];

  return {
    queryId: `activation-query-${queryParts.join("-")}`,
    query,
    activations,
    hitCount: activations.length,
    activationReady: activations.length > 0,
  };
}

export function findActivateSupplierOpportunities(limit = 5): OpportunityActivationQueryResult {
  return toQueryResult(
    { opportunityType: "supplier", limit },
    applyActivationQuery({ opportunityType: "supplier", limit }, getActivationsByType("supplier")),
  );
}

export function findActivateBrandOpportunities(limit = 5): OpportunityActivationQueryResult {
  return toQueryResult(
    { opportunityType: "brand", limit },
    applyActivationQuery({ opportunityType: "brand", limit }, getActivationsByType("brand")),
  );
}

export function findActivateTenderOpportunities(limit = 5): OpportunityActivationQueryResult {
  return toQueryResult(
    { opportunityType: "tender", limit },
    applyActivationQuery({ opportunityType: "tender", limit }, getActivationsByType("tender")),
  );
}

export function findActivatePartnershipOpportunities(limit = 5): OpportunityActivationQueryResult {
  return toQueryResult(
    { opportunityType: "partnership", limit },
    applyActivationQuery(
      { opportunityType: "partnership", limit },
      getActivationsByType("partnership"),
    ),
  );
}

export function findTopActivationOpportunities(limit = 5): OpportunityActivationQueryResult {
  return toQueryResult(
    { minActivationScore: TOP_ACTIVATION_SCORE_THRESHOLD, limit },
    applyActivationQuery(
      { minActivationScore: TOP_ACTIVATION_SCORE_THRESHOLD, limit },
      buildIndustryOpportunityActivations(),
    ),
  );
}

export function executeOpportunityActivationQuery(
  query: OpportunityActivationQuery = {},
): OpportunityActivationQueryResult {
  return toQueryResult(query, applyActivationQuery(query, buildIndustryOpportunityActivations()));
}

export function validateActivationQueryRegistry(): RegistryValidation {
  const canonical = executeOpportunityActivationQuery(CANONICAL_ACTIVATION_QUERY);
  const suppliers = findActivateSupplierOpportunities(3);
  const brands = findActivateBrandOpportunities(3);
  const tenders = findActivateTenderOpportunities(3);
  const partnerships = findActivatePartnershipOpportunities(3);
  const top = findTopActivationOpportunities(5);
  const subject = getActivationsBySubject(CANONICAL_ACTIVATION_SUBJECT_ID);

  const valid =
    canonical.activationReady &&
    canonical.hitCount >= 1 &&
    suppliers.hitCount >= 1 &&
    brands.hitCount >= 1 &&
    tenders.hitCount >= 2 &&
    partnerships.hitCount >= 1 &&
    top.hitCount >= 3 &&
    subject.length >= 1 &&
    canonical.activations.every(
      (activation) =>
        activation.score.feasibility > 0 &&
        activation.score.readiness > 0 &&
        activation.score.impact > 0 &&
        activation.score.urgency > 0 &&
        activation.score.confidence > 0,
    );

  return {
    valid,
    count: canonical.hitCount,
    summary: `activation-query canonical=${canonical.hitCount} suppliers=${suppliers.hitCount} tenders=${tenders.hitCount} top=${top.hitCount} valid=${valid}`,
  };
}

export function validateIndustryOpportunityActivation(): IndustryOpportunityActivationValidation {
  const activationRegistry = validateActivationRegistry();
  const activationContext = validateActivationContextRegistry();
  const activationQuery = validateActivationQueryRegistry();

  return {
    valid: activationRegistry.valid && activationContext.valid && activationQuery.valid,
    activationRegistry,
    activationContext,
    activationQuery,
  };
}
