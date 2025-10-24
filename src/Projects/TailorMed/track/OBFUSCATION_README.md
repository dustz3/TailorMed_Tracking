# TailorMed 程式碼混淆指南

## 概述

本指南說明如何對 TailorMed 貨件追蹤系統進行程式碼混淆，以保護 CSS 類別名稱和 HTML 結構不被輕易識別。

## 混淆方法

### 1. 基本混淆（推薦）

```bash
# 安裝依賴
npm install

# 執行基本混淆
npm run obfuscate

# 或使用完整建置流程
npm run build:secure
```

### 2. 混淆效果

**原始 CSS：**

```css
.timeline-track-panel {
  background: #fff;
  border-radius: 8px;
}

.hero-banner {
  background: linear-gradient(135deg, #143463 0%, #0f1a2e 100%);
}
```

**混淆後 CSS：**

```css
.tm1a2b3c4 {
  background: #fff;
  border-radius: 8px;
}

.tm5d6e7f8 {
  background: linear-gradient(135deg, #143463 0%, #0f1a2e 100%);
}
```

**原始 HTML：**

```html
<div class="timeline-track-panel">
  <h2 class="panel-title">Import/Export/Cross Trade</h2>
  <div class="timeline-track-container">
    <!-- 內容 -->
  </div>
</div>
```

**混淆後 HTML：**

```html
<div class="tm1a2b3c4">
  <h2 class="tm9g0h1i2">Import/Export/Cross Trade</h2>
  <div class="tm3j4k5l6">
    <!-- 內容 -->
  </div>
</div>
```

## 配置選項

### 基本配置

在 `obfuscation.config.js` 中調整：

```javascript
module.exports = {
  basic: {
    cssClasses: {
      enabled: true,
      prefix: 'tm', // 類別前綴
      length: 8, // 隨機字串長度
      exclude: ['btn'], // 保留的類別
    },
  },
};
```

### 進階配置

```javascript
module.exports = {
  advanced: {
    javascript: {
      enabled: true, // 啟用 JS 混淆
      mangle: true, // 變數名混淆
      compress: true, // 程式碼壓縮
      dropConsole: true, // 移除 console
    },
  },
};
```

## 使用流程

### 開發階段

1. **正常開發**：使用原始類別名稱開發
2. **測試功能**：確保所有功能正常運作
3. **執行混淆**：使用 `npm run obfuscate`

### 部署階段

1. **混淆建置**：`npm run build:secure`
2. **測試混淆版本**：`npm run preview:secure`
3. **部署混淆版本**：上傳 `dist-obfuscated` 目錄

## 注意事項

### 1. 類別對應表

混淆後會生成 `class-mapping.json` 檔案，記錄原始類別名稱與混淆後名稱的對應關係：

```json
{
  "timeline-track-panel": "tm1a2b3c4",
  "panel-title": "tm9g0h1i2",
  "hero-banner": "tm5d6e7f8"
}
```

### 2. 保留的類別

某些類別名稱會被保留，不會被混淆：

- `btn`、`container`、`hero`
- `site-header`、`site-footer`
- 所有 `data-*` 和 `aria-*` 屬性

### 3. 除錯

如果需要除錯，可以：

1. 查看 `class-mapping.json` 了解對應關係
2. 使用瀏覽器開發者工具檢查元素
3. 暫時關閉混淆進行除錯

## 安全等級

### 等級 1：基本混淆

- CSS 類別名稱混淆
- HTML 屬性混淆
- 程式碼壓縮

### 等級 2：進階混淆

- JavaScript 變數名混淆
- 字串編碼
- 控制流程混淆

### 等級 3：最高保護

- 反除錯保護
- 反篡改檢查
- 域名鎖定

## 建議

1. **開發時**：使用原始類別名稱，便於維護
2. **測試時**：先測試原始版本，再測試混淆版本
3. **部署時**：使用混淆版本，保護智慧財產權
4. **更新時**：重新執行混淆流程

## 故障排除

### 問題：混淆後樣式失效

**解決方案**：檢查 `class-mapping.json`，確認類別對應正確

### 問題：JavaScript 功能異常

**解決方案**：在配置中排除相關類別名稱

### 問題：混淆後檔案過大

**解決方案**：啟用壓縮選項，移除不必要的空白和註解

## 進階技巧

### 1. 自定義混淆規則

```javascript
// 在 obfuscate.js 中自定義
function customObfuscation(content, type) {
  if (type === 'css') {
    // 自定義 CSS 混淆邏輯
  }
  if (type === 'html') {
    // 自定義 HTML 混淆邏輯
  }
}
```

### 2. 批次處理

```bash
# 批次混淆多個專案
for project in project1 project2 project3; do
  cd $project
  npm run obfuscate
done
```

### 3. 自動化部署

```bash
# 在 CI/CD 中自動混淆
npm run build:secure
rsync -av dist-obfuscated/ /var/www/html/
```

這樣就可以有效保護您的程式碼結構和樣式命名！


