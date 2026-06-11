import { Package, Sofa } from "lucide-react";
import type { Item } from "@/types";
import { usePackingStore } from "@/store/usePackingStore";
import { cn } from "@/lib/utils";

interface ItemCardProps {
  item: Item;
  source: "pending" | "secondTrip";
}

function ItemCard({ item, source }: ItemCardProps) {
  const scale = Math.min(60 / Math.max(item.width, item.height), 1);
  const displayWidth = item.width * scale;
  const displayHeight = item.height * scale;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ source, itemId: item.id }),
    );
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg border cursor-grab active:cursor-grabbing",
        "bg-slate-800/60 border-slate-700 hover:border-brand-500/60",
        "hover:bg-slate-800 transition-all duration-200 animate-fade-in",
      )}
    >
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: 72, height: 56 }}
      >
        <div
          className="rounded shadow-md flex items-center justify-center transition-transform group-hover:scale-105"
          style={{
            width: displayWidth,
            height: displayHeight,
            backgroundColor: item.color,
            boxShadow: `0 0 0 1px rgba(255,255,255,0.1), 0 2px 8px ${item.color}40`,
          }}
        >
          {item.category === "furniture" ? (
            <Sofa className="w-4 h-4 text-white/90" />
          ) : (
            <Package className="w-4 h-4 text-white/90" />
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-100 truncate">
          {item.name}
        </div>
        <div className="text-xs text-slate-400 font-mono mt-0.5">
          {item.width} × {item.height} cm
        </div>
      </div>
    </div>
  );
}

export default function ItemList() {
  const { pendingItems } = usePackingStore();

  return (
    <div className="h-full min-h-0 flex flex-col bg-slate-900/40 rounded-2xl border border-slate-700/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/60 bg-slate-800/40">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-400" />
            物品清单
          </h2>
          <span className="text-xs font-mono text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded">
            {pendingItems.length}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">拖拽物品到货箱中</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-3 space-y-2">
        {pendingItems.length === 0 ? (
          <div className="text-center text-sm text-slate-500 py-8">
            所有物品已装载 ✨
          </div>
        ) : (
          pendingItems.map((item) => (
            <ItemCard key={item.id} item={item} source="pending" />
          ))
        )}
      </div>
    </div>
  );
}
