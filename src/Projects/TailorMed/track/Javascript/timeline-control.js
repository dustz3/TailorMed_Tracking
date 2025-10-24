// Timeline 控制面板功能
// 用於控制按鈕切換不同的 timeline 狀態

class TimelineControl {
  constructor() {
    this.currentStatus = null;
    this.timelineManager = null;
    this.init();
  }

  init() {
    // 等待 TimelineManager 載入
    this.waitForTimelineManager();

    // 綁定按鈕事件
    this.bindControlButtons();

    // 初始化顯示
    this.updateStatusDisplay('未選擇');
  }

  waitForTimelineManager() {
    const checkInterval = setInterval(() => {
      if (window.TimelineManager) {
        this.timelineManager = window.TimelineManager;
        clearInterval(checkInterval);
        console.log('Timeline Control: TimelineManager 已載入');
      }
    }, 100);
  }

  bindControlButtons() {
    document.addEventListener('DOMContentLoaded', () => {
      const controlButtons = document.querySelectorAll('.control-btn');
      const eventControlButtons =
        document.querySelectorAll('.event-control-btn');

      controlButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
          const status = e.target.getAttribute('data-status');
          this.switchTimelineStatus(status);
        });
      });

      eventControlButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
          console.log('乾冰按鈕被點擊');
          const eventType = e.target.getAttribute('data-event');
          console.log(`事件類型: ${eventType}`);
          this.toggleEventVisibility(eventType);
        });
      });
    });
  }

  switchTimelineStatus(status) {
    if (!this.timelineManager) {
      console.error('TimelineManager 尚未載入');
      return;
    }

    // 如果是第一步，重置所有乾冰事件狀態
    if (status === 'import-export-step1') {
      this.resetDryIceStates();
    }

    // 如果是第五步，隱藏第二個乾冰事件
    if (status === 'import-export-step5') {
      this.hideSecondDryIceEvent();
    }

    // 更新按鈕狀態
    this.updateButtonStates(status);

    // 更新狀態顯示
    this.updateStatusDisplay(this.getStatusDisplayName(status));

    // 渲染對應的 timeline
    this.renderTimelineByStatus(status);

    // 記錄當前狀態
    this.currentStatus = status;

    // 延遲更新事件控制按鈕狀態，確保 DOM 已渲染
    setTimeout(() => {
      this.updateEventControlButtonStates(status);
    }, 300);

    console.log(`Timeline Control: 切換到 ${status} 狀態`);
  }

  updateButtonStates(activeStatus) {
    const buttons = document.querySelectorAll('.control-btn');

    buttons.forEach((button) => {
      const status = button.getAttribute('data-status');
      if (status === activeStatus) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  // 更新事件控制按鈕狀態
  updateEventControlButtonStates(status) {
    // 乾冰按鈕保持獨立，不因步驟切換而重置
    // 使用存儲的狀態來恢復按鈕狀態
    const eventButtons = document.querySelectorAll('.event-control-btn');
    eventButtons.forEach((button) => {
      const eventType = button.getAttribute('data-event');
      const isActive = this.getEventState(eventType);

      console.log(`恢復乾冰事件狀態: ${eventType} = ${isActive}`);

      if (isActive) {
        button.classList.add('active');
        // 延遲顯示事件，確保 DOM 已完全渲染
        setTimeout(() => {
          this.showEvent(eventType);
        }, 100);
      } else {
        button.classList.remove('active');
        // 不要主動隱藏事件，讓事件保持其預設狀態
        // 只有當用戶明確點擊按鈕時才隱藏
      }
    });
  }

  // 獲取事件狀態
  getEventState(eventType) {
    return (this.eventStates && this.eventStates[eventType]) || false;
  }

  // 設置事件狀態
  setEventState(eventType, isVisible) {
    if (!this.eventStates) {
      this.eventStates = {};
    }
    this.eventStates[eventType] = isVisible;
  }

  // 重置乾冰事件狀態
  resetDryIceStates() {
    console.log('重置乾冰事件狀態');

    // 重置存儲的狀態
    if (this.eventStates) {
      this.eventStates['dry-ice'] = false;
      this.eventStates['special-handling'] = false;
    }

    // 重置按鈕狀態
    const eventButtons = document.querySelectorAll('.event-control-btn');
    eventButtons.forEach((button) => {
      button.classList.remove('active');
    });

    // 隱藏所有乾冰事件（只隱藏 timeline 上的事件，不隱藏按鈕）
    const dryIceEvents = document.querySelectorAll(
      '.timeline-events [data-event="dry-ice"]'
    );
    const specialHandlingEvents = document.querySelectorAll(
      '.timeline-events [data-event="special-handling"]'
    );

    [...dryIceEvents, ...specialHandlingEvents].forEach((event) => {
      event.style.display = 'none';
      event.removeAttribute('data-persistent');
    });

    console.log('乾冰事件狀態已重置');
  }

  // 隱藏第二個乾冰事件
  hideSecondDryIceEvent() {
    console.log('隱藏第二個乾冰事件');

    // 隱藏第二個乾冰事件（special-handling）
    const specialHandlingEvents = document.querySelectorAll(
      '.timeline-events [data-event="special-handling"]'
    );

    specialHandlingEvents.forEach((event) => {
      event.style.display = 'none';
      event.removeAttribute('data-persistent');
    });

    // 重置第二個乾冰按鈕狀態
    const specialHandlingButton = document.querySelector(
      '[data-event="special-handling"]'
    );
    if (specialHandlingButton) {
      specialHandlingButton.classList.remove('active');
    }

    // 重置存儲的狀態
    if (this.eventStates) {
      this.eventStates['special-handling'] = false;
    }

    console.log('第二個乾冰事件已隱藏');
  }

  updateStatusDisplay(statusName) {
    const statusElement = document.querySelector('.status-value');
    if (statusElement) {
      statusElement.textContent = statusName;
    }
  }

  getStatusDisplayName(status) {
    const statusNames = {
      'domestic-step1': '第一步 Processing',
      'domestic-step2': '第二步 Processing',
      'domestic-step3': '第三步 Processing',
      'domestic-step4': '第四步 Processing',
      completed: '完成',
      'import-export-step1': 'Import/Export 第一步',
      'import-export-step2': 'Import/Export 第二步',
      'import-export-step3': 'Import/Export 第三步',
      'import-export-step4': 'Import/Export 第四步',
      'import-export-step5': 'Import/Export 第五步',
      'import-export-step6': 'Import/Export 第六步',
      'import-export-step7': 'Import/Export 第七步',
      'import-export-completed': 'Import/Export 完成',
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

      // 渲染 timeline
      this.timelineManager.renderTimeline([timelineData], 'timeline-container');

      // 更新進度條
      this.timelineManager.updateTimelineProgress(
        0,
        timelineData.progressPercentage
      );
    } catch (error) {
      console.error('渲染 Timeline 時發生錯誤:', error);
    }
  }

  // 切換事件可見性
  toggleEventVisibility(eventType) {
    console.log(`點擊乾冰按鈕: ${eventType}, 當前狀態: ${this.currentStatus}`);

    const button = document.querySelector(`[data-event="${eventType}"]`);
    const isActive = button.classList.contains('active');

    console.log(`按鈕狀態: ${isActive ? '激活' : '未激活'}`);

    if (isActive) {
      // 隱藏事件
      this.hideEvent(eventType);
      button.classList.remove('active');
    } else {
      // 顯示事件
      this.showEvent(eventType);
      button.classList.add('active');
    }
  }

  // 顯示事件
  showEvent(eventType) {
    // 控制 timeline 中的事件顯示
    const events = document.querySelectorAll(
      `.timeline-events [data-event="${eventType}"]`
    );

    console.log(`找到 ${events.length} 個 ${eventType} 事件`);

    if (events.length === 0) {
      console.log(`警告: 找不到 ${eventType} 事件，可能 timeline 還沒渲染完成`);
      // 如果事件不存在，延遲重試
      setTimeout(() => {
        this.showEvent(eventType);
      }, 200);
      return;
    }

    events.forEach((event) => {
      event.style.display = 'block';
      // 添加持久化標記
      event.setAttribute('data-persistent', 'true');
      console.log(`顯示事件: ${event.id}`);
    });

    // 存儲事件狀態
    this.setEventState(eventType, true);

    // 更新當前 timeline 數據中的事件可見性
    this.updateCurrentTimelineEventVisibility(eventType, true);

    console.log(`事件 ${eventType} 已顯示`);
  }

  // 隱藏事件
  hideEvent(eventType) {
    // 控制 timeline 中的事件隱藏
    const events = document.querySelectorAll(
      `.timeline-events [data-event="${eventType}"]`
    );

    console.log(`找到 ${events.length} 個 ${eventType} 事件`);

    events.forEach((event) => {
      event.style.display = 'none';
      // 移除持久化標記
      event.removeAttribute('data-persistent');
      console.log(`隱藏事件: ${event.id}`);
    });

    // 存儲事件狀態
    this.setEventState(eventType, false);

    // 更新當前 timeline 數據中的事件可見性
    this.updateCurrentTimelineEventVisibility(eventType, false);

    console.log(`事件 ${eventType} 已隱藏`);
  }

  // 更新當前 timeline 數據中的事件可見性
  updateCurrentTimelineEventVisibility(eventType, isVisible) {
    if (!this.currentStatus) return;

    // 獲取當前 timeline 數據
    const timelineData = window.getTimelineDataByStatus(this.currentStatus);
    if (!timelineData || !timelineData.events) return;

    // 更新對應事件的 isVisible 狀態
    const event = timelineData.events.find((e) => e.type === eventType);
    if (event) {
      event.isVisible = isVisible;
    }
  }

  // 通過 ID 直接控制特定事件
  toggleEventById(eventId, isVisible) {
    const event = document.getElementById(eventId);
    if (event) {
      event.style.display = isVisible ? 'block' : 'none';
      console.log(`事件 ID: ${eventId} ${isVisible ? '已顯示' : '已隱藏'}`);
    } else {
      console.warn(`找不到 ID 為 ${eventId} 的事件`);
    }
  }

  // 獲取所有乾冰事件的 ID
  getDryIceEventIds() {
    const dryIceEvents = document.querySelectorAll('[data-event="dry-ice"]');
    const specialHandlingEvents = document.querySelectorAll(
      '[data-event="special-handling"]'
    );

    return {
      dryIce: Array.from(dryIceEvents).map((event) => event.id),
      specialHandling: Array.from(specialHandlingEvents).map(
        (event) => event.id
      ),
    };
  }

  // 獲取當前狀態
  getCurrentStatus() {
    return this.currentStatus;
  }

  // 重置到預設狀態
  resetToDefault() {
    this.switchTimelineStatus('domestic-step1');
  }

  // 顯示所有 timeline（用於比較）
  showAllTimelines() {
    if (!window.getAllTimelineData) {
      console.error('getAllTimelineData 函數尚未載入');
      return;
    }

    try {
      const allTimelineData = window.getAllTimelineData();
      this.timelineManager.renderTimeline(
        allTimelineData,
        'timeline-container'
      );

      // 更新狀態顯示
      this.updateStatusDisplay('顯示所有狀態');

      // 清除按鈕選中狀態
      const buttons = document.querySelectorAll('.control-btn');
      buttons.forEach((button) => button.classList.remove('active'));

      this.currentStatus = 'all';
    } catch (error) {
      console.error('顯示所有 Timeline 時發生錯誤:', error);
    }
  }
}

// 創建全域 Timeline Control 實例
window.TimelineControl = new TimelineControl();

// 添加一些便利函數到全域
window.switchTimeline = (status) => {
  if (window.TimelineControl) {
    window.TimelineControl.switchTimelineStatus(status);
  }
};

window.showAllTimelines = () => {
  if (window.TimelineControl) {
    window.TimelineControl.showAllTimelines();
  }
};

window.resetTimeline = () => {
  if (window.TimelineControl) {
    window.TimelineControl.resetToDefault();
  }
};

// 在控制台顯示使用說明
console.log(`
🎮 Timeline 控制面板已載入！

可用指令：
- switchTimeline('domestic-step1')  // 切換到第一步 Processing
- switchTimeline('domestic-step2')  // 切換到第二步 Processing  
- switchTimeline('domestic-step3')  // 切換到第三步 Processing
- switchTimeline('import-export')   // 切換到 Import/Export 流程
- switchTimeline('completion')      // 切換到訂單完成
- showAllTimelines()                // 顯示所有 timeline
- resetTimeline()                   // 重置到預設狀態

或直接點擊頁面上的按鈕！
`);
