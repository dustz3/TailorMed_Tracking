// Timeline Renderer V3
// 根據三種狀態動態渲染時間軸，節點平均分配但保持相同長度

import {
  TIMELINE_CONFIGS_V3,
  getTimelineConfigV3,
  generateTimelineDataV3,
} from '../data/timeline-configs-v3.js';

export class TimelineRendererV3 {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentConfig = null;
    this.currentStep = 1;
  }

  // 初始化時間軸
  init(shipmentType, currentStep = 1) {
    this.currentConfig = getTimelineConfigV3(shipmentType);
    this.currentStep = currentStep;
    this.render();
    this.setupInteractions();
  }

  // 渲染時間軸
  render() {
    if (!this.currentConfig) return;

    const timelineData = generateTimelineDataV3(
      this.currentConfig,
      this.currentStep
    );
    this.container.innerHTML = this.generateHTML(timelineData);
    this.animateProgress();
  }

  // 生成 HTML
  generateHTML(data) {
    return `
      <div class="status-panel-v3" data-shipment-type="${data.layout}">
        <h2 class="status-title">${data.configName}</h2>
        
        <div class="timeline-container">
          <div class="timeline-track">
            <div class="timeline-progress" style="width: ${
              data.progressWidth
            }%" data-target-width="${data.progressWidth}"></div>
          </div>
          
          <div class="timeline-nodes">
            ${this.generateNodesHTML(data.timelineNodes)}
          </div>
          
          <div class="timeline-events">
            ${this.generateEventsHTML(data.timelineEvents)}
          </div>
          
          <div class="timeline-labels">
            ${this.generateLabelsHTML(data.timelineNodes)}
          </div>
        </div>
        
        <div class="timeline-status">
          ${this.generateStatusInfo()}
        </div>
      </div>
    `;
  }

  // 生成節點 HTML
  generateNodesHTML(nodes) {
    return nodes
      .map(
        (node) => `
        <div class="timeline-node ${node.status}" data-step="${node.step}" style="left: ${node.position}%">
          <div class="node-dot"></div>
        </div>
      `
      )
      .join('');
  }

  // 生成事件 HTML
  generateEventsHTML(events) {
    if (!events.length) return '';

    return events
      .map(
        (event) => `
        <div class="timeline-event-icon ${event.status}" data-event-type="${event.eventType}" style="left: ${event.position}%">
          <img src="images/icon-${event.eventType}.svg" alt="${event.title}">
        </div>
      `
      )
      .join('');
  }

  // 生成標籤 HTML
  generateLabelsHTML(nodes) {
    return nodes
      .map(
        (node) => `
        <div class="timeline-label" style="left: ${node.position}%">
          <div class="label-title">${node.title}</div>
          <div class="label-time">${this.generateTimeForNode(node)}</div>
        </div>
      `
      )
      .join('');
  }

  // 生成狀態資訊
  generateStatusInfo() {
    const statusMap = {
      active: { class: 'processing', text: 'Processing' },
      completed: { class: 'completed', text: 'Completed' },
      pending: { class: 'processing', text: 'Processing' },
    };

    const currentStatus = this.getCurrentStatus();
    const statusInfo = statusMap[currentStatus] || statusMap['processing'];

    return `
      <div class="status-indicator ${statusInfo.class}">
        <div class="status-dot"></div>
        <span>${statusInfo.text}</span>
      </div>
    `;
  }

  // 獲取當前狀態
  getCurrentStatus() {
    if (this.currentStep >= this.currentConfig.nodeCount) return 'completed';
    return 'active';
  }

  // 生成節點時間
  generateTimeForNode(node) {
    if (node.status === 'pending') return 'Pending';
    if (node.status === 'active') return 'Processing...';

    // 為已完成的步驟生成模擬時間
    const hour = 9 + ((node.index * 2) % 12);
    const minute = (node.index * 15) % 60;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(
      2,
      '0'
    )}`;
  }

  // 設置互動效果
  setupInteractions() {
    const nodes = this.container.querySelectorAll('.timeline-node');
    const labels = this.container.querySelectorAll('.timeline-label');

    nodes.forEach((node, index) => {
      const label = labels[index];

      node.addEventListener('mouseenter', () => {
        node.style.transform = 'translate(-50%, -50%) scale(1.1)';
        if (label) {
          label.style.opacity = '1';
          label.style.transform = 'translateX(-50%) scale(1.05)';
        }
      });

      node.addEventListener('mouseleave', () => {
        node.style.transform = 'translate(-50%, -50%) scale(1)';
        if (label) {
          label.style.opacity = '0.8';
          label.style.transform = 'translateX(-50%) scale(1)';
        }
      });
    });
  }

  // 動畫進度條
  animateProgress() {
    const progressBar = this.container.querySelector('.timeline-progress');
    if (progressBar) {
      setTimeout(() => {
        progressBar.classList.add('animate');
      }, 100);
    }
  }

  // 更新步驟
  updateStep(newStep) {
    this.currentStep = newStep;
    this.render();
  }

  // 切換狀態
  switchShipmentType(shipmentType, currentStep = 1) {
    this.init(shipmentType, currentStep);
  }

  // 獲取當前配置資訊
  getCurrentConfig() {
    return {
      type: this.currentConfig.layout,
      name: this.currentConfig.name,
      nodeCount: this.currentConfig.nodeCount,
      currentStep: this.currentStep,
    };
  }
}

// 導出單例實例
export const timelineRendererV3 = new TimelineRendererV3(
  'timeline-container-v3'
);
