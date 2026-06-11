import { create } from "zustand";
import type { Item, PlacedItem, TruckDimensions } from "@/types";
import { MOCK_ITEMS, TRUCK_DIMENSIONS } from "@/data/mockItems";
import { canPlace } from "@/utils/collision";

interface PackingState {
  truck: TruckDimensions;
  pendingItems: Item[];
  secondTripItems: Item[];
  placedItems: PlacedItem[];
  selectedId: string | null;
  errorMessage: string | null;

  setSelected: (id: string | null) => void;
  setErrorMessage: (msg: string | null) => void;

  placeItem: (
    item: Item,
    x: number,
    y: number,
    rotated: boolean
  ) => { success: boolean; reason?: "collision" | "bounds" };

  movePlacedItem: (
    placedId: string,
    x: number,
    y: number
  ) => { success: boolean; reason?: "collision" | "bounds" };

  rotatePlacedItem: (
    placedId: string
  ) => { success: boolean; reason?: "collision" | "bounds" };

  removePlacedItem: (placedId: string) => void;

  sendToSecondTrip: (item: Item) => void;

  reset: () => void;

  autoPackRemaining: () => void;
}

function generatePlacedId(): string {
  return `placed-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const usePackingStore = create<PackingState>((set, get) => ({
  truck: TRUCK_DIMENSIONS,
  pendingItems: [...MOCK_ITEMS],
  secondTripItems: [],
  placedItems: [],
  selectedId: null,
  errorMessage: null,

  setSelected: (id) => set({ selectedId: id }),
  setErrorMessage: (msg) => set({ errorMessage: msg }),

  placeItem: (item, x, y, rotated) => {
    const state = get();
    const width = rotated ? item.height : item.width;
    const height = rotated ? item.width : item.height;

    const result = canPlace(
      { x, y, width, height },
      state.placedItems,
      state.truck
    );

    if (!result.ok) {
      return { success: false, reason: result.reason };
    }

    const placedItem: PlacedItem = {
      id: generatePlacedId(),
      itemId: item.id,
      x,
      y,
      width,
      height,
      rotated,
      name: item.name,
      color: item.color,
    };

    const isFromPending = state.pendingItems.some((i) => i.id === item.id);
    set({
      placedItems: [...state.placedItems, placedItem],
      pendingItems: isFromPending
        ? state.pendingItems.filter((i) => i.id !== item.id)
        : state.pendingItems,
      secondTripItems: !isFromPending
        ? state.secondTripItems.filter((i) => i.id !== item.id)
        : state.secondTripItems,
      selectedId: placedItem.id,
      errorMessage: null,
    });

    return { success: true };
  },

  movePlacedItem: (placedId, x, y) => {
    const state = get();
    const placed = state.placedItems.find((p) => p.id === placedId);
    if (!placed) return { success: false };

    const result = canPlace(
      { x, y, width: placed.width, height: placed.height },
      state.placedItems,
      state.truck,
      placedId
    );

    if (!result.ok) {
      return { success: false, reason: result.reason };
    }

    set({
      placedItems: state.placedItems.map((p) =>
        p.id === placedId ? { ...p, x, y } : p
      ),
      errorMessage: null,
    });

    return { success: true };
  },

  rotatePlacedItem: (placedId) => {
    const state = get();
    const placed = state.placedItems.find((p) => p.id === placedId);
    if (!placed) return { success: false };

    const newWidth = placed.height;
    const newHeight = placed.width;

    const result = canPlace(
      { x: placed.x, y: placed.y, width: newWidth, height: newHeight },
      state.placedItems,
      state.truck,
      placedId
    );

    if (!result.ok) {
      return { success: false, reason: result.reason };
    }

    set({
      placedItems: state.placedItems.map((p) =>
        p.id === placedId
          ? {
              ...p,
              width: newWidth,
              height: newHeight,
              rotated: !p.rotated,
            }
          : p
      ),
      errorMessage: null,
    });

    return { success: true };
  },

  removePlacedItem: (placedId) => {
    const state = get();
    const placed = state.placedItems.find((p) => p.id === placedId);
    if (!placed) return;

    const originalItem = MOCK_ITEMS.find((i) => i.id === placed.itemId);
    const isInSecondTrip = state.secondTripItems.some(
      (i) => i.id === placed.itemId
    );
    const isInPending = state.pendingItems.some((i) => i.id === placed.itemId);

    set({
      placedItems: state.placedItems.filter((p) => p.id !== placedId),
      pendingItems:
        !isInPending && !isInSecondTrip && originalItem
          ? [...state.pendingItems, originalItem]
          : state.pendingItems,
      selectedId: state.selectedId === placedId ? null : state.selectedId,
    });
  },

  sendToSecondTrip: (item) => {
    const state = get();
    set({
      pendingItems: state.pendingItems.filter((i) => i.id !== item.id),
      secondTripItems: state.secondTripItems.some((i) => i.id === item.id)
        ? state.secondTripItems
        : [...state.secondTripItems, item],
    });
  },

  reset: () => {
    set({
      placedItems: [],
      pendingItems: [...MOCK_ITEMS],
      secondTripItems: [],
      selectedId: null,
      errorMessage: null,
    });
  },

  autoPackRemaining: () => {
    const state = get();
    const remaining = [...state.pendingItems].sort(
      (a, b) => b.width * b.height - a.width * a.height
    );

    const tryPlaceItem = (item: Item, rotated: boolean): boolean => {
      const cur = get();
      const w = rotated ? item.height : item.width;
      const h = rotated ? item.width : item.height;

      for (let y = 0; y <= cur.truck.height - h; y += 10) {
        for (let x = 0; x <= cur.truck.width - w; x += 10) {
          const r = get().placeItem(item, x, y, rotated);
          if (r.success) {
            return true;
          }
        }
      }
      return false;
    };

    for (const item of remaining) {
      let placed = false;

      if (item.height > item.width) {
        placed = tryPlaceItem(item, true);
        if (!placed) placed = tryPlaceItem(item, false);
      } else {
        placed = tryPlaceItem(item, false);
        if (!placed) placed = tryPlaceItem(item, true);
      }

      if (!placed) {
        get().sendToSecondTrip(item);
      }
    }
  },
}));

export function useLoadingStats() {
  const { truck, placedItems } = usePackingStore();
  const totalArea = truck.width * truck.height;
  const usedArea = placedItems.reduce(
    (sum, p) => sum + p.width * p.height,
    0
  );
  const loadingRate = totalArea > 0 ? (usedArea / totalArea) * 100 : 0;
  const remainingArea = totalArea - usedArea;
  return { totalArea, usedArea, remainingArea, loadingRate };
}
