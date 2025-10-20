// 前端 API 整合範例
// 這個檔案示範如何修改 Javascript/app.js 來呼叫後端 API

// ========== API 設定 ==========
const API_BASE_URL = '/api/tracking';  // 如果前後端在同一個 server
// const API_BASE_URL = 'http://localhost:3000/api/tracking';  // 如果後端在不同 port

// ========== API 呼叫函數 ==========

/**
 * 查詢貨件資訊
 * @param {string} orderNo - 訂單號碼
 * @param {string} trackingNo - 追蹤號碼
 */
async function searchShipment(orderNo, trackingNo) {
  try {
    const response = await fetch(
      `${API_BASE_URL}?orderNo=${orderNo}&trackingNo=${trackingNo}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }
    
    const result = await response.json();
    return result.data;
    
  } catch (error) {
    console.error('Search shipment error:', error);
    throw error;
  }
}

/**
 * 使用 POST 方式查詢（表單提交）
 */
async function searchShipmentPost(orderNo, trackingNo) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order: orderNo,
        job: trackingNo
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }
    
    const result = await response.json();
    return result.data;
    
  } catch (error) {
    console.error('Search shipment error:', error);
    throw error;
  }
}

// ========== UI 更新函數 ==========

/**
 * 更新 Results Panel 資訊
 */
function updateResultsPanel(data) {
  // 更新基本資訊
  document.querySelector('.results-panel .field-value[data-field="orderNo"]').textContent = data.orderNo;
  document.querySelector('.results-panel .field-value[data-field="invoiceNo"]').textContent = data.invoiceNo;
  document.querySelector('.results-panel .field-value[data-field="mawb"]').textContent = data.mawb;
  document.querySelector('.results-panel .field-value[data-field="route"]').textContent = `${data.origin} → ${data.destination}`;
  document.querySelector('.results-panel .field-value[data-field="packageCount"]').textContent = data.packageCount;
  document.querySelector('.results-panel .field-value[data-field="weight"]').textContent = data.weight;
  document.querySelector('.results-panel .field-value[data-field="eta"]').textContent = data.eta;
  
  // 更新 Status Info
  document.querySelector('.status-info .field-value[data-field="trackingNo"]').textContent = data.trackingNo;
  document.querySelector('.status-info .status-inline').textContent = data.status;
  document.querySelector('.status-info .field-value[data-field="lastUpdate"]').textContent = data.lastUpdate;
}

/**
 * 更新 Timeline
 */
function updateTimeline(timelineData) {
  // 更新進度條
  const completedSteps = timelineData.filter(e => e.status === 'completed' && e.step).length;
  const totalSteps = timelineData.filter(e => e.step).length;
  const progress = (completedSteps / totalSteps) * 100;
  
  document.querySelector('.timeline-progress').style.width = `${progress}%`;
  
  // 更新節點狀態
  timelineData.forEach((event, index) => {
    if (!event.step) return; // 跳過 event（如 Dry Ice）
    
    const node = document.querySelector(`.timeline-node[data-step="${event.step}"]`);
    if (node) {
      node.className = `timeline-node ${event.status}`;
    }
    
    // 更新卡片
    const card = document.querySelector(`.timeline-card:nth-child(${index + 1})`);
    if (card) {
      card.className = `timeline-card ${event.status}`;
      card.querySelector('.card-title').textContent = event.title;
      card.querySelector('.card-time').textContent = event.time;
    }
  });
}

/**
 * 顯示錯誤訊息
 */
function showError(message) {
  const noteElement = document.querySelector('.results-note');
  if (noteElement) {
    noteElement.textContent = message;
    noteElement.style.display = 'block';
  }
}

/**
 * 隱藏錯誤訊息
 */
function hideError() {
  const noteElement = document.querySelector('.results-note');
  if (noteElement) {
    noteElement.style.display = 'none';
  }
}

// ========== 表單處理 ==========

/**
 * 處理表單提交
 */
async function handleFormSubmit(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const orderNo = formData.get('order');
  const trackingNo = formData.get('job');
  
  // 顯示載入狀態
  showLoadingState();
  
  try {
    // 呼叫 API
    const shipmentData = await searchShipment(orderNo, trackingNo);
    
    // 更新 UI
    updateResultsPanel(shipmentData);
    updateTimeline(shipmentData.timeline);
    hideError();
    
    // 顯示 results panel
    document.querySelector('.results-panel').style.display = 'flex';
    document.querySelector('.status-panel').style.display = 'block';
    
  } catch (error) {
    showError(error.message || '查詢失敗，請稍後再試');
    console.error('Form submit error:', error);
  } finally {
    hideLoadingState();
  }
}

// ========== 初始化 ==========

document.addEventListener('DOMContentLoaded', () => {
  // 綁定表單提交事件
  const form = document.querySelector('.summary-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
  
  // 檢查 URL 參數（如果有直接連結）
  const params = new URLSearchParams(window.location.search);
  const orderNo = params.get('orderNo');
  const trackingNo = params.get('trackingNo');
  
  if (orderNo && trackingNo) {
    // 自動查詢
    searchShipment(orderNo, trackingNo)
      .then(data => {
        updateResultsPanel(data);
        updateTimeline(data.timeline);
      })
      .catch(error => {
        showError(error.message);
      });
  }
});

// ========== 輔助函數 ==========

function showLoadingState() {
  // 可以加上 loading spinner 或禁用按鈕
  const submitBtn = document.querySelector('.summary-form button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'SEARCHING...';
  }
}

function hideLoadingState() {
  const submitBtn = document.querySelector('.summary-form button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'CHECK STATUS';
  }
}







