// TailorMed 貨件追蹤系統 - API 整合

// API 設定（從 config.js 讀取，如果沒有則使用預設值）
const API_BASE_URL = window.CONFIG?.API_BASE_URL || 'http://localhost:3000/api';

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
  try {
    const response = await fetch(
      `${API_BASE_URL}/tracking?orderNo=${encodeURIComponent(orderNo)}&trackingNo=${encodeURIComponent(trackingNo)}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null; // 找不到資料
      }
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
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
    'Original/Destination': shipmentData.origin && shipmentData.destination 
      ? (shipmentData.origin === 'Domestic' && shipmentData.destination === 'Domestic' 
        ? 'Domestic' 
        : `${shipmentData.origin} → ${shipmentData.destination}`)
      : '—',
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

