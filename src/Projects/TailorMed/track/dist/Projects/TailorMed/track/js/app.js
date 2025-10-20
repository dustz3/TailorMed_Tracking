// TailorMed 貨件追蹤系統 - API 整合

// API 設定（從 config.js 讀取，如果沒有則使用預設值）
const API_BASE_URL = window.CONFIG?.API_BASE_URL || 'http://localhost:3000/api';

// 使用追蹤功能（最小影響）
function trackUsage(action, data) {
  try {
    // 非阻塞式追蹤，不影響主要功能
    setTimeout(() => {
      fetch(`${API_BASE_URL}/usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action,
          data: data,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          url: window.location.href
        })
      }).catch(() => {}); // 靜默處理錯誤，不影響主要功能
    }, 0);
  } catch (error) {
    // 靜默處理，不影響主要功能
  }
}

// DOM 元素
const trackingForm = document.querySelector('.summary-form');
const orderInput = document.querySelector('input[name="order"]');
const jobInput = document.querySelector('input[name="job"]');
const resultsPanel = document.querySelector('.results-panel');
const lookupPanel = document.querySelector('.tracking-lookup-panel');
const statusPanel = document.querySelector('.status-panel');

// 狀態訊息
const STATUS_MESSAGES = {
  loading: '正在查詢貨件狀態，請稍候...',
  notFound: '查無此追蹤編號的記錄，請確認編號是否正確。',
  error: '服務暫時無法使用，稍候再試或聯絡客服人員。'
};

// 查詢貨件資料
async function fetchTrackingData(orderNo, trackingNo) {
  // 追蹤查詢嘗試
  trackUsage('query_attempt', { orderNo, trackingNo });
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/tracking?orderNo=${encodeURIComponent(orderNo)}&trackingNo=${encodeURIComponent(trackingNo)}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        // 追蹤查詢結果（未找到）
        trackUsage('query_result', { 
          orderNo, 
          trackingNo, 
          success: false, 
          reason: 'not_found',
          responseTime: Date.now() - startTime
        });
        return null; // 找不到資料
      }
      if (response.status === 429) {
        // 追蹤查詢結果（限制）
        trackUsage('query_result', { 
          orderNo, 
          trackingNo, 
          success: false, 
          reason: 'rate_limit',
          responseTime: Date.now() - startTime
        });
        // 查詢次數超過限制
        const errorData = await response.json();
        return { 
          error: 'rate_limit', 
          message: errorData.message || '查詢次數已達上限，請稍後再試。'
        };
      }
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const result = data.success ? data.data : null;
    
    // 追蹤查詢結果（成功）
    trackUsage('query_result', { 
      orderNo, 
      trackingNo, 
      success: !!result, 
      reason: result ? 'success' : 'no_data',
      responseTime: Date.now() - startTime
    });
    
    return result;
  } catch (error) {
    // 追蹤查詢結果（錯誤）
    trackUsage('query_result', { 
      orderNo, 
      trackingNo, 
      success: false, 
      reason: 'error',
      responseTime: Date.now() - startTime,
      error: error.message
    });
    
    console.error('Fetch tracking data failed:', error);
    return 'error';
  }
}

// 渲染貨件資訊
function renderShipmentInfo(shipmentData) {
  if (!shipmentData) return;

  // 更新基本資訊
  const summaryFields = {
    'Order No.': shipmentData.orderNo || '—',
    'Invoice No.': shipmentData.invoiceNo || '—',
    'MAWB': shipmentData.mawb || '—',
    'Original/Destination': shipmentData.route || '—',
    'Package Count': shipmentData.packageCount || '—',
    'Weight': shipmentData.weight ? `${shipmentData.weight} KG` : '—',
    'ETA': shipmentData.eta || '—'
  };

  // 更新 summary grid
  const summaryGrid = document.querySelector('.summary-grid');
  if (summaryGrid) {
    summaryGrid.innerHTML = '';
    Object.entries(summaryFields).forEach(([label, value]) => {
      const field = document.createElement('div');
      field.className = 'summary-field';
      field.innerHTML = `
        <span class="field-label">${label}</span>
        <span class="field-value">${value}</span>
      `;
      summaryGrid.appendChild(field);
    });
  }

  // 更新狀態資訊
  const statusInfo = document.querySelector('.status-info');
  if (statusInfo) {
    // 檢查是否有 Dry Ice Event
    const hasDryIceEvent = shipmentData.timeline?.some(item => item.isEvent && item.eventType === 'dryice');
    
    statusInfo.innerHTML = `
      <div class="summary-field">
        <span class="field-label">Tracking No.</span>
        <span class="field-value">${shipmentData.trackingNo}</span>
      </div>
      <div class="summary-field status-field">
        <span class="field-label">Status</span>
        <div class="status-value-wrapper">
          <span class="field-value status-inline status-in-transit">${shipmentData.status || 'Processing'}</span>
          ${hasDryIceEvent ? `
            <div class="status-icon-wrapper" data-tooltip="Dry Ice Refilled">
              <img class="status-icon" src="images/icon-dryice.svg" alt="Dry Ice Refilled">
            </div>
          ` : ''}
        </div>
      </div>
      <div class="summary-field">
        <span class="field-label">Last Update</span>
        <span class="field-value">${shipmentData.lastUpdate || '—'}</span>
      </div>
    `;
  }
}

// 渲染時間軸
function renderTimeline(timeline) {
  if (!timeline || timeline.length === 0) return;

  // 計算進度百分比（排除 event 項目）
  const steps = timeline.filter(item => item.step !== null);
  const completedSteps = steps.filter(item => item.status === 'completed').length;
  const progressPercentage = (completedSteps / (steps.length - 1)) * 100;

  // 更新進度條
  const progressBar = document.querySelector('.timeline-progress');
  if (progressBar) {
    progressBar.style.width = `${progressPercentage}%`;
  }

  // 更新 timeline nodes
  const timelineNodes = document.querySelector('.timeline-nodes');
  if (timelineNodes) {
    timelineNodes.innerHTML = '';
    
    timeline.forEach((item) => {
      // 跳過 event 項目（它們會顯示在別處）
      if (item.step === null) return;

      const node = document.createElement('div');
      node.className = `timeline-node ${item.status}`;
      node.setAttribute('data-step', item.step);
      node.innerHTML = `
        <div class="node-dot"></div>
        <div class="node-icon">${item.step}</div>
      `;
      timelineNodes.appendChild(node);
    });
  }

  // 更新 timeline cards
  const timelineCards = document.querySelector('.timeline-cards');
  if (timelineCards) {
    timelineCards.innerHTML = '';
    
    timeline.forEach((item) => {
      const card = document.createElement('div');
      
      if (item.isEvent) {
        // Dry Ice Event Card
        card.className = 'timeline-card event';
        card.innerHTML = `
          <div class="card-icon">
            <img class="card-icon-img icon-default" src="images/icon-dryice.svg" alt="Dry Ice">
            <img class="card-icon-img icon-hover" src="images/icon-dryice_hover.svg" alt="Dry Ice Hover">
          </div>
          <div class="card-content">
            <h3 class="card-title">${item.title}</h3>
            <p class="card-time">${item.time}</p>
          </div>
        `;
      } else {
        // 一般步驟 Card
        card.className = `timeline-card ${item.status}`;
        card.setAttribute('data-step', item.step);
        card.innerHTML = `
          <div class="card-step">Step ${item.step}</div>
          <div class="card-content">
            <h3 class="card-title">${item.title}</h3>
            <p class="card-time">${item.time}</p>
          </div>
        `;
      }
      
      timelineCards.appendChild(card);
    });
  }

  // 如果有 Dry Ice Event，添加時間軸圖示
  const dryIceEvent = timeline.find(item => item.isEvent && item.eventType === 'dryice');
  if (dryIceEvent) {
    const eventIcon = document.querySelector('.timeline-event-icon');
    if (!eventIcon && timelineNodes) {
      const icon = document.createElement('div');
      icon.className = 'timeline-event-icon';
      icon.innerHTML = '<img src="images/icon-dryice.svg" alt="Dry Ice Refilled">';
      timelineNodes.parentElement.appendChild(icon);
    }
  }
}

// 顯示載入狀態
function showLoading() {
  const resultsContainer = document.querySelector('.results-container');
  if (resultsContainer) {
    resultsContainer.innerHTML = `
      <div class="loading-message">
        <p>${STATUS_MESSAGES.loading}</p>
      </div>
    `;
  }
}

// 顯示錯誤訊息
function showError(message) {
  const resultsContainer = document.querySelector('.results-container');
  if (resultsContainer) {
    resultsContainer.innerHTML = `
      <div class="error-message">
        <p>${message}</p>
      </div>
    `;
  }
}

// 處理表單提交
async function handleFormSubmit(event) {
  event.preventDefault();

  const orderNo = orderInput.value.trim().toUpperCase();
  const trackingNo = jobInput.value.trim().toUpperCase();

  if (!orderNo || !trackingNo) return;

  // 顯示載入狀態
  showLoading();

  // 查詢資料
  const result = await fetchTrackingData(orderNo, trackingNo);

  // 處理結果
  if (result === 'error') {
    showError(STATUS_MESSAGES.error);
    return;
  }

  // 處理查詢次數限制
  if (result && result.error === 'rate_limit') {
    showError(result.message);
    return;
  }

  if (!result) {
    showError(STATUS_MESSAGES.notFound);
    return;
  }

  // 渲染資料
  renderShipmentInfo(result);
  renderTimeline(result.timeline);

  // 顯示結果面板
  if (resultsPanel) {
    resultsPanel.style.display = 'block';
  }
  if (statusPanel) {
    statusPanel.style.display = 'block';
  }

  // 更新 URL (不刷新頁面)
  const url = new URL(window.location);
  url.searchParams.set('order', orderNo);
  url.searchParams.set('tracking', trackingNo);
  window.history.pushState({}, '', url);

  // 滾動到結果區域
  resultsPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 從 URL 參數初始化
function initFromURL() {
  const params = new URLSearchParams(window.location.search);
  const orderNo = params.get('order');
  const trackingNo = params.get('tracking');

  if (orderNo && trackingNo) {
    orderInput.value = orderNo;
    jobInput.value = trackingNo;
    handleFormSubmit(new Event('submit'));
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 追蹤頁面載入
  trackUsage('page_load', {
    url: window.location.href,
    referrer: document.referrer,
    userAgent: navigator.userAgent
  });
  
  // 綁定表單提交事件
  if (trackingForm) {
    trackingForm.addEventListener('submit', handleFormSubmit);
  }

  // 從 URL 初始化
  initFromURL();

  // 重新初始化互動效果（在動態內容載入後）
  window.addEventListener('contentLoaded', () => {
    // 觸發 resize 事件以重新計算位置
    window.dispatchEvent(new Event('resize'));
  });
});

