/**
 * E10-P5 — Gateway Release Gate
 * Checks platform API gateway modules → PASS / FAIL
 */

import {
  E10_GATEWAY_BASE,
  E10_GATEWAY_ID,
  E10_GATEWAY_VERSION,
  GATEWAY_MANAGER_STATUSES,
  HTTP_METHODS,
  MIDDLEWARE_KINDS,
} from "../gateway/gateway.constants";
import { clearMiddlewares } from "../gateway/gateway.middleware";
import {
  createAuthStubHandler,
  createGatewayManager,
  getGatewayRegistryManifest,
} from "../gateway/gateway.manager";
import { clearRoutes } from "../gateway/gateway.route";
import { clearEventBus } from "../event/event.bus";
import { clearListeners } from "../event/event.listener";
import { clearEventTypes } from "../event/event.registry";
import { clearAllocations } from "../resource/resource.allocation";
import { clearPools } from "../resource/resource.pool";
import { clearQuotas } from "../resource/resource.quota";
import { clearServices } from "../runtime/runtime.registry";
import type {
  GateCheckItem,
  GateVerdict,
  ReleaseGateResult,
} from "./release.gate";

export type {
  GateCheckItem,
  GateVerdict,
  ReleaseGateResult,
};

export const E10_P5_SIGNOFF_VERSION = "e10-p5-signoff-1" as const;
export const E10_P5_GATEWAY_FREEZE_VERSION =
  "e10-p5-platform-gateway-freeze-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
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

export function checkE10P5ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  // Constants check
  checks.push(
    check(
      "GW-P5-CONSTANTS",
      "gateway",
      "Gateway version constants",
      E10_GATEWAY_ID === "enterprise-e10-platform-gateway-v1" &&
        E10_GATEWAY_VERSION === "e10-gateway-1" &&
        E10_GATEWAY_BASE === "enterprise-e10-p4-platform-event-v1" &&
        HTTP_METHODS.length === 5 &&
        MIDDLEWARE_KINDS.length === 5 &&
        GATEWAY_MANAGER_STATUSES.length === 4,
      `id=${E10_GATEWAY_ID} base=${E10_GATEWAY_BASE}`,
    ),
  );

  // Route + middleware + dispatch
  try {
    cleanup();
    const manager = createGatewayManager({ managerId: "e10-p5-gate" });
    manager.initialize();
    manager.start();

    const route = manager.registerRoute({
      id: "e10.p5.gate.route",
      path: "/api/health",
      method: "GET",
      description: "Health check",
      handler: (req) => ({
        requestId: req.requestId,
        status: 200,
        body: { ok: true },
        headers: {},
        respondedAt: new Date().toISOString(),
      }),
    });

    const result = manager.handle({
      method: "GET",
      path: "/api/health",
    });

    const notFound = manager.handle({
      method: "GET",
      path: "/api/missing",
    });

    const snap = manager.status();
    const manifest = getGatewayRegistryManifest();

    const ok =
      route.status === "ACTIVE" &&
      result.status === "OK" &&
      (result.response.body as Record<string, unknown>)?.ok === true &&
      notFound.status === "NOT_FOUND" &&
      snap.status === "RUNNING" &&
      snap.routeCount === 1 &&
      manifest.gatewayId === E10_GATEWAY_ID &&
      manifest.base === E10_GATEWAY_BASE;

    checks.push(
      check(
        "GW-P5-MANAGER",
        "gateway",
        "Route registry / normalize / dispatch",
        ok,
        `dispatch=${result.status} notFound=${notFound.status} routes=${snap.routeCount}`,
      ),
    );

    manager.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "GW-P5-MANAGER",
        "gateway",
        "Route registry / normalize / dispatch",
        false,
        error instanceof Error ? error.message : "gateway probe failed",
      ),
    );
  }

  // Middleware chain + auth stub
  try {
    cleanup();
    const manager = createGatewayManager({ managerId: "e10-p5-gate-mw" });
    manager.initialize();
    manager.start();

    manager.registerRoute({
      id: "e10.p5.gate.secure",
      path: "/api/secure",
      method: "POST",
      description: "Secure endpoint",
      handler: (req) => ({
        requestId: req.requestId,
        status: 200,
        body: { secure: true },
        headers: {},
        respondedAt: new Date().toISOString(),
      }),
    });

    manager.registerMiddleware({
      id: "e10.p5.gate.auth",
      name: "Auth Stub",
      kind: "AUTH",
      order: 1,
      handler: createAuthStubHandler({ requiredRole: "admin" }),
    });

    // No auth → FORBIDDEN
    const noAuth = manager.handle({
      method: "POST",
      path: "/api/secure",
    });

    // Wrong role → FORBIDDEN
    const wrongRole = manager.handle({
      method: "POST",
      path: "/api/secure",
      authContext: {
        authenticated: true,
        principalId: "user1",
        roles: ["viewer"],
      },
    });

    // Correct auth → OK
    const authed = manager.handle({
      method: "POST",
      path: "/api/secure",
      authContext: {
        authenticated: true,
        principalId: "admin1",
        roles: ["admin"],
      },
    });

    const mwOk =
      noAuth.status === "FORBIDDEN" &&
      noAuth.response.status === 401 &&
      wrongRole.status === "FORBIDDEN" &&
      wrongRole.response.status === 403 &&
      authed.status === "OK" &&
      authed.response.status === 200;

    checks.push(
      check(
        "GW-P5-MIDDLEWARE",
        "gateway",
        "Middleware chain + auth stub",
        mwOk,
        `noAuth=${noAuth.response.status} wrongRole=${wrongRole.response.status} authed=${authed.response.status}`,
      ),
    );

    // Disable middleware → passes without auth
    manager.disableMiddleware("e10.p5.gate.auth");
    const bypassed = manager.handle({
      method: "POST",
      path: "/api/secure",
    });
    checks.push(
      check(
        "GW-P5-MW-DISABLE",
        "gateway",
        "Disabled middleware bypassed",
        bypassed.status === "OK",
        `dispatch=${bypassed.status}`,
      ),
    );

    manager.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "GW-P5-MIDDLEWARE",
        "gateway",
        "Middleware chain + auth stub",
        false,
        error instanceof Error ? error.message : "middleware probe failed",
      ),
    );
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `e10-p5-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE10P5ReleaseGatePass(
  gate: ReleaseGateResult = checkE10P5ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E10-P5 release gate failed: ${gate.summary}`);
  }
}
