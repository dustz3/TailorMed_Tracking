// 審計報告相關功能

// 審計管理類
class AuditManager {
  constructor() {
    this.data = window.PermissionMatrixData;
    this.currentFilters = {
      dateFrom: '',
      dateTo: '',
      user: '',
      action: '',
      status: '',
    };
  }

  // 初始化審計管理
  initialize() {
    this.setupDateFilters();
    this.setupEventListeners();
    this.loadAuditData();
  }

  // 設定日期篩選器
  setupDateFilters() {
    const today = new Date().toISOString().split('T')[0];
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const dateTo = document.getElementById('dateTo');
    const dateFrom = document.getElementById('dateFrom');

    if (dateTo) dateTo.value = today;
    if (dateFrom) dateFrom.value = lastWeek.toISOString().split('T')[0];
  }

  // 設定事件監聽器
  setupEventListeners() {
    const generateBtn = document.getElementById('generateReport');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        this.generateReport();
      });
    }
  }

  // 載入審計資料
  loadAuditData() {
    const auditResults = document.getElementById('auditResults');
    if (!auditResults) return;

    const filteredLogs = this.filterAuditLogs();
    auditResults.innerHTML = this.renderAuditLogs(filteredLogs);
  }

  // 篩選審計記錄
  filterAuditLogs() {
    let logs = [...this.data.auditLogs];

    // 日期篩選
    if (this.currentFilters.dateFrom) {
      logs = logs.filter(
        (log) => log.timestamp >= this.currentFilters.dateFrom
      );
    }
    if (this.currentFilters.dateTo) {
      logs = logs.filter(
        (log) => log.timestamp <= this.currentFilters.dateTo + ' 23:59:59'
      );
    }

    // 使用者篩選
    if (this.currentFilters.user) {
      logs = logs.filter((log) =>
        log.user.toLowerCase().includes(this.currentFilters.user.toLowerCase())
      );
    }

    // 動作篩選
    if (this.currentFilters.action) {
      logs = logs.filter((log) =>
        log.action
          .toLowerCase()
          .includes(this.currentFilters.action.toLowerCase())
      );
    }

    // 狀態篩選
    if (this.currentFilters.status) {
      logs = logs.filter((log) => log.status === this.currentFilters.status);
    }

    return logs;
  }

  // 渲染審計記錄
  renderAuditLogs(logs) {
    if (logs.length === 0) {
      return `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>沒有找到符合條件的審計記錄</p>
                </div>
            `;
    }

    let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0; color: #143463;">審計記錄 (${logs.length} 筆)</h3>
                <button onclick="auditManager.exportAuditLogs()" style="padding: 0.5rem 1rem; background: #bb2749; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-download"></i> 匯出
                </button>
            </div>
        `;

    logs.forEach((log) => {
      const statusClass = this.getStatusClass(log.status);
      const actionIcon = this.getActionIcon(log.action);

      html += `
                <div style="margin-bottom: 1rem; padding: 1rem; background: white; border-radius: 6px; border-left: 4px solid #143463; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <i class="${actionIcon}" style="color: #143463;"></i>
                            <strong>${log.user}</strong>
                            <span style="color: #666;">執行了</span>
                            <strong>${log.action}</strong>
                        </div>
                        <span class="${statusClass}" style="padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">
                            ${log.status}
                        </span>
                    </div>
                    
                    <div style="margin-bottom: 0.5rem;">
                        <span style="color: #666;">目標:</span> ${log.target}
                        <span style="color: #666; margin-left: 1rem;">資料庫:</span> ${log.database}
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; color: #666;">
                        <span>${log.timestamp}</span>
                        <span>ID: ${log.id}</span>
                    </div>
                </div>
            `;
    });

    return html;
  }

  // 獲取狀態樣式類
  getStatusClass(status) {
    switch (status) {
      case '成功':
        return 'permission-yes';
      case '待審核':
        return 'permission-partial';
      case '失敗':
        return 'permission-no';
      default:
        return 'permission-partial';
    }
  }

  // 獲取動作圖標
  getActionIcon(action) {
    switch (action) {
      case '權限變更':
        return 'fas fa-key';
      case '資料查詢':
        return 'fas fa-search';
      case '資料修改':
        return 'fas fa-edit';
      case '權限申請':
        return 'fas fa-user-plus';
      case '登入':
        return 'fas fa-sign-in-alt';
      case '登出':
        return 'fas fa-sign-out-alt';
      default:
        return 'fas fa-cog';
    }
  }

  // 生成報告
  generateReport() {
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;

    if (!dateFrom || !dateTo) {
      alert('請選擇開始和結束日期');
      return;
    }

    this.currentFilters.dateFrom = dateFrom;
    this.currentFilters.dateTo = dateTo;

    // 顯示載入狀態
    const auditResults = document.getElementById('auditResults');
    auditResults.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div class="loading"></div>
                <p style="margin-top: 1rem; color: #666;">正在生成審計報告...</p>
            </div>
        `;

    // 模擬載入時間
    setTimeout(() => {
      this.loadAuditData();
      this.showReportSummary();
    }, 1500);
  }

  // 顯示報告摘要
  showReportSummary() {
    const filteredLogs = this.filterAuditLogs();
    const summary = this.calculateReportSummary(filteredLogs);

    const summaryHtml = `
            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <h4 style="color: #143463; margin-bottom: 1rem;">報告摘要</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div style="text-align: center; padding: 1rem; background: white; border-radius: 6px;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #143463;">${summary.totalLogs}</div>
                        <div style="font-size: 0.9rem; color: #666;">總記錄數</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: white; border-radius: 6px;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #28a745;">${summary.successCount}</div>
                        <div style="font-size: 0.9rem; color: #666;">成功操作</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: white; border-radius: 6px;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #dc3545;">${summary.failedCount}</div>
                        <div style="font-size: 0.9rem; color: #666;">失敗操作</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: white; border-radius: 6px;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #ffc107;">${summary.pendingCount}</div>
                        <div style="font-size: 0.9rem; color: #666;">待審核</div>
                    </div>
                </div>
            </div>
        `;

    const auditResults = document.getElementById('auditResults');
    auditResults.innerHTML = summaryHtml + this.renderAuditLogs(filteredLogs);
  }

  // 計算報告摘要
  calculateReportSummary(logs) {
    const summary = {
      totalLogs: logs.length,
      successCount: logs.filter((log) => log.status === '成功').length,
      failedCount: logs.filter((log) => log.status === '失敗').length,
      pendingCount: logs.filter((log) => log.status === '待審核').length,
    };

    return summary;
  }

  // 匯出審計記錄
  exportAuditLogs() {
    const filteredLogs = this.filterAuditLogs();
    let csv = 'ID,使用者,動作,目標,資料庫,時間,狀態\n';

    filteredLogs.forEach((log) => {
      csv += `${log.id},"${log.user}","${log.action}","${log.target}","${log.database}","${log.timestamp}","${log.status}"\n`;
    });

    this.downloadCSV(csv, 'audit-logs.csv');
  }

  // 下載 CSV 檔案
  downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

// 創建全域審計管理實例
let auditManager;

// 初始化審計管理
function initializeAuditManager() {
  auditManager = new AuditManager();
  auditManager.initialize();
}

// 當頁面載入完成時初始化
document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('auditResults')) {
    initializeAuditManager();
  }
});
