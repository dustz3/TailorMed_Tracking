// 角色管理相關功能

// 角色管理類
class RoleManager {
  constructor() {
    this.data = window.PermissionMatrixData;
    this.selectedRole = null;
  }

  // 初始化角色管理
  initialize() {
    this.renderRoleList();
    this.setupEventListeners();
  }

  // 渲染角色列表
  renderRoleList() {
    const roleList = document.getElementById('roleList');
    if (!roleList) return;

    roleList.innerHTML = '';

    this.data.roles.forEach((role) => {
      const roleItem = this.createRoleItem(role);
      roleList.appendChild(roleItem);
    });
  }

  // 創建角色項目
  createRoleItem(role) {
    const roleItem = document.createElement('div');
    roleItem.className = 'role-item';
    roleItem.setAttribute('data-role-id', role.id);

    // 計算權限統計
    const permissionStats = this.calculatePermissionStats(role);

    roleItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <h4 style="margin: 0; color: #143463;">${role.name}</h4>
                <span style="background: #bb2749; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">
                    ${permissionStats.totalPermissions} 權限
                </span>
            </div>
            <p style="margin: 0; color: #666; font-size: 0.9rem;">${
              role.description
            }</p>
            <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #666;">
                資料庫: ${
                  permissionStats.databaseCount
                } | 使用者: ${this.getUserCountByRole(role.id)}
            </div>
        `;

    // 點擊事件
    roleItem.addEventListener('click', () => {
      this.selectRole(role);
    });

    return roleItem;
  }

  // 計算權限統計
  calculatePermissionStats(role) {
    let totalPermissions = 0;
    let databaseCount = 0;

    Object.values(role.permissions).forEach((permissions) => {
      if (permissions.length > 0) {
        databaseCount++;
        totalPermissions += permissions.length;
      }
    });

    return { totalPermissions, databaseCount };
  }

  // 根據角色獲取使用者數量
  getUserCountByRole(roleId) {
    return this.data.users.filter((user) => user.role === roleId).length;
  }

  // 選擇角色
  selectRole(role) {
    // 更新選中狀態
    document.querySelectorAll('.role-item').forEach((item) => {
      item.classList.remove('active');
    });

    const selectedItem = document.querySelector(`[data-role-id="${role.id}"]`);
    if (selectedItem) {
      selectedItem.classList.add('active');
    }

    this.selectedRole = role;
    this.showRoleDetails(role);
  }

  // 顯示角色詳情
  showRoleDetails(role) {
    const roleDetails = document.getElementById('roleDetails');
    if (!roleDetails) return;

    const permissionStats = this.calculatePermissionStats(role);
    const users = this.data.users.filter((user) => user.role === role.id);

    roleDetails.innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <h3 style="color: #143463; margin-bottom: 0.5rem;">${
                  role.name
                }</h3>
                <p style="color: #666; margin-bottom: 1rem;">${
                  role.description
                }</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 6px; text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #143463;">${
                          permissionStats.totalPermissions
                        }</div>
                        <div style="font-size: 0.9rem; color: #666;">總權限數</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 6px; text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #143463;">${
                          permissionStats.databaseCount
                        }</div>
                        <div style="font-size: 0.9rem; color: #666;">資料庫數量</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 6px; text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #143463;">${
                          users.length
                        }</div>
                        <div style="font-size: 0.9rem; color: #666;">使用者數量</div>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <h4 style="color: #143463; margin-bottom: 1rem;">資料庫權限詳情</h4>
                ${this.renderDatabasePermissions(role)}
            </div>
            
            <div>
                <h4 style="color: #143463; margin-bottom: 1rem;">角色使用者</h4>
                ${this.renderRoleUsers(users)}
            </div>
        `;
  }

  // 渲染資料庫權限
  renderDatabasePermissions(role) {
    let html = '';

    this.data.databases.forEach((db) => {
      const permissions = role.permissions[db.id] || [];

      html += `
                <div style="margin-bottom: 1rem; padding: 1rem; background: white; border-radius: 6px; border-left: 4px solid #143463;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <h5 style="margin: 0; color: #143463;">${db.name}</h5>
                        <span style="font-size: 0.8rem; color: #666;">${
                          permissions.length
                        } 權限</span>
                    </div>
                    <p style="margin: 0 0 0.5rem 0; color: #666; font-size: 0.9rem;">${
                      db.description
                    }</p>
                    <div>
                        ${
                          permissions.length > 0
                            ? permissions
                                .map((perm) => {
                                  const permType =
                                    this.data.permissionTypes.find(
                                      (pt) => pt.id === perm
                                    );
                                  return `<span style="display: inline-block; padding: 0.25rem 0.5rem; margin: 0.25rem; background: ${
                                    permType ? permType.color : '#6c757d'
                                  }; color: white; border-radius: 4px; font-size: 0.8rem;">${
                                    permType ? permType.name : perm
                                  }</span>`;
                                })
                                .join('')
                            : '<span style="color: #dc3545; font-weight: bold;">無權限</span>'
                        }
                    </div>
                </div>
            `;
    });

    return html;
  }

  // 渲染角色使用者
  renderRoleUsers(users) {
    if (users.length === 0) {
      return '<p style="color: #666; font-style: italic;">此角色暫無使用者</p>';
    }

    let html = '<div style="display: grid; gap: 0.5rem;">';

    users.forEach((user) => {
      html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 6px; border: 1px solid #e9ecef;">
                    <div>
                        <strong>${user.name}</strong>
                        <div style="font-size: 0.8rem; color: #666;">${user.department}</div>
                    </div>
                    <div style="font-size: 0.8rem; color: #666;">
                        最後登入: ${user.lastLogin}
                    </div>
                </div>
            `;
    });

    html += '</div>';
    return html;
  }

  // 設定事件監聽器
  setupEventListeners() {
    // 這裡可以添加其他事件監聽器
  }
}

// 初始化角色管理
function initializeRoleManager() {
  const roleManager = new RoleManager();
  roleManager.initialize();
}

// 當頁面載入完成時初始化
document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('roleList')) {
    initializeRoleManager();
  }
});
