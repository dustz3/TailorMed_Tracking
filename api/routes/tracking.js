const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET - 查詢貨件追蹤資訊
// Query params: orderNo, trackingNo
router.get('/', async (req, res) => {
  try {
    const { orderNo, trackingNo } = req.query;

    if (!orderNo || !trackingNo) {
      return res.status(400).json({ 
        error: 'Missing parameters',
        message: 'Both orderNo and trackingNo are required' 
      });
    }

    // 查詢資料庫
    const shipment = await db.getShipmentByOrderAndTracking(orderNo, trackingNo);

    if (!shipment) {
      console.log('❌ 查詢失敗 - 找不到貨件:', { orderNo, trackingNo });
      return res.status(404).json({ 
        error: 'Not found',
        message: 'No shipment found with the provided information' 
      });
    }

    console.log('✅ 查詢成功 - 找到貨件:', { orderNo, trackingNo, shipmentId: shipment.id });
    res.json({
      success: true,
      data: shipment
    });

  } catch (error) {
    console.error('Tracking API error:', error);
    res.status(500).json({ 
      error: 'Database error',
      message: error.message 
    });
  }
});

// POST - 查詢貨件追蹤資訊（表單提交）
router.post('/', async (req, res) => {
  try {
    const { order, job } = req.body;

    if (!order || !job) {
      return res.status(400).json({ 
        error: 'Missing parameters',
        message: 'Both order number and job number are required' 
      });
    }

    // 查詢資料庫
    const shipment = await db.getShipmentByOrderAndTracking(order, job);

    if (!shipment) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'No shipment found with the provided information' 
      });
    }

    res.json({
      success: true,
      data: shipment
    });

  } catch (error) {
    console.error('Tracking API error:', error);
    res.status(500).json({ 
      error: 'Database error',
      message: error.message 
    });
  }
});

// GET - 取得時間軸事件
router.get('/timeline/:trackingNo', async (req, res) => {
  try {
    const { trackingNo } = req.params;
    
    const timeline = await db.getTimelineEvents(trackingNo);
    
    res.json({
      success: true,
      data: timeline
    });

  } catch (error) {
    console.error('Timeline API error:', error);
    res.status(500).json({ 
      error: 'Database error',
      message: error.message 
    });
  }
});

module.exports = router;


