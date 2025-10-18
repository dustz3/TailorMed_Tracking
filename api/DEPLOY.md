# TailorMed Tracking API - Render 部署指南

## 📋 部署前準備

### 1. 確保所有檔案已準備好
- ✅ `server.js` - 主程式
- ✅ `package.json` - 依賴套件
- ✅ `.gitignore` - 排除敏感檔案
- ✅ `render.yaml` - Render 配置（選用）

### 2. 準備 Git Repository
如果還沒有 Git repository，請執行：

```bash
cd C:\Users\Aries\Develop\Website_Wireframe\src\Projects\TailorMed\track\api
git init
git add .
git commit -m "Initial commit for Render deployment"
```

---

## 🚀 Render 部署步驟

### 方法 1：透過 GitHub/GitLab（推薦）

#### Step 1: 推送到 GitHub
```bash
# 創建新的 GitHub repository，然後執行：
git remote add origin https://github.com/你的帳號/tailormed-tracking.git
git branch -M main
git push -u origin main
```

#### Step 2: 在 Render 創建 Web Service
1. 登入 [Render Dashboard](https://dashboard.render.com/)
2. 點擊 **"New +"** → 選擇 **"Web Service"**
3. 連接您的 GitHub repository
4. 選擇 `tailormed-tracking` repository

#### Step 3: 配置服務
填寫以下資訊：
- **Name**: `tailormed-tracking-api`
- **Region**: `Singapore` (或選擇離客戶最近的區域)
- **Branch**: `main`
- **Root Directory**: `src/Projects/TailorMed/track/api`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: `Free`

#### Step 4: 設定環境變數
在 **Environment** 區域，新增以下環境變數：

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `AIRTABLE_API_KEY` | `您的 Airtable API Key` |
| `AIRTABLE_BASE_ID` | `appznhirfyiLbdpJJ` |
| `AIRTABLE_SHIPMENTS_TABLE` | `Tracking` |

⚠️ **重要**: 點擊每個環境變數旁的 🔒 圖示來隱藏敏感資訊

#### Step 5: 部署
點擊 **"Create Web Service"**，Render 會自動：
1. 下載您的程式碼
2. 執行 `npm install`
3. 啟動服務

---

### 方法 2：直接從本地部署（快速測試）

如果不想使用 Git，可以使用 Render 的手動部署：

1. 將整個 `api` 資料夾壓縮成 `.zip`
2. 在 Render Dashboard 使用 **"Deploy from GitHub"** 的替代方案
3. 上傳 zip 檔案

---

## 🔍 部署後測試

部署完成後，Render 會提供一個網址，例如：
```
https://tailormed-tracking-api.onrender.com
```

### 測試 API
```bash
# 測試 API 是否正常
curl "https://tailormed-tracking-api.onrender.com/api/tracking?orderNo=TM111682&trackingNo=GEXVC2YF"
```

### 測試前端頁面
在瀏覽器訪問：
```
https://tailormed-tracking-api.onrender.com/test
```

---

## 📱 給客戶的測試網址

部署成功後，提供客戶以下網址：

**測試頁面**:
```
https://tailormed-tracking-api.onrender.com/test
```

**API 文檔**:
```
GET https://tailormed-tracking-api.onrender.com/api/tracking
參數:
  - orderNo: 訂單號碼 (例如: TM111682)
  - trackingNo: 追蹤號碼 (例如: GEXVC2YF)
```

---

## ⚙️ 常見問題

### 1. 部署失敗
- 檢查 Build Logs
- 確認 `package.json` 中的 `start` script 正確
- 確認環境變數都已設定

### 2. API 無法連接 Airtable
- 檢查環境變數是否正確設定
- 確認 `AIRTABLE_API_KEY` 有效
- 確認 `AIRTABLE_BASE_ID` 正確

### 3. 靜態檔案找不到
- 確認 `dist` 資料夾已包含在 repository 中
- 檢查 `server.js` 中的路徑是否正確

### 4. 服務休眠（Free Plan）
Render Free Plan 的服務會在 15 分鐘無活動後休眠：
- 首次訪問會需要 30-60 秒啟動
- 可以升級到付費方案避免休眠

---

## 🔄 更新部署

當您更新程式碼後：

```bash
git add .
git commit -m "Update tracking logic"
git push origin main
```

Render 會自動檢測變更並重新部署。

---

## 📊 監控服務

在 Render Dashboard 可以查看：
- 📈 **Metrics**: CPU、記憶體使用率
- 📋 **Logs**: 即時日誌
- 🔔 **Alerts**: 設定通知

---

## 🆘 需要協助？

如有問題，請檢查：
1. Render 的 Logs 頁面
2. 本地測試是否正常
3. 環境變數是否正確設定

---

**準備好了嗎？開始部署吧！** 🚀









