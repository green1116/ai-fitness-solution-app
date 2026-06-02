import { SignJWT, jwtVerify } from "jose";

type UnlockIntent =
  | "unlock_pro"
  | "unlock_budget"
  | "unlock_enterprise"
  | "unlock_tender";

type UnlockMode = "full" | "budget" | "pack";

export type UnlockPlanLevel = "free" | "pro" | "enterprise";

export type UnlockTokenPayload = {
  scope: "unlock";
  planId: string;
  intent: UnlockIntent;
  email?: string;
  mode?: UnlockMode;
  /** 商业化套餐档：预览 / Pro 投标包 PDF / Enterprise PDF+ZIP */
  planLevel: UnlockPlanLevel;
};

function getUnlockSecret() {
  const secret = (process.env.UNLOCK_TOKEN_SECRET || "").trim();

  if (!secret) {
    throw new Error("UNLOCK_TOKEN_SECRET 未配置");
  }

  return new TextEncoder().encode(secret);
}

export async function issueUnlockToken(input: {
  planId: string;
  intent: UnlockIntent;
  email?: string;
  mode?: UnlockMode;
  planLevel: UnlockPlanLevel;
  ttlSec?: number;
}) {
  const ttlSec =
    input.ttlSec ??
    Number(process.env.UNLOCK_TOKEN_EXPIRES_IN_SECONDS || "86400");

  const key = getUnlockSecret();

  const token = await new SignJWT({
    scope: "unlock",
    planId: input.planId,
    intent: input.intent,
    email: input.email || undefined,
    mode: input.mode || undefined,
    planLevel: input.planLevel,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${ttlSec}s`)
    .sign(key);

  console.log("[unlock-token] issue success", {
    planId: input.planId,
    intent: input.intent,
    email: input.email || "",
    mode: input.mode || "",
    planLevel: input.planLevel,
    ttlSec,
    tokenPreview: `${token.slice(0, 16)}...`,
  });

  return token;
}

export async function verifyUnlockToken(
  token: string
): Promise<UnlockTokenPayload | null> {
  try {
    if (!token || !token.trim()) {
      console.log("[unlock-token] verify reject: empty token");
      return null;
    }

    const key = getUnlockSecret();

    const result = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });

    const payload = result.payload as Partial<UnlockTokenPayload>;

    console.log("[unlock-token] verify decoded", {
      scope: payload?.scope,
      planId: payload?.planId,
      mode: payload?.mode,
      planLevel: payload?.planLevel,
      email: payload?.email || "",
      intent: payload?.intent || "",
      exp: result.payload?.exp,
      iat: result.payload?.iat,
    });

    if (payload?.scope !== "unlock") {
      console.log("[unlock-token] verify reject: invalid scope", {
        scope: payload?.scope,
      });
      return null;
    }

    if (!payload?.planId) {
      console.log("[unlock-token] verify reject: missing planId");
      return null;
    }

    if (!payload?.email) {
      console.log("[unlock-token] verify reject: missing email");
      return null;
    }

    const rawMode = String(payload.mode || "").toLowerCase();
    const mode: UnlockMode | null =
      rawMode === "full" || rawMode === "budget" || rawMode === "pack"
        ? (rawMode as UnlockMode)
        : null;

    if (!mode) {
      console.log("[unlock-token] verify reject: missing/invalid mode", {
        rawMode,
      });
      return null;
    }

    const rawLevel = String(payload.planLevel || "").toLowerCase();
    const planLevel: UnlockPlanLevel =
      rawLevel === "free" || rawLevel === "pro" || rawLevel === "enterprise"
        ? rawLevel
        : "free";

    return {
      scope: "unlock",
      planId: String(payload.planId),
      intent: payload.intent as UnlockIntent,
      email: String(payload.email),
      mode,
      planLevel,
    };
  } catch (error: any) {
    console.log("[unlock-token] verify error", {
      name: error?.name,
      message: error?.message,
    });
    return null;
  }
}

export function intentAllowsFull(intent: string) {
  return (
    intent === "unlock_pro" ||
    intent === "unlock_enterprise" ||
    intent === "unlock_tender"
  );
}

export function intentAllowsBudget(intent: string) {
  return (
    intent === "unlock_budget" ||
    intent === "unlock_enterprise" ||
    intent === "unlock_tender"
  );
}