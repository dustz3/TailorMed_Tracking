// API 配置
// 自動檢測環境：如果是 localhost 使用本地 API，否則使用正式環境 API
const API_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://track.tailormed-intl.com/api';

// 匯出配置
window.CONFIG = {
  API_BASE_URL,
};
