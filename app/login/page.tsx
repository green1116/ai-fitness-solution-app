"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const returnTo = sp.get("returnTo") || "/result";

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  async function requestCode() {
    setMsg("");
    setLoading(true);
    try {
      const r = await fetch("/api/auth/email/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "鍙戦€佸け璐?);

      setStep("code");
      setMsg("楠岃瘉鐮佸凡鍙戦€侊紝璇锋煡鏀堕偖绠憋紙5鍒嗛挓鍐呮湁鏁堬級");

      // 60绉掑€掕鏃?
      setCooldown(60);
      const t = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(t);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (e: any) {
      setMsg(e?.message || "鍙戦€佸け璐?);
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    try {
      setError("");

      const r = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
        }),
        cache: "no-store",
      });

      const data = await r.json().catch(() => ({}));

      console.log("[verify] status=", r.status, "data=", data); // 鉁?鍏抽敭锛氭墦鍗版湇鍔＄杩斿洖

      if (!r.ok) {
        // 鉁?鎶婂悗绔繑鍥炵殑 stage/message 鏄剧ず鍑烘潵
        setError(data?.message || data?.msg || `楠岃瘉澶辫触锛?{data?.stage || "unknown"}锛塦);
        return;
      }

      // 鎴愬姛锛氬洖璺?
      const returnTo = new URLSearchParams(location.search).get("returnTo");
      location.href = returnTo ? decodeURIComponent(returnTo) : "/result";
    } catch (e: any) {
      console.error("[verify] exception", e);
      setError(e?.message || "楠岃瘉澶辫触");
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>鐧诲綍</h1>
      <p className="text-sm text-gray-500" style={{ marginBottom: 18 }}>
        鐧诲綍鍚庡皢杩斿洖涓婁竴椤?
      </p>

      {step === "email" && (
        <>
          <label style={{ display: "block", marginBottom: 8 }}>閭</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: 10,
              marginBottom: 12,
            }}
          />

          <button
            onClick={requestCode}
            disabled={loading || !email}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #111",
              background: loading ? "#eee" : "#111",
              color: loading ? "#666" : "#fff",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "鍙戦€佷腑..." : "鍙戦€侀獙璇佺爜"}
          </button>
        </>
      )}

      {step === "code" && (
        <>
          <div style={{ marginBottom: 10, color: "#666" }}>
            宸插彂閫佸埌锛?b>{email}</b>
          </div>

          <label style={{ display: "block", marginBottom: 8 }}>楠岃瘉鐮?/label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6浣嶆暟瀛?
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: 10,
              marginBottom: 12,
            }}
          />

          <button
            onClick={verifyCode}
            disabled={loading || code.length < 6}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #111",
              background: loading ? "#eee" : "#111",
              color: loading ? "#666" : "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: 10,
            }}
          >
            {loading ? "楠岃瘉涓?.." : "鐧诲綍"}
          </button>

          <button
            onClick={async () => {
              setError("");
              setLoading(true);
              try {
                const r = await fetch("/api/auth/email/send", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                });
                const j = await r.json().catch(() => ({}));
                if (!r.ok) throw new Error(j?.message || j?.msg || "鍙戦€佸け璐?);

                setMsg("楠岃瘉鐮佸凡鍙戦€侊紝璇锋煡鏀堕偖绠憋紙10鍒嗛挓鍐呮湁鏁堬級");

                // 60绉掑€掕鏃?
                setCooldown(60);
                const t = setInterval(() => {
                  setCooldown((c) => {
                    if (c <= 1) {
                      clearInterval(t);
                      return 0;
                    }
                    return c - 1;
                  });
                }, 1000);
              } catch (e: any) {
                setError(e?.message || "鍙戦€佸け璐?);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading || cooldown > 0}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: loading || cooldown > 0 ? "not-allowed" : "pointer",
            }}
          >
            {cooldown > 0 ? `閲嶆柊鍙戦€侊紙${cooldown}s锛塦 : "閲嶅彂楠岃瘉鐮?}
          </button>
        </>
      )}

      {(msg || error) && (
        <div
          style={{
            marginTop: 14,
            padding: 10,
            borderRadius: 10,
            background: error ? "#fee" : "#f6f6f6",
            border: `1px solid ${error ? "#fcc" : "#eee"}`,
            color: error ? "#c33" : "#333",
            whiteSpace: "pre-wrap",
          }}
        >
          {error || msg}
        </div>
      )}
    </div>
  );
}

