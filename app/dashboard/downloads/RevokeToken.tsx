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
          token,
          planId: planId || undefined,
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(data?.message || "撤销失败");
      } else {
        setMsg("✅ Token 已成功撤销");
        setToken("");
      }
    } catch (e: any) {
      setMsg(e?.message || "网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ border: "1px solid #e5e5e5", padding: 16, borderRadius: 8, marginBottom: 24 }}>
      <h3 style={{ fontWeight: 600, marginBottom: 8 }}>吊销下载 Token</h3>

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
          {loading ? "处理中…" : "吊销 Token"}
        </button>

        {msg && <div style={{ color: msg.startsWith("✅") ? "green" : "red" }}>{msg}</div>}
      </div>
    </div>
  );
}

