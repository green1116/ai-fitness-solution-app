export function sig8(reqsig?: string) {
    const s = String(reqsig || "").trim().toLowerCase();
    // 允许你未来换成 hash 的前8位也兼容
    return s ? s.slice(0, 8) : "00000000";
  }