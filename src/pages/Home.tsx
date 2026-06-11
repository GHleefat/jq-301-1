import { Truck, Package } from "lucide-react";
import ItemList from "@/components/ItemList";
import TruckCanvas from "@/components/TruckCanvas";
import StatsPanel from "@/components/StatsPanel";
import SecondTripList from "@/components/SecondTripList";

export default function Home() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="shrink-0 border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-sm z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
                <Truck className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                搬家装箱助手
              </h1>
              <p className="text-xs text-slate-400">合理规划空间，节省运费</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
              <Package className="w-3.5 h-3.5" />
              <span>拖拽 · 旋转 · 最优装载</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 max-w-[1600px] w-full mx-auto px-6 py-3 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 h-full min-h-0">
          <aside className="col-span-3 min-h-0 h-full flex flex-col overflow-hidden">
            <ItemList />
          </aside>

          <section className="col-span-6 min-h-0 h-full flex flex-col items-start overflow-hidden">
            <TruckCanvas />
          </section>

          <aside className="col-span-3 min-h-0 h-full flex flex-col gap-3 overflow-hidden">
            <div className="shrink-0">
              <StatsPanel />
            </div>
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <SecondTripList />
            </div>
          </aside>
        </div>
      </main>

      <footer className="shrink-0 border-t border-slate-800/60 py-2">
        <div className="max-w-[1600px] mx-auto px-6 text-center text-xs text-slate-500">
          💡 提示：选中物品后按 R 键旋转 · Del 键删除 · 拖拽物品自由摆放
        </div>
      </footer>
    </div>
  );
}
