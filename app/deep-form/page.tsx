"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type DeepFormState = {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
  q9: string;
  q10: string;
};

export default function DeepFormPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const orderNo = sp.get("order_no");

  const [form, setForm] = useState<DeepFormState>({
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!orderNo) {
      alert("请输入订单号");
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
        throw new Error(error?.error || "提交失败");
      }

      const body = await res.json();

      if (body.submission_id) {
        alert(
          "提交成功，submission_id=" +
            body.submission_id +
            "。我们将在 48 小时内完成处理。"
        );
        router.push(`/result/analysis?id=${body.submission_id}`);
      } else {
        alert("提交失败，请稍后重试。");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "请稍后重试。";
      alert("提交失败：" + message);
    } finally {
      setSubmitting(false);
    }
  }

  function updateField(field: keyof DeepFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <>
      <style jsx>{`
        :global(body) {
          font-family: Inter, system-ui, Arial, sans-serif;
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
          color: #111827;
        }

        label {
          display: block;
          margin-top: 14px;
          font-weight: 600;
          color: #111827;
          line-height: 1.6;
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
          font-family: inherit;
        }

        textarea {
          resize: vertical;
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
          line-height: 1.7;
        }
      `}</style>

      <div className="box">
        <h2>请补充以下信息，用于完成深度判断</h2>

        <div className="muted">
          提交后，我们将在 48 小时内交付判断报告（人工 + AI）。
        </div>

        <form id="deepForm" onSubmit={handleSubmit}>
          <label>1）你现在最真实想解决的问题是什么？（简述）</label>
          <textarea
            name="q1"
            rows={2}
            required
            value={form.q1}
            onChange={(e) => updateField("q1", e.target.value)}
          />

          <label>2）这件事成功对你意味着什么？（收益 / 目标）</label>
          <textarea
            name="q2"
            rows={2}
            required
            value={form.q2}
            onChange={(e) => updateField("q2", e.target.value)}
          />

          <label>
            3）如果失败，你能接受的最大损失是什么？（金钱 / 时间 / 名誉）
          </label>
          <input
            name="q3"
            type="text"
            required
            value={form.q3}
            onChange={(e) => updateField("q3", e.target.value)}
          />

          <label>4）你目前可投入的时间 / 资金 / 人力，请尽量量化</label>
          <input
            name="q4"
            type="text"
            required
            value={form.q4}
            onChange={(e) => updateField("q4", e.target.value)}
          />

          <label>5）哪些资源是不可持续或有限的？</label>
          <input
            name="q5"
            type="text"
            value={form.q5}
            onChange={(e) => updateField("q5", e.target.value)}
          />

          <label>
            6）是否有必须在某个时间点前得到结论？如有，请说明。
          </label>
          <input
            name="q6"
            type="text"
            value={form.q6}
            onChange={(e) => updateField("q6", e.target.value)}
          />

          <label>7）你现在最犹豫、最不确定的点是什么？</label>
          <textarea
            name="q7"
            rows={2}
            value={form.q7}
            onChange={(e) => updateField("q7", e.target.value)}
          />

          <label>8）你最担心的结果是什么？</label>
          <textarea
            name="q8"
            rows={2}
            value={form.q8}
            onChange={(e) => updateField("q8", e.target.value)}
          />

          <label>9）你是否已经有偏向的答案？（例如继续 / 暂停）</label>
          <input
            name="q9"
            type="text"
            value={form.q9}
            onChange={(e) => updateField("q9", e.target.value)}
          />

          <label>
            10）如果 AI 判断是否定，你是否愿意调整方向？（是 / 否）
          </label>
          <input
            name="q10"
            type="text"
            required
            value={form.q10}
            onChange={(e) => updateField("q10", e.target.value)}
          />

          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "提交中..." : "提交并进入判断队列"}
          </button>
        </form>

        <div className="muted">
          提交后会生成一份 submission 记录，我们会在 48 小时内以 PDF 或站内消息发送报告。
        </div>
      </div>
    </>
  );
}