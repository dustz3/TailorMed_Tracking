const Airtable = require('airtable');

// 從環境變數取得 Airtable 配置
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_SHIPMENTS_TABLE = process.env.AIRTABLE_SHIPMENTS_TABLE || 'Shipments';

// 判斷是否使用假資料
const USE_MOCK_DATA = !AIRTABLE_API_KEY || !AIRTABLE_BASE_ID;

// 速率限制配置（每分鐘 60 次）
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 秒
const RATE_LIMIT_MAX = 60;
const rateLimitStore = new Map();

// 監控數據（記憶體儲存）
const monitoringData = {
  totalRequests: 0,
  successfulQueries: 0,
  failedQueries: 0,
  startTime: Date.now(),
  requests: [],
  orderCounts: new Map(),
};

// 記錄監控項目
function recordMonitoringEntry(orderNo, trackingNo, success, responseTime) {
  monitoringData.totalRequests++;
  if (success) {
    monitoringData.successfulQueries++;
  } else {
    monitoringData.failedQueries++;
  }

  const entry = {
    timestamp: new Date().toISOString(),
    orderNo: orderNo || trackingNo || 'N/A',
    trackingNo: trackingNo || 'N/A',
    success,
    responseTime: `${responseTime}ms`,
    status: success ? 'success' : 'error',
  };

  monitoringData.requests.push(entry);
  if (monitoringData.requests.length > 100) {
    monitoringData.requests.shift();
  }

  // 統計 Order No. 查詢次數
  if (orderNo) {
    const count = monitoringData.orderCounts.get(orderNo) || 0;
    monitoringData.orderCounts.set(orderNo, count + 1);
  }
}

// 檢查速率限制
function checkRateLimit(clientId) {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientId) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

  if (now > clientData.resetTime) {
    clientData.count = 0;
    clientData.resetTime = now + RATE_LIMIT_WINDOW;
  }

  if (clientData.count >= RATE_LIMIT_MAX) {
    return { allowed: false, resetTime: clientData.resetTime };
  }

  clientData.count++;
  rateLimitStore.set(clientId, clientData);
  return { allowed: true };
}

// 假資料（當 Airtable 未配置時使用）
const mockData = {
  orderNo: 'TM111001',
  trackingNo: 'ABC123456789',
  status: 'In Transit',
  lastUpdate: new Date().toLocaleDateString('zh-TW', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }),
  timeline: [
    { step: 1, title: 'Order Placed', time: '10/01/2024 09:00', status: 'completed' },
    { step: 2, title: 'Processing', time: '10/02/2024 10:30', status: 'completed' },
    { step: 3, title: 'Origin Customs', time: '10/05/2024 14:20', status: 'completed' },
    { step: 4, title: 'Export Clearance', time: '10/06/2024 11:15', status: 'completed' },
    { step: 5, title: 'In Transit', time: 'Processing...', status: 'active' },
    { step: 6, title: 'Destination Customs Process', time: 'Pending', status: 'pending' },
    { step: 7, title: 'Import Released', time: 'Pending', status: 'pending' },
    { step: 8, title: 'Out for Delivery', time: 'Pending', status: 'pending' },
    { step: 9, title: 'POD', time: 'Pending', status: 'pending' },
  ],
};

// 格式化時間值
function formatTimeValue(fieldValue) {
  if (!fieldValue) return null;
  if (typeof fieldValue === 'string') {
    return fieldValue;
  }
  if (fieldValue instanceof Date) {
    return fieldValue.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return String(fieldValue);
}

// 提取路由字串
function extractRouteString(routeField) {
  if (!routeField) return null;
  if (typeof routeField === 'string') {
    const match = routeField.match(/Route:\s*(.+)/);
    return match ? match[1] : routeField;
  }
  return null;
}

// 判斷狀態
function determineStatus(stepData, timelineSteps) {
  const currentStep = timelineSteps.find(step => step.field && stepData[step.field]);
  if (currentStep) {
    return 'active';
  }
  const completedStep = timelineSteps.find(step => step.field && stepData[step.field]);
  if (completedStep) {
    return 'completed';
  }
  return 'pending';
}

// 從 Airtable 欄位建立時間軸
function buildTimelineFromFields(record, timelineSteps) {
  const timeline = [];
  
  timelineSteps.forEach((step, index) => {
    const fieldValue = record.get(step.field);
    const timeValue = formatTimeValue(fieldValue);
    
    let status = 'pending';
    if (timeValue) {
      const hasNextStep = index < timelineSteps.length - 1;
      const nextStepValue = record.get(timelineSteps[index + 1]?.field);
      status = nextStepValue ? 'completed' : 'active';
    }
    
    timeline.push({
      step: index + 1,
      title: step.title,
      time: timeValue || 'Pending',
      status,
    });
  });
  
  return timeline;
}

// 從 Airtable 查詢貨件
async function getShipmentByOrderAndTracking(orderNo, trackingNo) {
  if (USE_MOCK_DATA) {
    return {
      ...mockData,
      orderNo: orderNo || mockData.orderNo,
      trackingNo: trackingNo || mockData.trackingNo,
    };
  }

  try {
    const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
    
    const records = await base(AIRTABLE_SHIPMENTS_TABLE)
      .select({
        filterByFormula: `AND({Order No} = "${orderNo}", {Tracking No} = "${trackingNo}")`,
        maxRecords: 1,
      })
      .firstPage();

    if (records.length === 0) {
      return null;
    }

    const record = records[0];
    
    const timelineSteps = [
      { step: 1, field: 'Order Placed', title: 'Order Placed' },
      { step: 2, field: 'Processing', title: 'Processing' },
      { step: 3, field: 'Origin Customs', title: 'Origin Customs' },
      { step: 4, field: 'Export Clearance', title: 'Export Clearance' },
      { step: 5, field: 'In Transit', title: 'In Transit' },
      { step: 6, field: 'Destination Customs Process', title: 'Destination Customs Process' },
      { step: 7, field: 'Import Released', title: 'Import Released' },
      { step: 8, field: 'Out for Delivery', title: 'Out for Delivery' },
      { step: 9, field: 'POD', title: 'POD' },
    ];

    const timeline = buildTimelineFromFields(record, timelineSteps);
    
    const orderNoValue = record.get('Order No');
    const trackingNoValue = record.get('Tracking No');
    const statusValue = record.get('Status') || 'In Transit';
    const lastUpdateValue = record.get('Last Update');

    return {
      orderNo: Array.isArray(orderNoValue) ? orderNoValue[0] : orderNoValue,
      trackingNo: Array.isArray(trackingNoValue) ? trackingNoValue[0] : trackingNoValue,
      status: statusValue,
      lastUpdate: formatTimeValue(lastUpdateValue) || new Date().toLocaleDateString('zh-TW'),
      timeline,
    };
  } catch (error) {
    console.error('Airtable query error:', error);
    // 如果查詢失敗，回傳假資料
    return {
      ...mockData,
      orderNo: orderNo || mockData.orderNo,
      trackingNo: trackingNo || mockData.trackingNo,
    };
  }
}

// Netlify Function 處理器
exports.handler = async (event, context) => {
  const startTime = Date.now();
  const path = event.path;
  const method = event.httpMethod;
  const clientId = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';

  // 處理 CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // 檢查速率限制（除了健康檢查端點）
  if (!path.includes('/health')) {
    const rateLimit = checkRateLimit(clientId);
    if (!rateLimit.allowed) {
      recordMonitoringEntry(null, null, false, Date.now() - startTime);
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'rate_limit',
          message: '查詢次數已達上限，請稍後再試。',
          resetTime: rateLimit.resetTime,
        }),
      };
    }
  }

  // 健康檢查端點
  if (path.includes('/health')) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        usingMockData: USE_MOCK_DATA,
      }),
    };
  }

  // 監控統計端點
  if (path.includes('/monitoring/stats')) {
    const now = Date.now();
    const uptime = Math.floor((now - monitoringData.startTime) / 1000);
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);
    
    // 找出最常被查詢的 Order No.
    let topOrderNo = '-';
    let topOrderCount = 0;
    monitoringData.orderCounts.forEach((count, orderNo) => {
      if (count > topOrderCount) {
        topOrderCount = count;
        topOrderNo = orderNo;
      }
    });

    // 計算今日和本月查詢次數（簡化版，使用總查詢數）
    const todayQueries = monitoringData.successfulQueries;
    const monthQueries = monitoringData.successfulQueries;
    
    // 計算平均回應時間
    const avgResponseTime = monitoringData.requests.length > 0
      ? Math.round(
          monitoringData.requests.reduce((sum, req) => {
            const time = parseInt(req.responseTime) || 0;
            return sum + time;
          }, 0) / monitoringData.requests.length
        )
      : 0;
    
    // 計算成功率
    const successRate = monitoringData.totalRequests > 0
      ? ((monitoringData.successfulQueries / monitoringData.totalRequests) * 100).toFixed(1)
      : '0.0';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          todayQueries,
          monthQueries,
          totalRequests: monitoringData.totalRequests,
          successfulQueries: monitoringData.successfulQueries,
          failedQueries: monitoringData.failedQueries,
          successRate: `${successRate}%`,
          avgResponseTime: `${avgResponseTime}ms`,
          uptime: `${uptimeHours} 小時 ${uptimeMinutes} 分鐘`,
          topOrderNo,
          topOrderCount,
          recentRequests: monitoringData.requests.slice(-20).reverse(),
        },
      }),
    };
  }

  // 查詢端點
  if (path.includes('/tracking')) {
    try {
      let orderNo, trackingNo;

      if (method === 'GET') {
        const params = event.queryStringParameters || {};
        orderNo = params.orderNo;
        trackingNo = params.trackingNo;
      } else if (method === 'POST') {
        const body = JSON.parse(event.body || '{}');
        orderNo = body.orderNo;
        trackingNo = body.trackingNo;
      }

      if (!orderNo || !trackingNo) {
        recordMonitoringEntry(orderNo, trackingNo, false, Date.now() - startTime);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'missing_params',
            message: '請提供 orderNo 和 trackingNo 參數',
          }),
        };
      }

      const shipmentData = await getShipmentByOrderAndTracking(orderNo, trackingNo);
      const responseTime = Date.now() - startTime;

      if (!shipmentData) {
        recordMonitoringEntry(orderNo, trackingNo, false, responseTime);
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'not_found',
            message: '找不到對應的貨件資料',
          }),
        };
      }

      recordMonitoringEntry(orderNo, trackingNo, true, responseTime);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: shipmentData,
        }),
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      recordMonitoringEntry(null, null, false, responseTime);
      console.error('Tracking API error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'server_error',
          message: '伺服器錯誤，請稍後再試',
        }),
      };
    }
  }

  // 未知端點
  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({
      success: false,
      error: 'not_found',
      message: '找不到指定的端點',
    }),
  };
};

