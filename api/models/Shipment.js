// Shipment Model
// 貨件資料模型

// 如果使用 MongoDB + Mongoose
// const mongoose = require('mongoose');
// 
// const shipmentSchema = new mongoose.Schema({
//   orderNo: String,
//   trackingNo: String,
//   invoiceNo: String,
//   mawb: String,
//   origin: String,
//   destination: String,
//   packageCount: Number,
//   weight: Number,
//   eta: Date,
//   status: String,
//   lastUpdate: Date,
//   timeline: [{
//     step: Number,
//     title: String,
//     time: Date,
//     status: String
//   }]
// });
// 
// module.exports = mongoose.model('Shipment', shipmentSchema);

// ===== 目前使用簡單的資料結構 =====
// 當使用關聯式資料庫（MySQL/PostgreSQL）時，這是資料表結構參考

const ShipmentModel = {
  // 貨件主表結構
  shipments: {
    tableName: 'shipments',
    columns: {
      id: 'INT PRIMARY KEY AUTO_INCREMENT',
      order_no: 'VARCHAR(50) UNIQUE NOT NULL',
      tracking_no: 'VARCHAR(50) UNIQUE NOT NULL',
      invoice_no: 'VARCHAR(50)',
      mawb: 'VARCHAR(50)',
      origin: 'VARCHAR(10)',
      destination: 'VARCHAR(10)',
      package_count: 'INT',
      weight: 'DECIMAL(10,2)',
      eta: 'DATETIME',
      status: 'VARCHAR(50)',
      last_update: 'DATETIME',
      created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    }
  },

  // 時間軸事件表結構
  timeline_events: {
    tableName: 'timeline_events',
    columns: {
      id: 'INT PRIMARY KEY AUTO_INCREMENT',
      shipment_id: 'INT NOT NULL',
      step: 'INT NOT NULL',
      title: 'VARCHAR(100) NOT NULL',
      event_time: 'DATETIME',
      status: 'ENUM("completed", "active", "pending") DEFAULT "pending"',
      is_event: 'BOOLEAN DEFAULT FALSE',
      event_type: 'VARCHAR(50)',
      created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    },
    foreignKeys: {
      shipment_id: 'REFERENCES shipments(id) ON DELETE CASCADE'
    }
  },

  // 建立資料表的 SQL（供參考）
  createTableSQL: `
    CREATE TABLE IF NOT EXISTS shipments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      order_no VARCHAR(50) UNIQUE NOT NULL,
      tracking_no VARCHAR(50) UNIQUE NOT NULL,
      invoice_no VARCHAR(50),
      mawb VARCHAR(50),
      origin VARCHAR(10),
      destination VARCHAR(10),
      package_count INT,
      weight DECIMAL(10,2),
      eta DATETIME,
      status VARCHAR(50),
      last_update DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_order_tracking (order_no, tracking_no)
    );

    CREATE TABLE IF NOT EXISTS timeline_events (
      id INT PRIMARY KEY AUTO_INCREMENT,
      shipment_id INT NOT NULL,
      step INT NOT NULL,
      title VARCHAR(100) NOT NULL,
      event_time DATETIME,
      status ENUM('completed', 'active', 'pending') DEFAULT 'pending',
      is_event BOOLEAN DEFAULT FALSE,
      event_type VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
      INDEX idx_shipment_step (shipment_id, step)
    );
  `
};

module.exports = ShipmentModel;


