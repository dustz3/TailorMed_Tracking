# TailorMed 貨件追蹤系統 - 自有伺服器部署指南

## 📋 部署架構

將前端和後端整合到單一伺服器：`track.tailormed-intl.com`

```
track.tailormed-intl.com
├── /                    → index.html (Under Construction)
├── /tracking_ui.html    → 完整追蹤介面
├── /test                → API 測試頁面
└── /api/tracking        → API 端點
```

---

## 🚀 部署步驟

### 1. 伺服器環境準備

```bash
# 安裝 Node.js (18+ 或更新版本)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安裝 PM2 (用於保持應用程式運行)
sudo npm install -g pm2
```

---

### 2. 上傳檔案

將以下檔案上傳到伺服器的 `/var/www/track.tailormed-intl.com/` 目錄：

```
/var/www/track.tailormed-intl.com/
├── api/
│   ├── server.js
│   ├── routes/
│   │   └── tracking.js
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   └── Shipment.js
│   ├── standard.html
│   ├── basic.html
│   ├── admin.html
│   ├── logo.png
│   └── package.json
├── dist/                    ← 編譯後的前端檔案
│   ├── index.html
│   ├── tracking_ui.html
│   ├── css/
│   │   ├── main.css
│   │   └── variables.css
│   ├── js/
│   │   ├── app.js
│   │   ├── config.js
│   │   └── interaction.js
│   ├── images/
│   │   └── logo.png
│   └── data/
└── .env                     ← 環境變數設定
```

---

### 3. 設定環境變數

建立 `/var/www/track.tailormed-intl.com/.env` 檔案：

```env
# Airtable 設定
AIRTABLE_API_KEY=你的_Airtable_API_Key
AIRTABLE_BASE_ID=你的_Base_ID
AIRTABLE_SHIPMENTS_TABLE=Tracking

# 伺服器設定
PORT=3000
NODE_ENV=production

# 靜態檔案路徑（絕對路徑）
STATIC_PATH=/var/www/track.tailormed-intl.com/dist
```

---

### 4. 安裝依賴套件

```bash
cd /var/www/track.tailormed-intl.com/api
npm install
```

---

### 5. 修改前端 API 設定

編輯 `dist/js/config.js`，將 API URL 改為您的網域：

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : 'https://track.tailormed-intl.com/api';  // ← 改為您的網域

window.CONFIG = {
  API_BASE_URL
};
```

---

### 6. 使用 PM2 啟動應用程式

```bash
cd /var/www/track.tailormed-intl.com/api

# 啟動應用程式
pm2 start server.js --name "tailormed-tracking"

# 設定開機自動啟動
pm2 startup
pm2 save

# 查看狀態
pm2 status

# 查看日誌
pm2 logs tailormed-tracking
```

---

### 7. 設定 Nginx 反向代理

建立 Nginx 設定檔 `/etc/nginx/sites-available/track.tailormed-intl.com`：

```nginx
server {
    listen 80;
    server_name track.tailormed-intl.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name track.tailormed-intl.com;

    # SSL 憑證設定
    ssl_certificate /etc/letsencrypt/live/track.tailormed-intl.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/track.tailormed-intl.com/privkey.pem;

    # 反向代理到 Node.js 應用
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

啟用網站：

```bash
# 建立符號連結
sudo ln -s /etc/nginx/sites-available/track.tailormed-intl.com /etc/nginx/sites-enabled/

# 測試 Nginx 設定
sudo nginx -t

# 重新載入 Nginx
sudo systemctl reload nginx
```

---

### 8. 設定 SSL 憑證（使用 Let's Encrypt）

```bash
# 安裝 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 取得 SSL 憑證
sudo certbot --nginx -d track.tailormed-intl.com

# 測試自動續約
sudo certbot renew --dry-run
```

---

## 🔄 更新部署

當需要更新時：

```bash
# 1. 編譯新的前端檔案（在本地開發環境）
cd C:\Users\Aries\Develop\Website_Wireframe\src\Projects\TailorMed\track
node compile.js

# 2. 上傳 dist/ 資料夾到伺服器

# 3. 如果 API 有變更，上傳 api/ 資料夾

# 4. 重啟 PM2 應用程式
pm2 restart tailormed-tracking

# 5. 查看日誌確認
pm2 logs tailormed-tracking
```

---

## 📊 URL 對應表

| 路徑 | 說明 | 對應檔案 |
|------|------|---------|
| `/` | Under Construction 首頁 | `dist/index.html` |
| `/tracking_ui.html` | 完整追蹤介面 | `dist/tracking_ui.html` |
| `/standard` | 標準查詢頁面（完整版） | `api/standard.html` |
| `/basic` | 基本查詢頁面（簡化版） | `api/basic.html` |
| `/admin` | 管理員監控儀表板 | `api/admin.html` |
| `/api/tracking` | 追蹤 API 端點 | `api/routes/tracking.js` |
| `/api/health` | 健康檢查 | - |

---

## 🛠️ 常用指令

```bash
# 查看應用狀態
pm2 status

# 重啟應用
pm2 restart tailormed-tracking

# 停止應用
pm2 stop tailormed-tracking

# 查看日誌
pm2 logs tailormed-tracking

# 查看詳細資訊
pm2 show tailormed-tracking

# 監控資源使用
pm2 monit
```

---

## 🔍 故障排除

### 應用無法啟動

```bash
# 檢查 .env 檔案是否存在
ls -la /var/www/track.tailormed-intl.com/.env

# 檢查 Node.js 版本
node --version  # 應該是 v18 或更新

# 手動啟動測試
cd /var/www/track.tailormed-intl.com/api
node server.js
```

### API 無法連接 Airtable

```bash
# 檢查環境變數
cat /var/www/track.tailormed-intl.com/.env

# 測試 API
curl http://localhost:3000/api/health
```

### 靜態檔案無法載入

```bash
# 檢查 dist 資料夾權限
ls -la /var/www/track.tailormed-intl.com/dist

# 設定正確權限
sudo chown -R www-data:www-data /var/www/track.tailormed-intl.com
sudo chmod -R 755 /var/www/track.tailormed-intl.com
```

---

## 📝 注意事項

1. **安全性**：
   - 不要將 `.env` 檔案提交到 Git
   - 定期更新 SSL 憑證
   - 使用防火牆限制訪問

2. **備份**：
   - 定期備份 `.env` 檔案
   - 備份 Nginx 設定檔

3. **監控**：
   - 設定 PM2 監控警報
   - 監控伺服器資源使用狀況

4. **效能**：
   - 使用 Nginx 快取靜態資源
   - 啟用 Gzip 壓縮

---

## ✅ 部署完成檢查清單

- [ ] Node.js 已安裝
- [ ] PM2 已安裝並設定開機自動啟動
- [ ] 檔案已上傳到伺服器
- [ ] `.env` 檔案已正確設定
- [ ] npm 套件已安裝
- [ ] PM2 應用已啟動
- [ ] Nginx 已設定並重新載入
- [ ] SSL 憑證已安裝
- [ ] 可以訪問 https://track.tailormed-intl.com/
- [ ] API 測試頁面正常運作
- [ ] 追蹤功能可以正常查詢

---

**部署完成後，您的網站將完全運行在自己的伺服器上！** 🎉



