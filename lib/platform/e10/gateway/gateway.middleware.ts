/**
 * E10-P5 — Middleware Chain (auth stub + pipeline)
 * No external proxy / service mesh
 */

import { MIDDLEWARE_KINDS } from "./gateway.constants";
import type {
  GatewayRequest,
  GatewayResponse,
  MiddlewareDefinition,
  MiddlewareHandler,
  MiddlewareKind,
  MiddlewareResult,
  RegisterMiddlewareInput,
} from "./gateway.types";

const middlewares = new Map<string, MiddlewareDefinition>();

function nowIso(): string {
  return new Date().toISOString();
}

export function registerMiddleware(
  input: RegisterMiddlewareInput,
): MiddlewareDefinition {
  const id = input.id.trim();
  const name = input.name.trim();
  if (!id) throw new Error("middleware.id is required");
  if (!name) throw new Error("middleware.name is required");
  if (!(MIDDLEWARE_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid middleware kind: ${input.kind}`);
  }
  if (middlewares.has(id)) {
    throw new Error(`middleware already registered: ${id}`);
  }

  const def: MiddlewareDefinition = {
    id,
    name,
    kind: input.kind,
    order: input.order ?? 0,
    enabled: true,
    handler: input.handler,
    registeredAt: nowIso(),
  };
  middlewares.set(id, def);
  return cloneDef(def);
}

function cloneDef(def: MiddlewareDefinition): MiddlewareDefinition {
  return { ...def };
}

export function getMiddleware(id: string): MiddlewareDefinition | undefined {
  const def = middlewares.get(id.trim());
  return def ? cloneDef(def) : undefined;
}

export function listMiddlewares(filter?: {
  kind?: MiddlewareKind;
  enabled?: boolean;
}): MiddlewareDefinition[] {
  let result = [...middlewares.values()];
  if (filter?.kind) {
    result = result.filter((m) => m.kind === filter.kind);
  }
  if (filter?.enabled !== undefined) {
    result = result.filter((m) => m.enabled === filter.enabled);
  }
  return result
    .slice()
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
    .map(cloneDef);
}

export function enableMiddleware(id: string): MiddlewareDefinition {
  const def = middlewares.get(id.trim());
  if (!def) throw new Error(`middleware not found: ${id}`);
  def.enabled = true;
  middlewares.set(def.id, def);
  return cloneDef(def);
}

export function disableMiddleware(id: string): MiddlewareDefinition {
  const def = middlewares.get(id.trim());
  if (!def) throw new Error(`middleware not found: ${id}`);
  def.enabled = false;
  middlewares.set(def.id, def);
  return cloneDef(def);
}

export function removeMiddleware(id: string): boolean {
  return middlewares.delete(id.trim());
}

/**
 * Run the middleware chain (sorted by order) on a request.
 * Returns either the (possibly modified) request or a short-circuit response.
 */
export function runMiddlewareChain(
  req: GatewayRequest,
): { passed: true; request: GatewayRequest } | { passed: false; response: GatewayResponse } {
  const chain = listMiddlewares({ enabled: true });
  let current = req;

  for (const mw of chain) {
    const result: MiddlewareResult = mw.handler(current);
    if (result.action === "REJECT") {
      return { passed: false, response: result.response };
    }
    current = result.request;
  }

  return { passed: true, request: current };
}

/** Built-in auth stub middleware handler. */
export function createAuthStubHandler(options?: {
  requiredRole?: string;
}): MiddlewareHandler {
  return (req: GatewayRequest): MiddlewareResult => {
    if (!req.authContext || !req.authContext.authenticated) {
      return {
        action: "REJECT",
        response: {
          requestId: req.requestId,
          status: 401,
          body: { error: "UNAUTHORIZED", message: "authentication required" },
          headers: {},
          respondedAt: new Date().toISOString(),
        },
      };
    }
    if (
      options?.requiredRole &&
      !req.authContext.roles.includes(options.requiredRole)
    ) {
      return {
        action: "REJECT",
        response: {
          requestId: req.requestId,
          status: 403,
          body: { error: "FORBIDDEN", message: `role required: ${options.requiredRole}` },
          headers: {},
          respondedAt: new Date().toISOString(),
        },
      };
    }
    return { action: "CONTINUE", request: req };
  };
}

export function clearMiddlewares(): void {
  middlewares.clear();
}
