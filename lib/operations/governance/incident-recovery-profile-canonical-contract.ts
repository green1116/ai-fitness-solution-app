import {
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CANONICAL_CONTRACT_VERSION,
  type GovernanceIncidentRecoveryProfileCanonicalContractInput,
  type GovernanceIncidentRecoveryProfileCanonicalContractResult,
} from "./incident-recovery-profile-canonical-contract.types";
import { loadIncidentRecoveryProfileCanonicalContractRegistry } from "./incident-recovery-profile-canonical-contract.registry";
import { loadIncidentRecoveryProfileCanonicalContractConsumers } from "./incident-recovery-profile-canonical-contract.consumer";
import { validateIncidentRecoveryProfileCanonicalPayload } from "./incident-recovery-profile-canonical-contract.validator";
import { evaluateIncidentRecoveryProfileCanonicalCompatibility } from "./incident-recovery-profile-canonical-contract.compatibility";
import { buildIncidentRecoveryProfileCanonicalContractMatrix } from "./incident-recovery-profile-canonical-contract.matrix";
import { buildIncidentRecoveryProfileCanonicalContractReport } from "./incident-recovery-profile-canonical-contract.report";
import { buildIncidentRecoveryProfileCanonicalContractTrace } from "./incident-recovery-profile-canonical-contract.trace";
import { summarizeIncidentRecoveryProfileCanonicalContract } from "./incident-recovery-profile-canonical-contract.summary";

export function buildIncidentRecoveryProfileCanonicalContractRuntime(
  input: GovernanceIncidentRecoveryProfileCanonicalContractInput,
): GovernanceIncidentRecoveryProfileCanonicalContractResult {
  const contract = loadIncidentRecoveryProfileCanonicalContractRegistry({
    canonicalVersion: input.canonicalPayload.canonicalVersion,
  });
  const consumers = loadIncidentRecoveryProfileCanonicalContractConsumers();
  const compatibilities = consumers.map((consumer) => {
    const validation = validateIncidentRecoveryProfileCanonicalPayload({
      contract,
      payload: input.canonicalPayload,
    });
    return evaluateIncidentRecoveryProfileCanonicalCompatibility({
      consumer,
      missingRequiredFields: validation.missingRequiredFields.filter((f) =>
        consumer.requiredFields.includes(f),
      ),
      warnings: validation.warnings,
      payloadSourceType: input.canonicalPayload.sourceType,
    });
  });
  const matrix = buildIncidentRecoveryProfileCanonicalContractMatrix({
    deploymentId: input.deploymentId,
    compatibilities,
  });
  const report = buildIncidentRecoveryProfileCanonicalContractReport({
    contractVersion: contract.contractVersion,
    compatibilities,
  });
  const primary = compatibilities[0];
  const trace = buildIncidentRecoveryProfileCanonicalContractTrace({
    deploymentId: input.deploymentId,
    contractId: contract.contractId,
    compatibilities,
  });
  const core: Omit<GovernanceIncidentRecoveryProfileCanonicalContractResult, "summary"> = {
    version: GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CANONICAL_CONTRACT_VERSION,
    snapshot: contract,
    consumer: primary.consumerId as GovernanceIncidentRecoveryProfileCanonicalContractResult["consumer"],
    consumerVersion: primary.consumerVersion,
    compatibility: primary,
    matrix,
    report,
    trace,
    status: primary.status,
  };
  return { ...core, summary: summarizeIncidentRecoveryProfileCanonicalContract(core) };
}

export { GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CANONICAL_CONTRACT_VERSION };
