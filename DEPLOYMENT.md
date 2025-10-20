# TailorMed 貨件追蹤系統 - 部署指南

## 🌐 部署架構

- **前端**: Netlify (靜態網站)
- **後端**: Render (Node.js API)
- **網址**:
  - 前端: `https://track.tailormed-intl.com`
  - 後端: `https://tailormed-tracking-api.onrender.com`

## 📋 部署步驟

### 1. 後端部署 (Render)

1. 前往 [Render Dashboard](https://dashboard.render.com)
2. 點擊 "New +" → "Web Service"
3. 連接 GitHub 儲存庫
4. 選擇 `src/Projects/TailorMed/track/backend` 資料夾
5. 設定：
   - **Name**: `tailormed-tracking-api`
   - **Region**: `Singapore`
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. 環境變數設定：
   - `NODE_ENV`: `production`
   - `USE_MOCK_DATA`: `true`
7. 點擊 "Create Web Service"

### 2. 前端部署 (Netlify)

1. 前往 [Netlify Dashboard](https://app.netlify.com)
2. 點擊 "New site from Git"
3. 連接 GitHub 儲存庫
4. 設定：
   - **Base directory**: `dist`
   - **Build command**: (留空)
   - **Publish directory**: `dist`
5. 點擊 "Deploy site"

### 3. 自訂網址設定

#### Netlify 自訂網址

1. 在 Netlify 專案設定中
2. 前往 "Domain management"
3. 添加自訂網址: `track.tailormed-intl.com`
4. 設定 DNS 記錄指向 Netlify

#### Render 自訂網址

1. 在 Render 專案設定中
2. 前往 "Settings" → "Custom Domains"
3. 添加自訂網址: `api.track.tailormed-intl.com`

## 🔧 測試部署

### 測試網址

- 主頁: `https://track.tailormed-intl.com/`
- 設計頁面: `https://track.tailormed-intl.com/design`
- 基本版本: `https://track.tailormed-intl.com/basic`
- 標準版本: `https://track.tailormed-intl.com/standard`
- API 端點: `https://track.tailormed-intl.com/api/tracking`

### 測試資料

- **Order No.**: `TM439812`
- **Tracking No.**: `EX39DAF9`

## 📁 檔案結構

```
dist/                          # Netlify 部署目錄
├── index.html                 # 主頁
├── _redirects                # Netlify 重定向規則
├── netlify.toml              # Netlify 配置
├── css/                      # 樣式檔案
├── js/                       # JavaScript 檔案
├── images/                   # 圖片檔案
└── Projects/TailorMed/track/
    └── design_ui.html        # 設計頁面

src/Projects/TailorMed/track/backend/  # Render 部署目錄
├── server.js                 # 主程式
├── render.yaml              # Render 配置
├── package.json             # 依賴管理
└── data/
    └── mock-tracking.json   # Mock 資料
```

## 🚀 自動部署

### GitHub Actions (可選)

可以設定 GitHub Actions 自動部署：

- 推送到 `main` 分支時自動部署
- 前端自動部署到 Netlify
- 後端自動部署到 Render

## 🔍 監控和維護

### 後端監控

- Render Dashboard 查看服務狀態
- 查看 API 請求日誌
- 監控記憶體和 CPU 使用率

### 前端監控

- Netlify Dashboard 查看部署狀態
- 查看網站流量統計
- 監控網站效能

## 📞 客戶測試

### 提供給客戶的資訊

1. **主要網址**: `https://track.tailormed-intl.com/`
2. **測試資料**: Order No. `TM439812`, Tracking No. `EX39DAF9`
3. **功能說明**: 貨件追蹤系統測試版本
4. **回饋管道**: 提供聯絡方式收集客戶意見

## 🔄 更新流程

1. 修改程式碼
2. 推送到 GitHub
3. 自動部署到 Netlify 和 Render
4. 通知客戶測試新功能
