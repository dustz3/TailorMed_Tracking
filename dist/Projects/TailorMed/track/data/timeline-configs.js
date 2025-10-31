// Timeline 狀態配置系統
// 根據不同貨件狀態顯示對應的時間軸節點

export const TIMELINE_CONFIGS = {
  // 標準狀態：9個步驟 + 乾冰事件
  standard: {
    name: '標準貨件追蹤',
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
    layout: 'three-column', // 三列布局
  },

  // 簡化狀態：6個步驟（無乾冰事件）
  simplified: {
    name: '簡化貨件追蹤',
    steps: [
      { step: 1, title: 'Order Created', field: 'Order Created' },
      { step: 2, title: 'Shipment Collected', field: 'Shipment Collected' },
      { step: 3, title: 'In Transit', field: 'In Transit' },
      {
        step: 4,
        title: 'Customs Process',
        field: 'Destination Customs Process',
      },
      { step: 5, title: 'Out for Delivery', field: 'Out for Delivery' },
      { step: 6, title: 'Shipment Delivered', field: 'Shipment Delivered' },
    ],
    layout: 'two-column', // 兩列布局
  },

  // 快速狀態：4個步驟（國內快遞）
  express: {
    name: '快速貨件追蹤',
    steps: [
      { step: 1, title: 'Order Created', field: 'Order Created' },
      { step: 2, title: 'Shipment Collected', field: 'Shipment Collected' },
      { step: 3, title: 'In Transit', field: 'In Transit' },
      { step: 4, title: 'Delivered', field: 'Shipment Delivered' },
    ],
    layout: 'single-column', // 單列布局
  },

  // 醫療狀態：特殊步驟（需要溫度控制）
  medical: {
    name: '醫療用品追蹤',
    steps: [
      { step: 1, title: 'Order Created', field: 'Order Created' },
      { step: 2, title: 'Quality Check', field: 'Quality Check' },
      { step: 3, title: 'Temperature Control', field: 'Temperature Control' },
      { step: 4, title: 'Shipment Collected', field: 'Shipment Collected' },
      { step: 5, title: 'In Transit', field: 'In Transit' },
      { step: 6, title: 'Cold Chain Verified', field: 'Cold Chain Verified' },
      { step: 7, title: 'Delivered', field: 'Shipment Delivered' },
    ],
    layout: 'medical-layout', // 醫療專用布局
  },
};

// 根據貨件類型自動選擇配置
export function getTimelineConfig(shipmentType, hasDryIce = false) {
  switch (shipmentType) {
    case 'medical':
      return TIMELINE_CONFIGS.medical;
    case 'express':
      return TIMELINE_CONFIGS.express;
    case 'simplified':
      return TIMELINE_CONFIGS.simplified;
    default:
      // 標準配置，但可根據是否有乾冰動態調整
      const config = { ...TIMELINE_CONFIGS.standard };
      if (!hasDryIce) {
        config.steps = config.steps.filter((step) => !step.isEvent);
      }
      return config;
  }
}

// 動態生成 Pug 模板的輔助函數
export function generateTimelineNodes(config, currentStep = 1) {
  return config.steps.map((stepDef) => {
    const step = stepDef.step;
    let status = 'pending';

    if (step && step < currentStep) {
      status = 'completed';
    } else if (step === currentStep) {
      status = 'active';
    }

    return {
      step: step,
      title: stepDef.title,
      status: status,
      isEvent: stepDef.isEvent || false,
      eventType: stepDef.eventType || null,
    };
  });
}
