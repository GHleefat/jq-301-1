import type { Item, TruckDimensions } from "@/types";

export const TRUCK_DIMENSIONS: TruckDimensions = {
  width: 600,
  height: 400,
};

export const MOCK_ITEMS: Item[] = [
  { id: "box-1", name: "大纸箱", width: 80, height: 80, color: "#F97316", category: "box" },
  { id: "box-2", name: "大纸箱", width: 80, height: 80, color: "#FB923C", category: "box" },
  { id: "box-3", name: "中纸箱", width: 60, height: 60, color: "#FDBA74", category: "box" },
  { id: "box-4", name: "中纸箱", width: 60, height: 60, color: "#F59E0B", category: "box" },
  { id: "box-5", name: "中纸箱", width: 60, height: 60, color: "#FCD34D", category: "box" },
  { id: "box-6", name: "小纸箱", width: 40, height: 40, color: "#A78BFA", category: "box" },
  { id: "box-7", name: "小纸箱", width: 40, height: 40, color: "#8B5CF6", category: "box" },
  { id: "box-8", name: "小纸箱", width: 40, height: 40, color: "#C084FC", category: "box" },
  { id: "box-9", name: "小纸箱", width: 40, height: 40, color: "#A78BFA", category: "box" },
  { id: "fur-1", name: "沙发", width: 180, height: 80, color: "#10B981", category: "furniture" },
  { id: "fur-2", name: "餐桌", width: 140, height: 80, color: "#14B8A6", category: "furniture" },
  { id: "fur-3", name: "书桌", width: 120, height: 60, color: "#06B6D4", category: "furniture" },
  { id: "fur-4", name: "单人椅", width: 50, height: 50, color: "#0EA5E9", category: "furniture" },
  { id: "fur-5", name: "单人椅", width: 50, height: 50, color: "#3B82F6", category: "furniture" },
  { id: "fur-6", name: "床头柜", width: 50, height: 45, color: "#6366F1", category: "furniture" },
  { id: "fur-7", name: "电视柜", width: 160, height: 50, color: "#EC4899", category: "furniture" },
  { id: "fur-8", name: "衣柜", width: 120, height: 180, color: "#F43F5E", category: "furniture" },
];
