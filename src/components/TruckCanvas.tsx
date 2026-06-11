import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCw, Trash2, Truck } from "lucide-react";
import type { Item, PlacedItem } from "@/types";
import { usePackingStore } from "@/store/usePackingStore";
import { canPlace, snapToGrid } from "@/utils/collision";
import { cn } from "@/lib/utils";

interface GhostItem {
  x: number;
  y: number;
  width: number;
  height: number;
  valid: boolean;
  reason?: "collision" | "bounds";
  color: string;
  name: string;
}

export default function TruckCanvas() {
  const {
    truck,
    placedItems,
    pendingItems,
    secondTripItems,
    selectedId,
    errorMessage,
    setSelected,
    setErrorMessage,
    placeItem,
    movePlacedItem,
    rotatePlacedItem,
    removePlacedItem,
  } = usePackingStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [ghost, setGhost] = useState<GhostItem | null>(null);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggingPlacedId, setDraggingPlacedId] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: snapToGrid(clientX - rect.left),
      y: snapToGrid(clientY - rect.top),
    };
  }, []);

  const triggerShake = useCallback(() => {
    setShakeKey((k) => k + 1);
  }, []);

  const showError = useCallback(
    (msg: string) => {
      setErrorMessage(msg);
      triggerShake();
      setTimeout(() => setErrorMessage(null), 1500);
    },
    [setErrorMessage, triggerShake],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const data = e.dataTransfer.getData("application/json");
    if (!data) return;

    let item: Item | null = null;
    try {
      const parsed = JSON.parse(data);
      const list =
        parsed.source === "secondTrip" ? secondTripItems : pendingItems;
      item = list.find((i: Item) => i.id === parsed.itemId) ?? null;
    } catch {
      return;
    }

    if (!item) return;

    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    const width = item.width;
    const height = item.height;

    const result = canPlace(
      { x: x - width / 2, y: y - height / 2, width, height },
      placedItems,
      truck,
    );

    setGhost({
      x: x - width / 2,
      y: y - height / 2,
      width,
      height,
      valid: result.ok,
      reason: result.reason,
      color: item.color,
      name: item.name,
    });
  };

  const handleDragLeave = () => {
    setGhost(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    setGhost(null);

    if (!data) return;

    let item: Item | null = null;
    try {
      const parsed = JSON.parse(data);
      const list =
        parsed.source === "secondTrip" ? secondTripItems : pendingItems;
      item = list.find((i: Item) => i.id === parsed.itemId) ?? null;
    } catch {
      return;
    }

    if (!item) return;

    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    const result = placeItem(
      item,
      snapToGrid(x - item.width / 2),
      snapToGrid(y - item.height / 2),
      false,
    );

    if (!result.success) {
      showError(
        result.reason === "bounds"
          ? "⚠️ 物品超出货箱边界！"
          : "⚠️ 与其他物品发生碰撞！",
      );
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent, placed: PlacedItem) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelected(placed.id);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDraggingPlacedId(placed.id);
    setIsDraggingCanvas(true);
    setDragOffset({
      x: e.clientX - rect.left - placed.x,
      y: e.clientY - rect.top - placed.y,
    });
  };

  const handleCanvasMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingCanvas || !draggingPlacedId) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const placed = placedItems.find((p) => p.id === draggingPlacedId);
      if (!placed) return;

      const newX = snapToGrid(e.clientX - rect.left - dragOffset.x);
      const newY = snapToGrid(e.clientY - rect.top - dragOffset.y);

      const result = canPlace(
        { x: newX, y: newY, width: placed.width, height: placed.height },
        placedItems,
        truck,
        placed.id,
      );

      setGhost({
        x: newX,
        y: newY,
        width: placed.width,
        height: placed.height,
        valid: result.ok,
        reason: result.reason,
        color: placed.color,
        name: placed.name,
      });
    },
    [isDraggingCanvas, draggingPlacedId, dragOffset, placedItems, truck],
  );

  const handleCanvasMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingCanvas || !draggingPlacedId) {
        setGhost(null);
        return;
      }

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) {
        setIsDraggingCanvas(false);
        setDraggingPlacedId(null);
        setGhost(null);
        return;
      }

      const placed = placedItems.find((p) => p.id === draggingPlacedId);
      if (placed) {
        const newX = snapToGrid(e.clientX - rect.left - dragOffset.x);
        const newY = snapToGrid(e.clientY - rect.top - dragOffset.y);

        const result = movePlacedItem(draggingPlacedId, newX, newY);
        if (!result.success) {
          showError(
            result.reason === "bounds"
              ? "⚠️ 物品超出货箱边界！"
              : "⚠️ 与其他物品发生碰撞！",
          );
        }
      }

      setIsDraggingCanvas(false);
      setDraggingPlacedId(null);
      setGhost(null);
    },
    [
      isDraggingCanvas,
      draggingPlacedId,
      dragOffset,
      placedItems,
      movePlacedItem,
      showError,
    ],
  );

  useEffect(() => {
    if (isDraggingCanvas) {
      window.addEventListener("mousemove", handleCanvasMouseMove);
      window.addEventListener("mouseup", handleCanvasMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleCanvasMouseMove);
      window.removeEventListener("mouseup", handleCanvasMouseUp);
    };
  }, [isDraggingCanvas, handleCanvasMouseMove, handleCanvasMouseUp]);

  const handleRotate = (e: React.MouseEvent, placedId: string) => {
    e.stopPropagation();
    const result = rotatePlacedItem(placedId);
    if (!result.success) {
      showError(
        result.reason === "bounds"
          ? "⚠️ 旋转后超出货箱边界！"
          : "⚠️ 旋转后与其他物品碰撞！",
      );
    }
  };

  const handleDelete = (e: React.MouseEvent, placedId: string) => {
    e.stopPropagation();
    removePlacedItem(placedId);
  };

  const handleCanvasClick = () => {
    setSelected(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedId) return;
      if (e.key === "r" || e.key === "R") {
        const result = rotatePlacedItem(selectedId);
        if (!result.success) {
          showError(
            result.reason === "bounds"
              ? "⚠️ 旋转后超出货箱边界！"
              : "⚠️ 旋转后与其他物品碰撞！",
          );
        }
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        removePlacedItem(selectedId);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, rotatePlacedItem, removePlacedItem, showError]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-brand-400" />
          <h2 className="text-sm font-semibold text-slate-100">货箱空间</h2>
          <span className="text-xs font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
            {truck.width} × {truck.height} cm
          </span>
        </div>
        <div className="text-xs text-slate-500">
          按{" "}
          <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 text-[10px]">
            R
          </kbd>{" "}
          旋转
          <span className="mx-1">·</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 text-[10px]">
            Del
          </kbd>{" "}
          删除
        </div>
      </div>

      <div
        key={shakeKey}
        className={cn(
          "relative shrink-0 rounded-2xl border-2 border-slate-700/60 overflow-hidden flex items-start justify-center",
          shakeKey > 0 && "animate-shake",
        )}
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          boxShadow:
            "inset 0 0 60px rgba(0,0,0,0.4), 0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <div
          className="relative"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(71,85,105,0.15) 0px, rgba(71,85,105,0.15) 10px, transparent 10px, transparent 20px)",
            padding: "24px",
          }}
        >
          <div
            ref={canvasRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleCanvasClick}
            className="relative cursor-crosshair"
            style={{
              width: truck.width,
              height: truck.height,
              backgroundImage:
                "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              backgroundColor: "#0f172a",
              boxShadow:
                "inset 0 0 40px rgba(0,0,0,0.5), 0 0 0 2px rgba(249,115,22,0.3), 0 8px 32px rgba(0,0,0,0.4)",
              borderRadius: "4px",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

            {placedItems.map((placed) => {
              const isSelected = selectedId === placed.id;
              const isBeingDragged = draggingPlacedId === placed.id;
              return (
                <div
                  key={placed.id}
                  onMouseDown={(e) => handleCanvasMouseDown(e, placed)}
                  className={cn(
                    "absolute rounded-md cursor-move select-none transition-shadow",
                    "flex items-center justify-center",
                    isSelected &&
                      "ring-2 ring-brand-400 ring-offset-2 ring-offset-slate-900 z-20",
                    !isSelected && "hover:ring-2 hover:ring-white/30 z-10",
                    isBeingDragged && "opacity-20",
                  )}
                  style={{
                    left: placed.x,
                    top: placed.y,
                    width: placed.width,
                    height: placed.height,
                    backgroundColor: placed.color,
                    boxShadow: isSelected
                      ? `0 0 0 1px rgba(255,255,255,0.2), 0 8px 24px ${placed.color}60`
                      : `0 0 0 1px rgba(255,255,255,0.1), 0 4px 12px ${placed.color}40`,
                  }}
                >
                  <span className="text-xs font-medium text-white/95 text-center px-1 drop-shadow-sm">
                    {placed.name}
                  </span>

                  {isSelected && (
                    <div
                      className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-800 border border-slate-600 rounded-lg p-1 shadow-xl z-30"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => handleRotate(e, placed.id)}
                        className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="旋转 (R)"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, placed.id)}
                        className="p-1.5 rounded hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 transition-colors"
                        title="删除 (Del)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {ghost && (
              <div
                className={cn(
                  "absolute rounded-md pointer-events-none transition-all",
                  "flex items-center justify-center",
                  ghost.valid
                    ? "border-2 border-dashed border-emerald-400/80"
                    : "border-2 border-dashed border-rose-400/80",
                )}
                style={{
                  left: ghost.x,
                  top: ghost.y,
                  width: ghost.width,
                  height: ghost.height,
                  backgroundColor: ghost.valid
                    ? `${ghost.color}55`
                    : `${ghost.color}33`,
                  boxShadow: ghost.valid
                    ? `0 0 20px ${ghost.color}40`
                    : "0 0 20px rgba(244,63,94,0.3)",
                }}
              >
                <span
                  className={cn(
                    "text-xs font-medium",
                    ghost.valid ? "text-white" : "text-rose-200",
                  )}
                >
                  {ghost.name}
                </span>
              </div>
            )}

            {placedItems.length === 0 && !ghost && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 pointer-events-none">
                <Truck className="w-16 h-16 mb-3 opacity-30" />
                <p className="text-sm">将物品拖拽到此处</p>
                <p className="text-xs mt-1 opacity-60">
                  或点击「自动装载」快速装箱
                </p>
              </div>
            )}
          </div>

          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {ghost &&
              (ghost.x < 0 ||
                ghost.y < 0 ||
                ghost.x + ghost.width > truck.width ||
                ghost.y + ghost.height > truck.height) && (
                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                  <span className="text-xs text-slate-400 font-medium">
                    超出货箱范围
                  </span>
                </div>
              )}
          </div>
        </div>

        {errorMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-rose-900/90 border border-rose-500/50 text-rose-100 text-sm rounded-lg shadow-lg animate-fade-in z-50">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
