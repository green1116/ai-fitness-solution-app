"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ============================================
// 娣卞寲鍒ゆ柇 - 濉啓淇℃伅锛?0 涓棶棰樿〃鍗曪級
// ============================================
export default function DeepFormPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const orderNo = sp.get("order_no");

  const [form, setForm] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
    q6: "",
    q7: "",
    q8: "",
    q9: "",
    q10: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderNo) {
      alert("缂哄皯璁㈠崟鍙?);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_no: orderNo,
          answers: form,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.error || "鎻愪氦澶辫触");
      }

      const body = await res.json();

      if (body.submission_id) {
        alert(
          "鎻愪氦鎴愬姛锛宻ubmission_id=" +
            body.submission_id +
            "锛屾垜浠皢鍦?48 灏忔椂鍐呭鐞嗐€?
        );
        // 璺宠浆鍒扮粨鏋滈〉闈?
        router.push(`/result/analysis?id=${body.submission_id}`);
      } else {
        alert("鎻愪氦澶辫触锛岃绋嶅悗閲嶈瘯銆?);
      }
    } catch (err: any) {
      alert("鎻愪氦澶辫触锛? + (err?.message || "璇风◢鍚庨噸璇曘€?));
    } finally {
      setSubmitting(false);
    }
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <>
      <style jsx>{`
        body {
          font-family: Inter, system-ui, Arial;
          margin: 0;
          background: #f4f6f8;
          padding: 20px;
        }
        .box {
          max-width: 760px;
          margin: 20px auto;
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 8px 30px rgba(10, 20, 30, 0.06);
        }
        h2 {
          margin: 0 0 8px;
        }
        label {
          display: block;
          margin-top: 14px;
          font-weight: 600;
        }
        textarea,
        input {
          width: 100%;
          padding: 10px;
          margin-top: 6px;
          border: 1px solid #e6edf3;
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
        }
        .btn {
          background: #0b63ff;
          color: #fff;
          padding: 10px 14px;
          border-radius: 8px;
          border: none;
          margin-top: 18px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }
        .btn:hover:not(:disabled) {
          background: #0954d6;
        }
        .btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .muted {
          color: #6b7280;
          font-size: 13px;
          margin-top: 8px;
        }
      `}</style>

      <div className="box">
        <h2>璇疯ˉ鍏呬互涓嬩俊鎭紙鐢ㄤ簬瀹屾垚娣卞寲鍒ゆ柇锛?/h2>
        <div className="muted">
          鎻愪氦鍚庢垜浠皢鍦?48 灏忔椂鍐呬氦浠樺垽鏂姤鍛婏紙浜哄伐+AI锛夈€?
        </div>

        <form id="deepForm" onSubmit={handleSubmit}>
          <label>
            1锛変綘鐜板湪鏈€鐪熷疄鎯宠В鍐崇殑闂鏄粈涔堬紵锛堢畝杩帮級
          </label>
          <textarea
            name="q1"
            rows={2}
            required
            value={form.q1}
            onChange={(e) => updateField("q1", e.target.value)}
          />

          <label>2锛夎繖浠朵簨鎴愬姛瀵逛綘鎰忓懗鐫€浠€涔堬紵锛堟敹鐩?鐩爣锛?/label>
          <textarea
            name="q2"
            rows={2}
            required
            value={form.q2}
            onChange={(e) => updateField("q2", e.target.value)}
          />

          <label>
            3锛夊鏋滃け璐ワ紝浣犺兘鎺ュ彈鐨勬渶澶ф崯澶辨槸浠€涔堬紵锛堥噾閽?鏃堕棿/鍚嶈獕锛?
          </label>
          <input
            name="q3"
            type="text"
            required
            value={form.q3}
            onChange={(e) => updateField("q3", e.target.value)}
          />

          <label>4锛変綘鐩墠鍙姇鍏ョ殑鏃堕棿 / 璧勯噾 / 浜哄姏锛堣閲忓寲锛?/label>
          <input
            name="q4"
            type="text"
            required
            value={form.q4}
            onChange={(e) => updateField("q4", e.target.value)}
          />

          <label>5锛夊摢浜涜祫婧愭槸涓嶅彲鎸佺画鎴栨湁闄愮殑锛?/label>
          <input
            name="q5"
            type="text"
            value={form.q5}
            onChange={(e) => updateField("q5", e.target.value)}
          />

          <label>
            6锛夋槸鍚︽湁蹇呴』鍦ㄦ煇涓椂闂寸偣鍓嶅緱鍒扮粨璁猴紵锛堣嫢鏈夛紝璇疯鏄庯級
          </label>
          <input
            name="q6"
            type="text"
            value={form.q6}
            onChange={(e) => updateField("q6", e.target.value)}
          />

          <label>7锛変綘鐜板湪鏈€鐘硅鲍銆佹渶涓嶇‘瀹氱殑鐐规槸浠€涔堬紵</label>
          <textarea
            name="q7"
            rows={2}
            value={form.q7}
            onChange={(e) => updateField("q7", e.target.value)}
          />

          <label>8锛変綘鏈€鎷呭績鐨勭粨鏋滄槸浠€涔堬紵</label>
          <textarea
            name="q8"
            rows={2}
            value={form.q8}
            onChange={(e) => updateField("q8", e.target.value)}
          />

          <label>
            9锛変綘鏄惁宸茬粡鏈夊亸鍚戠殑绛旀锛燂紙渚嬪浣犲€惧悜缁х画/鏆傚仠锛?
          </label>
          <input
            name="q9"
            type="text"
            value={form.q9}
            onChange={(e) => updateField("q9", e.target.value)}
          />

          <label>10锛夊鏋?AI 鍒ゆ柇鏄惁瀹氾紝浣犳槸鍚︽効鎰忚皟鏁存柟鍚戯紵锛堟槸/鍚︼級</label>
          <input
            name="q10"
            type="text"
            required
            value={form.q10}
            onChange={(e) => updateField("q10", e.target.value)}
          />

          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "鎻愪氦涓?.." : "鎻愪氦骞惰繘鍏ュ垽鏂槦鍒?}
          </button>
        </form>

        <div className="muted">
          鎻愪氦鍚庝細鐢熸垚涓€浠?submission 璁板綍锛屾垜浠細鍦?48 灏忔椂鍐呬互 PDF /
          绔欏唴娑堟伅鍙戦€佹姤鍛娿€?
        </div>
      </div>
    </>
  );
}

