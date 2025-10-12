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

// 監控中間件（記錄 API 請求）
const monitoringMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // 只監控 API 請求
  if (req.path.startsWith('/api/')) {
    res.on('finish', () => {
      const requestData = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        responseTime: Date.now() - startTime,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || 'Unknown'
      };
      
      monitoringData.requests.push(requestData);
      
      // 保持最近的 1000 筆記錄（避免記憶體過多）
      if (monitoringData.requests.length > 1000) {
        monitoringData.requests = monitoringData.requests.slice(-1000);
      }
      
      // 簡單的 console 記錄
      console.log(`[${requestData.timestamp}] ${requestData.method} ${requestData.path} - ${requestData.statusCode} (${requestData.responseTime}ms)`);
    });
  }
  
  next(); // 繼續執行原有邏輯
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

// 監控統計 API
app.get('/api/monitoring/stats', (req, res) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // 計算統計數據
  const todayRequests = monitoringData.requests.filter(r => 
    new Date(r.timestamp) >= today
  );
  
  const thisMonthRequests = monitoringData.requests.filter(r => 
    new Date(r.timestamp) >= thisMonth
  );
  
  const trackingRequests = monitoringData.requests.filter(r => 
    r.path === '/api/tracking'
  );
  
  const successfulRequests = trackingRequests.filter(r => 
    r.statusCode === 200
  );
  
  const avgResponseTime = trackingRequests.length > 0 
    ? trackingRequests.reduce((sum, r) => sum + r.responseTime, 0) / trackingRequests.length
    : 0;
  
  const successRate = trackingRequests.length > 0 
    ? (successfulRequests.length / trackingRequests.length * 100).toFixed(1)
    : 0;
  
  // 獲取最近的請求
  const recentRequests = monitoringData.requests.slice(-10).reverse();
  
  const stats = {
    system: {
      uptime: monitoringData.startTime,
      totalRequests: monitoringData.requests.length
    },
    today: {
      queries: todayRequests.filter(r => r.path === '/api/tracking').length,
      requests: todayRequests.length
    },
    thisMonth: {
      queries: thisMonthRequests.filter(r => r.path === '/api/tracking').length,
      requests: thisMonthRequests.length
    },
    tracking: {
      totalQueries: trackingRequests.length,
      successfulQueries: successfulRequests.length,
      successRate: `${successRate}%`,
      averageResponseTime: `${Math.round(avgResponseTime)}ms`
    },
    recentRequests: recentRequests.map(r => ({
      time: r.timestamp,
      method: r.method,
      path: r.path,
      status: r.statusCode,
      responseTime: `${r.responseTime}ms`
    }))
  };
  
  res.json(stats);
});

// 使用追蹤 API
app.post('/api/usage', (req, res) => {
  try {
    const usageData = {
      ...req.body,
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString()
    };
    
    monitoringData.usage.push(usageData);
    
    // 保持最近的 500 筆使用記錄（避免記憶體過多）
    if (monitoringData.usage.length > 500) {
      monitoringData.usage = monitoringData.usage.slice(-500);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Usage tracking error:', error);
    res.status(500).json({ error: 'Usage tracking failed' });
  }
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

