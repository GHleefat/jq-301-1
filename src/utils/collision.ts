import type { PlacedItem, TruckDimensions } from "@/types";

export function checkCollision(
  item: { x: number; y: number; width: number; height: number },
  placedItems: PlacedItem[],
  excludeId?: string
): boolean {
  for (const placed of placedItems) {
    if (excludeId && placed.id === excludeId) continue;
    if (
      item.x < placed.x + placed.width &&
      item.x + item.width > placed.x &&
      item.y < placed.y + placed.height &&
      item.y + item.height > placed.y
    ) {
      return true;
    }
  }
  return false;
}

export function checkBounds(
  item: { x: number; y: number; width: number; height: number },
  truck: TruckDimensions
): boolean {
  return (
    item.x >= 0 &&
    item.y >= 0 &&
    item.x + item.width <= truck.width &&
    item.y + item.height <= truck.height
  );
}

export function canPlace(
  item: { x: number; y: number; width: number; height: number },
  placedItems: PlacedItem[],
  truck: TruckDimensions,
  excludeId?: string
): { ok: boolean; reason?: "collision" | "bounds" } {
  if (!checkBounds(item, truck)) {
    return { ok: false, reason: "bounds" };
  }
  if (checkCollision(item, placedItems, excludeId)) {
    return { ok: false, reason: "collision" };
  }
  return { ok: true };
}

export function snapToGrid(value: number, gridSize: number = 10): number {
  return Math.round(value / gridSize) * gridSize;
}
