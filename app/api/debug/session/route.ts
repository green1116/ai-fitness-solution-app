import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

function sha256Hex(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}
function hmacSha256Hex(secret: string, s: string) {
  return crypto.createHmac("sha256", secret).update(s).digest("hex");
}

async function findByTokenHash(tokenHash: string) {
  return prisma.session.findUnique({
    where: { tokenHash },
    select: { email: true, expiresAt: true },
  });
}

export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/(?:^|;\s*)session=([^;]+)/);
  const raw = m?.[1] ? decodeURIComponent(m[1]) : null;

  if (!raw) {
    return Response.json({ ok: false, step: "NO_SESSION_COOKIE" }, { status: 200 });
  }

  // 你 cookie 长度 64，非常像 hex token/或 tokenHash
  const direct = await findByTokenHash(raw);

  // 收集可能的 secret（只展示长度，不泄露内容）
  const secrets: Array<{ name: string; value: string }> = [];
  const pushSecret = (name: string) => {
    const v = (process.env[name] || "").trim();
    if (v) secrets.push({ name, value: v });
  };
  pushSecret("SESSION_TOKEN_SECRET");
  pushSecret("SESSION_SECRET");
  pushSecret("AUTH_SECRET");
  pushSecret("DOWNLOAD_TOKEN_SECRET");

  const candidates: Array<{
    label: string;
    tokenHash: string;
    secretName: string;
  }> = [];

  for (const s of secrets) {
    candidates.push({
      label: "sha256(raw:secret)",
      tokenHash: sha256Hex(`${raw}:${s.value}`),
      secretName: s.name,
    });
    candidates.push({
      label: "sha256(secret:raw)",
      tokenHash: sha256Hex(`${s.value}:${raw}`),
      secretName: s.name,
    });
    candidates.push({
      label: "hmacSha256(secret, raw)",
      tokenHash: hmacSha256Hex(s.value, raw),
      secretName: s.name,
    });
  }

  // 逐个尝试命中
  let matched: any = null;
  let matchedMeta: any = null;

  for (const c of candidates) {
    const row = await findByTokenHash(c.tokenHash);
    if (row) {
      matched = row;
      matchedMeta = { secretName: c.secretName, algo: c.label, tokenHash: c.tokenHash };
      break;
    }
  }

  return Response.json(
    {
      ok: true,
      hasCookie: true,
      rawLen: raw.length,
      // 不在这里回显 raw（避免泄露），你已经在浏览器看到了
      directMatch: !!direct,
      directEmail: direct?.email ?? null,
      directExpired: direct ? direct.expiresAt.getTime() <= Date.now() : null,

      secretsFound: secrets.map(s => ({ name: s.name, len: s.value.length })),

      matched: !!matched,
      matchedMeta,
      email: matched?.email ?? null,
      expiresAt: matched?.expiresAt ?? null,
      expired: matched ? matched.expiresAt.getTime() <= Date.now() : null,
    },
    { status: 200 }
  );
}
