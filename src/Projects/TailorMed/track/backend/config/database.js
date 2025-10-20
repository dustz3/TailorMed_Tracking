// 資料庫連線設定 - Airtable 或 Mock 資料
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// 檢查是否使用 mock 資料
const USE_MOCK_DATA =
  process.env.USE_MOCK_DATA === 'true' || !process.env.AIRTABLE_API_KEY;

let base = null;
if (!USE_MOCK_DATA) {
  const Airtable = require('airtable');
  // 初始化 Airtable
  Airtable.configure({
    apiKey: process.env.AIRTABLE_API_KEY,
  });
  base = Airtable.base(process.env.AIRTABLE_BASE_ID);
}

// Table 名稱 - 只需要一個表
const SHIPMENTS_TABLE = process.env.AIRTABLE_SHIPMENTS_TABLE || 'Tracking';

// 時間軸步驟定義
const TIMELINE_STEPS = [
  { step: 1, field: 'Order Created', title: 'Order Created' },
  { step: 2, field: 'Shipment Collected', title: 'Shipment Collected' },
  { step: 3, field: 'Origin Customs Process', title: 'Origin Customs Process' },
  { step: 4, field: 'Export Released', title: 'Export Released' },
  { step: 5, field: 'In Transit', title: 'In Transit' },
  {
    step: 6,
    field: 'Destination Customs Process',
    title: 'Destination Customs Process',
  },
  { step: 7, field: 'Import Released', title: 'Import Released' },
  {
    step: null,
    field: 'Dry Ice Refilled?',
    title: 'Dry Ice Refilled',
    isEvent: true,
    eventType: 'dryice',
  },
  { step: 8, field: 'Out for Delivery', title: 'Out for Delivery' },
  { step: 9, field: 'Shipment Delivered', title: 'Shipment Delivered' },
];

// 資料庫操作函數
const db = {
  // 根據訂單號和追蹤號查詢貨件
  async getShipmentByOrderAndTracking(orderNo, trackingNo) {
    try {
      console.log(`🔍 查詢貨件: Order=${orderNo}, Tracking=${trackingNo}`);

      // 如果使用 mock 資料
      if (USE_MOCK_DATA) {
        console.log('📦 使用 Mock 資料模式');

        // 載入 mock 資料
        const mockDataPath = path.join(__dirname, '../data/mock-tracking.json');
        const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));

        // 檢查是否匹配查詢條件
        if (
          mockData.orderNo === orderNo &&
          mockData.trackingNo === trackingNo
        ) {
          console.log('✅ Mock 資料查詢成功');
          return mockData;
        } else {
          console.log('❌ Mock 資料中找不到匹配的貨件');
          return null;
        }
      }

      // 使用 Airtable 查詢
      const records = await base(SHIPMENTS_TABLE)
        .select({
          filterByFormula: `AND({Job No.}='${orderNo}', {Tracking No.}='${trackingNo}')`,
          maxRecords: 1,
        })
        .firstPage();

      if (records.length === 0) {
        console.log('❌ 查無貨件資料');
        return null;
      }

      const record = records[0];
      const fields = record.fields;

      // 從各個時間欄位組合 Timeline
      const timeline = this._buildTimelineFromFields(fields);

      // 將 Airtable 資料格式轉換為前端需要的格式
      const shipment = {
        id: record.id,
        orderNo: fields['Job No.'],
        trackingNo: fields['Tracking No.'],
        invoiceNo: fields['Invoice No.'],
        mawb: fields['MAWB'],
        route: this._extractRouteString(fields['Origin/Destination']),
        packageCount: fields['Package Count'],
        weight: fields['Weight(KG)'],
        eta: this._formatTimeValue(fields['ETA']),
        status: this._determineStatus(timeline),
        lastUpdate: this._formatTimeValue(fields['Lastest Update']),
        timeline: timeline,
      };

      console.log('✅ 查詢成功');
      return shipment;
    } catch (error) {
      console.error('❌ 查詢錯誤:', error.message);
      throw error;
    }
  },

  // 取得時間軸事件（從貨件記錄中提取）
  async getTimelineEvents(trackingNo) {
    try {
      console.log(`🔍 查詢時間軸: Tracking=${trackingNo}`);

      const records = await base(SHIPMENTS_TABLE)
        .select({
          filterByFormula: `{Tracking No.}='${trackingNo}'`,
          maxRecords: 1,
        })
        .firstPage();

      if (records.length === 0) {
        return [];
      }

      const fields = records[0].fields;
      const timeline = this._buildTimelineFromFields(fields);

      console.log(`✅ 找到 ${timeline.length} 筆時間軸記錄`);
      return timeline;
    } catch (error) {
      console.error('❌ Airtable 時間軸查詢錯誤:', error.message);
      throw error;
    }
  },

  // 從 Airtable 欄位組合 Timeline 陣列
  _buildTimelineFromFields(fields) {
    const timeline = [];
    let nextProcessingIndex = -1;

    // 檢查是否已送達完成（Shipment Delivered 有時間資料）
    const isDelivered = fields['Shipment Delivered'];

    // 找出下一個沒有時間資料的步驟（排除事件步驟）
    TIMELINE_STEPS.forEach((stepDef, index) => {
      if (
        !fields[stepDef.field] &&
        !stepDef.isEvent &&
        nextProcessingIndex === -1
      ) {
        nextProcessingIndex = index;
      }
    });

    // 檢查是否應該顯示乾冰事件（步驟 8 完成且乾冰有打勾）
    const shouldShowDryIce =
      fields['Out for Delivery'] && fields['Dry Ice Refilled?'];

    // 組合 timeline
    TIMELINE_STEPS.forEach((stepDef, index) => {
      // 如果是乾冰事件，檢查是否應該顯示
      if (stepDef.isEvent) {
        if (!shouldShowDryIce) {
          return; // 跳過乾冰事件
        }
      }

      const timeValue = fields[stepDef.field];
      let status, time, title;

      // 處理標題（如果是 Shipment Delivered 且已完成，加上彩帶 emoji）
      title = stepDef.title;
      if (stepDef.field === 'Shipment Delivered' && timeValue) {
        title = `${stepDef.title} 🎉`;
      }

      if (timeValue) {
        // 有時間值 = 已完成
        status = 'completed';
        time = this._formatTimeValue(timeValue);
      } else {
        // 沒有時間值 = 如果是最下一個步驟且未送達則顯示為進行中，否則為待處理
        if (index === nextProcessingIndex && !stepDef.isEvent && !isDelivered) {
          status = 'active';
          time = 'Processing...';
        } else {
          status = 'pending';
          time = 'Pending';
        }
      }

      const timelineItem = {
        step: stepDef.step,
        title: title,
        time: time,
        status: status,
      };

      // 如果是 event，加入額外屬性
      if (stepDef.isEvent) {
        timelineItem.isEvent = true;
        timelineItem.eventType = stepDef.eventType;
      }

      timeline.push(timelineItem);
    });

    return timeline;
  },

  // 格式化時間值（處理 Airtable 各種時間格式）
  _formatTimeValue(value) {
    // 如果是陣列，取第一個元素
    if (Array.isArray(value)) {
      if (value.length === 0) return 'N/A';
      value = value[0];
    }

    // 如果是布林值 true（checkbox 勾選），顯示「已完成」
    if (value === true) {
      return 'Done';
    }

    // 如果是布林值 false，顯示為空
    if (value === false) {
      return 'N/A';
    }

    // 如果是有效的日期字串，格式化為 DD/MM/YYYY HH:MM
    if (typeof value === 'string' && value.length > 0) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          // 轉換為台灣時間 (UTC+8)
          const taiwanDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);

          // 格式化為：08/10/2025 14:32
          const year = taiwanDate.getUTCFullYear();
          const month = String(taiwanDate.getUTCMonth() + 1).padStart(2, '0');
          const day = String(taiwanDate.getUTCDate()).padStart(2, '0');
          const hours = String(taiwanDate.getUTCHours()).padStart(2, '0');
          const minutes = String(taiwanDate.getUTCMinutes()).padStart(2, '0');
          return `${day}/${month}/${year} ${hours}:${minutes}`;
        }
      } catch (error) {
        // 如果無法解析，直接返回原值
        return value;
      }
    }

    // 其他情況直接返回字串形式
    return String(value);
  },

  // 提取路線字串（直接返回 Airtable 的值）
  _extractRouteString(originDestination) {
    if (!originDestination) return null;

    // 如果是陣列（Lookup 欄位），取第一個元素
    if (Array.isArray(originDestination)) {
      return originDestination[0] || null;
    }

    // 如果是字串，直接返回
    if (typeof originDestination === 'string') {
      return originDestination;
    }

    return null;
  },

  // 根據時間軸判斷當前狀態
  _determineStatus(timeline) {
    if (!timeline || timeline.length === 0) {
      return 'Processing';
    }

    // 找出正在進行中的步驟（status === 'active'）
    const activeStep = timeline.find(
      (item) => item.status === 'active' && !item.isEvent
    );

    if (activeStep) {
      return activeStep.title;
    }

    // 如果沒有 active 步驟，找最後一個已完成的步驟
    const completedSteps = timeline.filter(
      (item) => item.status === 'completed' && !item.isEvent
    );

    if (completedSteps.length === 0) {
      return 'Order Created';
    }

    const lastCompleted = completedSteps[completedSteps.length - 1];
    // 如果最後完成的步驟是 Shipment Delivered，加上彩帶 emoji
    if (lastCompleted.title.includes('Shipment Delivered')) {
      return lastCompleted.title; // 已經包含 emoji 了
    }
    return lastCompleted.title;
  },

  // 測試資料庫連線
  async testConnection() {
    try {
      if (USE_MOCK_DATA) {
        console.log('🔗 測試 Mock 資料連線...');

        // 檢查 mock 資料檔案是否存在
        const mockDataPath = path.join(__dirname, '../data/mock-tracking.json');
        if (fs.existsSync(mockDataPath)) {
          const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
          console.log('✅ Mock 資料連線成功');
          console.log(
            `📊 Mock 資料: ${mockData.orderNo} - ${mockData.trackingNo}`
          );
          return true;
        } else {
          throw new Error('Mock 資料檔案不存在');
        }
      } else {
        console.log('🔗 測試 Airtable 連線...');

        // 嘗試讀取一筆資料來測試連線
        const records = await base(SHIPMENTS_TABLE)
          .select({ maxRecords: 1 })
          .firstPage();

        console.log('✅ Airtable 連線成功');
        console.log(`📊 資料表: ${SHIPMENTS_TABLE}`);
        return true;
      }
    } catch (error) {
      console.error('❌ 資料庫連線失敗:', error.message);
      if (!USE_MOCK_DATA) {
        console.error('請檢查：');
        console.error('  1. AIRTABLE_API_KEY 是否正確');
        console.error('  2. AIRTABLE_BASE_ID 是否正確');
        console.error('  3. Table 名稱是否正確');
        console.error('  4. Token 權限是否足夠');
      }
      throw error;
    }
  },

  // 新增貨件（選用功能）
  async createShipment(shipmentData) {
    try {
      const record = await base(SHIPMENTS_TABLE).create([
        {
          fields: {
            'Order No': shipmentData.orderNo,
            'Tracking No': shipmentData.trackingNo,
            'Invoice No': shipmentData.invoiceNo,
            MAWB: shipmentData.mawb,
            Origin: shipmentData.origin,
            Destination: shipmentData.destination,
            'Package Count': shipmentData.packageCount,
            Weight: shipmentData.weight,
            ETA: shipmentData.eta,
            Status: shipmentData.status,
            'Last Update': shipmentData.lastUpdate,
          },
        },
      ]);

      console.log('✅ 貨件已新增');
      return record[0].id;
    } catch (error) {
      console.error('❌ 新增貨件失敗:', error.message);
      throw error;
    }
  },

  // 更新貨件狀態（選用功能）
  async updateShipmentStatus(recordId, status, lastUpdate) {
    try {
      await base(SHIPMENTS_TABLE).update([
        {
          id: recordId,
          fields: {
            Status: status,
            'Last Update': lastUpdate,
          },
        },
      ]);

      console.log('✅ 貨件狀態已更新');
      return true;
    } catch (error) {
      console.error('❌ 更新貨件失敗:', error.message);
      throw error;
    }
  },
};

// 啟動時測試連線
db.testConnection().catch(console.error);

module.exports = db;
