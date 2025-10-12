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

// API Keys 配置
const VALID_API_KEYS = {
  'tm93585598': {
    name: 'Internal Team',
    rateLimit: 50 // 50 次/小時
  }
};

// Rate Limiting：外部用戶（每個 IP 每小時最多 10 次查詢）
const externalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小時
  max: 10, // 最多 10 次請求
  message: {
    error: 'Too many requests',
    message: 'Query limit reached (10 per hour). Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true, // 返回 RateLimit-* headers
  legacyHeaders: false, // 禁用 X-RateLimit-* headers
});

// Rate Limiting：內部用戶（每個 IP 每小時最多 50 次查詢）
const internalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小時
  max: 50, // 最多 50 次請求
  message: {
    error: 'Too many requests',
    message: 'Query limit reached (50 per hour). Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API Key 驗證中間件
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.query.apiKey;
  
  // 檢查是否有有效的 API Key
  if (apiKey && VALID_API_KEYS[apiKey]) {
    req.isAuthenticated = true;
    req.apiKeyInfo = VALID_API_KEYS[apiKey];
    console.log(`✅ 驗證成功 - API Key: ${apiKey} (${req.apiKeyInfo.name})`);
  } else {
    req.isAuthenticated = false;
  }
  
  next();
};

// 動態 Rate Limiter（根據驗證狀態選擇限制）
const dynamicRateLimiter = (req, res, next) => {
  if (req.isAuthenticated) {
    // 已驗證用戶：使用內部限制（50次/小時）
    internalLimiter(req, res, next);
  } else {
    // 未驗證用戶：使用外部限制（10次/小時）
    externalLimiter(req, res, next);
  }
};

// 監控中間件（記錄 API 請求）
const monitoringMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // 只監控 API 請求，但排除監控、健康檢查和公開查詢
  if (req.path.startsWith('/api/') && 
      req.path !== '/api/monitoring/stats' && 
      req.path !== '/api/health' &&
      !req.path.startsWith('/api/tracking-public')) {
    
    // 特別記錄追蹤請求
    if (req.path.startsWith('/api/tracking')) {
      console.log('🔍 記錄追蹤請求:', req.method, req.path);
    }
    
    res.on('finish', () => {
      // 簡化判斷：追蹤請求成功 = 200 或 304 狀態碼
      let isSuccess = false;
      if (req.path.startsWith('/api/tracking')) {
        isSuccess = res.statusCode === 200 || res.statusCode === 304;
      } else {
        // 非追蹤請求，使用狀態碼判斷
        isSuccess = res.statusCode === 200 || res.statusCode === 304;
      }
      
      const requestData = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl || req.path, // 使用完整 URL
        statusCode: res.statusCode,
        responseTime: Date.now() - startTime,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || 'Unknown',
        isSuccess: isSuccess // 新增成功/失敗標記
      };
      
      // 除錯：記錄完整路徑
      console.log('完整請求路徑:', {
        originalUrl: req.originalUrl,
        path: req.path,
        url: req.url,
        method: req.method,
        statusCode: res.statusCode,
        isSuccess: isSuccess
      });
      
      monitoringData.requests.push(requestData);
      
      // 保持最近的 1000 筆記錄（避免記憶體過多）
      if (monitoringData.requests.length > 1000) {
        monitoringData.requests = monitoringData.requests.slice(-1000);
      }
      
      // 簡單的 console 記錄
      console.log(`[${requestData.timestamp}] ${requestData.method} ${requestData.path} - ${requestData.statusCode} (${requestData.responseTime}ms) - [已儲存到監控] - 成功: ${isSuccess}`);
      
      // 特別標記追蹤請求
      if (req.path.startsWith('/api/tracking')) {
        console.log('✅ 追蹤請求已儲存:', requestData.path, '成功:', isSuccess);
      }
    });
  } else {
    // 對於監控和健康檢查請求，只記錄 console，不儲存到 monitoringData
    if (req.path.startsWith('/api/')) {
      res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${Date.now() - startTime}ms) - [監控請求，不儲存]`);
      });
    }
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

// API Routes（套用 API Key 驗證和動態 Rate Limiting）
app.use('/api/tracking', apiKeyAuth, dynamicRateLimiter, trackingRoutes);

// 公開查詢路由（不記錄監控，但仍套用 API Key 驗證和動態 Rate Limiting）
app.use('/api/tracking-public', apiKeyAuth, dynamicRateLimiter, trackingRoutes);

// 標準查詢頁面路由（會記錄監控）
app.get('/standard', (req, res) => {
  res.sendFile(path.join(__dirname, 'standard.html'));
});

// 基本查詢頁面（不記錄監控）
app.get('/basic', (req, res) => {
  res.sendFile(path.join(__dirname, 'basic.html'));
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
    // 否則重定向到標準查詢頁面
    res.redirect('/standard');
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TailorMed Tracking API is running' });
});

// 監控統計 API
app.get('/api/monitoring/stats', (req, res) => {
  const now = new Date();
  
  // 修正時區計算：使用台灣時間計算今日開始
  // 台灣時間 = UTC + 8 小時
  const taiwanTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  const taiwanToday = new Date(taiwanTime.getFullYear(), taiwanTime.getMonth(), taiwanTime.getDate());
  const taiwanThisMonth = new Date(taiwanTime.getFullYear(), taiwanTime.getMonth(), 1);
  
  // 轉換回 UTC 時間作為比較基準
  const todayStart = new Date(taiwanToday.getTime() - (8 * 60 * 60 * 1000));
  const thisMonthStart = new Date(taiwanThisMonth.getTime() - (8 * 60 * 60 * 1000));
  
  console.log('統計計算時間點:', {
    now: now.toISOString(),
    taiwanTime: taiwanTime.toISOString(),
    taiwanToday: taiwanToday.toISOString(),
    todayStart: todayStart.toISOString(),
    thisMonthStart: thisMonthStart.toISOString(),
    totalRequests: monitoringData.requests.length,
    sampleRequestTimes: monitoringData.requests.slice(-3).map(r => ({
      time: r.timestamp,
      path: r.path,
      isAfterToday: new Date(r.timestamp) >= todayStart
    }))
  });
  
  // 計算統計數據
  const todayRequests = monitoringData.requests.filter(r => {
    const requestTime = new Date(r.timestamp);
    return requestTime >= todayStart;
  });
  
  const thisMonthRequests = monitoringData.requests.filter(r => {
    const requestTime = new Date(r.timestamp);
    return requestTime >= thisMonthStart;
  });
  
  // 計算貨件查詢請求（使用完整 URL 匹配）
  const trackingRequests = monitoringData.requests.filter(r => 
    r.path && r.path.includes('/api/tracking')
  );
  
  const successfulRequests = trackingRequests.filter(r => 
    r.isSuccess === true || r.statusCode === 200 || r.statusCode === 304
  );
  
  const avgResponseTime = trackingRequests.length > 0 
    ? trackingRequests.reduce((sum, r) => sum + r.responseTime, 0) / trackingRequests.length
    : 0;
  
  const successRate = trackingRequests.length > 0 
    ? (successfulRequests.length / trackingRequests.length * 100).toFixed(1)
    : 0;
  
  // 獲取最近的請求
  const recentRequests = monitoringData.requests.slice(-10).reverse();
  
  // 除錯資訊
  console.log('統計結果:', {
    totalRequests: monitoringData.requests.length,
    todayRequestsCount: todayRequests.length,
    thisMonthRequestsCount: thisMonthRequests.length,
    trackingRequestsCount: trackingRequests.length,
    todayTrackingQueries: todayRequests.filter(r => r.path && r.path.includes('/api/tracking')).length,
    allRequestPaths: monitoringData.requests.map(r => r.path),
    recentRequestsSample: recentRequests.slice(0, 3).map(r => ({
      time: r.timestamp,
      path: r.path,
      method: r.method
    }))
  });
  
  // 詳細的追蹤請求分析
  console.log('🔍 追蹤請求詳細分析:', {
    allTrackingRequests: trackingRequests.map(r => ({
      time: r.timestamp,
      path: r.path,
      statusCode: r.statusCode,
      responseTime: r.responseTime,
      isSuccess: r.isSuccess
    })),
    successCount: successfulRequests.length,
    failureCount: trackingRequests.length - successfulRequests.length,
    failureRequests: trackingRequests.filter(r => r.isSuccess !== true).map(r => ({
      time: r.timestamp,
      path: r.path,
      statusCode: r.statusCode,
      responseTime: r.responseTime,
      isSuccess: r.isSuccess
    }))
  });
  
  const stats = {
    system: {
      uptime: monitoringData.startTime,
      totalRequests: monitoringData.requests.length,
      status: 'running'
    },
    today: {
      queries: todayRequests.filter(r => r.path && r.path.includes('/api/tracking')).length,
      requests: todayRequests.length
    },
    thisMonth: {
      queries: thisMonthRequests.filter(r => r.path && r.path.includes('/api/tracking')).length,
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

