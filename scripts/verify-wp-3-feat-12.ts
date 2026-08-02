/**
 * WP-3 / FEAT-12 — AC-GP01-05 verification.
 * Continue to AI Workspace only after planning inputs accepted.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { BuilderEntryScreen } from "../components/screens/entry/BuilderEntryScreen";
import { getAdapterBinding } from "../lib/frontend/adapter-bindings";
import {
  __planningIntakeSessionForTests,
  assertContinueToWorkspaceBindingReady,
  FEAT_12_ACTION_ID,
  FEAT_12_COMMAND,
  FEAT_12_ID,
  FEAT_12_INT_ID,
  FEAT_12_PREREQUISITE_ACTION,
  runContinueToWorkspaceCommand,
} from "../lib/frontend/continue-to-workspace-command";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== WP-3 FEAT-12 / AC-GP01-05 ===");

  __planningIntakeSessionForTests.clearAccepted();

  const binding = getAdapterBinding(FEAT_12_ACTION_ID);
  assert(binding, "ACT-02-03 binding exists");
  assert(binding.command === FEAT_12_COMMAND, "command ContinueToWorkspace");
  assert(binding.kind === "NAV", "NAV kind");
  assert(binding.navigateTo === "/workspace", 'navigateTo "/workspace" reused');
  assert(binding.existingApi === null, "no invented API");
  console.log('PASS existing ContinueToWorkspace navigateTo "/workspace" reused');

  const plan = assertContinueToWorkspaceBindingReady();
  assert(plan.flow === "nav", "nav flow");
  assert(plan.requiresHttp === false, "no HTTP required");
  assert(plan.navigateTo === "/workspace", "plan navigateTo");
  console.log("PASS planCommandFlow is NAV ContinueToWorkspace");

  let blocked = false;
  try {
    runContinueToWorkspaceCommand();
  } catch (err) {
    blocked = err instanceof Error && err.message.includes("ACT-02-02");
  }
  assert(blocked, "prerequisite blocks ContinueToWorkspace before inputs accepted");
  console.log("PASS ACT-02-03 prerequisite enforced (blocked without ACT-02-02)");

  __planningIntakeSessionForTests.markAccepted();
  const result = runContinueToWorkspaceCommand();
  assert(result.prerequisiteMet === true, "prerequisiteMet");
  assert(result.unconditionalNavigation === false, "not unconditional");
  assert(result.navigateTo === "/workspace", "result navigateTo");
  assert(result.command === FEAT_12_COMMAND, "result command");
  assert(result.actionId === FEAT_12_ACTION_ID, "result actionId");
  assert(result.featId === FEAT_12_ID, "result featId");
  console.log("PASS ContinueToWorkspace allowed after inputs accepted");

  __planningIntakeSessionForTests.clearAccepted();
  const html = renderToStaticMarkup(createElement(BuilderEntryScreen));
  assert(html.includes('data-screen="SCR-02"'), "SCR-02");
  assert(html.includes('data-cmp="CMP-FORWARD-PRIMARY"'), "CMP-FORWARD-PRIMARY");
  assert(html.includes(`data-feat="${FEAT_12_ID}"`), "FEAT-12 marker");
  assert(html.includes(`data-int-id="${FEAT_12_INT_ID}"`), "INT-FORWARD-PRIMARY");
  assert(html.includes(`data-action-id="${FEAT_12_ACTION_ID}"`), "ACT-02-03");
  assert(html.includes(`data-command="${FEAT_12_COMMAND}"`), "ContinueToWorkspace");
  assert(html.includes(`data-prerequisite="${FEAT_12_PREREQUISITE_ACTION}"`), "prerequisite ACT-02-02");
  assert(html.includes('data-prerequisite-met="false"'), "prerequisite not met initially");
  assert(html.includes('data-unconditional-nav="false"'), "no unconditional nav flag");
  assert(html.includes('data-ac="AC-GP01-05"'), "AC-GP01-05 affordance");
  assert(html.includes("Continue to AI Workspace"), "continue label");
  assert(
    !html.includes(`data-command="${FEAT_12_COMMAND}" href=`),
    "no ContinueToWorkspace link while prerequisite unmet",
  );
  assert(
    !html.includes('href="/workspace" data-action-id="ACT-02-03"') &&
      !html.includes('data-action-id="ACT-02-03" href="/workspace"'),
    "no unconditional ACT-02-03 href=/workspace",
  );
  console.log("PASS SCR-02 UI gates ContinueToWorkspace (no unconditional navigation)");

  console.log("");
  console.log("PASS AC-GP01-05 — Continue into AI Workspace");
  console.log("WP-3 FEAT-12 verification complete");
}

main();
