/**
 * V10 Trial Runtime — verification
 */
import {
  TRIAL_RUNTIME_VERSION,
  REVENUE_FOUNDATION_VERSION,
  runTrialRuntime,
  validateTrialRuntime,
  assertRuntimeSuccess,
} from "../lib/revenue-foundation";

const DEPLOYMENT_ID = "v10-trial-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const validation = validateTrialRuntime({ deploymentId: DEPLOYMENT_ID });
  assert(validation.planValid, "trial plan valid");
  assert(validation.limitsValid, "trial limits valid");
  assert(validation.expirationValid, "trial expiration valid");
  assert(validation.conversionValid, "trial conversion valid");
  console.log("✓ trial validation");

  const result = runTrialRuntime({ deploymentId: DEPLOYMENT_ID });
  assertRuntimeSuccess(result);
  assert(result.version === REVENUE_FOUNDATION_VERSION, "foundation version");
  assert(result.payload.version === TRIAL_RUNTIME_VERSION, "trial runtime version");
  assert(result.payload.plan.durationDays === 14, "trial duration");
  assert(result.payload.limits.enterpriseZip === 0, "trial no zip");
  assert(result.stages.length >= 4, "trial stages");
  console.log("✓ trial runtime");
  console.log(`PASS — ${result.summary}`);
}

main();
