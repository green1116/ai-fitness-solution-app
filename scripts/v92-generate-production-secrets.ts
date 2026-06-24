/**
 * 生成 Production 专用随机 secret（写入 gitignore 的本地文件，勿提交）。
 * 用法：npx tsx scripts/v92-generate-production-secrets.ts
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const out = path.join(process.cwd(), ".env.production.secrets.local");

const lines = [
  "# V9.2 Production secrets — 仅粘贴到 Vercel → Production Environment",
  "# 不要与 Preview / Local 共用；配置后 Redeploy Production",
  `# generated: ${new Date().toISOString()}`,
  "",
  `DOWNLOAD_TOKEN_SECRET=${crypto.randomBytes(48).toString("base64url")}`,
  `JWT_SECRET=${crypto.randomBytes(48).toString("base64url")}`,
  `SESSION_SECRET=${crypto.randomBytes(48).toString("base64url")}`,
  "ENABLE_COMMERCIAL_REGISTER=1",
  "",
  "# DATABASE_URL / DIRECT_URL：从 Supabase 控制台复制到 Vercel Production",
  "# 格式须与本地 .env 一致（含 pooler host、pgbouncer=true）",
  "",
];

fs.writeFileSync(out, lines.join("\n"), "utf8");
console.log(`[v92] wrote ${out}`);
console.log("[v92] 打开该文件，将变量逐项粘贴到 Vercel → Project → Settings → Environment Variables → Production");
