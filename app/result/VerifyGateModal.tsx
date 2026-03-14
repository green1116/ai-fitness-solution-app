"use client";
import React, { useEffect, useMemo, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  proposalNo: string;
  // 濡傛灉浣犳湁璁㈠崟鍙凤紝灏变紶杩涙潵锛堟湭鏉ユ帴 paid 鏍￠獙锛?
  orderNo?: string;
  // plan 鏁版嵁锛堢敤浜庣敓鎴?PDF锛?
  plan?: any;
  // 浣犵殑鏀粯璺宠浆锛堝 /pay?orderNo=xxx锛?
  onPay?: () => void;
  onVerified?: (emailToken: string) => void;
};

export default function VerifyGateModal({
  open,
  onClose,
  proposalNo,
  orderNo,
  plan,
  onPay,
  onVerified,
}: Props) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [emailToken, setEmailToken] = useState<string | null>(null);

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [cooldown, setCooldown] = useState(0);
  const canSend = cooldown <= 0 && !!email;

  useEffect(() => {
    if (!open) return;
    setCode("");
    setEmailToken(null);
  }, [open]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  if (!open) return null;

  async function sendCode() {
    if (!canSend) return;
    setSending(true);
    try {
      const res = await fetch("/api/auth/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || body?.msg || "send_failed");
      setCooldown(60);
      alert("楠岃瘉鐮佸凡鍙戦€侊紝璇锋煡鏀堕偖绠憋紙鍙兘闇€瑕佸嚑鍒嗛挓鎵嶈兘閫佽揪锛岃妫€鏌ユ敹浠剁鍜屽瀮鍦鹃偖浠舵枃浠跺す锛?0鍒嗛挓鍐呮湁鏁堬級");
    } catch (e: any) {
      alert("鍙戦€佸け璐ワ細" + (e?.message || e));
    } finally {
      setSending(false);
    }
  }

  async function verifyCode() {
    if (!email || !code) return;
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "verify_failed");
      setEmailToken(body.emailToken);
      onVerified?.(body.emailToken);
      alert("楠岃瘉鎴愬姛锛屽彲浠ヤ笅杞藉畬鏁寸増 PDF 浜?);
    } catch (e: any) {
      alert("楠岃瘉澶辫触锛? + (e?.message || e));
    } finally {
      setVerifying(false);
    }
  }

  async function downloadPdf() {
    setDownloading(true);
    try {
      // 涓嬭浇 PDF锛堜娇鐢?session cookie锛? 浣跨敤 fetch + blob 鏂瑰紡
      const proposalNoValue = proposalNo || "attaguy-plan";

      if (!plan) {
        alert("缂哄皯 plan 鏁版嵁锛屾棤娉曠敓鎴?PDF");
        return;
      }

      const pdfRes = await fetch(`/api/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalNo: proposalNoValue, plan }),
      });

      if (pdfRes.status === 402) {
        const body = await pdfRes.json();
        alert(body?.msg || "闇€瑕侀獙璇?);
        return;
      }

      if (!pdfRes.ok) {
        const t = await pdfRes.text();
        alert("鐢熸垚澶辫触锛? + t);
        return;
      }

      const blob = await pdfRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${proposalNoValue}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (e: any) {
      alert("涓嬭浇澶辫触锛? + (e?.message || e));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <div style={styles.title}>闇€瑕侀獙璇?/div>
        <div style={styles.desc}>涓嬭浇瀹屾暣鐗?PDF 闇€瑕佸厛鏀粯鎴栧畬鎴愰偖绠遍獙璇?/div>

        <button
          style={styles.payBtn}
          onClick={() => (onPay ? onPay() : alert("璇锋帴鍏ユ敮浠樿烦杞?))}
        >
          鍓嶅線鏀粯锛埪?99锛?
        </button>

        <div style={{ height: 16 }} />

        <div style={styles.row}>
          <input
            style={styles.input}
            placeholder="杈撳叆閭"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button style={styles.smallBtn} onClick={sendCode} disabled={!canSend || sending}>
            {cooldown > 0 ? `宸插彂閫?${cooldown}s)` : sending ? "鍙戦€佷腑鈥? : "鑾峰彇楠岃瘉鐮?}
          </button>
        </div>

        <div style={{ height: 12 }} />

        <div style={styles.row}>
          <input
            style={{ ...styles.input, color: "#111", caretColor: "#111", background: "#fff" }}
            placeholder="杈撳叆閭楠岃瘉鐮?
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button style={styles.smallBtn} onClick={verifyCode} disabled={!email || !code || verifying}>
            {verifying ? "楠岃瘉涓€? : "楠岃瘉"}
          </button>
        </div>

        <div style={{ height: 16 }} />

        <button
          style={{
            ...styles.downloadBtn,
            opacity: emailToken || orderNo ? 1 : 0.6,
          }}
          onClick={downloadPdf}
          disabled={downloading}
        >
          {downloading ? "涓嬭浇涓€? : "涓嬭浇瀹屾暣鐗?PDF"}
        </button>

        <div style={{ height: 10 }} />
        <button style={styles.cancel} onClick={onClose}>鍙栨秷</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    width: 640,
    maxWidth: "92vw",
    background: "#fff",
    borderRadius: 14,
    padding: 22,
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },
  title: { fontSize: 22, fontWeight: 800, marginBottom: 6 },
  desc: { color: "#555", marginBottom: 18 },
  row: { display: "flex", gap: 10 },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    border: "1px solid #ddd",
    padding: "0 12px",
    outline: "none",
  },
  payBtn: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  smallBtn: {
    width: 140,
    height: 44,
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#fafafa",
    cursor: "pointer",
    fontWeight: 700,
  },
  downloadBtn: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    border: "none",
    background: "#0b63ff",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  cancel: {
    width: "100%",
    height: 40,
    borderRadius: 10,
    border: "none",
    background: "transparent",
    color: "#666",
    cursor: "pointer",
  },
};


