import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { jwtVerify, SignJWT } from "jose";
import { prisma } from "@/lib/prisma";

const USE_STATEFUL_TOKEN =
  (process.env.DOWNLOAD_TOKEN_STATEFUL || "").trim() === "1";

import type { UnlockPlanLevel } from "@/lib/unlock-token";

export type DownloadTokenMode = "preview" | "full" | "budget" | "pack";
export type DownloadTokenVariant = "sales" | "enterprise" | "tender";

export type { UnlockPlanLevel };
/**
 * 第 4 刀：下载风控
 * - downloadToken 默认短期（120 秒）
 * - 每个 token 都有 jti（唯一 id）
 * - maxUses 默认为 1（一次性使用）
 * - 使用过的 jti 在进程内存里记录 10 分钟，防止重放
 */
export const DOWNLOAD_TOKEN_DEFAULT_TTL_SEC = 120;
const JTI_RETENTION_MS = 10 * 60 * 1000;
const JTI_CLEANUP_INTERVAL_MS = 60 * 1000;

const usedJtiStore = new Map<string, number>();
let jtiCleanupTimer: ReturnType<typeof setInterval> | null = null;

function cleanupUsedJtiStore(now = Date.now()) {
  let removed = 0;
  for (const [jti, usedAt] of usedJtiStore) {
    if (now - usedAt > JTI_RETENTION_MS) {
      usedJtiStore.delete(jti);
      removed += 1;
    }
  }
  if (removed > 0) {
    console.log("[DOWNLOAD_TOKEN] jti_cleanup", {
      removed,
      remaining: usedJtiStore.size,
    });
  }
}

function ensureJtiCleanupScheduled() {
  if (jtiCleanupTimer) return;
  jtiCleanupTimer = setInterval(() => {
    try {
      cleanupUsedJtiStore();
    } catch (err) {
      console.error("[DOWNLOAD_TOKEN] jti_cleanup_error", err);
    }
  }, JTI_CLEANUP_INTERVAL_MS);
  if (typeof jtiCleanupTimer.unref === "function") {
    jtiCleanupTimer.unref();
  }
}

/**
 * 尝试消费一个 jti。
 * - 为空 jti：直接放行（兼容未升级的 token，真正的一次性保护在 stateful DB 层）
 * - 首次使用：记录 usedAt，返回 ok
 * - 重复使用：返回 DOWNLOAD_TOKEN_REUSED
 */
export function consumeJti(
  jti: string | undefined | null
): { ok: true } | { ok: false; code: "DOWNLOAD_TOKEN_REUSED" } {
  const normalized = String(jti || "").trim();
  if (!normalized) {
    return { ok: true };
  }

  ensureJtiCleanupScheduled();

  const now = Date.now();
  cleanupUsedJtiStore(now);

  if (usedJtiStore.has(normalized)) {
    console.log("[DOWNLOAD_TOKEN] jti_reused", {
      jti: normalized,
      firstUsedAt: usedJtiStore.get(normalized),
    });
    return { ok: false, code: "DOWNLOAD_TOKEN_REUSED" };
  }

  usedJtiStore.set(normalized, now);
  return { ok: true };
}

function getDownloadSecret() {
  const s = (process.env.DOWNLOAD_TOKEN_SECRET || "").trim();
  if (!s) throw new Error("DOWNLOAD_TOKEN_SECRET_MISSING");
  return s;
}

function getDownloadKey() {
  return new TextEncoder().encode(getDownloadSecret());
}

function sha256HexRaw(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function resolveTtlSec(input: number | undefined) {
  const n = Number(input);
  if (!Number.isFinite(n) || n <= 0) {
    return DOWNLOAD_TOKEN_DEFAULT_TTL_SEC;
  }
  return Math.max(30, Math.floor(n));
}

/** downloadToken JWT 内的 planLevel；缺失或非三档字面量则视为 free，不默认提升权限 */
export function normalizePlanLevelInDownloadJwt(
  raw: unknown,
  _mode: DownloadTokenMode
): UnlockPlanLevel {
  const s = String(raw || "").toLowerCase();
  if (s === "free" || s === "pro" || s === "enterprise") return s as UnlockPlanLevel;
  return "free";
}

export function tenderPackAllowedByPlanLevel(
  planLevel: UnlockPlanLevel,
  packFormat: "merged" | "zip"
): boolean {
  if (planLevel === "free") return false;
  if (packFormat === "merged")
    return planLevel === "pro" || planLevel === "enterprise";
  return planLevel === "enterprise";
}

export const PLAN_LEVEL_FORBIDDEN_MESSAGE =
  "当前版本不支持该下载，请升级套餐";
export async function signDownloadJwt(input: {
  planId: string;
  mode: DownloadTokenMode;
  variant?: DownloadTokenVariant;
  email?: string;
  ttlSec?: number;
  jti?: string;
  maxUses?: number;
  planLevel?: UnlockPlanLevel;
}) {
  const ttlSec = resolveTtlSec(input.ttlSec);
  const variant: DownloadTokenVariant =
    input.variant === "tender"
      ? "tender"
      : input.variant === "enterprise"
      ? "enterprise"
      : "sales";

  const jti =
    input.jti && input.jti.trim() ? input.jti.trim() : crypto.randomUUID();
  const maxUses = Math.max(1, Number(input.maxUses ?? 1));
  const planLevel: UnlockPlanLevel =
    input.planLevel === "pro" ||
    input.planLevel === "enterprise" ||
    input.planLevel === "free"
      ? input.planLevel
      : normalizePlanLevelInDownloadJwt(undefined, input.mode);

  return await new SignJWT({
    scope: "pdf_download",
    planId: input.planId,
    mode: input.mode,
    variant,
    email: input.email || "",
    maxUses,
    planLevel,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime(`${ttlSec}s`)
    .sign(getDownloadKey());
}

export async function verifyDownloadJwt(token: string) {
  const { payload } = await jwtVerify(token, getDownloadKey());

  const modeRaw = String(payload.mode || "").toLowerCase();
  const mode: DownloadTokenMode =
    modeRaw === "preview" ||
    modeRaw === "full" ||
    modeRaw === "budget" ||
    modeRaw === "pack"
      ? (modeRaw as DownloadTokenMode)
      : "full";

  return {
    scope: String(payload.scope || ""),
    planId: String(payload.planId || ""),
    mode,
    variant: String(payload.variant || "sales") as DownloadTokenVariant,
    email: String(payload.email || ""),
    exp: Number(payload.exp || 0),
    iat: Number(payload.iat || 0),
    jti: String(payload.jti || ""),
    maxUses: Number(payload.maxUses || 1),
    planLevel: normalizePlanLevelInDownloadJwt(payload.planLevel, mode),
  };
}

export async function issueStatefulDownloadToken(input: {
  planId: string;
  mode: DownloadTokenMode;
  variant?: DownloadTokenVariant;
  email?: string;
  ttlSec?: number;
  maxUses?: number;
  jti?: string;
  planLevel?: UnlockPlanLevel;
}) {
  const maxUses = Math.max(1, Number(input.maxUses ?? 1));
  const jti =
    input.jti && input.jti.trim() ? input.jti.trim() : crypto.randomUUID();

  const token = await signDownloadJwt({
    planId: input.planId,
    mode: input.mode,
    variant: input.variant,
    email: input.email,
    ttlSec: input.ttlSec,
    jti,
    maxUses,
    planLevel: input.planLevel,
  });

  const ttlSec = resolveTtlSec(input.ttlSec);
  const expAt = new Date(Date.now() + ttlSec * 1000);
  const tokenHash = sha256HexRaw(token);

  try {
    await prisma.pdfDownloadTokenState.upsert({
      where: { tokenHash },
      update: {
        expAt,
        revoked: false,
        maxUses,
      },
      create: {
        tokenHash,
        planId: input.planId,
        mode: input.mode,
        expAt,
        maxUses,
        usedCount: 0,
        revoked: false,
      },
    });
    console.log("[DOWNLOAD_TOKEN] state_row_upserted", { jti });
  } catch (err) {
    console.error(
      "[DOWNLOAD_TOKEN] state_row_upsert_failed_fallback_to_jwt_only",
      err
    );
  }

  return token;
}

/**
 * 统一下载 token 消费逻辑
 * 支持：
 * 1) DEV_MODE_TOKEN（仅非生产）
 * 2) 纯 JWT token（邮箱验证码验证成功后直接签发）
 * 3) JWT + pdfDownloadTokenState 的旧状态型 token
 */
export async function requireAndConsumeDownloadToken(params: {
  downloadToken: string;
  planId: string;
  mode: DownloadTokenMode;
  variant?: DownloadTokenVariant;
  fingerprint: string;
  ip?: string | null;
  ua?: string | null;
  /** 仅 tender-pack：按套餐校验 merged / zip */
  packFormat?: "merged" | "zip";
}) {
  const token = String(params.downloadToken || "").trim();
  if (!token) {
    return { ok: false as const, code: "TOKEN_MISSING" as const };
  }

  if (token === "DEV_MODE_TOKEN") {
    if (process.env.NODE_ENV !== "production") {
      console.log("[DOWNLOAD_TOKEN] dev_mode_token");
      return {
        ok: true as const,
        tokenId: "DEV_MODE_TOKEN",
        usedCount: 0,
        maxUses: 0,
        bypass: true as const,
      };
    }
    return { ok: false as const, code: "TOKEN_DEV_NOT_ALLOWED" as const };
  }

  // 先按 JWT 校验
  try {
    const payload = await verifyDownloadJwt(token);

    if (payload.scope !== "pdf_download") {
      return { ok: false as const, code: "BAD_TOKEN_SCOPE" as const };
    }

    if (payload.planId !== params.planId) {
      return {
        ok: false as const,
        code: "TOKEN_PLAN_MISMATCH" as const,
        tokenPlanId: payload.planId,
      };
    }

    if (payload.mode && payload.mode !== params.mode) {
      return {
        ok: false as const,
        code: "TOKEN_MODE_MISMATCH" as const,
        tokenMode: payload.mode,
      };
    }

    // V6: variant 校验（由上层按资源类型传入，pack 可为 enterprise 或 tender）
    if (params.variant !== undefined && params.variant !== null) {
      const tokenVariant = (payload.variant || "sales") as DownloadTokenVariant;
      if (tokenVariant !== params.variant) {
        return {
          ok: false as const,
          code: "TOKEN_VARIANT_MISMATCH" as const,
          tokenVariant,
        };
      }
    }

    // 第 5 刀：投标包按 planLevel 区分 merged / zip（在 jti 消费之前拒绝，避免误耗凭证）
    if (params.mode === "pack" && params.packFormat) {
      if (
        !tenderPackAllowedByPlanLevel(payload.planLevel, params.packFormat)
      ) {
        return {
          ok: false as const,
          code: "PLAN_LEVEL_FORBIDDEN" as const,
          planLevel: payload.planLevel,
        };
      }
    }

    // 第 4 刀：jti 一次性消费，防止 downloadToken 被重放
    const jtiCheck = consumeJti(payload.jti);
    if (!jtiCheck.ok) {
      return {
        ok: false as const,
        code: "DOWNLOAD_TOKEN_REUSED" as const,
        tokenJti: payload.jti,
      };
    }

    if (!USE_STATEFUL_TOKEN) {
      console.log("[DOWNLOAD_TOKEN] jwt_only_stateless", { jti: payload.jti });
      return {
        ok: true as const,
        tokenId: "JWT_ONLY",
        usedCount: 1,
        maxUses: payload.maxUses || 1,
        jwtOnly: true as const,
        email: payload.email || "",
        jti: payload.jti,
      };
    }

    const tokenHash = sha256HexRaw(token);

    let row: Awaited<
      ReturnType<typeof prisma.pdfDownloadTokenState.findUnique>
    > | null = null;

    try {
      row = await prisma.pdfDownloadTokenState.findUnique({
        where: { tokenHash },
      });
    } catch (err) {
      console.error(
        "[DOWNLOAD_TOKEN] state_lookup_failed_fallback_to_jwt_only",
        err
      );
      return {
        ok: true as const,
        tokenId: "JWT_ONLY",
        usedCount: 0,
        maxUses: 0,
        jwtOnly: true as const,
        email: payload.email || "",
      };
    }

    if (!row) {
      console.log("[DOWNLOAD_TOKEN] jwt_only");
      return {
        ok: true as const,
        tokenId: "JWT_ONLY",
        usedCount: 0,
        maxUses: 0,
        jwtOnly: true as const,
        email: payload.email || "",
      };
    }

    if (row.revoked) {
      return { ok: false as const, code: "TOKEN_REVOKED" as const, tokenId: row.id };
    }

    if (row.expAt && row.expAt.getTime() <= Date.now()) {
      return { ok: false as const, code: "TOKEN_EXPIRED" as const, tokenId: row.id };
    }

    if (row.planId !== params.planId) {
      return {
        ok: false as const,
        code: "TOKEN_PLAN_MISMATCH" as const,
        tokenId: row.id,
        tokenPlanId: row.planId,
      };
    }

    if (row.mode && row.mode !== params.mode) {
      return {
        ok: false as const,
        code: "TOKEN_MODE_MISMATCH" as const,
        tokenId: row.id,
        tokenMode: row.mode,
      };
    }

    const hasLimit = (row.maxUses ?? 1) > 0;
    if (hasLimit && (row.usedCount ?? 0) >= (row.maxUses ?? 1)) {
      return {
        ok: false as const,
        code: "TOKEN_QUOTA_EXCEEDED" as const,
        tokenId: row.id,
        usedCount: row.usedCount,
        maxUses: row.maxUses,
      };
    }

    try {
      const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        try {
          await tx.licenseConsume.create({
            data: {
              licenseId: row!.id,
              planId: params.planId,
              fingerprint: params.fingerprint,
            },
          });
        } catch {
          return row!;
        }

        const next = await tx.pdfDownloadTokenState.update({
          where: { id: row!.id },
          data: { usedCount: { increment: 1 } },
        });

        return next;
      });

      console.log("[DOWNLOAD_TOKEN] stateful");
      return {
        ok: true as const,
        tokenId: updated.id,
        usedCount: updated.usedCount,
        maxUses: updated.maxUses,
      };
    } catch (err) {
      console.error(
        "[DOWNLOAD_TOKEN] state_consume_failed_fallback_to_jwt_only",
        err
      );
      return {
        ok: true as const,
        tokenId: "JWT_ONLY",
        usedCount: 0,
        maxUses: 0,
        jwtOnly: true as const,
        email: payload.email || "",
      };
    }
  } catch {
    // JWT 验证失败，回退到旧纯 state token 兼容逻辑
  }

  if (!USE_STATEFUL_TOKEN) {
    return { ok: false as const, code: "TOKEN_INVALID" as const };
  }

  const tokenHash = sha256HexRaw(token);

  let row: Awaited<
    ReturnType<typeof prisma.pdfDownloadTokenState.findUnique>
  > | null;
  try {
    row = await prisma.pdfDownloadTokenState.findUnique({
      where: { tokenHash },
    });
  } catch (err) {
    console.error("[DOWNLOAD_TOKEN] legacy_state_lookup_failed", err);
    return { ok: false as const, code: "TOKEN_STATE_LOOKUP_FAILED" as const };
  }

  if (!row) return { ok: false as const, code: "TOKEN_STATE_NOT_FOUND" as const };
  if (row.revoked) return { ok: false as const, code: "TOKEN_REVOKED" as const };

  if (row.expAt && row.expAt.getTime() <= Date.now()) {
    return { ok: false as const, code: "TOKEN_EXPIRED" as const, tokenId: row.id };
  }

  if (row.planId !== params.planId) {
    return {
      ok: false as const,
      code: "TOKEN_PLAN_MISMATCH" as const,
      tokenId: row.id,
      tokenPlanId: row.planId,
    };
  }

  if (row.mode && row.mode !== params.mode) {
    return {
      ok: false as const,
      code: "TOKEN_MODE_MISMATCH" as const,
      tokenId: row.id,
      tokenMode: row.mode,
    };
  }

  const hasLimit = (row.maxUses ?? 1) > 0;
  if (hasLimit && (row.usedCount ?? 0) >= (row.maxUses ?? 1)) {
    return {
      ok: false as const,
      code: "TOKEN_QUOTA_EXCEEDED" as const,
      tokenId: row.id,
      usedCount: row.usedCount,
      maxUses: row.maxUses,
    };
  }

  try {
    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      try {
        await tx.licenseConsume.create({
          data: {
            licenseId: row.id,
            planId: params.planId,
            fingerprint: params.fingerprint,
          },
        });
      } catch {
        return row;
      }

      const next = await tx.pdfDownloadTokenState.update({
        where: { id: row.id },
        data: { usedCount: { increment: 1 } },
      });

      return next;
    });

    console.log("[DOWNLOAD_TOKEN] stateful_fallback");
    return {
      ok: true as const,
      tokenId: updated.id,
      usedCount: updated.usedCount,
      maxUses: updated.maxUses,
    };
  } catch (err) {
    console.error("[DOWNLOAD_TOKEN] legacy_state_consume_failed", err);
    return { ok: false as const, code: "TOKEN_STATE_CONSUME_FAILED" as const };
  }
}