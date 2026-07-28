/**
 * Product M15 — Evolution governance oversight contract (in-memory, declarative)
 * Declarative match against registered governances/reviews —
 * no deployment / execution / capability upgrade.
 */

import { EVOLUTION_GOVERNANCE_OVERSIGHT_MODES } from "./governance.constants";
import { listEvolutionGovernances } from "./governance.registry";
import { listEvolutionGovernanceReviews } from "./review.registry";
import type {
  EvaluateEvolutionGovernanceOversightContractInput,
  EvolutionGovernance,
  EvolutionGovernanceOversightContract,
  EvolutionGovernanceOversightHit,
  EvolutionGovernanceOversightQuery,
  EvolutionGovernanceReview,
} from "./governance.types";

const contracts = new Map<string, EvolutionGovernanceOversightContract>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneContract(
  contract: EvolutionGovernanceOversightContract,
): EvolutionGovernanceOversightContract {
  return {
    ...contract,
    query: {
      ...contract.query,
      governanceKeys: contract.query.governanceKeys
        ? [...contract.query.governanceKeys]
        : undefined,
    },
    hits: contract.hits.map((h) => ({ ...h })),
    metadata: { ...contract.metadata },
  };
}

function matchReview(
  governance: EvolutionGovernance,
  review: EvolutionGovernanceReview,
  query: EvolutionGovernanceOversightQuery,
): EvolutionGovernanceOversightHit | undefined {
  if (governance.status !== "ACTIVE" && governance.status !== "DRAFT") {
    return undefined;
  }
  if (review.status !== "DECLARED" && review.status !== "DRAFT") {
    return undefined;
  }
  if (query.kind && governance.kind !== query.kind) return undefined;
  if (query.scope && governance.scope !== query.scope) return undefined;
  if (query.reviewKind && review.kind !== query.reviewKind) {
    return undefined;
  }

  const governanceKeys = (query.governanceKeys ?? []).map((k) =>
    k.trim().toUpperCase(),
  );
  if (
    governanceKeys.length > 0 &&
    !governanceKeys.includes(governance.governanceKey)
  ) {
    return undefined;
  }

  if (query.mode === "DECLARED") {
    if (governanceKeys.includes(governance.governanceKey)) {
      return {
        governanceId: governance.id,
        governanceKey: governance.governanceKey,
        kind: governance.kind,
        reviewKey: review.reviewKey,
        matchedOn: "GOVERNANCE",
      };
    }
    if (query.kind && governance.kind === query.kind) {
      return {
        governanceId: governance.id,
        governanceKey: governance.governanceKey,
        kind: governance.kind,
        reviewKey: review.reviewKey,
        matchedOn: "KIND",
      };
    }
    if (query.reviewKind && review.kind === query.reviewKind) {
      return {
        governanceId: governance.id,
        governanceKey: governance.governanceKey,
        kind: governance.kind,
        reviewKey: review.reviewKey,
        matchedOn: "REVIEW",
      };
    }
    if (query.scope && governance.scope === query.scope) {
      return {
        governanceId: governance.id,
        governanceKey: governance.governanceKey,
        kind: governance.kind,
        reviewKey: review.reviewKey,
        matchedOn: "SCOPE",
      };
    }
    return undefined;
  }

  if (query.mode === "ROUTINE") {
    if (query.kind && governance.kind === query.kind) {
      return {
        governanceId: governance.id,
        governanceKey: governance.governanceKey,
        kind: governance.kind,
        reviewKey: review.reviewKey,
        matchedOn: "KIND",
      };
    }
    return undefined;
  }

  // HANDSHAKE — exact governance key required
  if (governanceKeys.includes(governance.governanceKey)) {
    return {
      governanceId: governance.id,
      governanceKey: governance.governanceKey,
      kind: governance.kind,
      reviewKey: review.reviewKey,
      matchedOn: "GOVERNANCE",
    };
  }
  return undefined;
}

export function evaluateEvolutionGovernanceOversightContract(
  input: EvaluateEvolutionGovernanceOversightContractInput,
): EvolutionGovernanceOversightContract {
  const contractKey = input.contractKey.trim().toUpperCase();
  if (!contractKey) throw new Error("contract.contractKey is required");
  if (keys.has(contractKey)) {
    throw new Error(`contractKey already exists: ${contractKey}`);
  }
  if (
    !(EVOLUTION_GOVERNANCE_OVERSIGHT_MODES as readonly string[]).includes(
      input.query.mode,
    )
  ) {
    throw new Error(`invalid oversight mode: ${input.query.mode}`);
  }
  const hasFilter =
    Boolean(input.query.kind) ||
    Boolean(input.query.reviewKind) ||
    Boolean(input.query.scope) ||
    Boolean(input.query.governanceKeys?.length);
  if (!hasFilter) {
    throw new Error(
      "query.kind, query.reviewKind, query.scope, or query.governanceKeys is required",
    );
  }

  const id = input.id?.trim() || createId("evogovos");
  if (contracts.has(id)) throw new Error(`contract already exists: ${id}`);

  const governances = listEvolutionGovernances();
  const governanceById = new Map(governances.map((g) => [g.id, g]));
  const hits = listEvolutionGovernanceReviews()
    .map((review) => {
      const governance = governanceById.get(review.governanceId);
      if (!governance) return undefined;
      return matchReview(governance, review, input.query);
    })
    .filter((h): h is EvolutionGovernanceOversightHit => h !== undefined)
    .sort((a, b) => a.governanceKey.localeCompare(b.governanceKey));

  const contract: EvolutionGovernanceOversightContract = {
    id,
    contractKey,
    query: {
      ...input.query,
      queryKey: input.query.queryKey.trim().toUpperCase(),
      governanceKeys: input.query.governanceKeys
        ? input.query.governanceKeys.map((k) => k.trim().toUpperCase())
        : undefined,
    },
    hitCount: hits.length,
    hits,
    detail: `mode=${input.query.mode} hits=${hits.length}`,
    metadata: { ...(input.metadata ?? {}) },
    evaluatedAt: nowIso(),
  };
  contracts.set(id, contract);
  keys.set(contractKey, id);
  return cloneContract(contract);
}

export function getEvolutionGovernanceOversightContract(
  id: string,
): EvolutionGovernanceOversightContract | undefined {
  const contract = contracts.get(id.trim());
  return contract ? cloneContract(contract) : undefined;
}

export function listEvolutionGovernanceOversightContracts(): EvolutionGovernanceOversightContract[] {
  return [...contracts.values()]
    .slice()
    .sort((a, b) => a.contractKey.localeCompare(b.contractKey))
    .map(cloneContract);
}

export function clearEvolutionGovernanceOversightContracts(): void {
  contracts.clear();
  keys.clear();
}
