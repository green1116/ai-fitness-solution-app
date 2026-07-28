/**
 * Product M15 — Evolution experience exposure contract (in-memory, declarative)
 * Declarative match against registered experiences/capabilities —
 * no learning / optimization / AI analysis.
 */

import { EVOLUTION_EXPERIENCE_EXPOSURE_MODES } from "./experience.constants";
import { listEvolutionExperienceCapabilities } from "./capability.registry";
import { listEvolutionExperiences } from "./experience.registry";
import type {
  EvaluateEvolutionExperienceExposureContractInput,
  EvolutionExperience,
  EvolutionExperienceCapability,
  EvolutionExperienceExposureContract,
  EvolutionExperienceExposureHit,
  EvolutionExperienceExposureQuery,
} from "./experience.types";

const contracts = new Map<string, EvolutionExperienceExposureContract>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneContract(
  contract: EvolutionExperienceExposureContract,
): EvolutionExperienceExposureContract {
  return {
    ...contract,
    query: {
      ...contract.query,
      experienceKeys: contract.query.experienceKeys
        ? [...contract.query.experienceKeys]
        : undefined,
    },
    hits: contract.hits.map((h) => ({ ...h })),
    metadata: { ...contract.metadata },
  };
}

function matchCapability(
  experience: EvolutionExperience,
  capability: EvolutionExperienceCapability,
  query: EvolutionExperienceExposureQuery,
): EvolutionExperienceExposureHit | undefined {
  if (experience.status !== "ACTIVE" && experience.status !== "DRAFT") {
    return undefined;
  }
  if (capability.status !== "DECLARED" && capability.status !== "DRAFT") {
    return undefined;
  }
  if (query.kind && experience.kind !== query.kind) return undefined;
  if (query.scope && experience.scope !== query.scope) return undefined;
  if (query.capabilityKind && capability.kind !== query.capabilityKind) {
    return undefined;
  }

  const experienceKeys = (query.experienceKeys ?? []).map((k) =>
    k.trim().toUpperCase(),
  );
  if (
    experienceKeys.length > 0 &&
    !experienceKeys.includes(experience.experienceKey)
  ) {
    return undefined;
  }

  if (query.mode === "DECLARED") {
    if (experienceKeys.includes(experience.experienceKey)) {
      return {
        experienceId: experience.id,
        experienceKey: experience.experienceKey,
        kind: experience.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "EXPERIENCE",
      };
    }
    if (query.kind && experience.kind === query.kind) {
      return {
        experienceId: experience.id,
        experienceKey: experience.experienceKey,
        kind: experience.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "KIND",
      };
    }
    if (query.capabilityKind && capability.kind === query.capabilityKind) {
      return {
        experienceId: experience.id,
        experienceKey: experience.experienceKey,
        kind: experience.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "CAPABILITY",
      };
    }
    if (query.scope && experience.scope === query.scope) {
      return {
        experienceId: experience.id,
        experienceKey: experience.experienceKey,
        kind: experience.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "SCOPE",
      };
    }
    return undefined;
  }

  if (query.mode === "ROUTINE") {
    if (query.kind && experience.kind === query.kind) {
      return {
        experienceId: experience.id,
        experienceKey: experience.experienceKey,
        kind: experience.kind,
        capabilityKey: capability.capabilityKey,
        matchedOn: "KIND",
      };
    }
    return undefined;
  }

  // HANDSHAKE — exact experience key required
  if (experienceKeys.includes(experience.experienceKey)) {
    return {
      experienceId: experience.id,
      experienceKey: experience.experienceKey,
      kind: experience.kind,
      capabilityKey: capability.capabilityKey,
      matchedOn: "EXPERIENCE",
    };
  }
  return undefined;
}

export function evaluateEvolutionExperienceExposureContract(
  input: EvaluateEvolutionExperienceExposureContractInput,
): EvolutionExperienceExposureContract {
  const contractKey = input.contractKey.trim().toUpperCase();
  if (!contractKey) throw new Error("contract.contractKey is required");
  if (keys.has(contractKey)) {
    throw new Error(`contractKey already exists: ${contractKey}`);
  }
  if (
    !(EVOLUTION_EXPERIENCE_EXPOSURE_MODES as readonly string[]).includes(
      input.query.mode,
    )
  ) {
    throw new Error(`invalid exposure mode: ${input.query.mode}`);
  }
  const hasFilter =
    Boolean(input.query.kind) ||
    Boolean(input.query.capabilityKind) ||
    Boolean(input.query.scope) ||
    Boolean(input.query.experienceKeys?.length);
  if (!hasFilter) {
    throw new Error(
      "query.kind, query.capabilityKind, query.scope, or query.experienceKeys is required",
    );
  }

  const id = input.id?.trim() || createId("evoexex");
  if (contracts.has(id)) throw new Error(`contract already exists: ${id}`);

  const experiences = listEvolutionExperiences();
  const experienceById = new Map(experiences.map((e) => [e.id, e]));
  const hits = listEvolutionExperienceCapabilities()
    .map((capability) => {
      const experience = experienceById.get(capability.experienceId);
      if (!experience) return undefined;
      return matchCapability(experience, capability, input.query);
    })
    .filter((h): h is EvolutionExperienceExposureHit => h !== undefined)
    .sort((a, b) => a.experienceKey.localeCompare(b.experienceKey));

  const contract: EvolutionExperienceExposureContract = {
    id,
    contractKey,
    query: {
      ...input.query,
      queryKey: input.query.queryKey.trim().toUpperCase(),
      experienceKeys: input.query.experienceKeys
        ? input.query.experienceKeys.map((k) => k.trim().toUpperCase())
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

export function getEvolutionExperienceExposureContract(
  id: string,
): EvolutionExperienceExposureContract | undefined {
  const contract = contracts.get(id.trim());
  return contract ? cloneContract(contract) : undefined;
}

export function listEvolutionExperienceExposureContracts(): EvolutionExperienceExposureContract[] {
  return [...contracts.values()]
    .slice()
    .sort((a, b) => a.contractKey.localeCompare(b.contractKey))
    .map(cloneContract);
}

export function clearEvolutionExperienceExposureContracts(): void {
  contracts.clear();
  keys.clear();
}
