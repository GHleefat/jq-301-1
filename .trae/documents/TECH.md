## 1. 架构设计

```mermaid
graph TD
    A["React 应用层"] --> B["状态管理 (Zustand)"]
    A --> C["UI 组件层"]
    C --> C1["ItemList 物品清单"]
    C --> C2["TruckCanvas 货箱画布"]
    C --> C3["StatsPanel 统计面板"]
    C --> C4["SecondTripList 第二趟清单"]
    B --> D["核心逻辑层"]
    D --> D1["碰撞检测"]
    D --> D2["空间计算"]
    D --> D3["物品操作 (旋转/移动)"]
```

## 2. 技术描述
- 前端：React@18 + TypeScript + Vite
- 样式：TailwindCSS@3
- 状态管理：Zustand
- 图标：Lucide React
- 后端：无（纯前端应用）
- 数据库：无（使用本地 mock 数据）

## 3. 路由定义
| 路由 | 用途 |
|------|------|
| / | 主页面 - 装箱模拟器 |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    ITEM {
        string id "物品ID"
        string name "物品名称"
        number width "宽度(cm)"
        number height "高度(cm)"
        string color "显示颜色"
        string category "分类 (box/furniture)"
    }
    
    PLACED_ITEM {
        string id "放置ID"
        string itemId "关联物品ID"
        number x "X坐标"
        number y "Y坐标"
        number width "当前宽度"
        number height "当前高度"
        boolean rotated "是否旋转"
    }
    
    TRUCK {
        number width "货箱宽度"
        number height "货箱高度"
    }
```

### 4.2 TypeScript 类型定义

```typescript
interface Item {
  id: string;
  name: string;
  width: number;
  height: number;
  color: string;
  category: 'box' | 'furniture';
}

interface PlacedItem {
  id: string;
  itemId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
}

interface TruckState {
  width: number;
  height: number;
  placedItems: PlacedItem[];
  pendingItems: Item[];
  secondTripItems: Item[];
  selectedId: string | null;
}
```

## 5. 核心算法

### 5.1 碰撞检测
- AABB 轴对齐包围盒检测：判断两个矩形是否重叠
- 边界检测：确保物品坐标在货箱范围内

### 5.2 空间计算
- 已用面积 = Σ(放置物品面积)
- 装载率 = 已用面积 / 货箱总面积 × 100%
- 剩余面积 = 货箱总面积 - 已用面积

### 5.3 物品旋转
- 90度旋转：交换 width 和 height，保持中心点不变或重新定位
