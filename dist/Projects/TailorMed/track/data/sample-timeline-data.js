// 範例 Timeline 資料 - 用於動態渲染
// 這個檔案定義了不同狀態的 timeline 資料結構

const SAMPLE_TIMELINE_DATA = {
  // 第一個 Domestic Timeline - 第一步 Processing
  domesticStep1: {
    type: 'domestic',
    currentStep: 1,
    progressPercentage: 6, // 6% 完成
    nodes: [
      {
        status: 'processing',
        date: 'Oct 10',
        statusText: 'Order Created',
        statusTime: 'Processing...',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'Shipment Collected',
        statusTime: '--:--',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'In Transit',
        statusTime: '--:--',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'Shipment Delivered',
        statusTime: '--:--',
      },
    ],
  },

  // 第二個 Domestic Timeline - 第二步 Processing
  domesticStep2: {
    type: 'domestic',
    currentStep: 2,
    progressPercentage: 39.33, // 39.33% 完成
    nodes: [
      {
        status: 'completed',
        date: 'Oct 10',
        statusText: 'Order Created',
        statusTime: '09:30',
      },
      {
        status: 'processing',
        date: 'Oct 11',
        statusText: 'Shipment Collected',
        statusTime: 'Processing...',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'In Transit',
        statusTime: '--:--',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'Shipment Delivered',
        statusTime: '--:--',
      },
    ],
  },

  // 第三個 Domestic Timeline - 第三步 Processing
  domesticStep3: {
    type: 'domestic',
    currentStep: 3,
    progressPercentage: 72.67, // 72.67% 完成
    nodes: [
      {
        status: 'completed',
        date: 'Oct 10',
        statusText: 'Order Created',
        statusTime: '09:30',
      },
      {
        status: 'completed',
        date: 'Oct 11',
        statusText: 'Shipment Collected',
        statusTime: '14:20',
      },
      {
        status: 'processing',
        date: 'Oct 12',
        statusText: 'In Transit',
        statusTime: 'Processing...',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'Shipment Delivered',
        statusTime: '--:--',
      },
    ],
  },

  // 第四個 Domestic Timeline - 第四步 Processing
  domesticStep4: {
    type: 'domestic',
    currentStep: 4,
    progressPercentage: 100, // 100% 完成
    nodes: [
      {
        status: 'completed',
        date: 'Oct 10',
        statusText: 'Order Created',
        statusTime: '09:30',
      },
      {
        status: 'completed',
        date: 'Oct 11',
        statusText: 'Shipment Collected',
        statusTime: '14:20',
      },
      {
        status: 'completed',
        date: 'Oct 12',
        statusText: 'In Transit',
        statusTime: '08:45',
      },
      {
        status: 'processing',
        date: 'Oct 13',
        statusText: 'Shipment Delivered',
        statusTime: 'Processing...',
      },
    ],
  },

  // 第五個 Timeline - Domestic 完成（使用 Completion 樣式）
  completed: {
    type: 'domestic',
    currentStep: 5,
    progressPercentage: 100, // 100% 完成
    nodes: [
      {
        status: 'completed',
        date: 'Oct 10',
        statusText: 'Order Created',
        statusTime: '09:30',
        useCompletionStyle: true, // 第一個節點使用 Completion 樣式
      },
      {
        status: 'completed',
        date: 'Oct 11',
        statusText: 'Shipment Collected',
        statusTime: '14:20',
        useCompletionStyle: true, // 第二個節點使用 Completion 樣式
      },
      {
        status: 'completed',
        date: 'Oct 12',
        statusText: 'In Transit',
        statusTime: '08:45',
        useCompletionStyle: true, // 第三個節點使用 Completion 樣式
      },
      {
        status: 'completed',
        date: 'Oct 13',
        statusText: 'Shipment Delivered',
        statusTime: '18:00',
        isLastNode: true,
        useOrderCompletionContainer: true, // 最後節點使用 order-completion-container 樣式
      },
    ],
    // 沒有事件
  },

  // Import/Export Timeline - 第一步 Processing
  importExportStep1: {
    type: 'import_export',
    currentStep: 1,
    progressPercentage: 14.29, // 1/7 = 14.29%
    nodes: [
      {
        status: 'processing',
        date: 'Oct 10',
        statusText: 'Order Created',
        statusTime: 'Processing...',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'Shipment Collected',
        statusTime: '--:--',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'Origin Customs Process',
        statusTime: '--:--',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'In Transit',
        statusTime: '--:--',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'Destination Customs Process',
        statusTime: '--:--',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'Out for Delivery',
        statusTime: '--:--',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'Shipment Delivered',
        statusTime: '--:--',
      },
    ],
    events: [
      {
        id: 'dry-ice-terminal',
        type: 'dry-ice',
        text: 'Dry ice refilled<br/>(Terminal)',
        position: '57%',
        isVisible: false,
      },
      {
        id: 'dry-ice-refilled',
        type: 'special-handling',
        text: 'Dry ice refilled',
        position: '73.5%',
        isVisible: false,
      },
    ],
  },

  // Import/Export Timeline - 第二步 Processing
  importExportStep2: {
    type: 'import_export',
    currentStep: 2,
    progressPercentage: 28.57, // 2/7 = 28.57%
    nodes: [
      {
        status: 'completed',
        date: 'Oct 10',
        statusText: 'Order Created',
        statusTime: '09:30',
      },
      {
        status: 'processing',
        date: 'Oct 11',
        statusText: 'Shipment Collected',
        statusTime: 'Processing...',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'Origin Customs Process',
        statusTime: '--:--',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'In Transit',
        statusTime: '--:--',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'Destination Customs Process',
        statusTime: '--:--',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'Out for Delivery',
        statusTime: '--:--',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'Shipment Delivered',
        statusTime: '--:--',
      },
    ],
    events: [
      {
        id: 'dry-ice-terminal',
        type: 'dry-ice',
        text: 'Dry ice refilled<br/>(Terminal)',
        position: '57%',
        isVisible: false,
      },
      {
        id: 'dry-ice-refilled',
        type: 'special-handling',
        text: 'Dry ice refilled',
        position: '73.5%',
        isVisible: false,
      },
    ],
  },

  // Import/Export Timeline - 第三步 Processing
  importExportStep3: {
    type: 'import_export',
    currentStep: 3,
    progressPercentage: 42.86, // 3/7 = 42.86%
    nodes: [
      {
        status: 'completed',
        date: 'Oct 10',
        statusText: 'Order Created',
        statusTime: '09:30',
      },
      {
        status: 'completed',
        date: 'Oct 11',
        statusText: 'Shipment Collected',
        statusTime: '14:20',
      },
      {
        status: 'processing',
        date: 'Oct 12',
        statusText: 'Origin Customs Process',
        statusTime: 'Processing...',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'In Transit',
        statusTime: '--:--',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'Destination Customs Process',
        statusTime: '--:--',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'Out for Delivery',
        statusTime: '--:--',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'Shipment Delivered',
        statusTime: '--:--',
      },
    ],
    events: [
      {
        id: 'dry-ice-terminal',
        type: 'dry-ice',
        text: 'Dry ice refilled<br/>(Terminal)',
        position: '57%',
        isVisible: false,
      },
      {
        id: 'dry-ice-refilled',
        type: 'special-handling',
        text: 'Dry ice refilled',
        position: '73.5%',
        isVisible: false,
      },
    ],
  },

  // Import/Export Timeline - 第四步 Processing
  importExportStep4: {
    type: 'import_export',
    currentStep: 4,
    progressPercentage: 57.14, // 4/7 = 57.14%
    nodes: [
      {
        status: 'completed',
        date: 'Oct 10',
        statusText: 'Order Created',
        statusTime: '09:30',
      },
      {
        status: 'completed',
        date: 'Oct 11',
        statusText: 'Shipment Collected',
        statusTime: '14:20',
      },
      {
        status: 'completed',
        date: 'Oct 12',
        statusText: 'Origin Customs Process',
        statusTime: '08:45',
      },
      {
        status: 'processing',
        date: 'Oct 14',
        statusText: 'In Transit',
        statusTime: 'Processing...',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'Destination Customs Process',
        statusTime: '--:--',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'Out for Delivery',
        statusTime: '--:--',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'Shipment Delivered',
        statusTime: '--:--',
      },
    ],
    events: [
      {
        id: 'dry-ice-terminal',
        type: 'dry-ice',
        text: 'Dry ice refilled<br/>(Terminal)',
        position: '57%',
        isVisible: false,
      },
      {
        id: 'dry-ice-refilled',
        type: 'special-handling',
        text: 'Dry ice refilled',
        position: '73.5%',
        isVisible: false,
      },
    ],
  },

  // Import/Export Timeline - 第五步 Processing
  importExportStep5: {
    type: 'import_export',
    currentStep: 5,
    progressPercentage: 71.43, // 5/7 = 71.43%
    nodes: [
      {
        status: 'completed',
        date: 'Oct 10',
        statusText: 'Order Created',
        statusTime: '09:30',
      },
      {
        status: 'completed',
        date: 'Oct 11',
        statusText: 'Shipment Collected',
        statusTime: '14:20',
      },
      {
        status: 'completed',
        date: 'Oct 12',
        statusText: 'Origin Customs Process',
        statusTime: '08:45',
      },
      {
        status: 'completed',
        date: 'Oct 14',
        statusText: 'In Transit',
        statusTime: '16:00',
      },
      {
        status: 'processing',
        date: 'Oct 15',
        statusText: 'Destination Customs Process',
        statusTime: 'Processing...',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'Out for Delivery',
        statusTime: '--:--',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'Shipment Delivered',
        statusTime: '--:--',
      },
    ],
    events: [
      {
        id: 'dry-ice-terminal',
        type: 'dry-ice',
        text: 'Dry ice refilled<br/>(Terminal)',
        position: '57%',
        isVisible: false,
      },
      {
        id: 'dry-ice-refilled',
        type: 'special-handling',
        text: 'Dry ice refilled',
        position: '73.5%',
        isVisible: false,
      },
    ],
  },

  // Import/Export Timeline - 第六步 Processing
  importExportStep6: {
    type: 'import_export',
    currentStep: 6,
    progressPercentage: 85.71, // 6/7 = 85.71%
    nodes: [
      {
        status: 'completed',
        date: 'Oct 10',
        statusText: 'Order Created',
        statusTime: '09:30',
      },
      {
        status: 'completed',
        date: 'Oct 11',
        statusText: 'Shipment Collected',
        statusTime: '14:20',
      },
      {
        status: 'completed',
        date: 'Oct 12',
        statusText: 'Origin Customs Process',
        statusTime: '08:45',
      },
      {
        status: 'completed',
        date: 'Oct 14',
        statusText: 'In Transit',
        statusTime: '16:00',
      },
      {
        status: 'completed',
        date: 'Oct 15',
        statusText: 'Destination Customs Process',
        statusTime: '11:45',
      },
      {
        status: 'processing',
        date: 'Oct 16',
        statusText: 'Out for Delivery',
        statusTime: 'Processing...',
      },
      {
        status: 'pending',
        date: 'TBD',
        statusText: 'Shipment Delivered',
        statusTime: '--:--',
      },
    ],
    events: [
      {
        id: 'dry-ice-terminal',
        type: 'dry-ice',
        text: 'Dry ice refilled<br/>(Terminal)',
        position: '57%',
        isVisible: false,
      },
      {
        id: 'dry-ice-refilled',
        type: 'special-handling',
        text: 'Dry ice refilled',
        position: '73.5%',
        isVisible: false,
      },
    ],
  },

  // Import/Export Timeline - 第七步 Processing (完成)
  importExportStep7: {
    type: 'import_export',
    currentStep: 7,
    progressPercentage: 100, // 7/7 = 100%
    nodes: [
      {
        status: 'completed',
        date: 'Oct 10',
        statusText: 'Order Created',
        statusTime: '09:30',
      },
      {
        status: 'completed',
        date: 'Oct 11',
        statusText: 'Shipment Collected',
        statusTime: '14:20',
      },
      {
        status: 'completed',
        date: 'Oct 12',
        statusText: 'Origin Customs Process',
        statusTime: '08:45',
      },
      {
        status: 'completed',
        date: 'Oct 14',
        statusText: 'In Transit',
        statusTime: '16:00',
      },
      {
        status: 'completed',
        date: 'Oct 15',
        statusText: 'Destination Customs Process',
        statusTime: '11:45',
      },
      {
        status: 'completed',
        date: 'Oct 16',
        statusText: 'Out for Delivery',
        statusTime: '12:00',
      },
      {
        status: 'processing',
        date: 'Oct 16',
        statusText: 'Shipment Delivered',
        statusTime: 'Processing...',
      },
    ],
    events: [
      {
        type: 'dry-ice',
        text: 'Dry ice refilled<br/>(Terminal)',
        isVisible: false,
      },
      {
        type: 'special-handling',
        text: 'Dry ice refilled',
        isVisible: false,
      },
    ],
  },

  // Import/Export Timeline - 完成狀態（使用 Completion 樣式）
  importExportCompleted: {
    type: 'import_export',
    currentStep: 8,
    progressPercentage: 100, // 100% 完成
    nodes: [
      {
        status: 'completed',
        date: 'Oct 10',
        statusText: 'Order Created',
        statusTime: '09:30',
        useCompletionStyle: true, // 第一個節點使用 Completion 樣式
      },
      {
        status: 'completed',
        date: 'Oct 11',
        statusText: 'Shipment Collected',
        statusTime: '14:20',
        useCompletionStyle: true, // 第二個節點使用 Completion 樣式
      },
      {
        status: 'completed',
        date: 'Oct 12',
        statusText: 'Origin Customs Process',
        statusTime: '08:45',
        useCompletionStyle: true, // 第三個節點使用 Completion 樣式
      },
      {
        status: 'completed',
        date: 'Oct 14',
        statusText: 'In Transit',
        statusTime: '16:00',
        useCompletionStyle: true, // 第四個節點使用 Completion 樣式
      },
      {
        status: 'completed',
        date: 'Oct 15',
        statusText: 'Destination Customs Process',
        statusTime: '11:45',
        useCompletionStyle: true, // 第五個節點使用 Completion 樣式
      },
      {
        status: 'completed',
        date: 'Oct 16',
        statusText: 'Out for Delivery',
        statusTime: '12:00',
        useCompletionStyle: true, // 第六個節點使用 Completion 樣式
      },
      {
        status: 'completed',
        date: 'Oct 16',
        statusText: 'Shipment Delivered',
        statusTime: '18:00',
        isLastNode: true,
        useOrderCompletionContainer: true, // 最後節點使用 order-completion-container 樣式
      },
    ],
    events: [
      {
        type: 'dry-ice',
        text: 'Dry ice refilled<br/>(Terminal)',
        isVisible: false,
      },
      {
        type: 'special-handling',
        text: 'Dry ice refilled',
        isVisible: false,
      },
    ],
  },

  // Order Completion Timeline - 全部完成
  completion: {
    type: 'order_completion',
    currentStep: 7,
    progressPercentage: 100, // 100% 完成
    nodes: [
      {
        status: 'completed',
        date: 'Oct 10',
        statusText: 'Order Created',
        statusTime: '09:30',
      },
      {
        status: 'completed',
        date: 'Oct 11',
        statusText: 'Shipment Collected',
        statusTime: '14:20',
      },
      {
        status: 'completed',
        date: 'Oct 12',
        statusText: 'Origin Customs Process',
        statusTime: '08:45',
      },
      {
        status: 'completed',
        date: 'Oct 14',
        statusText: 'Destination Customs Process',
        statusTime: '16:00',
      },
      {
        status: 'completed',
        date: 'Oct 15',
        statusText: 'Dry ice refilled',
        statusTime: '10:30',
      },
      {
        status: 'completed',
        date: 'Oct 16',
        statusText: 'Out for Delivery',
        statusTime: '12:00',
      },
      {
        status: 'completed',
        date: 'Oct 16',
        statusText: 'Shipment Delivered',
        statusTime: '18:00',
        isLastNode: true,
      },
    ],
    events: [
      {
        type: 'dry-ice',
        text: 'Dry ice refilled<br/>(Terminal)',
        isVisible: false,
      },
    ],
  },
};

// 根據狀態獲取對應的 timeline 資料
function getTimelineDataByStatus(status) {
  switch (status) {
    case 'domestic-step1':
      return SAMPLE_TIMELINE_DATA.domesticStep1;
    case 'domestic-step2':
      return SAMPLE_TIMELINE_DATA.domesticStep2;
    case 'domestic-step3':
      return SAMPLE_TIMELINE_DATA.domesticStep3;
    case 'domestic-step4':
      return SAMPLE_TIMELINE_DATA.domesticStep4;
    case 'completed':
      return SAMPLE_TIMELINE_DATA.completed;
    case 'import-export-step1':
      return SAMPLE_TIMELINE_DATA.importExportStep1;
    case 'import-export-step2':
      return SAMPLE_TIMELINE_DATA.importExportStep2;
    case 'import-export-step3':
      return SAMPLE_TIMELINE_DATA.importExportStep3;
    case 'import-export-step4':
      return SAMPLE_TIMELINE_DATA.importExportStep4;
    case 'import-export-step5':
      return SAMPLE_TIMELINE_DATA.importExportStep5;
    case 'import-export-step6':
      return SAMPLE_TIMELINE_DATA.importExportStep6;
    case 'import-export-step7':
      return SAMPLE_TIMELINE_DATA.importExportStep7;
    case 'import-export-completed':
      return SAMPLE_TIMELINE_DATA.importExportCompleted;
    case 'import-export':
      return SAMPLE_TIMELINE_DATA.importExport;
    case 'completion':
      return SAMPLE_TIMELINE_DATA.completion;
    default:
      return SAMPLE_TIMELINE_DATA.domesticStep1;
  }
}

// 獲取所有 timeline 資料（用於展示多個狀態）
function getAllTimelineData() {
  return [
    SAMPLE_TIMELINE_DATA.domesticStep1,
    // 只顯示一個 Domestic timeline
    // SAMPLE_TIMELINE_DATA.domesticStep2,
    // SAMPLE_TIMELINE_DATA.domesticStep3,
    // SAMPLE_TIMELINE_DATA.domesticStep4,
    // 暫時排除 ImportExport 和 Completion
    // SAMPLE_TIMELINE_DATA.importExport,
    // SAMPLE_TIMELINE_DATA.completion,
  ];
}

// 動態更新 timeline 狀態的範例函數
function simulateTimelineProgress() {
  const timelineManager = window.TimelineManager;
  if (!timelineManager) return;

  const container = document.getElementById('timeline-container');
  if (!container) return;

  // 每 3 秒更新一次狀態
  let currentStatus = 'domestic-step1';
  const statuses = [
    'domestic-step1',
    'domestic-step2',
    'domestic-step3',
    'domestic-step4',
    'completed',
    // 暫時排除 ImportExport 和 Completion
    // 'import-export',
    // 'completion',
  ];
  let currentIndex = 0;

  setInterval(() => {
    currentStatus = statuses[currentIndex];
    const timelineData = getTimelineDataByStatus(currentStatus);

    // 清空容器並渲染新的 timeline
    container.innerHTML = '';
    timelineManager.renderTimeline([timelineData], 'timeline-container');

    // 更新進度條
    timelineManager.updateTimelineProgress(0, timelineData.progressPercentage);

    currentIndex = (currentIndex + 1) % statuses.length;
  }, 3000);
}

// 匯出供其他檔案使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SAMPLE_TIMELINE_DATA,
    getTimelineDataByStatus,
    getAllTimelineData,
    simulateTimelineProgress,
  };
} else {
  // 瀏覽器環境
  window.SAMPLE_TIMELINE_DATA = SAMPLE_TIMELINE_DATA;
  window.getTimelineDataByStatus = getTimelineDataByStatus;
  window.getAllTimelineData = getAllTimelineData;
  window.simulateTimelineProgress = simulateTimelineProgress;
}
