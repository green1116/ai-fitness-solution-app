// lib/log.ts
function maskEmail(email?: string | null) {
  if (!email) return "";
  const at = email.indexOf("@");
  if (at <= 1) return "***";
  const name = email.slice(0, at);
  const domain = email.slice(at + 1);
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

function maskToken(t?: string | null) {
  if (!t) return "";
  if (t.length <= 12) return "***";
  return `${t.slice(0, 6)}…${t.slice(-4)}`;
}

function maskIp(ip?: string | null) {
  if (!ip) return "";
  // 简单处理：只保留前两段（IPv4）/ 前几个块（IPv6）
  if (ip.includes(".")) {
    const parts = ip.split(".");
    return parts.length === 4 ? `${parts[0]}.${parts[1]}.*.*` : ip;
  }
  if (ip.includes(":")) {
    const parts = ip.split(":").filter(Boolean);
    return parts.slice(0, 3).join(":") + ":*";
  }
  return ip;
}

export function safeLog(event: string, payload: Record<string, any>) {
  const p = { ...payload };

  if ("email" in p) p.email = maskEmail(p.email);
  if ("token" in p) p.token = maskToken(p.token);
  if ("downloadToken" in p) p.downloadToken = maskToken(p.downloadToken);
  if ("ip" in p) p.ip = maskIp(p.ip);

  // OTP code 永远不许出现在日志里
  if ("code" in p) delete p.code;
  if ("otp" in p) delete p.otp;

  console.log(`[${event}]`, p);
}

