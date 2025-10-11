const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const trackingRoutes = require('./routes/tracking');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate Limiting：每個 IP 每小時最多 10 次查詢
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小時
  max: 10, // 最多 10 次請求
  message: {
    error: 'Too many requests',
    message: '您已達到查詢次數上限（每小時 10 次），請稍後再試。',
    retryAfter: '1 hour'
  },
  standardHeaders: true, // 返回 RateLimit-* headers
  legacyHeaders: false, // 禁用 X-RateLimit-* headers
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 靜態檔案服務（提供前端頁面）
// 根據環境變數決定靜態檔案路徑
const staticPath = process.env.STATIC_PATH || path.join(__dirname, '../dist');
console.log('📁 靜態檔案路徑:', staticPath);

// 檢查靜態檔案路徑是否存在，如果存在則提供靜態檔案服務
const fs = require('fs');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
  console.log('✅ 靜態檔案服務已啟用');
} else {
  console.log('⚠️  靜態檔案路徑不存在，僅提供 API 和測試頁面');
}

// API Routes（套用 Rate Limiting）
app.use('/api/tracking', apiLimiter, trackingRoutes);

// 測試頁面路由（使用內建的測試頁面）
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test.html'));
});

// Logo 圖片路由
app.get('/logo.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'logo.png'));
});

// 根路由
app.get('/', (req, res) => {
  // 如果靜態檔案存在，提供 index.html
  const indexPath = path.join(staticPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // 否則重定向到測試頁面
    res.redirect('/test');
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TailorMed Tracking API is running' });
});

// 404 處理
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 TailorMed Tracking Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoint: http://localhost:${PORT}/api/tracking`);
  console.log(`🌐 Frontend: http://localhost:${PORT}/index.html`);
});

module.exports = app;

