// lib/http.ts
export function getIp(headers: Headers) {
  // 反代常见头
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return headers.get("x-real-ip") || "";
}

export function getUA(headers: Headers) {
  return headers.get("user-agent") || "";
}

// 用于幂等下载 / 防刷：planId + ip + ua（你已有类似思路）
export function makeFingerprint(planId: string, ip: string, ua: string) {
  const raw = `${planId}|${ip}|${ua}`;
  // 简单 hash（不依赖 node crypto API 差异）
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (h * 31 + raw.charCodeAt(i)) >>> 0;
  return String(h);
}

