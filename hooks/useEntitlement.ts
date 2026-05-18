"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CommercialPlanLevel } from "@/lib/commercial/enterpriseUnlockStorage";
import { readPersistedLicenseForm } from "@/lib/commercial/resultLicenseStorage";
import {
  type PublicEntitlementPayload,
  parseEntitlementsSuccessPayload,
} from "@/lib/entitlements/publicEntitlement";

export type EntitlementSnapshot = PublicEntitlementPayload;

export type RefreshEntitlementOpts = {
  /** 跳过短 TTL 缓存、且不合并到他人 in-flight（支付后轮询等） */
  force?: boolean;
};

export type PollEntitlementsOpts = {
  /** 返回 true 时立即停止轮询 */
  isSatisfied: () => boolean;
  /** 默认 30_000 */
  maxMs?: number;
  /** 默认 600 */
  intervalMs?: number;
  /** 用于日志 */
  reason?: string;
  /** 轮询结束（成功或超时）时回调 */
  onComplete?: (satisfied: boolean) => void;
};

export type UseEntitlementResult = {
  loading: boolean;
  error: string | null;
  authenticated: boolean | null;
  entitlement: EntitlementSnapshot | null;
  source: string | null;
  effectiveLevel: CommercialPlanLevel;
  zipEnabled: boolean;
  fallbackUsed: boolean;
  refresh: (opts?: RefreshEntitlementOpts) => Promise<void>;
  /** 支付后等待 entitlement 同步；返回 stop()，组件卸载时自动 stop */
  pollUntil: (opts: PollEntitlementsOpts) => () => void;
};

function toCommercialLevel(
  level: "free" | "pro" | "enterprise",
): CommercialPlanLevel {
  return level === "enterprise" || level === "pro" ? level : "free";
}

function isAbortError(e: unknown): boolean {
  if (e instanceof DOMException && e.name === "AbortError") return true;
  return e instanceof Error && e.name === "AbortError";
}

function licenseKeySlot(key: string): string {
  if (!key) return "0";
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) | 0;
  }
  return `${key.length}:${h}`;
}

function entitlementsClientKey(
  planId: string,
  licenseKey: string,
  fingerprint: string,
) {
  return `${planId}::${licenseKeySlot(licenseKey)}::${fingerprint.length}:${licenseKeySlot(fingerprint)}`;
}

function snapshotsEqual(
  a: PublicEntitlementPayload | null,
  b: PublicEntitlementPayload | null,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.effectiveLevel === b.effectiveLevel &&
    a.zipEnabled === b.zipEnabled &&
    a.budgetEnabled === b.budgetEnabled &&
    a.enterpriseEnabled === b.enterpriseEnabled &&
    a.proEnabled === b.proEnabled &&
    a.planEnabled === b.planEnabled
  );
}

const CACHE_TTL_MS = 10_000;
const DEFAULT_POLL_MAX_MS = 30_000;
const DEFAULT_POLL_INTERVAL_MS = 600;

type CachedSuccess = {
  at: number;
  authenticated: boolean | null;
  source: string | null;
  parsed: PublicEntitlementPayload;
};

const successCacheByKey = new Map<string, CachedSuccess>();
const inflightByKey = new Map<string, Promise<FetchOutcome>>();

type FetchOutcome =
  | {
      kind: "ok";
      authenticated: boolean | null;
      source: string | null;
      parsed: PublicEntitlementPayload;
    }
  | {
      kind: "err";
      authenticated: boolean | null;
      source: string | null;
      message: string;
    };

async function fetchEntitlementsOnce(params: {
  planIdNorm: string;
  headers: Record<string, string>;
  signal: AbortSignal;
}): Promise<FetchOutcome> {
  const { planIdNorm, headers, signal } = params;
  const url = `/api/entitlements?planId=${encodeURIComponent(planIdNorm)}`;

  try {
    const r = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers,
      signal,
    });

    const raw = (await r.json().catch(() => ({}))) as Record<string, unknown>;

    let authVal: boolean | null = null;
    if (typeof raw.authenticated === "boolean") {
      authVal = raw.authenticated;
    }
    let srcVal: string | null = null;
    if (typeof raw.source === "string") {
      srcVal = raw.source;
    }

    if (!r.ok || raw.ok === false) {
      const msg = String(
        raw.message ?? raw.code ?? `entitlements request failed: ${r.status}`,
      );
      return { kind: "err", authenticated: authVal, source: srcVal, message: msg };
    }

    const parsed = parseEntitlementsSuccessPayload(raw);
    if (parsed) {
      return {
        kind: "ok",
        authenticated: authVal,
        source: srcVal,
        parsed,
      };
    }
    return {
      kind: "err",
      authenticated: authVal,
      source: srcVal,
      message: "entitlements 响应无法解析",
    };
  } catch (e) {
    if (isAbortError(e)) {
      return {
        kind: "err",
        authenticated: null,
        source: null,
        message: "entitlements 请求已中止或超时",
      };
    }
    return {
      kind: "err",
      authenticated: null,
      source: null,
      message: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * 与 GET /api/entitlements 对齐（planId 模式 + 可选匿名 license-key）。
 */
export function useEntitlement(planId: string): UseEntitlementResult {
  const planIdNorm = (planId || "").trim() || "attaguy-plan";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [entitlement, setEntitlement] = useState<EntitlementSnapshot | null>(
    null,
  );
  const [fallbackUsed, setFallbackUsed] = useState(false);

  const lastGoodRef = useRef<EntitlementSnapshot | null>(null);
  const refreshSeqRef = useRef(0);
  const inFlightAbortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const refreshingRef = useRef(false);
  const instanceRefreshPromiseRef = useRef<Promise<void> | null>(null);
  const pollStopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      inFlightAbortRef.current?.abort();
      pollStopRef.current?.();
      pollStopRef.current = null;
    };
  }, []);

  const applyOutcome = useCallback(
    (outcome: FetchOutcome, key: string) => {
      if (!mountedRef.current) return;

      if (outcome.kind === "ok") {
        successCacheByKey.set(key, {
          at: Date.now(),
          authenticated: outcome.authenticated,
          source: outcome.source,
          parsed: outcome.parsed,
        });
        if (typeof outcome.authenticated === "boolean") {
          setAuthenticated((prev) =>
            prev === outcome.authenticated ? prev : outcome.authenticated,
          );
        }
        if (outcome.source) {
          setSource((prev) =>
            prev === outcome.source ? prev : outcome.source,
          );
        }
        setError((prev) => (prev === null ? prev : null));
        lastGoodRef.current = outcome.parsed;
        setEntitlement((prev) =>
          snapshotsEqual(prev, outcome.parsed) ? prev : outcome.parsed,
        );
        setFallbackUsed((prev) => (prev === false ? prev : false));
      } else {
        setError((prev) =>
          prev === outcome.message ? prev : outcome.message,
        );
        if (typeof outcome.authenticated === "boolean") {
          setAuthenticated((prev) =>
            prev === outcome.authenticated ? prev : outcome.authenticated,
          );
        }
        if (outcome.source) {
          setSource((prev) =>
            prev === outcome.source ? prev : outcome.source,
          );
        }
        if (lastGoodRef.current) {
          setEntitlement((prev) =>
            snapshotsEqual(prev, lastGoodRef.current)
              ? prev
              : lastGoodRef.current,
          );
          setFallbackUsed((prev) => (prev === true ? prev : true));
        }
      }
    },
    [],
  );

  const refresh = useCallback(
    async (opts?: RefreshEntitlementOpts) => {
      if (refreshingRef.current && instanceRefreshPromiseRef.current) {
        return instanceRefreshPromiseRef.current;
      }

      const run = async () => {
        const persisted =
          typeof window !== "undefined"
            ? readPersistedLicenseForm()
            : { licenseKey: "", fingerprint: "", planId: "" };

        const key = entitlementsClientKey(
          planIdNorm,
          (persisted.licenseKey || "").trim(),
          (persisted.fingerprint || "").trim(),
        );

        const force = opts?.force === true;

        console.log("[ENTITLEMENT] refresh", { planId: planIdNorm, force });

        if (!force) {
          const hit = successCacheByKey.get(key);
          if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
            if (!mountedRef.current) return;
            lastGoodRef.current = hit.parsed;
            applyOutcome(
              {
                kind: "ok",
                authenticated: hit.authenticated,
                source: hit.source,
                parsed: hit.parsed,
              },
              key,
            );
            setLoading((prev) => (prev === false ? prev : false));
            return;
          }

          const existing = inflightByKey.get(key);
          if (existing) {
            setLoading((prev) => (prev === true ? prev : true));
            const outcome = await existing;
            if (!mountedRef.current) return;
            applyOutcome(outcome, key);
            setLoading((prev) => (prev === false ? prev : false));
            return;
          }
        } else {
          successCacheByKey.delete(key);
          inflightByKey.delete(key);
        }

        inFlightAbortRef.current?.abort();
        const ac = new AbortController();
        inFlightAbortRef.current = ac;
        const seq = ++refreshSeqRef.current;

        setLoading((prev) => (prev === true ? prev : true));
        setError((prev) => (prev === null ? prev : null));
        setFallbackUsed((prev) => (prev === false ? prev : false));

        const headers: Record<string, string> = {
          "x-plan-id": planIdNorm,
        };
        const k = (persisted.licenseKey || "").trim();
        const fp = (persisted.fingerprint || "").trim();
        if (k) headers["x-license-key"] = k;
        if (fp) headers["x-fingerprint"] = fp;

        const fetchPromise = fetchEntitlementsOnce({
          planIdNorm,
          headers,
          signal: ac.signal,
        });

        if (!force) {
          inflightByKey.set(key, fetchPromise);
        }

        const FETCH_TIMEOUT_MS = 25_000;
        const timeoutId = window.setTimeout(() => {
          try {
            ac.abort();
          } catch {
            /* noop */
          }
        }, FETCH_TIMEOUT_MS);

        try {
          const outcome = await fetchPromise;

          if (seq !== refreshSeqRef.current || !mountedRef.current) {
            return;
          }

          applyOutcome(outcome, key);
        } finally {
          window.clearTimeout(timeoutId);
          if (!force) {
            if (inflightByKey.get(key) === fetchPromise) {
              inflightByKey.delete(key);
            }
          }
          if (seq === refreshSeqRef.current && mountedRef.current) {
            setLoading((prev) => (prev === false ? prev : false));
          }
        }
      };

      refreshingRef.current = true;
      const p = run().finally(() => {
        refreshingRef.current = false;
        instanceRefreshPromiseRef.current = null;
      });
      instanceRefreshPromiseRef.current = p;
      return p;
    },
    [applyOutcome, planIdNorm],
  );

  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    void refreshRef.current();
  }, [planIdNorm]);

  const pollUntil = useCallback(
    (opts: PollEntitlementsOpts) => {
      pollStopRef.current?.();

      const maxMs = opts.maxMs ?? DEFAULT_POLL_MAX_MS;
      const intervalMs = opts.intervalMs ?? DEFAULT_POLL_INTERVAL_MS;
      const reason = opts.reason ?? "unspecified";
      let stopped = false;

      const stop = (satisfied: boolean) => {
        if (stopped) return;
        stopped = true;
        window.clearInterval(intervalId);
        window.clearTimeout(deadlineId);
        console.log("[ENTITLEMENT] polling stop", {
          planId: planIdNorm,
          reason,
          satisfied,
        });
        if (pollStopRef.current === stopFn) {
          pollStopRef.current = null;
        }
        opts.onComplete?.(satisfied);
      };

      const stopFn = () => stop(opts.isSatisfied());

      console.log("[ENTITLEMENT] polling start", {
        planId: planIdNorm,
        reason,
        maxMs,
        intervalMs,
      });

      if (opts.isSatisfied()) {
        console.log("[ENTITLEMENT] payment confirmed", {
          planId: planIdNorm,
          reason,
          via: "already-satisfied",
        });
        stop(true);
        return stopFn;
      }

      const tick = () => {
        if (stopped) return;
        if (opts.isSatisfied()) {
          console.log("[ENTITLEMENT] payment confirmed", {
            planId: planIdNorm,
            reason,
          });
          stop(true);
        }
      };

      void refreshRef.current({ force: true });

      const intervalId = window.setInterval(() => {
        tick();
        if (stopped) return;
        void refreshRef.current({ force: true });
      }, intervalMs);

      const deadlineId = window.setTimeout(() => {
        tick();
        stop(opts.isSatisfied());
      }, maxMs);

      pollStopRef.current = stopFn;
      return stopFn;
    },
    [planIdNorm],
  );

  const effectiveLevel = entitlement
    ? toCommercialLevel(entitlement.effectiveLevel)
    : ("free" as CommercialPlanLevel);

  const zipEnabled = entitlement?.zipEnabled === true;

  return {
    loading,
    error,
    authenticated,
    entitlement,
    source,
    effectiveLevel,
    zipEnabled,
    fallbackUsed,
    refresh,
    pollUntil,
  };
}
