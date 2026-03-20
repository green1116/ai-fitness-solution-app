"use client";

import { useState } from "react";

export default function RevokeByPlan() {
  const [planId, setPlanId] = useState("");
  const [reason, setReason] = useState("batch_revoke");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!planId.trim()) {
      setMsg("请填写 planId");
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch("/api/token/revoke-by-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: planId.trim(),
          reason: reason.trim() || "batch_revoke",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.message || "批量撤销失败");
      } else {
        setMsg(`成功：已撤销 ${data.revokedCount ?? 0} 个 token`);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "网络错误";
      setMsg(message);
    } finally {
      setLoading(false);
    }
  }

  const ok = !!msg && msg.startsWith("成功");

  return (
    <div
      style={{
        border: "1px solid #e5e5e5",
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
      }}
    >
      <h3 style={{ fontWeight: 600, marginBottom: 8 }}>
        按 planId 批量撤销 Token
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input
          value={planId}
          onChange={(e) => setPlanId(e.target.value)}
          placeholder="planId（必填）"
        />

        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="reason（可选）"
        />

        <button onClick={submit} disabled={loading}>
          {loading ? "处理中..." : "批量撤销"}
        </button>

        {msg && (
          <div style={{ marginTop: 8, color: ok ? "green" : "red" }}>{msg}</div>
        )}
      </div>
    </div>
  );
}