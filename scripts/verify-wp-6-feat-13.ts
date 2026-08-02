/**
 * WP-6 / FEAT-13 — AC-GP01-08 verification.
 * Open solution result via existing OpenSolutionResult API+NAV binding.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { WorkspaceScreen } from "../components/screens/workspace/WorkspaceScreen";
import { getAdapterBinding } from "../lib/frontend/adapter-bindings";
import {
  assertOpenSolutionResultBindingReady,
  FEAT_13_ACTION_ID,
  FEAT_13_COMMAND,
  FEAT_13_ID,
  FEAT_13_INT_ID,
  runOpenSolutionResultCommand,
} from "../lib/frontend/open-solution-result-command";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("=== WP-6 FEAT-13 / AC-GP01-08 ===");

  const binding = getAdapterBinding(FEAT_13_ACTION_ID);
  assert(binding, "ACT-04-06 binding exists");
  assert(binding.command === FEAT_13_COMMAND, "command OpenSolutionResult");
  assert(binding.kind === "API+NAV", "API+NAV kind (not NAV-only)");
  assert(
    binding.existingApi === "/api/v80/pdf?type=plan",
    "reuses existingApi /api/v80/pdf?type=plan",
  );
  assert(binding.navigateTo === "/solution", 'navigateTo "/solution" reused');
  console.log("PASS existing OpenSolutionResult Result binding reused");

  const plan = assertOpenSolutionResultBindingReady();
  assert(plan.requiresHttp === true, "requiresHttp");
  assert(plan.flow === "command", "command flow");
  assert(plan.transport.mode === "existing-api", "existing-api transport");
  assert(plan.navigateTo === "/solution", "plan navigateTo");
  assert(plan.binding?.kind === "API+NAV", "binding API+NAV");
  console.log("PASS planCommandFlow is API+NAV OpenSolutionResult");

  let fetchedUrl = "";
  let fetchedMethod = "";
  const result = await runOpenSolutionResultCommand({
    projectId: "proj-wp6",
    fetchImpl: (async (input, init) => {
      fetchedUrl = String(input);
      fetchedMethod = String(init?.method ?? "GET");
      return new Response(new Uint8Array([37, 80, 68, 70]), {
        status: 200,
        headers: { "Content-Type": "application/pdf" },
      });
    }) as typeof fetch,
  });

  assert(result.httpInvoked === true, "httpInvoked");
  assert(result.navigationOnly === false, "navigationOnly false");
  assert(result.localOnly === false, "localOnly false");
  assert(result.httpMethod === "GET", "GET existing PDF API");
  assert(result.command === FEAT_13_COMMAND, "result command");
  assert(result.actionId === FEAT_13_ACTION_ID, "result actionId");
  assert(result.featId === FEAT_13_ID, "result featId");
  assert(result.navigateTo === "/solution", "navigateTo /solution");
  assert(
    result.navigateHref === "/solution?projectId=proj-wp6",
    `navigateHref=${result.navigateHref}`,
  );
  assert(fetchedUrl.startsWith("/api/v80/pdf"), `fetchedUrl=${fetchedUrl}`);
  assert(fetchedUrl.includes("type=plan"), "type=plan reused");
  assert(fetchedUrl.includes("projectId=proj-wp6"), "projectId query");
  assert(fetchedMethod === "GET", `fetchedMethod=${fetchedMethod}`);
  assert(result.settle.navigateTo === "/solution", "settle navigateTo");
  assert(result.settle.serverSlice === "SRV-SOLUTION", "SRV-SOLUTION settle");
  console.log("PASS UI invokes existing OpenSolutionResult HTTP then NAV");

  const html = renderToStaticMarkup(
    createElement(WorkspaceScreen, { projectId: "proj-demo" }),
  );
  assert(html.includes('data-screen="SCR-04"'), "SCR-04");
  assert(html.includes('data-cmp="CMP-OUTCOME-LINKS"'), "CMP-OUTCOME-LINKS");
  assert(html.includes(`data-feat="${FEAT_13_ID}"`), "FEAT-13 marker");
  assert(html.includes(`data-int-id="${FEAT_13_INT_ID}"`), "INT-WS-OUTCOME");
  assert(html.includes(`data-action-id="${FEAT_13_ACTION_ID}"`), "ACT-04-06");
  assert(html.includes(`data-command="${FEAT_13_COMMAND}"`), "OpenSolutionResult");
  assert(html.includes('data-ac="AC-GP01-08"'), "AC-GP01-08 affordance");
  assert(html.includes('data-navigation-only="false"'), "not navigation-only");
  assert(html.includes('data-local-only="false"'), "not local-only");
  assert(html.includes('data-navigate-to="/solution"'), "navigate-to cue");
  assert(html.includes("/solution?projectId=proj-demo"), "solution href preserved");
  assert(html.includes("Open solution result"), "solution CTA");
  console.log("PASS SCR-04 UI exposes OpenSolutionResult (API+NAV, not local-only)");

  console.log("");
  console.log("PASS AC-GP01-08 — Open my solution result");
  console.log("WP-6 FEAT-13 verification complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
