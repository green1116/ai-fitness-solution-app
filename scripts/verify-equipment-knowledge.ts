import {
  EQUIPMENT_KNOWLEDGE_RUNTIME_VERSION,
  EQUIPMENT_CATEGORIES,
  runEquipmentKnowledgeRuntime,
  validateEquipmentKnowledgeRuntime,
  assertRuntimeSuccess,
} from "../lib/knowledge-base";

const ID = "v12.5-equipment-knowledge-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateEquipmentKnowledgeRuntime({ deploymentId: ID }).valid, "validation");
const r = runEquipmentKnowledgeRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === EQUIPMENT_KNOWLEDGE_RUNTIME_VERSION, "version");
assert(r.payload.assetCount === EQUIPMENT_CATEGORIES.length, "categories");
console.log(`PASS — ${r.summary}`);
