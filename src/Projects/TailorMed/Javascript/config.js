// API 配置
// 自動檢測環境：如果是 localhost 使用本地 API，否則使用 Render API
// 請在部署前將下面的 Render URL 替換成您實際的 Render 服務網址
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : 'https://tailormed-tracking-api.onrender.com/api';

// 匯出配置
window.CONFIG = {
  API_BASE_URL
};









