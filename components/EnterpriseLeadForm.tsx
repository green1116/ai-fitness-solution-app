"use client";

import React, { useMemo, useState } from "react";

export type EnterpriseLeadFormValue = {
  company: string;
  name: string;
  phone: string;
  email: string;
  title: string;
};

type Props = {
  open: boolean;
  loading?: boolean;
  initialEmail?: string;
  title?: string;
  submitText?: string;
  onClose: () => void;
  onSubmit: (value: EnterpriseLeadFormValue) => Promise<void> | void;
};

function normalizePhone(input: string) {
  return input.replace(/[^\d+]/g, "").trim();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string) {
  const v = normalizePhone(phone);
  return v.length >= 6;
}

export default function EnterpriseLeadForm({
  open,
  loading = false,
  initialEmail = "",
  title = "填写企业信息后下载",
  submitText = "提交并继续",
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<EnterpriseLeadFormValue>({
    company: "",
    name: "",
    phone: "",
    email: initialEmail,
    title: "",
  });

  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setForm((prev) => ({
      ...prev,
      email: initialEmail || prev.email || "",
    }));
    setError(null);
  }, [open, initialEmail]);

  const canSubmit = useMemo(() => {
    return (
      form.company.trim().length > 0 &&
      form.name.trim().length > 0 &&
      isValidPhone(form.phone) &&
      isValidEmail(form.email)
    );
  }, [form]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-neutral-950 p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              请先填写企业信息，我们将为你生成本次下载记录，并继续企业版下载流程。
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            关闭
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <div className="mb-1.5 text-sm text-white/85">
              公司名称 <span className="text-red-400">*</span>
            </div>
            <input
              value={form.company}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, company: e.target.value }))
              }
              placeholder="如：上海某某科技有限公司"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/25 focus:bg-white/8"
            />
          </label>

          <label className="block">
            <div className="mb-1.5 text-sm text-white/85">
              联系人 <span className="text-red-400">*</span>
            </div>
            <input
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="如：张经理"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/25 focus:bg-white/8"
            />
          </label>

          <label className="block">
            <div className="mb-1.5 text-sm text-white/85">
              手机号 <span className="text-red-400">*</span>
            </div>
            <input
              value={form.phone}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="如：13800138000"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/25 focus:bg-white/8"
            />
          </label>

          <label className="block">
            <div className="mb-1.5 text-sm text-white/85">
              邮箱 <span className="text-red-400">*</span>
            </div>
            <input
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="如：name@company.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/25 focus:bg-white/8"
            />
          </label>

          <label className="block md:col-span-2">
            <div className="mb-1.5 text-sm text-white/85">职位</div>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="如：行政经理 / HRD / 采购负责人"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/25 focus:bg-white/8"
            />
          </label>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            取消
          </button>

          <button
            type="button"
            disabled={!canSubmit || loading}
            onClick={async () => {
              setError(null);

              if (!form.company.trim()) {
                setError("请填写公司名称。");
                return;
              }
              if (!form.name.trim()) {
                setError("请填写联系人。");
                return;
              }
              if (!isValidPhone(form.phone)) {
                setError("请输入有效手机号。");
                return;
              }
              if (!isValidEmail(form.email)) {
                setError("请输入有效邮箱。");
                return;
              }

              try {
                await onSubmit({
                  company: form.company.trim(),
                  name: form.name.trim(),
                  phone: normalizePhone(form.phone),
                  email: form.email.trim(),
                  title: form.title.trim(),
                });
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "提交失败，请稍后重试。"
                );
              }
            }}
            className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "提交中..." : submitText}
          </button>
        </div>
      </div>
    </div>
  );
}