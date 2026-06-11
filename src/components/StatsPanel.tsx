import { PackageCheck, RotateCcw, Sparkles, TrendingUp } from "lucide-react";
import { usePackingStore, useLoadingStats } from "@/store/usePackingStore";
import { cn } from "@/lib/utils";

export default function StatsPanel() {
  const { reset, autoPackRemaining, pendingItems, placedItems } =
    usePackingStore();
  const { loadingRate, usedArea, totalArea, remainingArea } = useLoadingStats();

  const getRateColor = () => {
    if (loadingRate >= 80) return "text-emerald-400";
    if (loadingRate >= 50) return "text-brand-400";
    return "text-slate-300";
  };

  const getBarColor = () => {
    if (loadingRate >= 80) return "bg-emerald-500";
    if (loadingRate >= 50) return "bg-brand-500";
    return "bg-slate-500";
  };

  return (
    <div className="bg-slate-900/40 rounded-2xl border border-slate-700/60 p-4 space-y-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-slate-400 text-xs uppercase tracking-wider mb-1">
          <TrendingUp className="w-3.5 h-3.5" />
          装载率
        </div>
        <div
          className={cn(
            "text-5xl font-bold font-mono tabular-nums transition-colors",
            getRateColor()
          )}
        >
          {loadingRate.toFixed(1)}
          <span className="text-2xl">%</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>已用空间</span>
          <span className="font-mono">
            {usedArea.toLocaleString()} / {totalArea.toLocaleString()} cm²
          </span>
        </div>
        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              getBarColor()
            )}
            style={{ width: `${Math.min(loadingRate, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">剩余</span>
          <span className="text-slate-300 font-mono">
            {remainingArea.toLocaleString()} cm²
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60">
        <div className="bg-slate-800/40 rounded-lg p-2 text-center">
          <PackageCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <div className="text-lg font-semibold text-slate-100 font-mono">
            {placedItems.length}
          </div>
          <div className="text-[10px] text-slate-500">已装载</div>
        </div>
        <div className="bg-slate-800/40 rounded-lg p-2 text-center">
          <PackageCheck className="w-4 h-4 text-slate-500 mx-auto mb-1" />
          <div className="text-lg font-semibold text-slate-400 font-mono">
            {pendingItems.length}
          </div>
          <div className="text-[10px] text-slate-500">待装载</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2">
        <button
          onClick={autoPackRemaining}
          disabled={pendingItems.length === 0}
          className={cn(
            "flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
            "bg-brand-500/90 hover:bg-brand-500 text-white",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand-500/90"
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          自动装载
        </button>
        <button
          onClick={reset}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all bg-slate-700/60 hover:bg-slate-700 text-slate-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重置
        </button>
      </div>
    </div>
  );
}
