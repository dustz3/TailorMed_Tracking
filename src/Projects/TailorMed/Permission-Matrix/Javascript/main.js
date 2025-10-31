// TailorMed 權限矩陣系統主要 JavaScript

document.addEventListener('DOMContentLoaded', function () {
  // 初始化系統
  initializeSystem();

  // 設定導航功能
  setupNavigation();

  // 載入統計資料
  loadStatistics();

  // 初始化權限矩陣
  initializeMatrix();

  // 初始化角色管理
  initializeRoles();

  // 初始化審計報告
  initializeAudit();

  // 載入 CRM 表單統計
  loadCRMTableStats();

  // 載入 OMS 表單統計
  loadOMSTableStats();

  // 載入 FIN 表單統計
  loadFINTableStats();
});

// 初始化系統
function initializeSystem() {
  console.log('TailorMed 權限矩陣系統已啟動');

  // 設定當前日期（如果元素存在）
  const dateToElement = document.getElementById('dateTo');
  const dateFromElement = document.getElementById('dateFrom');

  if (dateToElement) {
    const today = new Date().toISOString().split('T')[0];
    dateToElement.value = today;
  }

  if (dateFromElement) {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    dateFromElement.value = lastWeek.toISOString().split('T')[0];
  }
}

// 設定導航功能
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section');

  navLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });

        // 更新導航狀態
        navLinks.forEach((l) => l.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });
}

// 載入統計資料
function loadStatistics() {
  const data = window.PermissionMatrixData;

  // 除錯資訊
  console.log('載入統計資料...', data);
  console.log('window.PermissionMatrixData:', window.PermissionMatrixData);

  if (!data) {
    console.error('PermissionMatrixData 未定義');
    console.log('嘗試重新載入...');
    // 延遲重試
    setTimeout(() => {
      const retryData = window.PermissionMatrixData;
      if (retryData) {
        console.log('重試成功，載入統計資料');
        loadStatistics();
      } else {
        console.error('重試失敗，PermissionMatrixData 仍然未定義');
      }
    }, 100);
    return;
  }

  // 更新統計數字
  const totalUsersElement = document.getElementById('totalUsers');
  const totalDatabasesElement = document.getElementById('totalDatabases');
  const totalPermissionsElement = document.getElementById('totalPermissions');
  const totalFieldsElement = document.getElementById('totalFields');

  if (totalUsersElement) {
    totalUsersElement.textContent = data.users ? data.users.length : 0;
    console.log('總使用者數:', data.users ? data.users.length : 0);
  }

  if (totalDatabasesElement) {
    totalDatabasesElement.textContent = data.databases
      ? data.databases.length
      : 0;
    console.log('資料庫數量:', data.databases ? data.databases.length : 0);
  }

  // 計算總權限項目
  let totalPermissions = 0;
  if (data.roles) {
    data.roles.forEach((role) => {
      if (role.permissions) {
        Object.values(role.permissions).forEach((perms) => {
          totalPermissions += perms.length;
        });
      }
    });
  }

  if (totalPermissionsElement) {
    totalPermissionsElement.textContent = totalPermissions;
    console.log('權限項目總數:', totalPermissions);
  }

  // 計算欄位總計
  if (totalFieldsElement) {
    const totalFields = calculateTotalFields();
    totalFieldsElement.textContent = totalFields;
    console.log('欄位總計:', totalFields);
  }

  // 更新安全問題數量（如果元素存在）
  const securityIssuesElement = document.getElementById('securityIssues');
  if (securityIssuesElement) {
    securityIssuesElement.textContent = data.securityIssues
      ? data.securityIssues.length
      : 0;
  }

  // 添加動畫效果
  animateCounters();
}

// 動畫計數器
function animateCounters() {
  const counters = document.querySelectorAll('.stat-content h3');

  counters.forEach((counter) => {
    const target = parseInt(counter.textContent);
    let current = 0;
    const increment = target / 50;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        counter.textContent = target;
        clearInterval(timer);
      } else {
        counter.textContent = Math.floor(current);
      }
    }, 30);
  });
}

// 初始化權限矩陣
function initializeMatrix() {
  const data = window.PermissionMatrixData;

  // 填充篩選器
  populateFilters();

  // 生成權限矩陣
  generatePermissionMatrix();

  // 匯出功能已移除
}

// 填充篩選器
function populateFilters() {
  const data = window.PermissionMatrixData;
  const roleFilter = document.getElementById('roleFilter');
  const dbFilter = document.getElementById('dbFilter');

  // 填充角色篩選器
  data.roles.forEach((role) => {
    const option = document.createElement('option');
    option.value = role.id;
    option.textContent = role.name;
    roleFilter.appendChild(option);
  });

  // 填充資料庫篩選器
  data.databases.forEach((db) => {
    const option = document.createElement('option');
    option.value = db.id;
    option.textContent = db.name;
    dbFilter.appendChild(option);
  });

  // 設定篩選事件
  roleFilter.addEventListener('change', filterMatrix);
  dbFilter.addEventListener('change', filterMatrix);
}

// 生成權限矩陣
function generatePermissionMatrix() {
  const data = window.PermissionMatrixData;
  const matrixContainer = document.getElementById('permissionMatrix');

  // 創建表格
  const table = document.createElement('table');
  table.className = 'matrix-table';

  // 創建表頭
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  // 添加角色標題
  const roleHeader = document.createElement('th');
  roleHeader.textContent = '角色/資料庫';
  headerRow.appendChild(roleHeader);

  // 添加資料庫標題
  data.databases.forEach((db) => {
    const th = document.createElement('th');
    th.textContent = db.name;
    th.title = db.description;
    th.style.minWidth = '150px';
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // 創建表格主體
  const tbody = document.createElement('tbody');

  data.roles.forEach((role) => {
    const row = document.createElement('tr');
    row.setAttribute('data-role', role.id);

    // 角色名稱
    const roleCell = document.createElement('td');
    roleCell.innerHTML = `<strong>${role.name}</strong><br><small>${role.description}</small>`;
    row.appendChild(roleCell);

    // 權限狀態
    data.databases.forEach((db) => {
      const cell = document.createElement('td');
      const permissions = role.permissions[db.id] || [];

      if (permissions.length === 0) {
        cell.innerHTML = '<span class="permission-no">無權限</span>';
      } else {
        const permissionText = permissions
          .map((p) => {
            const permType = data.permissionTypes.find((pt) => pt.id === p);
            return permType ? permType.name : p;
          })
          .join(', ');
        cell.innerHTML = `<span class="permission-yes">${permissionText}</span>`;
      }

      row.appendChild(cell);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  matrixContainer.innerHTML = '';
  matrixContainer.appendChild(table);
}

// 篩選矩陣
function filterMatrix() {
  const roleFilter = document.getElementById('roleFilter').value;
  const dbFilter = document.getElementById('dbFilter').value;
  const rows = document.querySelectorAll('.matrix-table tbody tr');

  rows.forEach((row) => {
    const roleId = row.getAttribute('data-role');
    let showRow = true;

    if (roleFilter && roleId !== roleFilter) {
      showRow = false;
    }

    if (showRow) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

// 匯出功能已移除

// 初始化角色管理
function initializeRoles() {
  const data = window.PermissionMatrixData;
  const roleList = document.getElementById('roleList');
  const roleDetails = document.getElementById('roleDetails');

  // 如果角色管理區域被隱藏，則跳過初始化
  if (!roleList || !roleDetails) {
    return;
  }

  // 生成角色列表
  data.roles.forEach((role) => {
    const roleItem = document.createElement('div');
    roleItem.className = 'role-item';
    roleItem.setAttribute('data-role', role.id);

    roleItem.innerHTML = `
            <h4>${role.name}</h4>
            <p>${role.description}</p>
        `;

    roleItem.addEventListener('click', function () {
      // 更新選中狀態
      document.querySelectorAll('.role-item').forEach((item) => {
        item.classList.remove('active');
      });
      this.classList.add('active');

      // 顯示角色詳情
      showRoleDetails(role);
    });

    roleList.appendChild(roleItem);
  });
}

// 顯示角色詳情
function showRoleDetails(role) {
  const data = window.PermissionMatrixData;
  const roleDetails = document.getElementById('roleDetails');

  let permissionsHtml = '<h3>權限詳情</h3>';

  data.databases.forEach((db) => {
    const permissions = role.permissions[db.id] || [];
    permissionsHtml += `
            <div style="margin-bottom: 1rem; padding: 1rem; background: white; border-radius: 6px;">
                <h4>${db.name}</h4>
                <p style="color: #666; font-size: 0.9rem; margin-bottom: 0.5rem;">${
                  db.description
                }</p>
                <div>
                    ${
                      permissions.length > 0
                        ? permissions
                            .map((p) => {
                              const permType = data.permissionTypes.find(
                                (pt) => pt.id === p
                              );
                              return `<span style="display: inline-block; padding: 0.25rem 0.5rem; margin: 0.25rem; background: ${
                                permType ? permType.color : '#6c757d'
                              }; color: white; border-radius: 4px; font-size: 0.8rem;">${
                                permType ? permType.name : p
                              }</span>`;
                            })
                            .join('')
                        : '<span style="color: #dc3545; font-weight: bold;">無權限</span>'
                    }
                </div>
            </div>
        `;
  });

  roleDetails.innerHTML = permissionsHtml;
}

// 初始化審計報告
function initializeAudit() {
  const generateBtn = document.getElementById('generateReport');

  // 如果審計報告區域被隱藏，則跳過初始化
  if (!generateBtn) {
    return;
  }

  generateBtn.addEventListener('click', function () {
    generateAuditReport();
  });

  // 載入預設審計資料
  loadAuditData();
}

// 載入審計資料
function loadAuditData() {
  const data = window.PermissionMatrixData;
  const auditResults = document.getElementById('auditResults');

  // 如果審計結果區域不存在，則跳過
  if (!auditResults) {
    return;
  }

  let auditHtml = '<h3>最近的審計記錄</h3>';

  data.auditLogs.forEach((log) => {
    const statusClass =
      log.status === '成功'
        ? 'permission-yes'
        : log.status === '待審核'
        ? 'permission-partial'
        : 'permission-no';

    auditHtml += `
            <div style="margin-bottom: 1rem; padding: 1rem; background: white; border-radius: 6px; border-left: 4px solid #143463;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <strong>${log.user}</strong>
                    <span class="${statusClass}">${log.status}</span>
                </div>
                <p style="margin-bottom: 0.5rem;">${log.action} - ${log.target}</p>
                <small style="color: #666;">${log.timestamp}</small>
            </div>
        `;
  });

  auditResults.innerHTML = auditHtml;
}

// 生成審計報告
function generateAuditReport() {
  const dateFromElement = document.getElementById('dateFrom');
  const dateToElement = document.getElementById('dateTo');

  // 如果元素不存在，則跳過
  if (!dateFromElement || !dateToElement) {
    return;
  }

  const dateFrom = dateFromElement.value;
  const dateTo = dateToElement.value;

  if (!dateFrom || !dateTo) {
    alert('請選擇開始和結束日期');
    return;
  }

  // 這裡可以實現更複雜的報告生成邏輯
  alert(`正在生成 ${dateFrom} 到 ${dateTo} 的審計報告...`);
}

// 載入 CRM 表單統計
function loadCRMTableStats() {
  // 模擬 CRM 表單統計資料
  const crmStats = {
    quotations: { total: 55, sensitive: 2 },
    partners: { total: 24, sensitive: 0 },
    contacts: { total: 17, sensitive: 0 },
    attns: { total: 19, sensitive: 0 },
    locations: { total: 9, sensitive: 0 },
    'package-items': { total: 18, sensitive: 0 },
    'charge-items': { total: 14, sensitive: 0 },
    'non-taxable': { total: 12, sensitive: 0 },
    staffs: { total: 12, sensitive: 0 },
  };

  // 統計數字已在 Pug 中硬編碼，不需要 JavaScript 更新
  console.log('CRM 表單統計已載入');
}

// 載入 OMS 表單統計
function loadOMSTableStats() {
  // 模擬 OMS 表單統計資料
  const omsStats = {
    orders: { total: 43, sensitive: 0 },
    airwaybill: { total: 32, sensitive: 0 },
    tracking: { total: 27, sensitive: 0 },
    flights: { total: 14, sensitive: 0 },
    'oms-package-items': { total: 20, sensitive: 0 },
    driver: { total: 8, sensitive: 0 },
    'release-checklist': { total: 21, sensitive: 0 },
    'sample-checklist': { total: 16, sensitive: 0 },
    'chain-custody': { total: 14, sensitive: 0 },
    'dry-ice-label': { total: 12, sensitive: 0 },
  };

  // 統計數字已在 Pug 中硬編碼，不需要 JavaScript 更新
  console.log('OMS 表單統計已載入');
}

// 載入 FIN 表單統計
function loadFINTableStats() {
  // 模擬 FIN 表單統計資料
  const finStats = {
    'debit-notes': { total: 60, sensitive: 3 },
    'charge-items': { total: 14, sensitive: 0 },
    'non-taxable-charges': { total: 12, sensitive: 0 },
    'profit-cost-summary': { total: 13, sensitive: 2 },
    'charge-catalog': { total: 19, sensitive: 0 },
    bene: { total: 11, sensitive: 0 },
  };

  // 統計數字已在 Pug 中硬編碼，不需要 JavaScript 更新
  console.log('FIN 表單統計已載入');
}

// 計算欄位總計
function calculateTotalFields() {
  // CRM 表單欄位總計
  const crmFields = 55 + 24 + 17 + 19 + 9 + 18 + 14 + 12 + 12; // 180

  // OMS 表單欄位總計
  const omsFields = 43 + 32 + 27 + 14 + 20 + 8 + 21 + 16 + 14 + 12; // 207

  // FIN 表單欄位總計
  const finFields = 60 + 14 + 12 + 13 + 19 + 11; // 129

  return crmFields + omsFields + finFields; // 516
}
