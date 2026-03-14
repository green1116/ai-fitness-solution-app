"use client";
import { useState } from "react";

export default function RevokeByPlan() {
  const [planId, setPlanId] = useState("");
  const [reason, setReason] = useState("batch_revoke");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!planId.trim()) return setMsg("璇峰～鍐?planId");
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/token/revoke-by-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, reason }),
      });
      const data = await res.json();
      if (!res.ok) setMsg(data?.message || "鎵归噺鍚婇攢澶辫触");
      else setMsg(`鉁?宸插悐閿€ ${data.revokedCount} 涓?token`);
    } catch (e: any) {
      setMsg(e?.message || "缃戠粶閿欒");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ border: "1px solid #e5e5e5", padding: 16, borderRadius: 8, marginBottom: 24 }}>
      <h3 style={{ fontWeight: 600, marginBottom: 8 }}>鎸?planId 鎵归噺鍚婇攢 Token</h3>
      <input value={planId} onChange={(e) => setPlanId(e.target.value)} placeholder="planId锛堝繀濉級" />
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="reason锛堝彲閫夛級" />
      <button onClick={submit} disabled={loading}>{loading ? "澶勭悊涓€? : "鎵归噺鍚婇攢"}</button>
      {msg && <div style={{ marginTop: 8, color: msg.startsWith("鉁?) ? "green" : "red" }}>{msg}</div>}
    </div>
  );
}


