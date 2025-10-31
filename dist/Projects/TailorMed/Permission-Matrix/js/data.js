// TailorMed 權限矩陣資料

// 模擬資料庫資料
const databases = [
  {
    id: 'crm',
    name: 'CRM',
    description: '客戶關係管理系統 - 客戶資料、聯絡記錄、銷售機會',
  },
  {
    id: 'oms',
    name: 'OMS',
    description: '訂單管理系統 - 訂單處理、庫存管理、配送追蹤',
  },
  {
    id: 'fin',
    name: 'FIN',
    description: '財務管理系統 - 財務報表、發票管理、付款記錄',
  },
];

// 使用者角色
const roles = [
  {
    id: 'admin',
    name: '系統管理員',
    description: '擁有所有資料庫的完整存取權限',
    permissions: {
      crm: ['read', 'write', 'delete', 'admin'],
      oms: ['read', 'write', 'delete', 'admin'],
      fin: ['read', 'write', 'delete', 'admin'],
    },
  },
  {
    id: 'manager',
    name: '部門主管',
    description: '管理部門相關資料庫的讀寫權限',
    permissions: {
      crm: ['read', 'write'],
      oms: ['read', 'write'],
      fin: ['read'],
    },
  },
  {
    id: 'sales',
    name: '業務人員',
    description: '客戶和產品資料的讀寫權限',
    permissions: {
      crm: ['read', 'write'],
      oms: ['read'],
      fin: ['read'],
    },
  },
  {
    id: 'finance',
    name: '財務人員',
    description: '財務資料的完整存取權限',
    permissions: {
      crm: ['read'],
      oms: ['read'],
      fin: ['read', 'write', 'delete'],
    },
  },
  {
    id: 'logistics',
    name: '物流人員',
    description: '物流和配送資料的讀寫權限',
    permissions: {
      crm: ['read'],
      oms: ['read', 'write'],
      fin: ['read'],
    },
  },
  {
    id: 'viewer',
    name: '檢視者',
    description: '僅有資料檢視權限',
    permissions: {
      crm: ['read'],
      oms: ['read'],
      fin: ['read'],
    },
  },
];

// 權限類型
const permissionTypes = [
  { id: 'read', name: '讀取', description: '檢視資料', color: '#28a745' },
  {
    id: 'write',
    name: '寫入',
    description: '新增和修改資料',
    color: '#ffc107',
  },
  {
    id: 'delete',
    name: '刪除',
    description: '刪除資料',
    color: '#dc3545',
  },
  {
    id: 'admin',
    name: '管理',
    description: '完整管理權限',
    color: '#6f42c1',
  },
];

// 使用者資料
const users = [
  {
    id: 'u1',
    name: '張小明',
    role: 'admin',
    department: 'IT部門',
    lastLogin: '2025-01-23',
  },
  {
    id: 'u2',
    name: '李美華',
    role: 'manager',
    department: '業務部',
    lastLogin: '2025-01-23',
  },
  {
    id: 'u3',
    name: '王大雄',
    role: 'sales',
    department: '業務部',
    lastLogin: '2025-01-22',
  },
  {
    id: 'u4',
    name: '陳小芳',
    role: 'finance',
    department: '財務部',
    lastLogin: '2025-01-23',
  },
  {
    id: 'u5',
    name: '林志強',
    role: 'logistics',
    department: '物流部',
    lastLogin: '2025-01-22',
  },
  {
    id: 'u6',
    name: '黃淑娟',
    role: 'viewer',
    department: '人事部',
    lastLogin: '2025-01-21',
  },
];

// 審計記錄
const auditLogs = [
  {
    id: 'a1',
    user: '張小明',
    action: '權限變更',
    target: '李美華',
    database: 'CRM',
    timestamp: '2025-01-23 14:30:00',
    status: '成功',
  },
  {
    id: 'a2',
    user: '李美華',
    action: '資料查詢',
    target: 'CRM',
    database: 'CRM',
    timestamp: '2025-01-23 13:45:00',
    status: '成功',
  },
  {
    id: 'a3',
    user: '王大雄',
    action: '資料修改',
    target: 'OMS',
    database: 'OMS',
    timestamp: '2025-01-23 11:20:00',
    status: '成功',
  },
  {
    id: 'a4',
    user: '陳小芳',
    action: '權限申請',
    target: 'FIN',
    database: 'FIN',
    timestamp: '2025-01-23 09:15:00',
    status: '待審核',
  },
  {
    id: 'a5',
    user: '林志強',
    action: '資料查詢',
    target: 'OMS',
    database: 'OMS',
    timestamp: '2025-01-22 16:30:00',
    status: '成功',
  },
];

// 安全問題
const securityIssues = [
  {
    id: 's1',
    type: '高風險',
    description: '使用者黃淑娟擁有過多權限',
    severity: 'high',
    status: '待處理',
  },
  {
    id: 's2',
    type: '中風險',
    description: 'FIN 系統缺少備份權限設定',
    severity: 'medium',
    status: '處理中',
  },
  {
    id: 's3',
    type: '低風險',
    description: '建議定期更新密碼政策',
    severity: 'low',
    status: '已處理',
  },
];

// 匯出資料
window.PermissionMatrixData = {
  databases,
  roles,
  permissionTypes,
  users,
  auditLogs,
  securityIssues,
};
