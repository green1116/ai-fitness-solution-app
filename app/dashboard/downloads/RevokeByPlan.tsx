"use client";
import { useState } from "react";

export default function RevokeByPlan() {
  const [planId, setPlanId] = useState("");
  const [reason, setReason] = useState("batch_revoke");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!planId.trim()) return setMsg("请填�?planId");
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/token/revoke-by-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, reason }),
      });
      const data = await res.json();
      if (!res.ok) setMsg(data?.message || "批量吊销失败");
      else setMsg(`�?已吊销 ${data.revokedCount} �?token`);
    } catch (e: any) {
      setMsg(e?.message || "网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ border: "1px solid #e5e5e5", padding: 16, borderRadius: 8, marginBottom: 24 }}>
      <h3 style={{ fontWeight: 600, marginBottom: 8 }}>�?planId 批量吊销 Token</h3>
      <input value={planId} onChange={(e) => setPlanId(e.target.value)} placeholder="planId（必填）" />
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="reason（可选）" />
      <button onClick={submit} disabled={loading}>{loading ? "处理中�? : "批量吊销"}</button>
      {msg && <div style={{ marginTop: 8, color: msg.startsWith("�?) ? "green" : "red" }}>{msg}</div>}
    </div>
  );
}


