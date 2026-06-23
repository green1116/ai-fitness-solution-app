export function ProductionLoading({ message = "加载生产就绪数据…" }: { message?: string }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-zinc-800 bg-black/40">
      <p className="animate-pulse text-sm text-zinc-400">{message}</p>
    </div>
  );
}
