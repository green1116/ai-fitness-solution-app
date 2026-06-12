import {
  VALUE_PROPOSITION_RUNTIME_VERSION,
  runValuePropositionRuntime,
  validateValuePropositionRuntime,
  assertRuntimeSuccess,
} from "../lib/proposal-differentiation";

const ID = "v192-value-proposition-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateValuePropositionRuntime({ deploymentId: ID, bidderBrand: "Shuhua" }).valid, "validation");
const r = runValuePropositionRuntime({ deploymentId: ID, bidderBrand: "Shuhua" });
assertRuntimeSuccess(r);
assert(r.payload.version === VALUE_PROPOSITION_RUNTIME_VERSION, "version");
assert(r.payload.snapshot.competitivePosition.includes("Value"), "value position");
console.log(`PASS — ${r.summary}`);
