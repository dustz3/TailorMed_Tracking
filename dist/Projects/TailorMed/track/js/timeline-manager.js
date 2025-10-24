// Timeline Manager - 動態時間軸管理系統
// 用於根據資料動態渲染不同狀態的時間軸

class TimelineManager {
  constructor() {
    this.timelineTypes = {
      domestic: 'domestic',
      importExport: 'import_export',
      completion: 'order_completion',
    };

    this.nodeStates = {
      completed: 'completed',
      processing: 'processing',
      pending: 'pending',
    };
  }

  // 根據資料動態渲染 timeline
  renderTimeline(timelineData, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return;
    }

    // 清空容器
    container.innerHTML = '';

    // 根據 timeline 類型渲染
    timelineData.forEach((timeline, index) => {
      const timelineElement = this.createTimelineElement(timeline, index);
      container.appendChild(timelineElement);
    });
  }

  // 創建單個 timeline 元素
  createTimelineElement(timeline, index) {
    const wrapper = document.createElement('div');
    wrapper.className = `timeline-track-container timeline-${timeline.type}`;

    // 根據 domestic timeline 的步驟添加對應的類別
    if (timeline.type === this.timelineTypes.domestic) {
      switch (timeline.currentStep) {
        case 1:
          wrapper.classList.add('timeline-domestic-step1');
          break;
        case 2:
          wrapper.classList.add('timeline-domestic-step2');
          break;
        case 3:
          wrapper.classList.add('timeline-domestic-step3');
          break;
        case 4:
          wrapper.classList.add('timeline-domestic-step4');
          break;
        case 5:
          wrapper.classList.add('timeline-domestic-completed');
          break;
        default:
          wrapper.classList.add('timeline-domestic-full');
      }
    }

    // 根據 import_export timeline 的步驟添加對應的類別
    if (timeline.type === this.timelineTypes.importExport) {
      switch (timeline.currentStep) {
        case 1:
          wrapper.classList.add('timeline-import_export-step1');
          break;
        case 2:
          wrapper.classList.add('timeline-import_export-step2');
          break;
        case 3:
          wrapper.classList.add('timeline-import_export-step3');
          break;
        case 4:
          wrapper.classList.add('timeline-import_export-step4');
          break;
        case 5:
          wrapper.classList.add('timeline-import_export-step5');
          break;
        case 6:
          wrapper.classList.add('timeline-import_export-step6');
          break;
        case 7:
          wrapper.classList.add('timeline-import_export-step7');
          break;
        case 8:
          wrapper.classList.add('timeline-import_export-completed');
          break;
        default:
          wrapper.classList.add('timeline-import_export');
      }
    }

    // Order Completion timeline 使用專用樣式
    if (timeline.type === this.timelineTypes.completion) {
      wrapper.classList.add('timeline-order_completion');
    }

    wrapper.innerHTML = this.generateTimelineHTML(timeline);
    return wrapper;
  }

  // 生成 timeline HTML
  generateTimelineHTML(timeline) {
    const { type, nodes, events = [] } = timeline;

    let html = `
      <div class="timeline-visual-container">
        <div class="timeline-horizontal-line"></div>
        <div class="timeline-nodes">
    `;

    // 渲染節點
    nodes.forEach((node, index) => {
      html += this.generateNodeHTML(node, index + 1, type);
    });

    html += `
        </div>
      </div>
    `;

    // 渲染事件
    if (events.length > 0) {
      html += '<div class="timeline-events">';
      events.forEach((event) => {
        html += this.generateEventHTML(event);
      });
      html += '</div>';
    }

    return html;
  }

  // 生成節點 HTML
  generateNodeHTML(node, stepNumber, timelineType) {
    const {
      status,
      date,
      statusText,
      statusTime,
      isLastNode = false,
      useCompletionStyle = false,
      useOrderCompletionContainer = false,
    } = node;

    let nodeClass = `timeline-node ${status}`;
    if (isLastNode && timelineType === this.timelineTypes.completion) {
      nodeClass += ' last-node';
    }

    let nodeContent = '';

    if (timelineType === this.timelineTypes.completion && isLastNode) {
      // Order Completion 的最後一個節點使用特殊容器
      nodeContent = `
        <div class="order-completion-container"></div>
        <div class="node-date">${date}</div>
        <div class="node-status">
          <div class="status-text">${statusText}</div>
          <div class="status-time">${statusTime}</div>
        </div>
      `;
    } else if (useOrderCompletionContainer) {
      // 使用 order-completion-container 樣式的節點
      nodeContent = `
        <div class="order-completion-container"></div>
        <div class="node-date">${date}</div>
        <div class="node-status">
          <div class="status-text">${statusText}</div>
          <div class="status-time">${statusTime}</div>
        </div>
      `;
    } else if (useCompletionStyle) {
      // 使用 Completion 樣式的節點
      nodeContent = `
        <div class="node-circle-completion"></div>
        <div class="node-date">${date}</div>
        <div class="node-status">
          <div class="status-text">${statusText}</div>
          <div class="status-time">${statusTime}</div>
        </div>
      `;
    } else {
      // 一般節點
      nodeContent = `
        <div class="node-circle"></div>
        <div class="node-date">${date}</div>
        <div class="node-status">
          <div class="status-text">${statusText}</div>
          <div class="status-time">${statusTime}</div>
        </div>
      `;
    }

    return `
      <div class="${nodeClass}" data-step="${stepNumber}">
        ${nodeContent}
      </div>
    `;
  }

  // 生成事件 HTML
  generateEventHTML(event) {
    const { type, text, isVisible = false, position = '50%', id } = event;

    // 總是渲染事件，不管 isVisible 狀態
    // 使用更簡潔的 ID 格式
    let eventId = id;
    if (!eventId) {
      // 根據事件類型生成簡潔的 ID
      if (type === 'dry-ice') {
        eventId = 'dryice-terminal';
      } else if (type === 'special-handling') {
        eventId = 'dryice-refilled';
      } else {
        // 其他類型的事件使用通用格式
        eventId = `${type.replace('-', '')}-${text
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .substring(0, 10)}`;
      }
    }

    // 根據事件類型添加專用 class
    let eventClass = 'timeline-event';
    if (type === 'dry-ice') {
      eventClass += ' event-dry-ice-terminal';
    } else if (type === 'special-handling') {
      eventClass += ' event-dry-ice-refilled';
    }

    return `
      <div class="${eventClass}" id="${eventId}" data-event="${type}" style="display: ${
      isVisible ? 'block' : 'none'
    };">
        <div class="event-tag">
          <div class="event-tag-text">${text}</div>
        </div>
      </div>
    `;
  }

  // 更新節點狀態
  updateNodeState(timelineIndex, nodeIndex, newStatus) {
    const timeline = document.querySelectorAll('.timeline-track-container')[
      timelineIndex
    ];
    if (!timeline) return;

    const node = timeline.querySelector(
      `.timeline-node[data-step="${nodeIndex + 1}"]`
    );
    if (!node) return;

    // 移除舊狀態類別
    Object.values(this.nodeStates).forEach((state) => {
      node.classList.remove(state);
    });

    // 添加新狀態類別
    node.classList.add(newStatus);

    // 更新狀態文字顏色和動畫
    this.updateNodeStyling(node, newStatus);
  }

  // 更新節點樣式
  updateNodeStyling(node, status) {
    const statusText = node.querySelector('.status-text');
    if (!statusText) return;

    // 移除現有的動畫效果
    statusText.style.position = '';
    statusText.style.color = '';
    statusText.style.overflow = '';

    const beforeElement = statusText.querySelector('::before');
    if (beforeElement) {
      beforeElement.remove();
    }

    // 根據狀態應用樣式
    switch (status) {
      case this.nodeStates.processing:
        statusText.style.position = 'relative';
        statusText.style.color = 'var(--accent-color)';
        statusText.style.overflow = 'hidden';
        this.addGradientShineAnimation(statusText);
        break;
      case this.nodeStates.pending:
        statusText.style.color = 'var(--neutral-light)';
        break;
      case this.nodeStates.completed:
        statusText.style.color = 'var(--primary-color)';
        break;
    }
  }

  // 添加 Gradient Shine 動畫
  addGradientShineAnimation(element) {
    const beforeElement = document.createElement('div');
    beforeElement.className = 'gradient-shine';
    beforeElement.style.cssText = `
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
      animation: gradientShine 2s infinite;
      pointer-events: none;
      z-index: 1;
      border-radius: 2px;
    `;

    element.appendChild(beforeElement);
  }

  // 更新連接線進度
  updateTimelineProgress(timelineIndex, progressPercentage) {
    const timeline = document.querySelectorAll('.timeline-track-container')[
      timelineIndex
    ];
    if (!timeline) return;

    const beforeLine = timeline.querySelector(
      '.timeline-horizontal-line::before'
    );
    const afterLine = timeline.querySelector(
      '.timeline-horizontal-line::after'
    );

    if (beforeLine) {
      beforeLine.style.width = `${progressPercentage}%`;
    }
    if (afterLine) {
      afterLine.style.left = `${progressPercentage}%`;
      afterLine.style.width = `${100 - progressPercentage}%`;
    }
  }
}

// 範例資料結構
const sampleTimelineData = [
  {
    type: 'domestic',
    currentStep: 1,
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
        statusText: 'Shipment Delivered',
        statusTime: '--:--',
      },
    ],
  },
  {
    type: 'domestic',
    currentStep: 2,
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
        statusText: 'Shipment Delivered',
        statusTime: '--:--',
      },
    ],
  },
  {
    type: 'import_export',
    currentStep: 5,
    nodes: [
      {
        status: 'completed',
        date: 'Oct 10',
        statusText: 'Origin Pickup',
        statusTime: '09:30',
      },
      {
        status: 'completed',
        date: 'Oct 11',
        statusText: 'Origin Customs Process',
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
    ],
    events: [
      {
        type: 'dry-ice',
        text: 'Dry ice refilled<br/>(Terminal)',
        isVisible: true,
      },
      {
        type: 'special-handling',
        text: 'Out for Delivery',
        isVisible: false,
      },
    ],
  },
  {
    type: 'order_completion',
    currentStep: 7,
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
        statusText: 'Out for Delivery',
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
        isVisible: true,
      },
    ],
  },
];

// 創建全域 Timeline Manager 實例
window.TimelineManager = new TimelineManager();

// 範例使用方式
document.addEventListener('DOMContentLoaded', () => {
  // 等待資料載入完成
  if (typeof getAllTimelineData === 'function') {
    // 渲染所有範例資料
    const allTimelineData = getAllTimelineData();
    window.TimelineManager.renderTimeline(
      allTimelineData,
      'timeline-container'
    );

    // 啟動動態演示（可選）
    // simulateTimelineProgress();
  } else {
    // 如果資料還沒載入，使用內建範例
    window.TimelineManager.renderTimeline(
      sampleTimelineData,
      'timeline-container'
    );
  }
});
