// 表格權限管理系統

// 表格權限資料結構
const tablePermissions = {
  // CRM 資料庫表格權限
  crm: {
    quotations: {
      name: 'Quotations',
      description: '報價單管理',
      fields: {
        basic: ['客戶名稱', '報價日期', '產品項目', '數量'],
        sensitive: ['報價金額', '利潤率', '成本'],
        system: ['ID', '建立時間', '修改時間'],
      },
    },
    partners: {
      name: 'Partners',
      description: '合作夥伴資料',
      fields: {
        basic: ['公司名稱', '聯絡人', '電話', '地址'],
        sensitive: ['合約金額', '付款條件', '信用額度'],
        system: ['ID', '建立時間', '修改時間'],
      },
    },
    contacts: {
      name: 'Contacts',
      description: 'Shipper/Consignee 往來客戶',
      fields: {
        basic: ['公司名稱', '聯絡人', '電話', 'Email', '地址'],
        sensitive: ['合約條件', '信用額度', '付款條件'],
        system: ['ID', '建立時間', '修改時間'],
      },
    },
    attns: {
      name: 'ATTNs',
      description: '經辦人',
      fields: {
        basic: ['經辦人姓名', '部門', '職位', '聯絡方式'],
        sensitive: ['權限等級', '特殊授權'],
        system: ['ID', '建立時間', '修改時間'],
      },
    },
    locations: {
      name: 'Locations',
      description: '地點管理',
      fields: {
        basic: ['地點名稱', '地址', '聯絡人', '電話'],
        sensitive: ['租金', '合約資訊'],
        system: ['ID', '建立時間', '修改時間'],
      },
    },
    package_items: {
      name: 'Package Items',
      description: '包裹項目',
      fields: {
        basic: ['項目名稱', '描述', '重量', '尺寸'],
        sensitive: ['成本', '利潤'],
        system: ['ID', '建立時間', '修改時間'],
      },
    },
    charge_items: {
      name: 'Charge Items',
      description: '收費項目',
      fields: {
        basic: ['項目名稱', '描述', '單位'],
        sensitive: ['單價', '成本', '利潤率'],
        system: ['ID', '建立時間', '修改時間'],
      },
    },
    non_taxable_charges: {
      name: 'Non-Taxable Charges',
      description: '免稅項目',
      fields: {
        basic: ['項目名稱', '描述', '免稅原因'],
        sensitive: ['金額', '稅務狀態'],
        system: ['ID', '建立時間', '修改時間'],
      },
    },
    staffs: {
      name: 'Staffs',
      description: '員工資料',
      fields: {
        basic: ['姓名', '部門', '職位', '電話'],
        sensitive: ['薪資', '個人資料', '績效評分'],
        system: ['ID', '建立時間', '修改時間'],
      },
    },
  },
  // OMS 資料庫表格權限
  oms: {
    orders: {
      name: 'Orders',
      description: '訂單管理',
      fields: {
        basic: ['訂單編號', '客戶名稱', '訂單日期', '狀態'],
        sensitive: ['訂單金額', '成本', '利潤'],
        system: ['ID', '建立時間', '修改時間'],
      },
    },
    inventory: {
      name: 'Inventory',
      description: '庫存管理',
      fields: {
        basic: ['產品名稱', '庫存數量', '位置', '狀態'],
        sensitive: ['成本', '進價', '售價'],
        system: ['ID', '建立時間', '修改時間'],
      },
    },
    shipments: {
      name: 'Shipments',
      description: '配送追蹤',
      fields: {
        basic: ['配送單號', '收件人', '地址', '狀態'],
        sensitive: ['配送費用', '保險金額'],
        system: ['ID', '建立時間', '修改時間'],
      },
    },
  },
  // FIN 資料庫表格權限
  fin: {
    invoices: {
      name: 'Invoices',
      description: '發票管理',
      fields: {
        basic: ['發票號碼', '客戶名稱', '發票日期', '狀態'],
        sensitive: ['發票金額', '稅額', '實收金額'],
        system: ['ID', '建立時間', '修改時間'],
      },
    },
    payments: {
      name: 'Payments',
      description: '付款記錄',
      fields: {
        basic: ['付款單號', '付款日期', '付款方式', '狀態'],
        sensitive: ['付款金額', '手續費', '實際到帳金額'],
        system: ['ID', '建立時間', '修改時間'],
      },
    },
    reports: {
      name: 'Reports',
      description: '財務報表',
      fields: {
        basic: ['報表名稱', '期間', '狀態'],
        sensitive: ['總收入', '總成本', '淨利潤'],
        system: ['ID', '建立時間', '修改時間'],
      },
    },
  },
};

// 角色表格權限定義
const roleTablePermissions = {
  admin: {
    crm: {
      quotations: {
        basic: ['read', 'write', 'delete'],
        sensitive: ['read', 'write', 'delete'],
        system: ['read', 'write', 'delete'],
      },
      partners: {
        basic: ['read', 'write', 'delete'],
        sensitive: ['read', 'write', 'delete'],
        system: ['read', 'write', 'delete'],
      },
      contacts: {
        basic: ['read', 'write', 'delete'],
        sensitive: ['read', 'write', 'delete'],
        system: ['read', 'write', 'delete'],
      },
      attns: {
        basic: ['read', 'write', 'delete'],
        sensitive: [],
        system: ['read', 'write', 'delete'],
      },
      locations: {
        basic: ['read', 'write', 'delete'],
        sensitive: ['read', 'write', 'delete'],
        system: ['read', 'write', 'delete'],
      },
      package_items: {
        basic: ['read', 'write', 'delete'],
        sensitive: ['read', 'write', 'delete'],
        system: ['read', 'write', 'delete'],
      },
      charge_items: {
        basic: ['read', 'write', 'delete'],
        sensitive: ['read', 'write', 'delete'],
        system: ['read', 'write', 'delete'],
      },
      non_taxable_charges: {
        basic: ['read', 'write', 'delete'],
        sensitive: ['read', 'write', 'delete'],
        system: ['read', 'write', 'delete'],
      },
      staffs: {
        basic: ['read', 'write', 'delete'],
        sensitive: ['read', 'write', 'delete'],
        system: ['read', 'write', 'delete'],
      },
    },
    oms: {
      orders: {
        basic: ['read', 'write', 'delete'],
        sensitive: ['read', 'write', 'delete'],
        system: ['read', 'write', 'delete'],
      },
      inventory: {
        basic: ['read', 'write', 'delete'],
        sensitive: ['read', 'write', 'delete'],
        system: ['read', 'write', 'delete'],
      },
      shipments: {
        basic: ['read', 'write', 'delete'],
        sensitive: ['read', 'write', 'delete'],
        system: ['read', 'write', 'delete'],
      },
    },
    fin: {
      invoices: {
        basic: ['read', 'write', 'delete'],
        sensitive: ['read', 'write', 'delete'],
        system: ['read', 'write', 'delete'],
      },
      payments: {
        basic: ['read', 'write', 'delete'],
        sensitive: ['read', 'write', 'delete'],
        system: ['read', 'write', 'delete'],
      },
      reports: {
        basic: ['read', 'write', 'delete'],
        sensitive: ['read', 'write', 'delete'],
        system: ['read', 'write', 'delete'],
      },
    },
  },
  sales_manager: {
    crm: {
      quotations: {
        basic: ['read', 'write', 'delete'],
        sensitive: ['read', 'write'],
        system: ['read'],
      },
      partners: {
        basic: ['read', 'write'],
        sensitive: ['read'],
        system: ['read'],
      },
      contacts: {
        basic: ['read', 'write'],
        sensitive: ['read'],
        system: ['read'],
      },
      attns: { basic: ['read', 'write'], sensitive: [], system: ['read'] },
      locations: {
        basic: ['read', 'write'],
        sensitive: ['read'],
        system: ['read'],
      },
      package_items: {
        basic: ['read', 'write'],
        sensitive: ['read'],
        system: ['read'],
      },
      charge_items: {
        basic: ['read', 'write'],
        sensitive: ['read'],
        system: ['read'],
      },
      non_taxable_charges: {
        basic: ['read', 'write'],
        sensitive: ['read'],
        system: ['read'],
      },
      staffs: { basic: ['read'], sensitive: [], system: ['read'] },
    },
    oms: {
      orders: {
        basic: ['read', 'write'],
        sensitive: ['read'],
        system: ['read'],
      },
      inventory: { basic: ['read'], sensitive: [], system: ['read'] },
      shipments: {
        basic: ['read', 'write'],
        sensitive: ['read'],
        system: ['read'],
      },
    },
    fin: {
      invoices: { basic: ['read'], sensitive: [], system: ['read'] },
      payments: { basic: ['read'], sensitive: [], system: ['read'] },
      reports: { basic: ['read'], sensitive: [], system: ['read'] },
    },
  },
  operations_staff: {
    crm: {
      quotations: { basic: ['read'], sensitive: [], system: ['read'] },
      partners: { basic: ['read'], sensitive: [], system: ['read'] },
      contacts: { basic: ['read'], sensitive: [], system: ['read'] },
      attns: { basic: ['read'], sensitive: [], system: ['read'] },
      locations: { basic: ['read'], sensitive: [], system: ['read'] },
      package_items: { basic: ['read'], sensitive: [], system: ['read'] },
      charge_items: { basic: ['read'], sensitive: [], system: ['read'] },
      non_taxable_charges: { basic: ['read'], sensitive: [], system: ['read'] },
      staffs: { basic: ['read'], sensitive: [], system: ['read'] },
    },
    oms: {
      orders: {
        basic: ['read', 'write'],
        sensitive: ['read'],
        system: ['read'],
      },
      inventory: {
        basic: ['read', 'write'],
        sensitive: ['read'],
        system: ['read'],
      },
      shipments: {
        basic: ['read', 'write'],
        sensitive: ['read'],
        system: ['read'],
      },
    },
    fin: {
      invoices: { basic: ['read'], sensitive: [], system: ['read'] },
      payments: { basic: ['read'], sensitive: [], system: ['read'] },
      reports: { basic: ['read'], sensitive: [], system: ['read'] },
    },
  },
  finance_staff: {
    crm: {
      quotations: { basic: ['read'], sensitive: ['read'], system: ['read'] },
      partners: { basic: ['read'], sensitive: ['read'], system: ['read'] },
      contacts: { basic: ['read'], sensitive: [], system: ['read'] },
      attns: { basic: ['read'], sensitive: [], system: ['read'] },
      locations: { basic: ['read'], sensitive: ['read'], system: ['read'] },
      package_items: { basic: ['read'], sensitive: ['read'], system: ['read'] },
      charge_items: {
        basic: ['read', 'write'],
        sensitive: ['read', 'write'],
        system: ['read'],
      },
      non_taxable_charges: {
        basic: ['read', 'write'],
        sensitive: ['read', 'write'],
        system: ['read'],
      },
      staffs: { basic: ['read'], sensitive: [], system: ['read'] },
    },
    oms: {
      orders: { basic: ['read'], sensitive: ['read'], system: ['read'] },
      inventory: { basic: ['read'], sensitive: ['read'], system: ['read'] },
      shipments: { basic: ['read'], sensitive: ['read'], system: ['read'] },
    },
    fin: {
      invoices: {
        basic: ['read', 'write', 'delete'],
        sensitive: ['read', 'write', 'delete'],
        system: ['read', 'write', 'delete'],
      },
      payments: {
        basic: ['read', 'write', 'delete'],
        sensitive: ['read', 'write', 'delete'],
        system: ['read', 'write', 'delete'],
      },
      reports: {
        basic: ['read', 'write'],
        sensitive: ['read', 'write'],
        system: ['read', 'write'],
      },
    },
  },
  viewer: {
    crm: {
      quotations: { basic: ['read'], sensitive: [], system: [] },
      partners: { basic: ['read'], sensitive: [], system: [] },
      contacts: { basic: ['read'], sensitive: [], system: [] },
      attns: { basic: [], sensitive: [], system: [] },
      locations: { basic: ['read'], sensitive: [], system: [] },
      package_items: { basic: ['read'], sensitive: [], system: [] },
      charge_items: { basic: ['read'], sensitive: [], system: [] },
      non_taxable_charges: { basic: ['read'], sensitive: [], system: [] },
      staffs: { basic: [], sensitive: [], system: [] },
    },
    oms: {
      orders: { basic: ['read'], sensitive: [], system: [] },
      inventory: { basic: ['read'], sensitive: [], system: [] },
      shipments: { basic: ['read'], sensitive: [], system: [] },
    },
    fin: {
      invoices: { basic: [], sensitive: [], system: [] },
      payments: { basic: [], sensitive: [], system: [] },
      reports: { basic: ['read'], sensitive: [], system: [] },
    },
  },
};

// 匯出資料
window.TablePermissionsData = {
  tablePermissions,
  roleTablePermissions,
};
