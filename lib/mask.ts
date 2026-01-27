/**
 * 敏感信息脱敏工具函数
 */

/**
 * 脱敏 token（只显示前 6 后 4 位）
 */
export function maskToken(t?: string | null): string {
  if (!t) return "";
  const s = String(t);
  if (s.length <= 12) return "***";
  return `${s.slice(0, 6)}...${s.slice(-4)}`;
}

/**
 * 脱敏 email（只显示用户名前 2 位和域名）
 */
export function maskEmail(e?: string | null): string {
  if (!e) return "";
  const [u, d] = e.split("@");
  if (!d) return "***";
  return `${u.slice(0, 2)}***@${d}`;
}

