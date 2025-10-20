# TailorMed Tracking API - API Keys 說明

## 📋 概述

API Key 系統允許特定客戶享有更高的查詢額度，用於開發、測試和整合服務。

## 🔑 查詢限制

### 外部查詢（無 API Key）
- **限制**：10 次/小時
- **對象**：一般終端使用者
- **使用**：直接訪問頁面查詢即可

### 內部查詢（有 API Key）
- **限制**：50 次/小時
- **對象**：內部團隊、合作廠商
- **使用**：在 URL 中附加 API Key

---

## 💻 使用方式

### 方式一：帶 API Key 的專屬 URL

**給客戶專屬連結**，收藏後直接使用：

```
Basic 版本（簡化介面）：
https://tailormed-tracking-api.onrender.com/basic?apiKey=tm93585598

Standard 版本（完整介面）：
https://tailormed-tracking-api.onrender.com/standard?apiKey=tm93585598
```

**優點**：
- ✅ 客戶只需要收藏連結
- ✅ 輸入任何訂單號碼都會自動使用 API Key
- ✅ 使用體驗與一般用戶完全相同

### 方式二：API 直接呼叫

**用於系統整合**：

```bash
# 帶 API Key 的請求（50次/小時）
GET /api/tracking?orderNo=TM111682&trackingNo=GEXVC2YF&apiKey=tm93585598

# 不帶 API Key 的請求（10次/小時）
GET /api/tracking?orderNo=TM111682&trackingNo=GEXVC2YF
```

---

## 🔐 目前有效的 API Keys

| API Key | 名稱 | 限制額度 | 用途 |
|---------|------|---------|------|
| `tm93585598` | Internal Team | 50次/小時 | 內部團隊使用 |

---

## 📊 使用範例

### 範例 1：一般用戶
```
訪問：https://tailormed-tracking-api.onrender.com/basic
輸入：TM111682 / GEXVC2YF
結果：查詢成功（計入 10次/小時 限制）
```

### 範例 2：內部團隊
```
訪問：https://tailormed-tracking-api.onrender.com/basic?apiKey=tm93585598
輸入：TM111682 / GEXVC2YF
結果：查詢成功（計入 50次/小時 限制）
```

### 範例 3：系統整合
```javascript
// JavaScript 範例
const apiKey = 'tm93585598';
const orderNo = 'TM111682';
const trackingNo = 'GEXVC2YF';

const response = await fetch(
  `https://tailormed-tracking-api.onrender.com/api/tracking?orderNo=${orderNo}&trackingNo=${trackingNo}&apiKey=${apiKey}`
);

const data = await response.json();
console.log(data);
```

---

## 🛡️ 安全注意事項

1. **保密性**
   - ⚠️ 請勿在公開網站或程式碼中暴露 API Key
   - ⚠️ 避免通過不安全的管道（如 email）傳送 API Key

2. **撤銷機制**
   - 如果 API Key 洩漏，請立即聯絡管理員撤銷並重新生成

3. **監控**
   - 系統會記錄所有 API Key 的使用情況
   - 可通過 Admin Dashboard 查看使用統計

---

## ⚙️ 管理 API Keys

### 新增 API Key

編輯 `api/server.js`：

```javascript
const VALID_API_KEYS = {
  'tm93585598': {
    name: 'Internal Team',
    rateLimit: 50
  },
  'tm_new_key_here': {
    name: 'Client Name',
    rateLimit: 100  // 可自訂額度
  }
};
```

### 撤銷 API Key

從 `VALID_API_KEYS` 中移除對應的 Key 即可。

---

## 📞 支援

如有任何問題，請聯絡：
- **Email**: support@tailormed.com.tw
- **Phone**: +886 2-2694-6168

---

**更新日期**: 2025-10-12

