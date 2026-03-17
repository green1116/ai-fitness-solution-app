import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import crypto from "crypto";

export function sha256Hex(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export async function verifyDownloadJwt(token: string) {
  const secret = (process.env.DOWNLOAD_TOKEN_SECRET || "").trim();
  if (!secret) throw new Error("DOWNLOAD_TOKEN_SECRET missing");

  const key = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
  return payload as any; // { scope, planId, mode, email, iat, exp }
}

export async function requireAndConsumeToken(opts: {
  downloadToken: string;
  planId: string;
  mode: "full" | "preview" | "budget";
  fingerprint: string;
}) {
  const token = opts.downloadToken.trim();
  if (!token) throw new Error("MISSING_DOWNLOAD_TOKEN");

  // ✅ DEV token 直接放行（不扣）
  if (token === "DEV_MODE_TOKEN") {
    return { ok: true, dev: true as const, tokenState: null as any };
  }

  // ✅ JWT 验证（防伪造）
  const payload = await verifyDownloadJwt(token);

  if (payload?.scope !== "pdf_download") throw new Error("BAD_TOKEN_SCOPE");
  if ((payload?.planId || "") !== opts.planId) throw new Error("TOKEN_PLAN_MISMATCH");
  if ((payload?.mode || "") !== opts.mode) throw new Error("TOKEN_MODE_MISMATCH");

  // ✅ 查 tokenState（扣次数/撤销/到期）
  const tokenHash = sha256Hex(token);
  const row = await prisma.pdfDownloadTokenState.findUnique({
    where: { tokenHash },
    select: { id: true, planId: true, mode: true, expAt: true, maxUses: true, usedCount: true, revoked: true },
  });
  if (!row) throw new Error("TOKEN_STATE_NOT_FOUND");
  if (row.revoked) throw new Error("TOKEN_REVOKED");
  if (row.expAt.getTime() <= Date.now()) throw new Error("TOKEN_EXPIRED");
  if (row.planId !== opts.planId) throw new Error("TOKEN_STATE_PLAN_MISMATCH");
  if ((row.mode || "full") !== opts.mode) throw new Error("TOKEN_STATE_MODE_MISMATCH");

  // ✅ 防重复扣：LicenseConsume unique(licenseId,fingerprint)
  //   我们复用 LicenseConsume，把 tokenState.id 当作 licenseId
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 先尝试插入 consume（如果已存在说明已经扣过/用过）
    let inserted = false;
    try {
      await tx.licenseConsume.create({
        data: {
          licenseId: row.id,
          planId: opts.planId,
          fingerprint: opts.fingerprint,
        },
      });
      inserted = true;
    } catch (e: any) {
      // 违反 unique(licenseId,fingerprint) 就说明重复请求，不再扣
      inserted = false;
    }

    if (inserted) {
      // 首次消费才扣次数
      const next = row.usedCount + 1;
      if (next > row.maxUses) {
        throw new Error("TOKEN_MAX_USES_EXCEEDED");
      }
      await tx.pdfDownloadTokenState.update({
        where: { id: row.id },
        data: { usedCount: next },
      });
    }
  });

  return { ok: true, dev: false as const, tokenState: row };
}
