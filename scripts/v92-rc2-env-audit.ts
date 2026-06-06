import "dotenv/config";
/**
 * V9.2-RC2 生产环境变量复核（不打印 secret 明文）
 */
const REQUIRED_PROD = [
  "DATABASE_URL",
  "DIRECT_URL",
  "DOWNLOAD_TOKEN_SECRET",
  "JWT_SECRET",
] as const;

const PLACEHOLDER_PATTERNS = [
  /^CHANGE_ME/i,
  /^your[-_]/i,
  /^xxx$/i,
  /\[PASSWORD\]/i,
  /\[PROJECT_REF\]/i,
  /^some-long-random-string$/i,
  /^ai-fitness-solution-ci-secret$/i,
];

function isPlaceholder(name: string, value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  return PLACEHOLDER_PATTERNS.some((re) => re.test(v) || re.test(name));
}

function mask(value: string): string {
  if (value.length <= 8) return "***";
  return `${value.slice(0, 4)}…${value.slice(-4)} (len=${value.length})`;
}

function main() {
  console.log("=== V9.2-RC2 Production Env Audit ===\n");
  const missing: string[] = [];
  const risky: string[] = [];
  const ok: string[] = [];

  for (const key of REQUIRED_PROD) {
    const value = (process.env[key] || "").trim();
    if (!value) {
      missing.push(key);
      continue;
    }
    if (isPlaceholder(key, value)) {
      risky.push(`${key} 疑似占位符 (${mask(value)})`);
      continue;
    }
    if (key.includes("SECRET") && value.length < 32) {
      risky.push(`${key} 长度过短 (<32)`);
      continue;
    }
    ok.push(`${key}=${mask(value)}`);
  }

  if (process.env.DEV_ZIP_ALLOW_ALL === "1") {
    risky.push("DEV_ZIP_ALLOW_ALL=1 不应出现在生产");
  }
  if (process.env.DEV_ZIP_DEFAULT_ALLOW !== "0" && process.env.NODE_ENV === "production") {
    risky.push("生产环境请确认未依赖 DEV_ZIP_* 放行");
  }

  console.log("OK:");
  ok.forEach((l) => console.log(`  ✓ ${l}`));
  console.log("\n缺失:");
  if (missing.length) missing.forEach((k) => console.log(`  ✗ ${k}`));
  else console.log("  (无)");
  console.log("\n风险:");
  if (risky.length) risky.forEach((r) => console.log(`  ⚠ ${r}`));
  else console.log("  (无)");

  const pass = missing.length === 0 && risky.length === 0;
  console.log(`\n${pass ? "ENV_AUDIT_PASS" : "ENV_AUDIT_FAIL"}\n`);
  process.exit(pass ? 0 : 1);
}

main();
