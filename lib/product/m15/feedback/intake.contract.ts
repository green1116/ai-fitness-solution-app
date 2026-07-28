/**
 * Product M15 — Evolution feedback intake contract (in-memory, declarative)
 * Declarative match against registered feedbacks/capabilities —
 * no learning / optimization / AI analysis.
 */

import { EVOLUTION_FEEDBACK_INTAKE_MODES } from "./feedback.constants";
import { listEvolutionFeedbackCapabilities } from "./capability.registry";
import { listEvolutionFeedbacks } from "./feedback.registry";
import type {
  EvaluateEvolutionFeedbackIntakeContractInput,
  EvolutionFeedback,
  EvolutionFeedbackCapability,
  EvolutionFeedbackIntakeContract,
  EvolutionFeedbackIntakeHit,
  EvolutionFeedbackIntakeQuery,
} from "./feedback.types";

const contracts = new Map<string, EvolutionFeedbackIntakeContract>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneContract(
  contract: EvolutionFeedbackIntakeContract,
): EvolutionFeedbackIntakeContract {
  return {
    ...contract,
    query: {
      ...contract.query,
      feedbackKeys: contract.query.feedbackKeys
        ? [...contract.query.feedbackKeys]
        : undefined,
    },
    hits: contract.hits.map((h) => ({ ...h })),
    metadata: { ...contract.metadata },
  };
}

function matchCapability(
  feedback: EvolutionFeedback,
  capability: EvolutionFeedbackCapability,
  query: EvolutionFeedbackIntakeQuery,
): EvolutionFeedbackIntakeHit | undefined {
  if (feedback.status !== "ACTIVE" && feedback.status !== "DRAFT") {
    return undefined;
  }
  if (capability.status !== "DECLARED" && capability.status !== "DRAFT") {
    return undefined;
  }
  if (query.kind && feedback.kind !== query.kind) return undefined;
  if (query.scope && feedback.scope !== query.scope) return undefined;
  if (query.capabilityKind && capability.kind !== query.capabilityKind) {
    return undefined;
  }

  const feedbackKeys = (query.feedbackKeys ?? []).map((k) =>
    k.trim().toUpperCase(),
  );
  if (feedbackKeys.length > 0 && !feedbackKeys.includes(feedback.feedbackKey)) {
    return undefined;
  }

  if (query.mode === "DECLARED") {
    if (feedbackKeys.includes(feedback.feedbackKey)) {
      return {
        feedbackId: feedback.id,
        feedbackKey: feedback.feedbackKey,
        kind: feedback.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "FEEDBACK",
      };
    }
    if (query.kind && feedback.kind === query.kind) {
      return {
        feedbackId: feedback.id,
        feedbackKey: feedback.feedbackKey,
        kind: feedback.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "KIND",
      };
    }
    if (query.capabilityKind && capability.kind === query.capabilityKind) {
      return {
        feedbackId: feedback.id,
        feedbackKey: feedback.feedbackKey,
        kind: feedback.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "CAPABILITY",
      };
    }
    if (query.scope && feedback.scope === query.scope) {
      return {
        feedbackId: feedback.id,
        feedbackKey: feedback.feedbackKey,
        kind: feedback.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "SCOPE",
      };
    }
    return undefined;
  }

  if (query.mode === "ROUTINE") {
    if (query.kind && feedback.kind === query.kind) {
      return {
        feedbackId: feedback.id,
        feedbackKey: feedback.feedbackKey,
        kind: feedback.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "KIND",
      };
    }
    return undefined;
  }

  // HANDSHAKE — exact feedback key required
  if (feedbackKeys.includes(feedback.feedbackKey)) {
    return {
      feedbackId: feedback.id,
      feedbackKey: feedback.feedbackKey,
      kind: feedback.kind,
      capabilityKey: capability.capabilityKey,
      matchedOn: "FEEDBACK",
    };
  }
  return undefined;
}

export function evaluateEvolutionFeedbackIntakeContract(
  input: EvaluateEvolutionFeedbackIntakeContractInput,
): EvolutionFeedbackIntakeContract {
  const contractKey = input.contractKey.trim().toUpperCase();
  if (!contractKey) throw new Error("contract.contractKey is required");
  if (keys.has(contractKey)) {
    throw new Error(`contractKey already exists: ${contractKey}`);
  }
  if (
    !(EVOLUTION_FEEDBACK_INTAKE_MODES as readonly string[]).includes(
      input.query.mode,
    )
  ) {
    throw new Error(`invalid intake mode: ${input.query.mode}`);
  }
  const hasFilter =
    Boolean(input.query.kind) ||
    Boolean(input.query.capabilityKind) ||
    Boolean(input.query.scope) ||
    Boolean(input.query.feedbackKeys?.length);
  if (!hasFilter) {
    throw new Error(
      "query.kind, query.capabilityKind, query.scope, or query.feedbackKeys is required",
    );
  }

  const id = input.id?.trim() || createId("evofbin");
  if (contracts.has(id)) throw new Error(`contract already exists: ${id}`);

  const feedbacks = listEvolutionFeedbacks();
  const feedbackById = new Map(feedbacks.map((f) => [f.id, f]));
  const hits = listEvolutionFeedbackCapabilities()
    .map((capability) => {
      const feedback = feedbackById.get(capability.feedbackId);
      if (!feedback) return undefined;
      return matchCapability(feedback, capability, input.query);
    })
    .filter((h): h is EvolutionFeedbackIntakeHit => h !== undefined)
    .sort((a, b) => a.feedbackKey.localeCompare(b.feedbackKey));

  const contract: EvolutionFeedbackIntakeContract = {
    id,
    contractKey,
    query: {
      ...input.query,
      queryKey: input.query.queryKey.trim().toUpperCase(),
      feedbackKeys: input.query.feedbackKeys
        ? input.query.feedbackKeys.map((k) => k.trim().toUpperCase())
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

export function getEvolutionFeedbackIntakeContract(
  id: string,
): EvolutionFeedbackIntakeContract | undefined {
  const contract = contracts.get(id.trim());
  return contract ? cloneContract(contract) : undefined;
}

export function listEvolutionFeedbackIntakeContracts(): EvolutionFeedbackIntakeContract[] {
  return [...contracts.values()]
    .slice()
    .sort((a, b) => a.contractKey.localeCompare(b.contractKey))
    .map(cloneContract);
}

export function clearEvolutionFeedbackIntakeContracts(): void {
  contracts.clear();
  keys.clear();
}
