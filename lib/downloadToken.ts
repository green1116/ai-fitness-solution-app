// lib/downloadToken.ts
import crypto from "crypto";

export type DownloadTokenPayload = {
  planId: string;
  scope: "pdf_download";
  iat: number;
  exp: number;
};

// base64url helpers
function b64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function b64urlToBuffer(input: string) {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(base64, "base64");
}

function hmacSha256(data: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(data).digest();
}

function timingSafeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function getSecret() {
  const secret = process.env.DOWNLOAD_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "DOWNLOAD_TOKEN_SECRET 未配置或太短（建议至少 32 字符）"
    );
  }
  return secret;
}

function nowSec() {
  return Math.floor(Date.now() / 1000);
}

export function createDownloadToken(planId: string, expiresInSeconds?: number) {
  const secret = getSecret();
  const ttl =
    typeof expiresInSeconds === "number"
      ? expiresInSeconds
      : Number(process.env.DOWNLOAD_TOKEN_EXPIRES_IN_SECONDS || 1800);

  const iat = nowSec();
  const exp = iat + Math.max(60, ttl); // 至少 60 秒，避免太短导致误判

  const header = { alg: "HS256", typ: "JWT" };
  const payload: DownloadTokenPayload = {
    planId,
    scope: "pdf_download",
    iat,
    exp,
  };

  const encodedHeader = b64url(JSON.stringify(header));
  const encodedPayload = b64url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = b64url(hmacSha256(signingInput, secret));
  return `${signingInput}.${signature}`;
}

export function verifyDownloadToken(token: string): DownloadTokenPayload {
  const secret = getSecret();

  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("token 格式错误");

  const [encodedHeader, encodedPayload, encodedSig] = parts;
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSig = b64url(hmacSha256(signingInput, secret));

  if (!timingSafeEqual(encodedSig, expectedSig)) {
    throw new Error("token 签名不匹配");
  }

  const payloadJson = b64urlToBuffer(encodedPayload).toString("utf8");
  const payload = JSON.parse(payloadJson) as DownloadTokenPayload;

  if (payload.scope !== "pdf_download") throw new Error("token scope 不正确");

  const t = nowSec();
  if (typeof payload.exp !== "number" || t >= payload.exp) {
    throw new Error("token 已过期");
  }
  if (typeof payload.iat !== "number" || payload.iat > t + 30) {
    throw new Error("token 时间不正确");
  }
  if (!payload.planId) throw new Error("token 缺少 planId");

  return payload;
}

