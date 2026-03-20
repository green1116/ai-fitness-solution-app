"use client";

import { useState } from "react";

export default function RevokeToken() {
  const [token, setToken] = useState("");
  const [planId, setPlanId] = useState("");
  const [reason, setReason] = useState("manual_revoke");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    if (!token.trim()) {
      setMsg("请先粘贴 token");
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch("/api/token/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          planId: planId.trim() || undefined,
          reason: reason.trim() || "manual_revoke",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.message || "撤销失败");
      } else {
        setMsg("成功：Token 已撤销");
        setToken("");
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
      <h3 style={{ fontWeight: 600, marginBottom: 8 }}>撤销下载 Token</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <textarea
          placeholder="粘贴 downloadToken（必填）"
          rows={3}
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />

        <input
          placeholder="planId（可选）"
          value={planId}
          onChange={(e) => setPlanId(e.target.value)}
        />

        <input
          placeholder="reason（可选，默认 manual_revoke）"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <button onClick={submit} disabled={loading}>
          {loading ? "处理中..." : "撤销 Token"}
        </button>

        {msg && <div style={{ color: ok ? "green" : "red" }}>{msg}</div>}
      </div>
    </div>
  );
}