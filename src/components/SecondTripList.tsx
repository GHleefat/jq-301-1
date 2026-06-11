import { AlertTriangle, Package, Truck } from "lucide-react";
import type { Item } from "@/types";
import { usePackingStore } from "@/store/usePackingStore";
import { cn } from "@/lib/utils";

function SecondTripCard({ item }: { item: Item }) {
  const scale = Math.min(50 / Math.max(item.width, item.height), 1);
  const displayWidth = item.width * scale;
  const displayHeight = item.height * scale;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ source: "secondTrip", itemId: item.id }),
    );
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "group flex items-center gap-2.5 p-2 rounded-lg border cursor-grab active:cursor-grabbing",
        "bg-rose-950/30 border-rose-900/40 hover:border-rose-500/50",
        "hover:bg-rose-950/50 transition-all duration-200 animate-fade-in",
      )}
    >
      <div
        className="relative flex items-center justify-center shrink-0 rounded bg-slate-900/40"
        style={{ width: 56, height: 44 }}
      >
        <div
          className="rounded shadow-sm"
          style={{
            width: displayWidth,
            height: displayHeight,
            backgroundColor: item.color,
            opacity: 0.85,
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-rose-200 truncate">
          {item.name}
        </div>
        <div className="text-[10px] text-rose-400/70 font-mono mt-0.5">
          {item.width} × {item.height}
        </div>
      </div>
    </div>
  );
}

export default function SecondTripList() {
  const { secondTripItems, sendToSecondTrip, pendingItems } = usePackingStore();

  const handleSendAll = () => {
    const items = [...pendingItems];
    items.forEach((item) => sendToSecondTrip(item));
  };

  return (
    <div className="h-full min-h-0 flex flex-col bg-slate-900/40 rounded-2xl border border-rose-900/30 overflow-hidden">
      <div className="px-4 py-3 border-b border-rose-900/30 bg-rose-950/20">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-rose-200 flex items-center gap-2">
            <Truck className="w-4 h-4" />
            第二趟清单
          </h2>
          <span className="text-xs font-mono text-rose-300 bg-rose-900/40 px-2 py-0.5 rounded">
            {secondTripItems.length}
          </span>
        </div>
        <p className="text-xs text-rose-400/70 mt-1 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          装不下的物品放这里
        </p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-3 space-y-2">
        {secondTripItems.length === 0 ? (
          <div className="text-center text-sm text-slate-500 py-8 flex flex-col items-center gap-2">
            <Package className="w-8 h-8 text-slate-600" />
            <div>暂无第二趟物品</div>
          </div>
        ) : (
          secondTripItems.map((item) => (
            <SecondTripCard key={item.id} item={item} />
          ))
        )}
      </div>
      {pendingItems.length > 0 && (
        <div className="p-3 border-t border-rose-900/30">
          <button
            onClick={handleSendAll}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all bg-rose-900/40 hover:bg-rose-900/60 text-rose-200"
          >
            <Truck className="w-3.5 h-3.5" />
            全部放入第二趟 ({pendingItems.length})
          </button>
        </div>
      )}
    </div>
  );
}
