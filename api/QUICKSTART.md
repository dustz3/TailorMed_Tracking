# 🚀 TailorMed Tracking API - 快速開始

## 📋 步驟 1: 安裝依賴

```bash
cd src/Projects/TailorMed/track/api
npm install
```

## 📋 步驟 2: 選擇資料庫（開發階段可跳過）

### 目前狀態：使用 Mock Data
- ✅ 無需設定資料庫
- ✅ 自動讀取 `../data/mock-tracking.json`
- ✅ 適合前端開發和測試

### 未來切換到真實資料庫：

**選項 A: MySQL**
```bash
npm install mysql2
```

**選項 B: PostgreSQL**
```bash
npm install pg
```

**選項 C: MongoDB**
```bash
npm install mongoose
```

然後編輯 `config/database.js`，取消註解對應的資料庫設定。

## 📋 步驟 3: 啟動 API Server

```bash
# 開發模式（自動重啟）
npm run dev

# 或正常啟動
npm start
```

伺服器會在 **http://localhost:3000** 啟動

## 📋 步驟 4: 測試 API

### 瀏覽器測試
打開：http://localhost:3000/api/health

應該看到：
```json
{
  "status": "ok",
  "message": "TailorMed Tracking API is running"
}
```

### 查詢貨件測試
打開：http://localhost:3000/api/tracking?orderNo=TM439812&trackingNo=EX39DAF9

應該回傳完整的貨件資訊。

## 📋 步驟 5: 前端整合

### 方式 A: 修改現有的 app.js（簡單）

在 `Javascript/app.js` 中加入：
```javascript
async function searchShipment(orderNo, trackingNo) {
  const response = await fetch(`/api/tracking?orderNo=${orderNo}&trackingNo=${trackingNo}`);
  const result = await response.json();
  return result.data;
}
```

### 方式 B: 使用範例程式碼（完整）

參考 `api/frontend-integration-example.js`，這裡有：
- ✅ 完整的 API 呼叫
- ✅ 錯誤處理
- ✅ UI 更新函數
- ✅ 表單處理

## 🔄 開發流程

### 目前（開發階段）
```
前端表單 → JavaScript → API Server → Mock Data → 回傳資料 → 更新 UI
```

### 未來（上線後）
```
前端表單 → JavaScript → API Server → 資料庫 → 回傳資料 → 更新 UI
```

## 📝 資料結構說明

### API 請求
```javascript
GET /api/tracking?orderNo=TM439812&trackingNo=EX39DAF9
```

### API 回應
```json
{
  "success": true,
  "data": {
    "orderNo": "TM439812",
    "trackingNo": "EX39DAF9",
    "invoiceNo": "TM202507098",
    "mawb": "074-12345678",
    "status": "Out for Delivery",
    "eta": "2025-10-06 14:30 (local)",
    "timeline": [
      {
        "step": 1,
        "title": "Order Created",
        "time": "2025-10-01 09:30",
        "status": "completed"
      },
      ...
    ]
  }
}
```

## 🛠️ 下一步

1. **測試 Mock Data 模式**
   - 啟動 API server
   - 測試查詢功能
   - 確認資料格式正確

2. **準備資料庫**
   - 參考 `models/Shipment.js` 的資料表結構
   - 執行 CREATE TABLE SQL
   - 匯入測試資料

3. **切換到真實資料庫**
   - 修改 `config/database.js`
   - 設定 `.env` 環境變數
   - 測試資料庫連線

4. **部署**
   - 設定 production 環境變數
   - 使用 PM2 或 Docker 部署
   - 設定 HTTPS

## ⚠️ 注意事項

- `.env` 檔案包含敏感資訊，不要提交到 git
- 開發時使用 mock data，上線前切換到真實資料庫
- API 需要適當的錯誤處理和輸入驗證
- 考慮加入 rate limiting 防止濫用










