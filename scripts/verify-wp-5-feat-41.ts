/**
 * WP-5 / FEAT-41 — AC-GP01-07 verification.
 * See project context via existing ViewProjectContext binding (not local/NAV-only).
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { WorkspaceScreen } from "../components/screens/workspace/WorkspaceScreen";
import { getAdapterBinding } from "../lib/frontend/adapter-bindings";
import {
  assertViewProjectContextBindingReady,
  FEAT_41_ACTION_ID,
  FEAT_41_COMMAND,
  FEAT_41_ID,
  FEAT_41_INT_ID,
  mapProjectContextResponse,
  runViewProjectContextCommand,
} from "../lib/frontend/view-project-context-command";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("=== WP-5 FEAT-41 / AC-GP01-07 ===");

  const binding = getAdapterBinding(FEAT_41_ACTION_ID);
  assert(binding, "ACT-04-02 binding exists");
  assert(binding.command === FEAT_41_COMMAND, "command ViewProjectContext");
  assert(binding.kind === "API", "API kind");
  assert(
    binding.existingApi === "/api/workspace/summary",
    "reuses existingApi /api/workspace/summary",
  );
  assert(binding.navigateTo === null, "navigateTo null — not navigation-only");
  console.log("PASS existing ViewProjectContext binding reused");

  const plan = assertViewProjectContextBindingReady();
  assert(plan.requiresHttp === true, "requiresHttp");
  assert(plan.flow === "command", "command flow");
  assert(plan.transport.mode === "existing-api", "existing-api transport");
  assert(
    plan.transport.mode === "existing-api" &&
      plan.transport.routeRef === binding.existingApi,
    "transport route = binding.existingApi",
  );
  assert(plan.navigateTo === null, "plan navigateTo null");
  console.log("PASS planCommandFlow is HTTP ViewProjectContext (not NAV)");

  const mapped = mapProjectContextResponse(
    {
      ok: true,
      summary: {
        currentProject: { id: "proj-wp5", name: "WP5 Fitness Project" },
        projectsCount: 2,
        quotesCount: 3,
        reportsCount: 1,
      },
    },
    "proj-wp5",
  );
  assert(mapped.projectId === "proj-wp5", "mapped projectId");
  assert(mapped.projectLabel === "WP5 Fitness Project", "mapped projectLabel");
  assert(mapped.requirementsLabel.includes("Quotes"), "mapped requirements");
  assert(mapped.progressLabel.includes("Projects"), "mapped progress");
  assert(mapped.documentsCue.length > 0, "mapped documents cue");

  let fetchedUrl = "";
  let fetchedMethod = "";
  const result = await runViewProjectContextCommand({
    projectId: "proj-wp5",
    fetchImpl: (async (input, init) => {
      fetchedUrl = String(input);
      fetchedMethod = String(init?.method ?? "GET");
      return new Response(
        JSON.stringify({
          ok: true,
          summary: {
            currentProject: { id: "proj-wp5", name: "WP5 Fitness Project" },
            projectsCount: 2,
            quotesCount: 3,
            reportsCount: 1,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }) as typeof fetch,
  });

  assert(result.httpInvoked === true, "httpInvoked");
  assert(result.navigationOnly === false, "navigationOnly false");
  assert(result.localOnly === false, "localOnly false");
  assert(result.httpMethod === "GET", "GET existing API");
  assert(result.command === FEAT_41_COMMAND, "result command");
  assert(result.actionId === FEAT_41_ACTION_ID, "result actionId");
  assert(result.featId === FEAT_41_ID, "result featId");
  assert(
    fetchedUrl.startsWith("/api/workspace/summary"),
    `fetchedUrl=${fetchedUrl}`,
  );
  assert(fetchedUrl.includes("projectId=proj-wp5"), "projectId query cue");
  assert(fetchedMethod === "GET", `fetchedMethod=${fetchedMethod}`);
  assert(result.context.projectLabel === "WP5 Fitness Project", "context label");
  assert(result.settle.navigateTo === null, "settle does not navigate");
  assert(result.settle.serverSlice === "SRV-PROJECT", "SRV-PROJECT settle");
  console.log("PASS UI invokes existing ViewProjectContext HTTP flow");

  const html = renderToStaticMarkup(
    createElement(WorkspaceScreen, { projectId: "proj-demo" }),
  );
  assert(html.includes('data-screen="SCR-04"'), "SCR-04");
  assert(html.includes('data-cmp="CMP-CONTEXT-PANEL"'), "CMP-CONTEXT-PANEL");
  assert(html.includes(`data-feat="${FEAT_41_ID}"`), "FEAT-41 marker");
  assert(html.includes(`data-int-id="${FEAT_41_INT_ID}"`), "INT-WS-CONTEXT");
  assert(html.includes(`data-action-id="${FEAT_41_ACTION_ID}"`), "ACT-04-02");
  assert(html.includes(`data-command="${FEAT_41_COMMAND}"`), "ViewProjectContext");
  assert(html.includes('data-ac="AC-GP01-07"'), "AC-GP01-07 affordance");
  assert(html.includes('data-navigation-only="false"'), "not navigation-only");
  assert(html.includes('data-local-only="false"'), "not local-only");
  assert(html.includes("View project context"), "load CTA");
  assert(html.includes('type="button"'), "button control");
  assert(
    !html.includes(`data-command="${FEAT_41_COMMAND}" href=`),
    "ViewProjectContext is not a link",
  );
  assert(html.includes('data-action-id="ACT-04-08"'), "documents link preserved");
  console.log(
    "PASS SCR-04 UI exposes ViewProjectContext control (not NAV/local-only)",
  );

  console.log("");
  console.log(
    "PASS AC-GP01-07 — See my project context (requirements, progress, documents)",
  );
  console.log("WP-5 FEAT-41 verification complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
