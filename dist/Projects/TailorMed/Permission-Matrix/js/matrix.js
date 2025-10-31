// 權限矩陣相關功能

// 矩陣操作類
class PermissionMatrix {
  constructor() {
    this.data = window.PermissionMatrixData;
    this.currentFilter = {
      role: '',
      database: '',
    };
  }

  // 生成權限矩陣表格
  generateMatrix() {
    const matrixContainer = document.getElementById('permissionMatrix');
    const table = this.createMatrixTable();

    matrixContainer.innerHTML = '';
    matrixContainer.appendChild(table);
  }

  // 創建矩陣表格
  createMatrixTable() {
    const table = document.createElement('table');
    table.className = 'matrix-table';

    // 表頭
    const thead = this.createTableHeader();
    table.appendChild(thead);

    // 表格主體
    const tbody = this.createTableBody();
    table.appendChild(tbody);

    return table;
  }

  // 創建表頭
  createTableHeader() {
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // 角色/資料庫標題
    const roleHeader = document.createElement('th');
    roleHeader.textContent = '角色/資料庫';
    roleHeader.style.minWidth = '200px';
    headerRow.appendChild(roleHeader);

    // 資料庫標題
    this.data.databases.forEach((db) => {
      const th = document.createElement('th');
      th.textContent = db.name;
      th.title = db.description;
      th.style.minWidth = '150px';
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    return thead;
  }

  // 創建表格主體
  createTableBody() {
    const tbody = document.createElement('tbody');

    this.data.roles.forEach((role) => {
      if (this.shouldShowRole(role)) {
        const row = this.createRoleRow(role);
        tbody.appendChild(row);
      }
    });

    return tbody;
  }

  // 創建角色行
  createRoleRow(role) {
    const row = document.createElement('tr');
    row.setAttribute('data-role', role.id);

    // 角色資訊
    const roleCell = document.createElement('td');
    roleCell.innerHTML = `
            <div style="text-align: left;">
                <strong>${role.name}</strong><br>
                <small style="color: #666;">${role.description}</small>
            </div>
        `;
    row.appendChild(roleCell);

    // 權限狀態
    this.data.databases.forEach((db) => {
      const cell = document.createElement('td');
      const permissions = role.permissions[db.id] || [];

      if (this.shouldShowDatabase(db)) {
        cell.innerHTML = this.createPermissionCell(permissions);
      } else {
        cell.innerHTML = '<span style="color: #ccc;">-</span>';
      }

      row.appendChild(cell);
    });

    return row;
  }

  // 創建權限單元格
  createPermissionCell(permissions) {
    if (permissions.length === 0) {
      return '<span class="permission-no">無權限</span>';
    }

    const permissionBadges = permissions
      .map((perm) => {
        const permType = this.data.permissionTypes.find((pt) => pt.id === perm);
        if (permType) {
          return `<span style="display: inline-block; padding: 2px 6px; margin: 1px; background: ${permType.color}; color: white; border-radius: 3px; font-size: 1rem;">${permType.name}</span>`;
        }
        return `<span style="display: inline-block; padding: 2px 6px; margin: 1px; background: #6c757d; color: white; border-radius: 3px; font-size: 1rem;">${perm}</span>`;
      })
      .join('');

    return permissionBadges;
  }

  // 判斷是否顯示角色
  shouldShowRole(role) {
    if (this.currentFilter.role && role.id !== this.currentFilter.role) {
      return false;
    }
    return true;
  }

  // 判斷是否顯示資料庫
  shouldShowDatabase(db) {
    if (this.currentFilter.database && db.id !== this.currentFilter.database) {
      return false;
    }
    return true;
  }

  // 設定篩選器
  setFilter(type, value) {
    this.currentFilter[type] = value;
    this.generateMatrix();
  }

  // 匯出矩陣為 CSV
  exportToCSV() {
    let csv = '角色,描述';

    // 添加資料庫標題
    this.data.databases.forEach((db) => {
      csv += `,${db.name}`;
    });
    csv += '\n';

    // 添加角色資料
    this.data.roles.forEach((role) => {
      csv += `"${role.name}","${role.description}"`;

      this.data.databases.forEach((db) => {
        const permissions = role.permissions[db.id] || [];
        const permText = permissions
          .map((p) => {
            const permType = this.data.permissionTypes.find(
              (pt) => pt.id === p
            );
            return permType ? permType.name : p;
          })
          .join(';');

        csv += `,"${permText || '無權限'}"`;
      });

      csv += '\n';
    });

    // 下載 CSV 檔案
    this.downloadCSV(csv, 'permission-matrix.csv');
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

// 初始化矩陣功能
function initializeMatrixFunctions() {
  const matrix = new PermissionMatrix();

  // 設定篩選器事件
  const roleFilter = document.getElementById('roleFilter');
  const dbFilter = document.getElementById('dbFilter');

  if (roleFilter) {
    roleFilter.addEventListener('change', function () {
      matrix.setFilter('role', this.value);
    });
  }

  if (dbFilter) {
    dbFilter.addEventListener('change', function () {
      matrix.setFilter('database', this.value);
    });
  }

  // 設定匯出按鈕
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', function () {
      matrix.exportToCSV();
    });
  }

  // 初始生成矩陣
  matrix.generateMatrix();
}

// 當頁面載入完成時初始化
document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('permissionMatrix')) {
    initializeMatrixFunctions();
  }
});
