// Timeline 狀態配置系統 V3
// 根據三種狀態（Domestic、Import/Export、Cross Trade）顯示對應的時間軸節點

export const TIMELINE_CONFIGS_V3 = {
  // Domestic 狀態：4個步驟
  domestic: {
    name: 'Domestic Shipment',
    steps: [
      { step: 1, title: 'Order Created', field: 'Order Created' },
      { step: 2, title: 'Shipment Collected', field: 'Shipment Collected' },
      { step: 3, title: 'In Transit', field: 'In Transit' },
      { step: 4, title: 'Delivered', field: 'Shipment Delivered' },
    ],
    nodeCount: 4,
    layout: 'domestic',
  },

  // Import/Export 狀態：7個步驟 + 2個事件
  importExport: {
    name: 'Import/Export Shipment',
    steps: [
      { step: 1, title: 'Order Created', field: 'Order Created' },
      { step: 2, title: 'Shipment Collected', field: 'Shipment Collected' },
      {
        step: 3,
        title: 'Origin Customs Process',
        field: 'Origin Customs Process',
      },
      { step: 4, title: 'Export Released', field: 'Export Released' },
      { step: 5, title: 'In Transit', field: 'In Transit' },
      {
        step: 6,
        title: 'Destination Customs Process',
        field: 'Destination Customs Process',
      },
      { step: 7, title: 'Import Released', field: 'Import Released' },
      {
        step: null,
        title: 'Dry Ice Refilled',
        field: 'Dry Ice Refilled?',
        isEvent: true,
        eventType: 'dryice',
      },
      { step: 8, title: 'Out for Delivery', field: 'Out for Delivery' },
      { step: 9, title: 'Shipment Delivered', field: 'Shipment Delivered' },
    ],
    nodeCount: 7, // 只計算主要步驟，不包含事件
    eventCount: 2, // 乾冰事件數量
    layout: 'import-export',
  },

  // Cross Trade 狀態：6個步驟
  crossTrade: {
    name: 'Cross Trade Shipment',
    steps: [
      { step: 1, title: 'Order Created', field: 'Order Created' },
      { step: 2, title: 'Shipment Collected', field: 'Shipment Collected' },
      {
        step: 3,
        title: 'Customs Process',
        field: 'Destination Customs Process',
      },
      { step: 4, title: 'In Transit', field: 'In Transit' },
      { step: 5, title: 'Out for Delivery', field: 'Out for Delivery' },
      { step: 6, title: 'Shipment Delivered', field: 'Shipment Delivered' },
    ],
    nodeCount: 6,
    layout: 'cross-trade',
  },
};

// 根據 Airtable 欄位值選擇配置
export function getTimelineConfigV3(shipmentType) {
  switch (shipmentType) {
    case 'Domestic':
      return TIMELINE_CONFIGS_V3.domestic;
    case 'Import/Export':
      return TIMELINE_CONFIGS_V3.importExport;
    case 'Cross Trade':
      return TIMELINE_CONFIGS_V3.crossTrade;
    default:
      return TIMELINE_CONFIGS_V3.domestic; // 預設為 Domestic
  }
}

// 計算節點位置（平均分配在時間軸上）
export function calculateNodePositions(nodeCount, totalWidth = 100) {
  const positions = [];
  const step = totalWidth / (nodeCount - 1);

  for (let i = 0; i < nodeCount; i++) {
    positions.push(i * step);
  }

  return positions;
}

// 生成時間軸數據
export function generateTimelineDataV3(config, currentStep = 1) {
  const { steps, nodeCount, layout } = config;
  const nodePositions = calculateNodePositions(nodeCount);

  // 只處理主要步驟（非事件）
  const mainSteps = steps.filter((step) => !step.isEvent);

  const timelineNodes = mainSteps.map((stepDef, index) => {
    const status = getStepStatus(stepDef, currentStep);
    return {
      ...stepDef,
      status,
      position: nodePositions[index],
      index,
    };
  });

  // 處理事件（如果有）
  const events = steps.filter((step) => step.isEvent);
  const timelineEvents = events.map((eventDef, index) => {
    const status = getEventStatus(eventDef, currentStep);
    return {
      ...eventDef,
      status,
      position: 75 + index * 10, // 事件位置在後半段
    };
  });

  return {
    configName: config.name,
    layout,
    timelineNodes,
    timelineEvents,
    progressWidth: calculateProgressWidth(mainSteps, currentStep),
  };
}

// 獲取步驟狀態
function getStepStatus(stepDef, currentStep) {
  if (stepDef.step < currentStep) {
    return 'completed';
  } else if (stepDef.step === currentStep) {
    return 'active';
  } else {
    return 'pending';
  }
}

// 獲取事件狀態
function getEventStatus(eventDef, currentStep) {
  // 事件通常在第7步之後出現
  if (currentStep >= 7) {
    return 'completed';
  } else {
    return 'pending';
  }
}

// 計算進度條寬度
function calculateProgressWidth(steps, currentStep) {
  const completedSteps = steps.filter((step) => step.step < currentStep).length;
  const totalSteps = steps.length;
  return Math.round((completedSteps / totalSteps) * 100);
}
