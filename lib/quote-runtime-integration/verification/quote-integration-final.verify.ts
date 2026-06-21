import { existsSync } from "fs";
import { join } from "path";
import {
  V56_INTEGRATION_FROZEN,
  WORKSPACE_QUOTE_INTEGRATION_FINAL_META,
  WORKSPACE_QUOTE_INTEGRATION_FINAL_TAG,
} from "../freeze/v56-final-meta";
import { V56_INTEGRATION_LOCKED } from "../freeze/v56-p8-meta";
import {
  assertHasApiAdapter,
  assertHasE2eFlow,
  assertHasExecutionCore,
  assertHasPersistenceAdapter,
  assertHasPortBinding,
  assertHasReliabilityLayer,
  assertHasWorkflowLayer,
  assertNoDirectHandlerAccess,
  assertNoDirectPrismaAccess,
  assertP8NoQueue,
  assertP8NoWorker,
  assertV56IntegrationLocked,
  validateQuoteIntegrationP8,
} from "./quote-integration-integrity";

const INTEGRATION_ROOT = join(process.cwd(), "lib", "quote-runtime-integration");

export interface QuoteIntegrationFinalValidation {
  valid: boolean;
  summary: string;
}

export function assertV56IntegrationFrozen(): boolean {
  return (
    existsSync(join(INTEGRATION_ROOT, "freeze", "v56-final.ts")) &&
    existsSync(join(INTEGRATION_ROOT, "freeze", "v56-final-meta.ts")) &&
    WORKSPACE_QUOTE_INTEGRATION_FINAL_META.tag === WORKSPACE_QUOTE_INTEGRATION_FINAL_TAG &&
    WORKSPACE_QUOTE_INTEGRATION_FINAL_META.state === "FROZEN" &&
    WORKSPACE_QUOTE_INTEGRATION_FINAL_META.frozen === true &&
    WORKSPACE_QUOTE_INTEGRATION_FINAL_META.layers === 8 &&
    WORKSPACE_QUOTE_INTEGRATION_FINAL_META.integrationFrozen === V56_INTEGRATION_FROZEN &&
    WORKSPACE_QUOTE_INTEGRATION_FINAL_META.integrityLocked === V56_INTEGRATION_LOCKED &&
    WORKSPACE_QUOTE_INTEGRATION_FINAL_META.phaseTags.length === 8
  );
}

export async function validateQuoteIntegrationFinal(): Promise<QuoteIntegrationFinalValidation> {
  const p8 = await validateQuoteIntegrationP8();
  const frozen = assertV56IntegrationFrozen();
  const locked = await assertV56IntegrationLocked();
  const foundation =
    assertHasExecutionCore() &&
    assertHasPortBinding() &&
    assertHasPersistenceAdapter() &&
    assertHasApiAdapter() &&
    assertHasWorkflowLayer() &&
    assertHasReliabilityLayer() &&
    assertHasE2eFlow();
  const guards =
    assertNoDirectPrismaAccess() &&
    assertNoDirectHandlerAccess() &&
    assertP8NoQueue() &&
    assertP8NoWorker();

  const valid = p8.valid && frozen && locked && foundation && guards;

  return {
    valid,
    summary: [
      `finalTag=${WORKSPACE_QUOTE_INTEGRATION_FINAL_TAG}`,
      `frozen=${V56_INTEGRATION_FROZEN}`,
      `locked=${V56_INTEGRATION_LOCKED}`,
      `valid=${valid}`,
    ].join(" "),
  };
}
