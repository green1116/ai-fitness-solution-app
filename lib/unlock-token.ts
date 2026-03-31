import { jwtVerify, SignJWT } from "jose";

export type UnlockIntent = "unlock_pro" | "unlock_budget" | "unlock_tender";

function getSecret() {
  const s = (process.env.DOWNLOAD_TOKEN_SECRET || "").trim();
  if (!s) throw new Error("DOWNLOAD_TOKEN_SECRET_MISSING");
  return new TextEncoder().encode(s);
}

/**
 * 签发解锁 token（留资成功后返回，用于后续申请 download token）
 * 有效期 24 小时
 */
export async function signUnlockToken(payload: {
  planId: string;
  email: string;
  intent: UnlockIntent;
  ttlSec?: number;
}) {
  const ttlSec = payload.ttlSec ?? 86400; // 24h
  const now = Math.floor(Date.now() / 1000);
  const exp = now + ttlSec;

  return new SignJWT({
    scope: "unlock",
    planId: payload.planId,
    email: payload.email,
    intent: payload.intent,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(getSecret());
}

export type UnlockPayload = {
  scope: string;
  planId: string;
  email: string;
  intent: UnlockIntent;
  exp: number;
  iat: number;
};

/**
 * 校验解锁 token
 */
export async function verifyUnlockToken(
  token: string
): Promise<UnlockPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      scope: String(payload.scope || ""),
      planId: String(payload.planId || ""),
      email: String(payload.email || ""),
      intent: String(payload.intent || "unlock_pro") as UnlockIntent,
      exp: Number(payload.exp || 0),
      iat: Number(payload.iat || 0),
    };
  } catch {
    return null;
  }
}

/** 判断 intent 是否允许下载 pack（需 unlock_tender） */
export function intentAllowsPack(intent: UnlockIntent): boolean {
  return intent === "unlock_tender";
}

/** 判断 intent 是否允许下载 full（unlock_pro 或 unlock_tender） */
export function intentAllowsFull(intent: UnlockIntent): boolean {
  return intent === "unlock_pro" || intent === "unlock_tender";
}

/** 判断 intent 是否允许下载 budget（unlock_pro / unlock_budget / unlock_tender 均可） */
export function intentAllowsBudget(intent: UnlockIntent): boolean {
  return (
    intent === "unlock_pro" ||
    intent === "unlock_budget" ||
    intent === "unlock_tender"
  );
}
