// Timeline 動態渲染器
// 根據不同狀態動態生成和更新時間軸組件

import {
  TIMELINE_CONFIGS,
  getTimelineConfig,
} from '../data/timeline-configs.js';

export class TimelineRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentConfig = null;
    this.currentStep = 1;
  }

  // 初始化時間軸
  init(shipmentType, currentStep = 1, hasDryIce = false) {
    this.currentConfig = getTimelineConfig(shipmentType, hasDryIce);
    this.currentStep = currentStep;
    this.render();
    this.setupInteractions();
  }

  // 渲染時間軸
  render() {
    if (!this.currentConfig) return;

    const timelineData = this.generateTimelineData();
    this.container.innerHTML = this.generateHTML(timelineData);
    this.animateProgress();
  }

  // 生成時間軸數據
  generateTimelineData() {
    const { steps, layout } = this.currentConfig;
    const timelineSteps = [];
    const topSteps = [];
    const bottomSteps = [];

    steps.forEach((stepDef, index) => {
      const status = this.getStepStatus(stepDef, index);
      const stepData = {
        ...stepDef,
        status,
        index,
        month: this.generateMonth(index),
        day: this.generateDay(index),
        time: this.generateTime(index, status),
      };

      if (layout === 'three-column') {
        // 三列布局：奇數步驟在上，偶數步驟在下
        if (stepDef.step && stepDef.step % 2 === 1) {
          topSteps.push(stepData);
        } else if (stepDef.step && stepDef.step % 2 === 0) {
          bottomSteps.push(stepData);
        } else if (stepDef.isEvent) {
          bottomSteps.push(stepData);
        }
      } else if (layout === 'two-column') {
        // 兩列布局：左側奇數，右側偶數
        if (stepDef.step && stepDef.step % 2 === 1) {
          topSteps.push(stepData);
        } else {
          bottomSteps.push(stepData);
        }
      } else {
        // 單列布局：所有步驟在一行
        topSteps.push(stepData);
      }

      timelineSteps.push(stepData);
    });

    return {
      configName: this.currentConfig.name,
      layout,
      timelineSteps,
      topSteps,
      bottomSteps,
      progressWidth: this.calculateProgressWidth(),
    };
  }

  // 獲取步驟狀態
  getStepStatus(stepDef, index) {
    if (stepDef.isEvent) {
      return this.currentStep >= 8 ? 'completed' : 'pending';
    }

    if (!stepDef.step) return 'pending';

    if (stepDef.step < this.currentStep) {
      return 'completed';
    } else if (stepDef.step === this.currentStep) {
      return 'active';
    } else {
      return 'pending';
    }
  }

  // 計算進度條寬度
  calculateProgressWidth() {
    const completedSteps = this.currentConfig.steps.filter(
      (step) => !step.isEvent && step.step < this.currentStep
    ).length;

    const totalSteps = this.currentConfig.steps.filter(
      (step) => !step.isEvent
    ).length;
    return Math.round((completedSteps / totalSteps) * 100);
  }

  // 生成 HTML
  generateHTML(data) {
    return `
      <div class="status-panel-dynamic" data-config-type="${data.layout}">
        <h2 class="status-title">${data.configName}</h2>
        
        <div class="timeline-cards-container">
          ${this.generateCardsHTML(data.topSteps, 'top')}
          
          <div class="timeline-container">
            <div class="timeline-track">
              <div class="timeline-progress" style="width: ${
                data.progressWidth
              }%" data-target-width="${data.progressWidth}"></div>
            </div>
            <div class="timeline-nodes">
              ${this.generateNodesHTML(data.timelineSteps)}
            </div>
          </div>
          
          ${this.generateCardsHTML(data.bottomSteps, 'bottom')}
        </div>
        
        <div class="timeline-status-info">
          ${this.generateStatusInfo()}
        </div>
      </div>
    `;
  }

  // 生成卡片 HTML
  generateCardsHTML(steps, position) {
    if (!steps.length) return '';

    return `
      <div class="timeline-cards ${position}">
        ${steps
          .map(
            (step) => `
          <div class="timeline-card ${step.status} ${
              step.isEvent ? 'event' : ''
            }" 
               data-step="${step.step || ''}" 
               data-event-type="${step.eventType || ''}">
            <div class="card-number">${step.step || step.eventType}</div>
            <div class="card-content">
              <div class="card-title">${step.title}</div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  // 生成節點 HTML
  generateNodesHTML(steps) {
    return steps
      .map((step) => {
        if (step.isEvent) {
          return `
          <div class="timeline-event-icon" data-event-type="${step.eventType}">
            <img src="images/icon-${step.eventType}.svg" alt="${step.title}">
          </div>
        `;
        }

        return `
        <div class="timeline-node ${step.status}" data-step="${step.step}">
          <div class="node-dot">
            <div class="node-icon">${step.step}</div>
          </div>
          <div class="node-datetime">
            <div class="node-month">${step.month}</div>
            <div class="node-day">${step.day}</div>
            <div class="node-time">${step.time}</div>
          </div>
        </div>
      `;
      })
      .join('');
  }

  // 生成狀態資訊
  generateStatusInfo() {
    const statusMap = {
      active: { class: 'status-processing', text: 'Processing' },
      completed: { class: 'status-completed', text: 'Completed' },
      pending: { class: 'status-processing', text: 'Processing' },
    };

    const currentStatus = this.getCurrentStatus();
    const statusInfo = statusMap[currentStatus] || statusMap['processing'];

    return `
      <div class="status-badge ${statusInfo.class}">
        <span>${statusInfo.text}</span>
      </div>
      <div class="timeline-description">
        <p>${this.getStatusDescription()}</p>
      </div>
    `;
  }

  // 獲取當前狀態
  getCurrentStatus() {
    if (this.currentStep === 9) return 'completed';
    return 'active';
  }

  // 獲取狀態描述
  getStatusDescription() {
    const descriptions = {
      active: 'Your shipment is being processed',
      completed: 'Your shipment has been delivered',
      pending: 'Your shipment is being prepared',
    };

    return descriptions[this.getCurrentStatus()] || descriptions['active'];
  }

  // 設置互動效果
  setupInteractions() {
    // 節點懸停效果
    const nodes = this.container.querySelectorAll('.timeline-node');
    const cards = this.container.querySelectorAll('.timeline-card');

    nodes.forEach((node) => {
      node.addEventListener('mouseenter', () => {
        const step = node.dataset.step;
        const correspondingCard = this.container.querySelector(
          `.timeline-card[data-step="${step}"]`
        );
        if (correspondingCard) {
          correspondingCard.classList.add('highlighted');
        }
      });

      node.addEventListener('mouseleave', () => {
        const step = node.dataset.step;
        const correspondingCard = this.container.querySelector(
          `.timeline-card[data-step="${step}"]`
        );
        if (correspondingCard) {
          correspondingCard.classList.remove('highlighted');
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

  // 切換配置
  switchConfig(shipmentType, hasDryIce = false) {
    this.init(shipmentType, this.currentStep, hasDryIce);
  }

  // 輔助方法：生成模擬數據
  generateMonth(index) {
    const months = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ];
    return months[index % 12];
  }

  generateDay(index) {
    return String(index + 1).padStart(2, '0');
  }

  generateTime(index, status) {
    if (status === 'pending') return '--:--';
    if (status === 'active') return 'Processing...';

    const hour = 9 + ((index * 2) % 12);
    const minute = (index * 15) % 60;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(
      2,
      '0'
    )}`;
  }
}

// 導出單例實例
export const timelineRenderer = new TimelineRenderer('timeline-container');
