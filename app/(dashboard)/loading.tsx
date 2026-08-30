export default function DashboardLoading() {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-lg border border-zinc-800 bg-zinc-950 px-6 py-16"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-500" />
      <p className="text-sm font-medium text-zinc-200">正在加载控制台数据…</p>
      <p className="text-xs text-zinc-500">客户与运营页面可能需要数秒，请稍候</p>
    </div>
  );
}
