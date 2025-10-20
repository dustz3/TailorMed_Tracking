# Netlify 部署指南

## 🎯 架構說明

本專案採用**前後端分離**架構：
- **前端**：靜態網站 → 部署到 **Netlify**
- **後端**：Node.js API → 部署到 **Render**

---

## 📋 Netlify 部署步驟

### 步驟 1：登入 Netlify

前往 [Netlify](https://app.netlify.com/) 並登入您的帳號

---

### 步驟 2：建立新網站

1. 點擊 **"Add new site"** → 選擇 **"Import an existing project"**

2. 選擇 **GitHub** 作為來源

3. 授權 Netlify 訪問您的 GitHub 帳號

4. 選擇 **`dustz3/TailorMed_Tracking`** repository

---

### 步驟 3：配置建置設定

| 設定項目 | 填入內容 |
|---------|---------|
| **Branch to deploy** | `main` |
| **Base directory** | ` ` (留空) |
| **Build command** | `cd src/Projects/TailorMed/track && npm install && npm run build` |
| **Publish directory** | `dist/Projects/TailorMed/track` |

⚠️ **重要**：確保路徑正確！

---

### 步驟 4：部署

點擊 **"Deploy site"** 按鈕

Netlify 會：
1. ⬇️ 從 GitHub 下載程式碼
2. 📦 執行編譯命令
3. 🚀 發布靜態網站

部署時間約 **1-3 分鐘**

---

### 步驟 5：更新 API 端點

部署成功後，Netlify 會給您一個網址，例如：
```
https://random-name-123.netlify.app
```

#### 方法 A：使用 Netlify 的環境變數（推薦）

如果您想要更靈活的配置，可以在 Netlify 設定環境變數：

1. 在 Netlify Dashboard → **Site settings** → **Environment variables**
2. 新增變數：
   ```
   API_URL = https://tailormed-tracking-api.onrender.com/api
   ```

然後修改 `config.js` 讀取環境變數（需要建置工具支援）

#### 方法 B：直接修改 config.js（簡單快速）

1. 編輯 `src/Projects/TailorMed/track/Javascript/config.js`
2. 將 Render 的 API URL 替換成實際的網址：
   ```javascript
   const API_BASE_URL = window.location.hostname === 'localhost' 
     ? 'http://localhost:3000/api'
     : 'https://你的Render服務名稱.onrender.com/api';  // 改這裡
   ```
3. 重新編譯並推送：
   ```bash
   npm run build
   git add .
   git commit -m "Update API endpoint"
   git push origin main
   ```

Netlify 會自動重新部署！

---

## 🎨 自訂網域（選用）

如果您有自己的網域：

1. 在 Netlify Dashboard → **Domain settings**
2. 點擊 **"Add custom domain"**
3. 輸入您的網域名稱（例如：`tracking.tailormed.com`）
4. 按照指示設定 DNS

Netlify 會自動提供免費的 HTTPS 憑證！

---

## 🔄 自動部署

當您推送新的程式碼到 GitHub 的 `main` 分支時，Netlify 會自動檢測並重新部署：

```bash
git add .
git commit -m "更新內容"
git push origin main
```

---

## 🧪 測試網站

部署完成後：

1. **前端網站**：`https://你的網站名稱.netlify.app`
2. **API 測試**：`https://你的Render服務名稱.onrender.com/api/tracking?orderNo=TM111682&trackingNo=GEXVC2YF`

---

## ⚙️ 常見問題

### 1. 部署失敗：找不到 dist 資料夾

**原因**：編譯命令未正確執行

**解決**：
- 確認 Build command 正確：`cd src/Projects/TailorMed/track && npm install && npm run build`
- 檢查 Publish directory 是否為：`dist/Projects/TailorMed/track`

---

### 2. 前端無法連接到 API

**原因**：API URL 未正確設定

**解決**：
1. 檢查 `Javascript/config.js` 中的 API URL
2. 確認 Render 的 API 服務正在運行
3. 檢查瀏覽器開發者工具的 Console 和 Network 標籤

---

### 3. CORS 錯誤

**原因**：Render API 未允許 Netlify 網域

**解決**：
在 Render 的 API `server.js` 中確認 CORS 設定：
```javascript
app.use(cors()); // 允許所有來源
```

或指定特定來源：
```javascript
app.use(cors({
  origin: ['https://你的網站名稱.netlify.app']
}));
```

---

## 📱 給客戶的最終網址

部署完成後，提供客戶：

```
https://你的網站名稱.netlify.app
```

客戶可以直接在瀏覽器輸入訂單號碼和追蹤號碼來查詢貨件！

---

## 🎉 完成！

現在您有：
- ✅ **Render**：運行 Node.js API 後端
- ✅ **Netlify**：提供漂亮的前端介面
- ✅ **GitHub**：程式碼版本控制
- ✅ **自動部署**：推送即部署

**專業的雲端部署架構完成！** 🚀









