/**
 * V80 P5 — Global invariant certification (V76–V79 stack)
 */
import { SYSTEM_INVARIANT_CATALOG } from "./system.invariant.catalog";
import type { SystemGlobalInvariantCert, SystemInvariantCertManifest } from "./system.closure";
import { V80_SYSTEM_CLOSURE_VERSION } from "./system.closure";

const STACK_LAYERS = ["V76", "V77", "V78", "V79"] as const;

export const SYSTEM_GLOBAL_INVARIANT_CERTS: SystemGlobalInvariantCert[] = [
  {
    id: "SYS-GIC-001",
    invariantRef: "SYS-INV-001",
    layerRefs: [...STACK_LAYERS],
    certificationRule: "stack-freeze-intact-certified",
    stackCondition: "forall(layer in V76..V79): freezeVersion.locked",
    closureRef: "SYS-CLS-004",
    required: true,
    description: "Certify V76–V79 stack freeze invariant",
  },
  {
    id: "SYS-GIC-002",
    invariantRef: "SYS-INV-002",
    layerRefs: [...STACK_LAYERS],
    certificationRule: "cross-layer-map-certified",
    stackCondition: "crossLayerMap.complete && length == 4",
    closureRef: "SYS-CLS-001",
    required: true,
    description: "Certify cross-layer map invariant across stack",
  },
  {
    id: "SYS-GIC-003",
    invariantRef: "SYS-INV-003",
    layerRefs: [...STACK_LAYERS],
    certificationRule: "dependency-chain-certified",
    stackCondition: "dependencyChain == [V76,V77,V78,V79]",
    closureRef: "SYS-CLS-004",
    required: true,
    description: "Certify V76→V79 dependency chain invariant",
  },
  {
    id: "SYS-GIC-004",
    invariantRef: "SYS-INV-004",
    layerRefs: [...STACK_LAYERS],
    certificationRule: "scope-coverage-certified",
    stackCondition: "scopeCoverage.complete && perLayerScopes == 4",
    closureRef: "SYS-CLS-005",
    required: true,
    description: "Certify global scope coverage invariant",
  },
  {
    id: "SYS-GIC-005",
    invariantRef: "SYS-INV-005",
    layerRefs: [...STACK_LAYERS],
    certificationRule: "signoff-alignment-certified",
    stackCondition: "forall(layer): signoffRef == crossLayerMap[layer]",
    closureRef: "SYS-CLS-002",
    required: true,
    description: "Certify signoff version alignment invariant",
  },
  {
    id: "SYS-GIC-006",
    invariantRef: "SYS-INV-006",
    layerRefs: [...STACK_LAYERS],
    certificationRule: "declarative-stack-certified",
    stackCondition: "noRuntimeOrchestration && noExecution && noMutation",
    closureRef: "SYS-CLS-006",
    required: true,
    description: "Certify declarative-only stack invariant",
  },
];

export function isSystemGlobalInvariantCertComplete(): boolean {
  const invariantIds = new Set(SYSTEM_INVARIANT_CATALOG.map((i) => i.id));
  return (
    SYSTEM_GLOBAL_INVARIANT_CERTS.length === 6 &&
    SYSTEM_GLOBAL_INVARIANT_CERTS.every(
      (c) =>
        invariantIds.has(c.invariantRef) &&
        c.layerRefs.length === 4 &&
        c.certificationRule.length > 0 &&
        c.stackCondition.length > 0,
    )
  );
}

export function buildSystemInvariantCertManifest(): SystemInvariantCertManifest {
  const certifications = SYSTEM_GLOBAL_INVARIANT_CERTS;
  const certificationComplete = isSystemGlobalInvariantCertComplete();

  return {
    version: V80_SYSTEM_CLOSURE_VERSION,
    certCount: certifications.length,
    certificationComplete,
    certifications,
    summary: `system-invariant-cert count=${certifications.length} complete=${certificationComplete}`,
  };
}

export function getSystemGlobalInvariantCertById(id: string): SystemGlobalInvariantCert | undefined {
  return SYSTEM_GLOBAL_INVARIANT_CERTS.find((c) => c.id === id);
}

export function getSystemGlobalInvariantCertByInvariantRef(
  invariantRef: string,
): SystemGlobalInvariantCert | undefined {
  return SYSTEM_GLOBAL_INVARIANT_CERTS.find((c) => c.invariantRef === invariantRef);
}
