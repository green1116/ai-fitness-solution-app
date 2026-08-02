/**
 * WP-4 / FEAT-40 — AC-GP01-06 verification.
 * Work with AI guidance via existing WorkspaceInteract binding (not local/NAV-only).
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { WorkspaceScreen } from "../components/screens/workspace/WorkspaceScreen";
import { getAdapterBinding } from "../lib/frontend/adapter-bindings";
import {
  assertWorkspaceInteractBindingReady,
  FEAT_40_ACTION_ID,
  FEAT_40_COMMAND,
  FEAT_40_ID,
  FEAT_40_INT_ID,
  runWorkspaceInteractCommand,
} from "../lib/frontend/workspace-interact-command";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("=== WP-4 FEAT-40 / AC-GP01-06 ===");

  const binding = getAdapterBinding(FEAT_40_ACTION_ID);
  assert(binding, "ACT-04-01 binding exists");
  assert(binding.command === FEAT_40_COMMAND, "command WorkspaceInteract");
  assert(binding.kind === "NEAREST", "NEAREST kind");
  assert(
    binding.existingApi === "/api/workspace/summary",
    "reuses existingApi /api/workspace/summary",
  );
  assert(binding.navigateTo === null, "navigateTo null — not navigation-only");
  console.log("PASS existing WorkspaceInteract binding reused");

  const plan = assertWorkspaceInteractBindingReady();
  assert(plan.requiresHttp === true, "requiresHttp");
  assert(plan.flow === "command", "command flow");
  assert(plan.transport.mode === "existing-api", "existing-api transport");
  assert(
    plan.transport.mode === "existing-api" &&
      plan.transport.routeRef === binding.existingApi,
    "transport route = binding.existingApi",
  );
  assert(plan.navigateTo === null, "plan navigateTo null");
  console.log("PASS planCommandFlow is HTTP/NEAREST WorkspaceInteract (not NAV)");

  let fetchedUrl = "";
  let fetchedMethod = "";
  const result = await runWorkspaceInteractCommand({
    message: "Help refine the fitness space layout",
    projectId: "proj-wp4",
    fetchImpl: (async (input, init) => {
      fetchedUrl = String(input);
      fetchedMethod = String(init?.method ?? "GET");
      return new Response(
        JSON.stringify({
          ok: true,
          summary: {
            currentProject: { id: "proj-wp4", name: "WP4 Project" },
            projectsCount: 1,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }) as typeof fetch,
  });

  assert(result.httpInvoked === true, "httpInvoked");
  assert(result.navigationOnly === false, "navigationOnly false");
  assert(result.localOnly === false, "localOnly false");
  assert(result.httpMethod === "GET", "GET nearest surface");
  assert(result.command === FEAT_40_COMMAND, "result command");
  assert(result.actionId === FEAT_40_ACTION_ID, "result actionId");
  assert(result.featId === FEAT_40_ID, "result featId");
  assert(
    fetchedUrl.startsWith("/api/workspace/summary"),
    `fetchedUrl=${fetchedUrl}`,
  );
  assert(fetchedUrl.includes("projectId=proj-wp4"), "projectId query cue");
  assert(fetchedMethod === "GET", `fetchedMethod=${fetchedMethod}`);
  assert(
    result.message === "Help refine the fitness space layout",
    "message submitted",
  );
  assert(result.summaryPresent === true, "summaryPresent");
  assert(result.settle.navigateTo === null, "settle does not navigate");
  assert(
    result.settle.serverSlice === "SRV-TASK-PROGRESS",
    "SRV-TASK-PROGRESS settle",
  );
  console.log("PASS UI invokes existing WorkspaceInteract HTTP/NEAREST flow");

  const html = renderToStaticMarkup(
    createElement(WorkspaceScreen, { projectId: "proj-demo" }),
  );
  assert(html.includes('data-screen="SCR-04"'), "SCR-04");
  assert(html.includes('data-cmp="CMP-CONV-PANEL"'), "CMP-CONV-PANEL");
  assert(html.includes(`data-feat="${FEAT_40_ID}"`), "FEAT-40 marker");
  assert(html.includes(`data-int-id="${FEAT_40_INT_ID}"`), "INT-WS-CONVERSE");
  assert(html.includes(`data-action-id="${FEAT_40_ACTION_ID}"`), "ACT-04-01");
  assert(html.includes(`data-command="${FEAT_40_COMMAND}"`), "WorkspaceInteract");
  assert(html.includes('data-ac="AC-GP01-06"'), "AC-GP01-06 affordance");
  assert(html.includes('data-navigation-only="false"'), "not navigation-only");
  assert(html.includes('data-local-only="false"'), "not local-only");
  assert(html.includes('name="workspaceMessage"'), "message field");
  assert(html.includes("Continue guided work"), "submit CTA");
  assert(html.includes('type="submit"'), "submit control");
  assert(
    !html.includes(`data-command="${FEAT_40_COMMAND}" href=`),
    "WorkspaceInteract is not a link",
  );
  console.log("PASS SCR-04 UI exposes WorkspaceInteract control (not NAV/local-only)");

  console.log("");
  console.log("PASS AC-GP01-06 — Work with AI guidance on my task");
  console.log("WP-4 FEAT-40 verification complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
