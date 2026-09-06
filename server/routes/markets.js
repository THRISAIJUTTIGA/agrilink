import { Router } from 'express';
import db from '../database/db.js';

const router = Router();

router.get('/crops', (req, res) => {
  const crops = db.prepare('SELECT * FROM crops').all();
  res.json(crops);
});

router.get('/markets', (req, res) => {
  const markets = db.prepare('SELECT * FROM markets').all();
  res.json(markets);
});

// GET /api/market-prices?crop=Chilli&district=Guntur
router.get('/market-prices', (req, res) => {
  const { crop, district } = req.query;
  let query = `SELECT mp.*, c.name as crop_name, c.unit, m.name as market_name, m.district, m.type as market_type
    FROM market_prices mp
    JOIN crops c ON c.id = mp.crop_id
    JOIN markets m ON m.id = mp.market_id WHERE 1=1`;
  const params = [];
  if (crop) { query += ' AND c.name = ?'; params.push(crop); }
  if (district) { query += ' AND m.district = ?'; params.push(district); }
  query += ' ORDER BY mp.price DESC';
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

// GET /api/price-history?crop=Chilli&days=7
router.get('/price-history', (req, res) => {
  const { crop, days } = req.query;
  if (!crop) return res.status(400).json({ error: 'crop is required' });
  const cropRow = db.prepare('SELECT * FROM crops WHERE name = ?').get(crop);
  if (!cropRow) return res.status(404).json({ error: 'crop not found' });
  const limit = parseInt(days) || 7;
  const rows = db.prepare('SELECT date, price FROM price_history WHERE crop_id = ? ORDER BY date DESC LIMIT ?').all(cropRow.id, limit);
  res.json(rows.reverse());
});

// GET /api/insights?crop=Chilli - sale window recommendation (simulated)
router.get('/insights', (req, res) => {
  const { crop } = req.query;
  if (!crop) return res.status(400).json({ error: 'crop is required' });
  const cropRow = db.prepare('SELECT * FROM crops WHERE name = ?').get(crop);
  if (!cropRow) return res.status(404).json({ error: 'crop not found' });

  const hist7 = db.prepare('SELECT date, price FROM price_history WHERE crop_id = ? ORDER BY date DESC LIMIT 7').all(cropRow.id).reverse();
  const hist30rows = db.prepare('SELECT date, price FROM price_history WHERE crop_id = ? ORDER BY date DESC LIMIT 30').all(cropRow.id).reverse();

  const current = hist7[hist7.length - 1]?.price || 0;
  const weekAgo = hist7[0]?.price || current;
  const change7 = weekAgo ? Math.round(((current - weekAgo) / weekAgo) * 1000) / 10 : 0;

  const expectedLow = Math.round(current * 1.02 * 100) / 100;
  const expectedHigh = Math.round(current * 1.06 * 100) / 100;

  let recommendation = 'SELL NOW';
  let reason = 'Prices are near their recent peak and demand looks steady.';
  let confidence = 74;
  if (change7 > 3) {
    recommendation = 'WAIT 3-5 DAYS';
    reason = 'Market demand is increasing and nearby arrivals are decreasing.';
    confidence = 87;
  } else if (change7 < -3) {
    recommendation = 'SELL NOW';
    reason = 'Prices are trending down; holding may reduce returns.';
    confidence = 81;
  }

  res.json({
    crop,
    unit: cropRow.unit,
    current_price: current,
    change_7d_pct: change7,
    expected_range: { low: expectedLow, high: expectedHigh },
    recommendation,
    reason,
    confidence,
    history_7d: hist7,
    history_30d: hist30rows,
    disclaimer: 'This is simulated prototype intelligence for demo purposes, not a guaranteed prediction.'
  });
});

export default router;
