# TailorMed 貨件追蹤系統 API

## 📦 專案簡介

這是 TailorMed 的貨件追蹤系統後端 API，提供即時的貨件追蹤資訊，整合 Airtable 作為資料來源。

## 🏗️ 專案結構

```
api/
├── server.js              # Express 伺服器主程式
├── package.json           # 依賴套件配置
├── .env                   # 環境變數（不會被 git 追蹤）
├── .gitignore            # Git 忽略檔案清單
├── render.yaml           # Render 部署配置
├── standard.html         # 標準查詢頁面（完整版）
├── basic.html            # 基本查詢頁面（簡化版）
├── admin.html            # 管理員監控儀表板
├── config/
│   └── database.js       # Airtable 資料庫連接與查詢
├── routes/
│   └── tracking.js       # API 路由定義
└── models/
    └── Shipment.js       # 資料模型

dist/  # 前端靜態檔案
├── index.html            # 主頁面
├── tracking_ui.html      # 貨件追蹤介面
├── css/                  # 樣式表
├── js/                   # JavaScript
└── images/              # 圖片資源
```

## 🚀 快速開始

### 本地開發

1. **安裝依賴**
```bash
npm install
```

2. **設定環境變數**
創建 `.env` 檔案：
```env
AIRTABLE_API_KEY=你的_API_Key
AIRTABLE_BASE_ID=appznhirfyiLbdpJJ
AIRTABLE_SHIPMENTS_TABLE=Tracking
PORT=3000
```

3. **啟動伺服器**
```bash
npm start
```

4. **訪問測試頁面**
```
http://localhost:3000/standard  # 標準查詢頁面（完整版）
http://localhost:3000/basic     # 基本查詢頁面（簡化版）
http://localhost:3000/admin     # 管理員監控儀表板
```

## 📡 API 端點

### GET `/api/tracking`

查詢貨件追蹤資訊

**參數**:
- `orderNo` (required): 訂單號碼，例如 `TM111682`
- `trackingNo` (required): 追蹤號碼，例如 `GEXVC2YF`

**範例請求**:
```bash
GET /api/tracking?orderNo=TM111682&trackingNo=GEXVC2YF
```

**回應格式**:
```json
{
  "success": true,
  "data": {
    "id": "recr4mepKGexVC2YF",
    "orderNo": "TM111682",
    "trackingNo": "GEXVC2YF",
    "invoiceNo": "TM202509143",
    "mawb": "775-8834193",
    "origin": "TPE",
    "destination": "PVG",
    "packageCount": 1,
    "weight": 52,
    "eta": "06/10/2025 02:35",
    "status": "Out for Delivery",
    "lastUpdate": "11/10/2025 15:22",
    "timeline": [
      {
        "step": 1,
        "title": "Order Created",
        "time": "02/10/2025 15:26",
        "status": "completed"
      },
      ...
    ]
  }
}
```

## 🗄️ 資料來源

系統使用 **Airtable** 作為資料庫，連接至 `Tracking` 資料表。

### Airtable 欄位對應

| Airtable 欄位 | API 欄位 | 說明 |
|--------------|---------|------|
| `Job No.` | `orderNo` | 訂單號碼 |
| `Tracking No.` | `trackingNo` | 追蹤號碼 |
| `Invoice No.` | `invoiceNo` | 發票號碼 |
| `MAWB` | `mawb` | 主提單號 |
| `Origin/Destination` | `origin`, `destination` | 起訖地 |
| `Weight(KG)` | `weight` | 重量 |
| `ETA` | `eta` | 預計到達時間 |
| `Lastest Update` | `lastUpdate` | 最後更新時間 |
| `Order Created` | timeline[0] | 訂單建立時間 |
| `Shipment Collected` | timeline[1] | 貨物收取時間 |
| ... | ... | 其他時間軸步驟 |

## 🎨 時間軸狀態

每個步驟有三種狀態：
- `completed` ✅ - 已完成（綠色）
- `active` 🟡 - 進行中（黃色，顯示 "Processing..."）
- `pending` ⏳ - 待處理（灰色，顯示 "Pending"）

## 🔧 環境變數

| 變數名稱 | 說明 | 必填 |
|---------|------|------|
| `AIRTABLE_API_KEY` | Airtable Personal Access Token | ✅ |
| `AIRTABLE_BASE_ID` | Airtable Base ID | ✅ |
| `AIRTABLE_SHIPMENTS_TABLE` | 資料表名稱（預設: Tracking） | ✅ |
| `PORT` | 伺服器端口（預設: 3000） | ❌ |
| `NODE_ENV` | 環境模式（production/development） | ❌ |

## 📱 部署

詳細的部署說明請參考 [DEPLOY.md](./DEPLOY.md)

**快速部署到 Render**:
1. 推送程式碼到 GitHub
2. 在 Render 連接 repository
3. 設定環境變數
4. 點擊部署

## 🧪 測試資料

可以使用以下測試資料：

| Order No. | Tracking No. | 狀態 |
|-----------|-------------|------|
| TM111682 | GEXVC2YF | Out for Delivery |
| TM111595 | GF6J1JS1 | Export Released |
| TM111670 | DKRW3D7R | 各階段測試 |

## 🛠️ 技術棧

- **Backend**: Node.js + Express.js
- **Database**: Airtable
- **Frontend**: HTML + CSS + Vanilla JavaScript
- **Deployment**: Render

## 📄 授權

© 2025 TailorMed. All rights reserved.
