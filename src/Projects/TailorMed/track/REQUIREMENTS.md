# TailorMed 貨件追蹤系統需求文件

## 專案概述

### 專案名稱

TailorMed 貨件追蹤系統 (TailorMed Shipment Tracking System)

### 專案目標

建立一個現代化的貨件追蹤系統，提供即時、清晰的貨物運輸狀態追蹤功能，支援不同類型的運輸流程。

### 技術架構

- **前端框架**: HTML5 + CSS3 + JavaScript
- **模板引擎**: Pug
- **樣式預處理器**: Stylus
- **字型**: Noto Sans (Google Fonts)
- **部署平台**: Netlify
- **版本控制**: Git

---

## 功能需求

### 1. 時間軸追蹤系統 (Timeline Tracking System)

#### 1.1 支援的追蹤類型

- **DOMESTIC** (國內運輸) - 4 個節點
- **IMPORT/EXPORT** (進出口運輸) - 7 個節點 + 2 個事件
- **CROSS TRADE** (跨國貿易) - 10 個節點 (Origin:4 + Transit:2 + Destination:4)
- **ORDER COMPLETION** (訂單完成) - 3 個節點

#### 1.2 節點狀態系統

- **Completed** (已完成): 藍色圓圈 + 勾選圖標
- **Processing** (處理中): 藍色圓圈 + 卡車圖標 + Gradient Shine 動畫
- **In Transit** (運輸中): 藍色圓圈 + 運輸圖標 + Gradient Shine 動畫
- **Pending** (待處理): 灰色虛線圓圈，無圖標

#### 1.3 互動效果

- **節點 Hover 效果**: 圓圈放大 1.10 倍 + 陰影效果
- **完成狀態 Hover**: `:before` 從白色變為 `primary-color`，圖標從藍色變為白色
- **Processing/In Transit 狀態**: 文字有 Gradient Shine 動畫效果

### 2. 視覺設計系統

#### 2.1 顏色規範

- **Primary Color**: 主要藍色 (用於完成狀態、連接線)
- **Accent Color**: 輔助藍色 (用於漸層效果)
- **Neutral Colors**: 灰色系 (用於待處理狀態、文字)

#### 2.2 連接線樣式

- **DOMESTIC**: 漸層連接線 (`primary-color` → `accent-color`)
- **IMPORT/EXPORT**: 漸層連接線 (`primary-color` → `accent-color`)
- **CROSS TRADE**: 純色連接線 (`primary-color`)
- **ORDER COMPLETION**: 純色連接線 (`primary-color`)

#### 2.3 節點樣式

- **圓圈尺寸**: 40x40px
- **連接線高度**: 5px
- **日期字體**: 1.1rem, Title Case (如 "Oct 13")
- **狀態文字**: 0.9rem
- **時間文字**: 0.85rem
- **狀態區域寬度**: 110px

### 3. 動畫效果

#### 3.1 Gradient Shine 動畫

- **觸發條件**: Processing 和 In Transit 狀態
- **動畫效果**: 白色漸層從左到右掃過文字
- **動畫時長**: 2 秒循環
- **動畫範圍**: 僅限於狀態文字區域

#### 3.2 Hover 動畫

- **節點圓圈**: 縮放效果 + 陰影
- **過渡時間**: 0.3 秒
- **顏色變化**: 完成狀態的顏色反轉效果

### 4. 響應式設計

#### 4.1 桌面版本

- **最大寬度**: 1200px
- **間距**: 40px padding
- **字體大小**: 標準尺寸

#### 4.2 移動版本

- **媒體查詢**: `@media (max-width: 768px)`
- **字體縮放**: 相對縮小
- **間距調整**: 減少 padding

---

## 具體實現需求

### 1. 節點內容結構

#### 1.1 標準節點

```pug
.timeline-node.completed(data-step="1")
  .node-circle
  .node-date Oct 13
  .node-status
    .status-text Final Inspection
    .status-time 09:15
```

#### 1.2 Order Completion 特殊節點

```pug
.timeline-node.completed(data-step="3")
  .order-completion-container
  .node-date Oct 13
  .node-status
    .status-text Order Completed
    .status-time 14:45
```

### 2. 特殊組件需求

#### 2.1 Order Completion 容器

- **尺寸**: 55x40px
- **圓角**: 5px
- **背景**: `primary-color`
- **圖標**: TailorMed mark (36x24px, 原色)

#### 2.2 事件標籤 (Event Tags)

- **乾冰補充事件**: 垂直連接線 + 標籤文字
- **位置**: 時間軸下方
- **樣式**: 淺藍色背景 + 白色圖標

### 3. 狀態流程定義

#### 3.1 DOMESTIC 流程

1. Order Created (訂單建立)
2. Shipment Collected (貨件收取) - Processing 狀態
3. In Transit (運輸中) - Pending 狀態
4. Shipment Delivered (貨件送達) - Pending 狀態

#### 3.2 IMPORT/EXPORT 流程

1. Order Created (訂單建立)
2. Shipment Collected (貨件收取)
3. Origin Customs Process (起點海關處理)
4. In Transit (運輸中) - Processing 狀態
5. Destination Customs Process (目的地海關處理)
6. Out for Delivery (配送中)
7. Shipment Delivered (貨件送達)

#### 3.3 CROSS TRADE 流程

- **Origin 階段**: Cargo Ready → Port In → On Board → Departure Confirmed
- **Transit 階段**: In Transit Start → Arrival Notice Issued
- **Destination 階段**: Arrival Port → Customs Cleared → Delivery Out → POD

#### 3.4 ORDER COMPLETION 流程

1. Final Inspection (最終檢查)
2. Quality Approval (品質核准)
3. Order Completed (訂單完成) - 特殊容器顯示

---

## 技術實現細節

### 1. 檔案結構

```
src/Projects/TailorMed/track/
├── Templates/
│   ├── tracking_ui.pug (主頁面)
│   └── components/
│       └── timelineTrack.pug (時間軸組件)
├── Styles/
│   ├── main.styl (主樣式)
│   ├── variables.styl (變數定義)
│   └── components/
│       └── timelineTrack.styl (時間軸樣式)
├── Javascript/
│   ├── app.js (應用邏輯)
│   ├── config.js (配置檔案)
│   └── interaction.js (互動邏輯)
├── Assets/
│   ├── icon-check.svg (勾選圖標)
│   ├── icon-truck.svg (卡車圖標)
│   ├── icon-inTransit.svg (運輸圖標)
│   └── tailormed-mark.svg (品牌標誌)
└── compile.js (編譯腳本)
```

### 2. 編譯流程

- **Pug → HTML**: 模板編譯
- **Stylus → CSS**: 樣式編譯
- **資源複製**: 圖片和 JavaScript 檔案複製到 dist 目錄

### 3. 部署需求

- **靜態檔案服務**: 支援 HTML, CSS, JS, 圖片
- **路由設定**: SPA 路由支援 (Netlify \_redirects)
- **CDN**: 字型載入優化

---

## 效能需求

### 1. 載入效能

- **字型預載**: Google Fonts preconnect
- **圖片優化**: SVG 格式，適當尺寸
- **CSS 優化**: Stylus 編譯，移除未使用樣式

### 2. 互動效能

- **動畫流暢度**: 60fps 動畫效果
- **響應時間**: Hover 效果 < 100ms
- **記憶體使用**: 最小化 DOM 操作

### 3. 瀏覽器支援

- **現代瀏覽器**: Chrome, Firefox, Safari, Edge
- **CSS 支援**: Flexbox, CSS Grid, CSS Variables
- **JavaScript**: ES6+ 語法支援

---

## 維護需求

### 1. 程式碼品質

- **模組化設計**: 組件化架構
- **樣式分離**: 變數統一管理
- **註解完整**: 中文註解說明

### 2. 擴展性

- **新增時間軸類型**: 易於擴展新的追蹤流程
- **狀態系統**: 支援新增節點狀態
- **主題系統**: 支援顏色主題切換

### 3. 版本控制

- **Git 管理**: 功能分支開發
- **部署自動化**: Netlify 自動部署
- **回滾機制**: 快速回滾到穩定版本

---

## 驗收標準

### 1. 功能驗收

- [ ] 四種時間軸類型正常顯示
- [ ] 節點狀態正確切換
- [ ] 動畫效果流暢運行
- [ ] Hover 互動正常響應

### 2. 視覺驗收

- [ ] 顏色規範正確應用
- [ ] 字體大小符合設計
- [ ] 間距對齊準確
- [ ] 響應式設計正常

### 3. 效能驗收

- [ ] 頁面載入時間 < 3 秒
- [ ] 動畫幀率 ≥ 50fps
- [ ] 記憶體使用穩定
- [ ] 跨瀏覽器相容性

---

## 前期工作成果

### 2. 需求文件整理

基於客戶訪談結果，我們整理了完整的系統需求文件，包含：

#### 2.1 功能需求分析

- **核心功能識別**: 貨件追蹤系統需要支援四種不同的運輸流程類型
- **使用者故事**: 從客戶角度定義了完整的追蹤體驗需求
- **業務流程梳理**: 詳細分析了 DOMESTIC、IMPORT/EXPORT、CROSS TRADE、ORDER COMPLETION 四種流程
- **狀態定義**: 明確定義了 Completed、Processing、In Transit、Pending 四種節點狀態

#### 2.2 非功能性需求

- **效能要求**: 頁面載入時間 < 3 秒，動畫幀率 ≥ 50fps
- **可用性要求**: 支援現代瀏覽器，響應式設計
- **維護性要求**: 模組化設計，易於擴展新的追蹤流程

#### 2.3 需求優先級排序

- **高優先級**: 時間軸顯示、節點狀態切換、基本互動效果
- **中優先級**: 動畫效果、響應式設計、特殊節點樣式
- **低優先級**: 主題切換、進階互動功能

### 3. 技術可行性評估

#### 3.1 技術選型分析

- **前端框架**: 選擇 HTML5 + CSS3 + JavaScript 原生技術棧
  - **評估理由**: 輕量級、快速載入、易於維護、相容性佳
  - **替代方案**: React/Vue.js (考慮到專案規模，原生技術更適合)
- **模板引擎**: 採用 Pug

  - **評估理由**: 簡潔語法、組件化支援、編譯時優化
  - **效能優勢**: 預編譯模板，減少運行時處理

- **樣式預處理器**: 選擇 Stylus
  - **評估理由**: 簡潔語法、變數管理、嵌套支援
  - **維護優勢**: 統一的樣式變數管理，易於主題切換

#### 3.2 技術風險評估

- **瀏覽器相容性**: 低風險 - 使用標準 Web 技術
- **效能風險**: 低風險 - 輕量級實現，優化動畫效果
- **維護風險**: 低風險 - 清晰的代碼結構和文檔

#### 3.3 技術債務管理

- **代碼品質**: 建立統一的代碼規範和註解標準
- **文檔維護**: 完整的技術文檔和使用說明
- **版本控制**: Git 分支管理策略

### 4. 系統架構設計

#### 4.1 整體架構

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   使用者介面層    │    │   業務邏輯層     │    │   資料展示層     │
│   (UI Layer)    │    │ (Business Logic) │    │ (Presentation)  │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • 時間軸組件     │    │ • 狀態管理       │    │ • Timeline Track │
│ • 互動控制       │    │ • 動畫控制       │    │ • Node States    │
│ • 響應式佈局     │    │ • 事件處理       │    │ • Visual Effects │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### 4.2 組件架構設計

- **模組化設計**: 每個時間軸類型為獨立組件
- **狀態管理**: 統一的節點狀態系統
- **樣式系統**: 基於變數的主題系統
- **互動系統**: 分離的 JavaScript 互動邏輯

#### 4.3 資料流設計

- **靜態資料**: 時間軸配置和節點資訊
- **動態狀態**: 節點狀態和動畫效果
- **使用者互動**: Hover 效果和狀態切換

#### 4.4 擴展性設計

- **新增時間軸類型**: 通過配置檔案快速添加
- **狀態擴展**: 統一的狀態系統支援新狀態
- **主題系統**: 基於 CSS 變數的主題切換

### 5. 資料庫設計

#### 5.1 資料結構設計

由於此專案主要為前端展示系統，資料庫設計主要針對靜態配置資料：

```javascript
// 時間軸配置資料結構
const timelineConfigs = {
  domestic: {
    type: 'domestic',
    nodes: 4,
    steps: [
      { id: 1, name: 'Order Created', status: 'completed' },
      { id: 2, name: 'Shipment Collected', status: 'processing' },
      { id: 3, name: 'In Transit', status: 'pending' },
      { id: 4, name: 'Shipment Delivered', status: 'pending' },
    ],
  },
  importExport: {
    type: 'import_export',
    nodes: 7,
    events: 2,
    steps: [
      { id: 1, name: 'Order Created', status: 'completed' },
      { id: 2, name: 'Shipment Collected', status: 'completed' },
      { id: 3, name: 'Origin Customs Process', status: 'completed' },
      { id: 4, name: 'In Transit', status: 'in_transit' },
      { id: 5, name: 'Destination Customs Process', status: 'pending' },
      { id: 6, name: 'Out for Delivery', status: 'pending' },
      { id: 7, name: 'Shipment Delivered', status: 'pending' },
    ],
  },
  // ... 其他配置
};
```

#### 5.2 資料管理策略

- **靜態配置**: 時間軸結構和節點資訊
- **動態狀態**: 即時追蹤狀態更新
- **快取策略**: 本地儲存常用配置
- **版本控制**: 配置檔案版本管理

#### 5.3 資料驗證

- **結構驗證**: 確保時間軸配置完整性
- **狀態驗證**: 驗證節點狀態的有效性
- **一致性檢查**: 確保資料間的一致性

### 6. 介面設計規範

#### 6.1 視覺設計系統

- **色彩系統**:

  - Primary Color: 主要藍色 (#143463)
  - Accent Color: 輔助藍色 (#97d3df)
  - Neutral Colors: 灰色系 (#666, #999, #ccc)

- **字型系統**:

  - 主要字型: Noto Sans (Google Fonts)
  - 字重: 300, 400, 500, 600, 700
  - 字級: 0.85rem - 1.1rem

- **間距系統**:
  - 基礎單位: 8px
  - 常用間距: 10px, 16px, 24px, 32px, 40px

#### 6.2 組件設計規範

- **節點設計**:

  - 圓圈尺寸: 40x40px
  - 狀態指示: 顏色 + 圖標組合
  - 互動效果: 縮放 + 陰影

- **連接線設計**:

  - 線條高度: 5px
  - 漸層效果: 支援純色和漸層兩種模式
  - 動畫效果: 進度條動畫

- **文字設計**:
  - 日期格式: Title Case (Oct 13)
  - 狀態文字: 0.9rem
  - 時間文字: 0.85rem

#### 6.3 互動設計規範

- **Hover 效果**:

  - 節點圓圈: scale(1.10) + box-shadow
  - 過渡時間: 0.3s ease
  - 顏色變化: 完成狀態反轉效果

- **動畫效果**:
  - Gradient Shine: 2 秒循環，白色漸層掃過
  - 適用狀態: Processing, In Transit
  - 動畫範圍: 僅限狀態文字區域

#### 6.4 響應式設計規範

- **桌面版本**: 最大寬度 1200px，標準間距
- **平板版本**: 768px - 1024px，調整間距
- **手機版本**: < 768px，緊湊佈局

#### 6.5 無障礙設計規範

- **色彩對比**: 確保文字與背景有足夠對比度
- **鍵盤導航**: 支援 Tab 鍵導航
- **螢幕閱讀器**: 適當的 ARIA 標籤
- **動畫控制**: 支援使用者偏好設定

---

## 專案里程碑

### Phase 1: 基礎架構 ✅

- [x] 專案結構建立
- [x] 基礎樣式系統
- [x] 時間軸組件開發

### Phase 2: 核心功能 ✅

- [x] 四種時間軸類型實現
- [x] 節點狀態系統
- [x] 互動效果開發

### Phase 3: 優化完善 ✅

- [x] 動畫效果優化
- [x] 響應式設計
- [x] 效能優化

### Phase 4: 部署上線

- [ ] 生產環境部署
- [ ] 效能監控設定
- [ ] 使用者測試反饋

---

_文件版本: 1.0_  
_最後更新: 2025 年 1 月_  
_維護者: TailorMed 開發團隊_
