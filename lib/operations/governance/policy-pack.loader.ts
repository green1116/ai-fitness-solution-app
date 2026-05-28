import { buildDefaultGovernancePolicyPacks } from "./policy-pack";
import {
  GOVERNANCE_POLICY_PACK_VERSION,
  type GovernancePolicyPack,
  type GovernancePolicyPackVersion,
} from "./policy-pack.types";

export function isGovernancePolicyPackVersion(version: string): version is GovernancePolicyPackVersion {
  return version === GOVERNANCE_POLICY_PACK_VERSION;
}

export function validateGovernancePolicyPacks(packs: GovernancePolicyPack[]): GovernancePolicyPack[] {
  if (packs.length === 0) {
    throw new Error("Governance policy pack registry must contain at least one pack.");
  }
  for (const pack of packs) {
    if (!isGovernancePolicyPackVersion(pack.version)) {
      throw new Error(`Unsupported policy pack version: ${pack.version}`);
    }
  }
  return packs;
}

export function loadGovernancePolicyPacks(input?: {
  packs?: GovernancePolicyPack[];
}): GovernancePolicyPack[] {
  const loaded = input?.packs ?? buildDefaultGovernancePolicyPacks();
  return validateGovernancePolicyPacks(loaded);
}
