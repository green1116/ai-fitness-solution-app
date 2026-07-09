/**
 * V80 REAL EXEC P2 — First deal closing entry (spec exports)
 */
export { V80_REALEXEC_CLOSING_VERSION, V80_REALEXEC_CLOSING_FREEZE_VERSION } from "./closing.types";
export type {
  FirstContactScript,
  DemoFlowStep,
  ObjectionResponse,
  ClosingScriptBeat,
  ClosingManifest,
  FirstDealClosingReport,
} from "./closing.types";

export { FIRST_CONTACT_SCRIPT, isFirstContactScriptComplete } from "./closing.first-contact.spec";
export { DEMO_FLOW_30MIN, isDemoFlowComplete } from "./closing.demo-flow.spec";
export { OBJECTION_HANDLING, isObjectionHandlingComplete } from "./closing.objections.spec";
export { CLOSING_SCRIPT, isClosingScriptComplete } from "./closing.close-script.spec";

export {
  buildFirstDealClosing,
  buildClosingManifest,
  assertFirstDealClosingPass,
  formatClosingSummary,
  runFirstDealClosing,
} from "./closing.builder";
