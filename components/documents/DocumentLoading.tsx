export function DocumentLoading({ message = "加载文档中心…" }: { message?: string }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-zinc-800 bg-black/40">
      <p className="animate-pulse text-sm text-zinc-400">{message}</p>
    </div>
  );
}
