// lib/download-token.ts
import { SignJWT, jwtVerify } from "jose";

export type DownloadTokenPayload = {
  planId: string;
  scope: "pdf_download";
  mode?: "full" | "preview";
};

function getSecretKey() {
  const secret = process.env.DOWNLOAD_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "DOWNLOAD_TOKEN_SECRET is missing or too short (need >= 32 chars)."
    );
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

  // clockTolerance 给 10 秒，避免轻微时间漂移
  const { payload } = await jwtVerify(token, key, { clockTolerance: 10 });

  const planId = String(payload.planId ?? "");
  const scope = String(payload.scope ?? "");
  const mode = (payload as any).mode as "full" | "preview" | undefined;

  if (!planId) throw new Error("token missing planId");
  if (scope !== "pdf_download") throw new Error("token invalid scope");

  return { planId, scope: scope as "pdf_download", mode };
}
