// src/lib/download-token.ts
import { SignJWT, jwtVerify } from "jose";

export type DownloadTokenPayload = {
  planId: string;
  scope: "pdf_download";
  mode?: "full" | "preview";
};

function getSecretKey() {
  const secret = process.env.DOWNLOAD_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("DOWNLOAD_TOKEN_SECRET is missing or too short (need >= 32 chars).");
  }
  return new TextEncoder().encode(secret);
}

function getExpiresInSeconds() {
  const raw = Number(process.env.DOWNLOAD_TOKEN_EXPIRES_IN_SECONDS ?? 1800);
  if (!Number.isFinite(raw) || raw <= 0) return 1800;
  return raw;
}

export async function signDownloadToken(payload: DownloadTokenPayload) {
  const key = getSecretKey();
  const expSec = getExpiresInSeconds();
  const now = Math.floor(Date.now() / 1000);

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + expSec)
    .sign(key);
}

export async function verifyDownloadToken(token: string) {
  const key = getSecretKey();
  const { payload } = await jwtVerify(token, key, { clockTolerance: 10 });

  const planId = String(payload.planId ?? "");
  const scope = String(payload.scope ?? "");
  const mode = (payload as any).mode as "full" | "preview" | undefined;

  if (!planId) throw new Error("token missing planId");
  if (scope !== "pdf_download") throw new Error("token invalid scope");

  return { planId, scope: scope as "pdf_download", mode };
}

/**
 * ✅ 兼容旧调用：原来 createDownloadToken 返回 b64.sig
 * 现在直接返回 JWT
 */
export async function createDownloadToken(args: { planId: string; mode?: "full" | "preview" }) {
  return await signDownloadToken({ planId: args.planId, scope: "pdf_download", mode: args.mode });
}

/**
 * ✅ 兼容旧调用：原来 createDownloadTokenAndStore 会存储状态
 * 你现在没有"token 存储"需求的话，就先直接返回 token（最稳）
 */
export async function createDownloadTokenAndStore(args: { planId: string; mode?: "full" | "preview" }) {
  const token = await createDownloadToken(args);
  return token;
}

/**
 * ✅ 兼容旧调用：generateDownloadToken 只接收 planId
 * 现在返回 JWT token（默认 mode 为 full）
 */
export async function generateDownloadToken(planId: string) {
  return await createDownloadToken({ planId, mode: "full" });
}
