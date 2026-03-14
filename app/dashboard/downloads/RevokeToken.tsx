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
      setMsg("璇峰厛绮樿创 token");
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
        setMsg(data?.message || "鎾ら攢澶辫触");
      } else {
        setMsg("鉁?Token 宸叉垚鍔熸挙閿€");
        setToken("");
      }
    } catch (e: any) {
      setMsg(e?.message || "缃戠粶閿欒");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ border: "1px solid #e5e5e5", padding: 16, borderRadius: 8, marginBottom: 24 }}>
      <h3 style={{ fontWeight: 600, marginBottom: 8 }}>鍚婇攢涓嬭浇 Token</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <textarea
          placeholder="绮樿创 downloadToken锛堝繀濉級"
          rows={3}
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />

        <input
          placeholder="planId锛堝彲閫夛級"
          value={planId}
          onChange={(e) => setPlanId(e.target.value)}
        />

        <input
          placeholder="reason锛堝彲閫夛紝榛樿 manual_revoke锛?
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <button onClick={submit} disabled={loading}>
          {loading ? "澶勭悊涓€? : "鍚婇攢 Token"}
        </button>

        {msg && <div style={{ color: msg.startsWith("鉁?) ? "green" : "red" }}>{msg}</div>}
      </div>
    </div>
  );
}


