import {
  COMPETITIVE_ADVANTAGE_RUNTIME_VERSION,
  runCompetitiveAdvantageRuntime,
  validateCompetitiveAdvantageRuntime,
  assertRuntimeSuccess,
} from "../lib/proposal-differentiation";

const ID = "v192-competitive-advantage-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateCompetitiveAdvantageRuntime({ deploymentId: ID, bidderBrand: "Life Fitness" }).valid, "validation");
const r = runCompetitiveAdvantageRuntime({ deploymentId: ID, bidderBrand: "Life Fitness" });
assertRuntimeSuccess(r);
assert(r.payload.version === COMPETITIVE_ADVANTAGE_RUNTIME_VERSION, "version");
assert(r.payload.snapshot.matrix.brandAdvantage.length >= 2, "brand advantage");
console.log(`PASS — ${r.summary}`);
