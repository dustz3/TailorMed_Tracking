const express = require('express');
const cors = require('cors');
const path = require('path');
const trackingRoutes = require('./routes/tracking');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 靜態檔案服務（提供前端頁面）
// 使用相對路徑，讓部署環境也能正常工作
const staticPath = path.join(__dirname, '../../../dist/Projects/TailorMed/track');
console.log('📁 靜態檔案路徑:', staticPath);
app.use(express.static(staticPath));

// API Routes
app.use('/api/tracking', trackingRoutes);

// 測試頁面路由
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test.html'));
});

// 根路由重定向到 index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
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

