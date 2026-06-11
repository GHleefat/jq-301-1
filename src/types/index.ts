export interface Item {
  id: string;
  name: string;
  width: number;
  height: number;
  color: string;
  category: "box" | "furniture";
}

export interface PlacedItem {
  id: string;
  itemId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
  name: string;
  color: string;
}

export interface TruckDimensions {
  width: number;
  height: number;
}

export type DragSource = "pending" | "secondTrip" | "canvas";

export interface DragPayload {
  source: DragSource;
  item?: Item;
  placedItem?: PlacedItem;
}
