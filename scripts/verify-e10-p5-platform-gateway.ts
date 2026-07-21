/**
 * E10-P5 — Platform API Gateway verification
 * Gateway layer above E10-P4 Platform Event Bus
 */
import fs from "node:fs";
import path from "node:path";

import { E10_PLATFORM_ID } from "../lib/platform/e10/core/platform.constants";
import { buildPlatformFoundation } from "../lib/platform/e10/core/platform.lifecycle";
import {
  E10_GATEWAY_BASE,
  E10_GATEWAY_FREEZE_VERSION,
  E10_GATEWAY_ID,
  E10_GATEWAY_VERSION,
  DISPATCH_RESULT_STATUSES,
  GATEWAY_MANAGER_STATUSES,
  HTTP_METHODS,
  MIDDLEWARE_KINDS,
  ROUTE_STATUSES,
} from "../lib/platform/e10/gateway/gateway.constants";
import { clearMiddlewares } from "../lib/platform/e10/gateway/gateway.middleware";
import {
  createAuthStubHandler,
  createGatewayManager,
  getGatewayRegistryManifest,
} from "../lib/platform/e10/gateway/gateway.manager";
import { clearRoutes } from "../lib/platform/e10/gateway/gateway.route";
import {
  E10_EVENT_BASE,
  E10_EVENT_ID,
} from "../lib/platform/e10/event/event.constants";
import { clearEventBus } from "../lib/platform/e10/event/event.bus";
import { clearListeners } from "../lib/platform/e10/event/event.listener";
import { clearEventTypes } from "../lib/platform/e10/event/event.registry";
import {
  E10_RESOURCE_ID,
} from "../lib/platform/e10/resource/resource.constants";
import { clearAllocations } from "../lib/platform/e10/resource/resource.allocation";
import { clearPools } from "../lib/platform/e10/resource/resource.pool";
import { clearQuotas } from "../lib/platform/e10/resource/resource.quota";
import {
  E10_RUNTIME_ID,
} from "../lib/platform/e10/runtime/runtime.constants";
import { clearServices } from "../lib/platform/e10/runtime/runtime.registry";
import {
  assertE10P5ReleaseGatePass,
  checkE10P5ReleaseGate,
  E10_P5_GATEWAY_FREEZE_VERSION,
} from "../lib/platform/e10/signoff/gateway.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
  clearRoutes();
  clearMiddlewares();
  clearEventBus();
  clearListeners();
  clearEventTypes();
  clearAllocations();
  clearQuotas();
  clearPools();
  clearServices();
}

function checkModules() {
  const required = [
    "lib/platform/e10/gateway/gateway.constants.ts",
    "lib/platform/e10/gateway/gateway.types.ts",
    "lib/platform/e10/gateway/gateway.route.ts",
    "lib/platform/e10/gateway/gateway.router.ts",
    "lib/platform/e10/gateway/gateway.middleware.ts",
    "lib/platform/e10/gateway/gateway.manager.ts",
    "lib/platform/e10/signoff/gateway.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(E10_GATEWAY_ID === "enterprise-e10-platform-gateway-v1", "gateway id");
  check(E10_GATEWAY_VERSION === "e10-gateway-1", "gateway version");
  check(E10_GATEWAY_FREEZE_VERSION === "e10-gateway-freeze-1", "gateway freeze");
  check(
    E10_GATEWAY_BASE === "enterprise-e10-p4-platform-event-v1",
    "gateway base",
  );
  check(
    E10_P5_GATEWAY_FREEZE_VERSION === "e10-p5-platform-gateway-freeze-1",
    "p5 freeze version",
  );
  check(HTTP_METHODS.length === 5, "http methods");
  check(ROUTE_STATUSES.length === 3, "route statuses");
  check(MIDDLEWARE_KINDS.length === 5, "middleware kinds");
  check(GATEWAY_MANAGER_STATUSES.length === 4, "manager statuses");
  check(DISPATCH_RESULT_STATUSES.length === 4, "dispatch result statuses");
  console.log("✓ version constants");
}

function checkUpstreamCompatible() {
  cleanup();
  const foundation = buildPlatformFoundation();
  check(foundation.ready === true, "P1 foundation still ready");
  check(foundation.platformId === E10_PLATFORM_ID, "P1 platform id");
  check(E10_RUNTIME_ID === "enterprise-e10-platform-runtime-v1", "P2 runtime id");
  check(E10_RESOURCE_ID === "enterprise-e10-platform-resource-v1", "P3 resource id");
  check(E10_EVENT_ID === "enterprise-e10-platform-event-v1", "P4 event id");
  check(
    E10_EVENT_BASE === "enterprise-e10-p3-platform-resource-v1",
    "P4 base intact",
  );
  console.log("✓ P1/P2/P3/P4 compatibility");
}

function testGatewayStack() {
  cleanup();

  const manager = createGatewayManager({ managerId: "e10-p5-verify" });
  check(manager.initialize().status === "READY", "manager ready");
  check(manager.start().status === "RUNNING", "manager running");

  // Register route with handler
  const route = manager.registerRoute({
    id: "e10.verify.health",
    path: "/api/health",
    method: "GET",
    description: "Health endpoint",
    handler: (req) => ({
      requestId: req.requestId,
      status: 200,
      body: { healthy: true },
      headers: { "x-version": E10_GATEWAY_VERSION },
      respondedAt: new Date().toISOString(),
    }),
  });
  check(route.status === "ACTIVE", "route active");
  check(route.method === "GET", "route method");

  // Dispatch OK
  const ok = manager.handle({ method: "GET", path: "/api/health" });
  check(ok.status === "OK", "dispatch ok");
  check(ok.response.status === 200, "response 200");
  check(
    (ok.response.body as Record<string, unknown>)?.healthy === true,
    "response body",
  );

  // Not found
  const nf = manager.handle({ method: "POST", path: "/api/health" });
  check(nf.status === "NOT_FOUND", "not found for wrong method");

  // Register middleware (auth)
  manager.registerMiddleware({
    id: "e10.verify.auth",
    name: "Verify Auth",
    kind: "AUTH",
    order: 10,
    handler: createAuthStubHandler(),
  });

  // No auth → blocked
  const blocked = manager.handle({ method: "GET", path: "/api/health" });
  check(blocked.status === "FORBIDDEN", "blocked without auth");
  check(blocked.response.status === 401, "401 response");

  // With auth → OK
  const authed = manager.handle({
    method: "GET",
    path: "/api/health",
    authContext: { authenticated: true, principalId: "u1", roles: ["user"] },
  });
  check(authed.status === "OK", "authed dispatch ok");

  // Disable middleware → pass without auth
  manager.disableMiddleware("e10.verify.auth");
  const noMw = manager.handle({ method: "GET", path: "/api/health" });
  check(noMw.status === "OK", "disabled middleware skipped");

  // Route disable
  manager.setRouteStatus("e10.verify.health", "DISABLED");
  const disabled = manager.handle({ method: "GET", path: "/api/health" });
  check(disabled.status === "NOT_FOUND", "disabled route not found");

  // Manifest
  const manifest = getGatewayRegistryManifest();
  check(manifest.gatewayId === E10_GATEWAY_ID, "manifest id");
  check(manifest.base === E10_GATEWAY_BASE, "manifest base");
  check(manifest.routeCount === 1, "manifest routes");

  manager.stop();
  check(manager.status().status === "STOPPED", "manager stopped");
  cleanup();
  console.log("✓ route / middleware / auth / normalize / dispatch / manager");
}

function testSignoff() {
  const gate = checkE10P5ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertE10P5ReleaseGatePass(gate);
  console.log("✓ gateway release gate");
}

function main() {
  console.log("E10-P5 Platform API Gateway verify");
  checkModules();
  checkConstants();
  checkUpstreamCompatible();
  testGatewayStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
