const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const trackingRoutes = require('./routes/tracking');

// 監控資料儲存（記憶體中，簡單實作）
const monitoringData = {
  requests: [],
  usage: [], // 新增使用追蹤資料
  startTime: new Date().toISOString()
};

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

// 簡化監控中間件（避免啟動問題）
const monitoringMiddleware = (req, res, next) => {
  // 只記錄 console，不儲存資料
  if (req.path.startsWith('/api/')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 加入監控中間件（在現有中間件後）
app.use(monitoringMiddleware);

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

// 監控儀表板路由
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
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

// 簡化監控統計 API
app.get('/api/monitoring/stats', (req, res) => {
  const stats = {
    system: {
      uptime: monitoringData.startTime,
      totalRequests: monitoringData.requests.length,
      status: 'running'
    },
    today: {
      queries: 0,
      requests: 0
    },
    thisMonth: {
      queries: 0,
      requests: 0
    },
    tracking: {
      totalQueries: 0,
      successfulQueries: 0,
      successRate: '100%',
      averageResponseTime: '0ms'
    },
    recentRequests: []
  };
  
  res.json(stats);
});

// 簡化使用追蹤 API
app.post('/api/usage', (req, res) => {
  // 簡化版本，只回應成功
  res.json({ success: true });
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

