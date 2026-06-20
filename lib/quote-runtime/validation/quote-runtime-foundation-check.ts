import { existsSync } from "fs";
import { join } from "path";
import {
  assertApiPortContract,
  assertCommercialPortContract,
  assertPersistencePortContract,
  assertPortRegistryContract,
  assertPortTypesContract,
  validateQuotePorts,
} from "../ports/quote-port-guards";
import { validateQuotePortFoundation } from "../ports/quote-port-validation";
import {
  assertAssemblyFactoryContract,
  assertAssemblyGuardsContract,
  assertAssemblySnapshotContract,
  assertAssemblyTypesContract,
  assertAssemblyViewContract,
} from "./quote-runtime-verify-p5";
import {
  assertContextFactoryContract,
  assertContextGuardsContract,
  assertContextSnapshotContract,
} from "./quote-runtime-verify-p2";
import {
  assertDomainFactoryContract,
  assertDomainGuardsContract,
  assertDomainRegistryContract,
  assertDomainStateContract,
  assertDomainTypesContract,
  assertDomainViewContract,
} from "./quote-runtime-verify-p3";
import {
  assertLifecycleFactoryContract,
  assertLifecycleGuardsContract,
  assertLifecycleRegistryContract,
  assertLifecycleStateContract,
  assertLifecycleTypesContract,
  assertLifecycleViewContract,
} from "./quote-runtime-verify-p4";
import { assertQuoteBridgeContract, assertQuoteContextContract } from "./quote-runtime-verify";
import {
  assertQuoteRuntimeDependencyChain,
} from "./quote-runtime-dependency-check";
import {
  assertWorkspaceQuoteRuntimeSnapshotCheck,
  buildQuoteRuntimeFoundationSnapshot,
} from "./quote-runtime-snapshot-check";

const QUOTE_ROOT = join(process.cwd(), "lib", "quote-runtime");

export interface QuoteRuntimeFoundationValidation {
  valid: boolean;
  summary: string;
}

export function assertHasBridgeLayer(): boolean {
  return (
    existsSync(join(QUOTE_ROOT, "bridge", "create-quote-bridge.ts")) &&
    assertQuoteBridgeContract()
  );
}

export function assertHasContextLayer(): boolean {
  return (
    existsSync(join(QUOTE_ROOT, "context", "quote-context-factory.ts")) &&
    assertQuoteContextContract() &&
    assertContextFactoryContract() &&
    assertContextGuardsContract() &&
    assertContextSnapshotContract()
  );
}

export function assertHasDomainLayer(): boolean {
  return (
    existsSync(join(QUOTE_ROOT, "domain", "quote-domain-view.ts")) &&
    assertDomainTypesContract() &&
    assertDomainStateContract() &&
    assertDomainGuardsContract() &&
    assertDomainRegistryContract() &&
    assertDomainFactoryContract() &&
    assertDomainViewContract()
  );
}

export function assertHasLifecycleLayer(): boolean {
  return (
    existsSync(join(QUOTE_ROOT, "lifecycle", "quote-lifecycle-view.ts")) &&
    assertLifecycleTypesContract() &&
    assertLifecycleStateContract() &&
    assertLifecycleGuardsContract() &&
    assertLifecycleRegistryContract() &&
    assertLifecycleFactoryContract() &&
    assertLifecycleViewContract()
  );
}

export function assertHasAssemblyLayer(): boolean {
  return (
    existsSync(join(QUOTE_ROOT, "assembly", "quote-runtime-assembly-view.ts")) &&
    assertAssemblyTypesContract() &&
    assertAssemblyViewContract() &&
    assertAssemblyFactoryContract() &&
    assertAssemblyGuardsContract() &&
    assertAssemblySnapshotContract()
  );
}

export function assertHasPortLayer(): boolean {
  return (
    existsSync(join(QUOTE_ROOT, "ports", "quote-persistence.port.ts")) &&
    assertPersistencePortContract() &&
    assertApiPortContract() &&
    assertCommercialPortContract() &&
    assertPortRegistryContract() &&
    assertPortTypesContract() &&
    validateQuotePorts().valid
  );
}

export function validateQuoteRuntimeFoundation(
  workspaceId = "v55-foundation-integrity",
): QuoteRuntimeFoundationValidation {
  const foundationSnapshot = buildQuoteRuntimeFoundationSnapshot(workspaceId);
  const portFoundation = validateQuotePortFoundation(foundationSnapshot.runtimeSnapshot);

  const valid =
    assertHasBridgeLayer() &&
    assertHasContextLayer() &&
    assertHasDomainLayer() &&
    assertHasLifecycleLayer() &&
    assertHasAssemblyLayer() &&
    assertHasPortLayer() &&
    assertQuoteRuntimeDependencyChain() &&
    assertWorkspaceQuoteRuntimeSnapshotCheck(foundationSnapshot) &&
    portFoundation.valid;

  return {
    valid,
    summary: [
      `workspaceId=${foundationSnapshot.workspaceId}`,
      `runtimeState=${foundationSnapshot.runtimeSnapshot.runtimeState}`,
      `dependencyChain=${assertQuoteRuntimeDependencyChain()}`,
      `portFoundation=${portFoundation.valid}`,
      `valid=${valid}`,
    ].join(" "),
  };
}
