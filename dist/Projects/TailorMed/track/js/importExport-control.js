// Import/Export Timeline 控制邏輯
// 專門處理 Import/Export timeline 的狀態切換

class ImportExportControl {
  constructor() {
    this.timelineManager = null;
    this.currentStatus = null;
    this.init();
  }

  init() {
    // 等待 TimelineManager 載入
    if (window.TimelineManager) {
      this.timelineManager = new window.TimelineManager();
      this.bindControlButtons();
      console.log('Import/Export Control 初始化完成');
    } else {
      // 如果 TimelineManager 還沒載入，等待一下
      console.log('等待 TimelineManager 載入...');
      setTimeout(() => this.init(), 100);
    }
  }

  bindControlButtons() {
    const buttons = document.querySelectorAll(
      '.import-export-control-panel .control-btn'
    );
    buttons.forEach((button) => {
      button.addEventListener('click', (e) => {
        const status = e.target.getAttribute('data-status');
        this.switchTimeline(status);
      });
    });
  }

  switchTimeline(status) {
    if (!this.timelineManager) {
      console.error('TimelineManager 尚未初始化');
      return;
    }

    try {
      // 更新按鈕狀態
      this.updateButtonStates(status);

      // 更新狀態顯示
      this.updateStatusDisplay(status);

      // 渲染對應的 timeline
      this.renderTimelineByStatus(status);

      this.currentStatus = status;
    } catch (error) {
      console.error('切換 Import/Export Timeline 時發生錯誤:', error);
    }
  }

  updateButtonStates(activeStatus) {
    const buttons = document.querySelectorAll(
      '.import-export-control-panel .control-btn'
    );
    buttons.forEach((button) => {
      const status = button.getAttribute('data-status');
      if (status === activeStatus) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  updateStatusDisplay(status) {
    const statusName = this.getStatusDisplayName(status);
    const statusElement = document.querySelector(
      '.import-export-control-panel .status-value'
    );
    if (statusElement) {
      statusElement.textContent = statusName;
    }
  }

  getStatusDisplayName(status) {
    const statusNames = {
      'import-export-step1': 'Import 第一步',
      'import-export-step2': 'Import 第二步',
      'import-export-step3': 'Import 第三步',
      'import-export-step4': 'Import 第四步',
      'import-export-step5': 'Import 第五步',
      'import-export-step6': 'Import 第六步',
      'import-export-completed': 'Import 完成',
    };

    return statusNames[status] || status;
  }

  renderTimelineByStatus(status) {
    if (!window.getTimelineDataByStatus) {
      console.error('getTimelineDataByStatus 函數尚未載入');
      return;
    }

    try {
      // 獲取對應的 timeline 資料
      const timelineData = window.getTimelineDataByStatus(status);

      if (!timelineData) {
        console.error(`找不到狀態 ${status} 的資料`);
        return;
      }

      // 清空現有的 timeline 容器
      const container = document.getElementById('timeline-container');
      if (container) {
        container.innerHTML = '';

        // 渲染新的 timeline
        const timelineElement =
          this.timelineManager.createTimelineElement(timelineData);
        container.appendChild(timelineElement);
      }
    } catch (error) {
      console.error('渲染 Import/Export Timeline 時發生錯誤:', error);
    }
  }

  // 獲取當前狀態
  getCurrentStatus() {
    return this.currentStatus;
  }

  // 重置到初始狀態
  resetTimeline() {
    this.switchTimeline('import-export-step1');
  }
}

// 當 DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
  // 延遲初始化，確保所有腳本都載入完成
  setTimeout(() => {
    window.importExportControl = new ImportExportControl();
  }, 300);
});
