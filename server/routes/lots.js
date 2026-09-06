import { Router } from 'express';
import db from '../database/db.js';

const router = Router();

const cropCodes = { Chilli: 'CHL', Paddy: 'PDY', Cotton: 'COT', Tomato: 'TOM', Turmeric: 'TUR' };

function qualityScore({ moisture, damage_pct, size, color, foreign_material }) {
  let score = 100;
  score -= Math.max(0, (moisture || 0) - 10) * 2;
  score -= (damage_pct || 0) * 3;
  score -= (foreign_material || 0) * 4;
  if (size === 'Premium') score += 0; else if (size === 'Medium') score -= 5; else score -= 10;
  if (color === 'Good') score += 0; else score -= 5;
  return Math.max(40, Math.min(100, Math.round(score)));
}

function nextLotCode(cropName) {
  const prefix = cropCodes[cropName] || cropName.slice(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  const row = db.prepare(`SELECT COUNT(*) as cnt FROM lots WHERE lot_code LIKE ?`).get(`${prefix}-${year}-%`);
  const seq = String(row.cnt + 1).padStart(3, '0');
  return `${prefix}-${year}-${seq}-${Date.now().toString().slice(-4)}`;
}

function serializeLot(row) {
  return row;
}

// GET /api/lots - list with filters
router.get('/lots', (req, res) => {
  const { crop, grade, location, status, min_price, max_price, min_qty } = req.query;
  let query = `SELECT l.*, c.name as crop_name, c.unit as crop_unit,
      f.name as farmer_name, fp.name as fpo_name
    FROM lots l
    JOIN crops c ON c.id = l.crop_id
    LEFT JOIN farmers f ON f.id = l.farmer_id
    LEFT JOIN fpos fp ON fp.id = l.fpo_id
    WHERE 1=1`;
  const params = [];
  if (crop) { query += ' AND c.name = ?'; params.push(crop); }
  if (grade) { query += ' AND l.quality_grade = ?'; params.push(grade); }
  if (location) { query += ' AND l.location LIKE ?'; params.push(`%${location}%`); }
  if (status) { query += ' AND l.status = ?'; params.push(status); }
  if (min_price) { query += ' AND l.expected_price >= ?'; params.push(Number(min_price)); }
  if (max_price) { query += ' AND l.expected_price <= ?'; params.push(Number(max_price)); }
  if (min_qty) { query += ' AND l.quantity >= ?'; params.push(Number(min_qty)); }
  query += ' ORDER BY l.created_at DESC, l.id DESC';
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

router.get('/lots/:id', (req, res) => {
  const row = db.prepare(`SELECT l.*, c.name as crop_name, c.unit as crop_unit,
      f.name as farmer_name, fp.name as fpo_name
    FROM lots l
    JOIN crops c ON c.id = l.crop_id
    LEFT JOIN farmers f ON f.id = l.farmer_id
    LEFT JOIN fpos fp ON fp.id = l.fpo_id
    WHERE l.id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Lot not found' });
  res.json(row);
});

// farmer lots by farmer id
router.get('/farmers/:farmerId/lots', (req, res) => {
  const rows = db.prepare(`SELECT l.*, c.name as crop_name, c.unit as crop_unit FROM lots l
    JOIN crops c ON c.id = l.crop_id WHERE l.farmer_id = ? ORDER BY l.created_at DESC`).all(req.params.farmerId);
  res.json(rows);
});

router.get('/fpos/:fpoId/lots', (req, res) => {
  const rows = db.prepare(`SELECT l.*, c.name as crop_name, c.unit as crop_unit FROM lots l
    JOIN crops c ON c.id = l.crop_id WHERE l.fpo_id = ? ORDER BY l.created_at DESC`).all(req.params.fpoId);
  res.json(rows);
});

// POST /api/lots - create a new lot
router.post('/lots', (req, res) => {
  const b = req.body;
  if (!b.crop || !b.quantity || !b.farmer_id && !b.fpo_id) {
    return res.status(400).json({ error: 'crop, quantity and farmer_id or fpo_id are required' });
  }
  const cropRow = db.prepare('SELECT * FROM crops WHERE name = ?').get(b.crop);
  if (!cropRow) return res.status(400).json({ error: 'Unknown crop' });

  const qs = qualityScore({
    moisture: Number(b.moisture),
    damage_pct: Number(b.damage_pct),
    size: b.size,
    color: b.color,
    foreign_material: Number(b.foreign_material)
  });
  const lotCode = nextLotCode(b.crop);
  const now = new Date().toISOString().slice(0, 10);

  const info = db.prepare(`INSERT INTO lots (lot_code, farmer_id, fpo_id, crop_id, variety, quantity, unit, location,
      harvest_date, expected_price, quality_grade, moisture, damage_pct, size, color, foreign_material,
      quality_score, description, image, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`).run(
    lotCode, b.farmer_id || null, b.fpo_id || null, cropRow.id, b.variety || '', Number(b.quantity),
    b.unit || 'tonnes', b.location || '', b.harvest_date || now, Number(b.expected_price) || 0,
    b.quality_grade || 'B', Number(b.moisture) || 0, Number(b.damage_pct) || 0, b.size || 'Medium',
    b.color || 'Good', Number(b.foreign_material) || 0, qs, b.description || '', b.image || null, now
  );

  db.prepare('INSERT INTO notifications (user_role, message, created_at, read) VALUES (?, ?, ?, 0)')
    .run('buyer', `New lot ${lotCode} (${b.crop}) available in the marketplace`, now);

  const created = db.prepare('SELECT * FROM lots WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ message: 'Lot created successfully', lot: serializeLot(created) });
});

// GET /api/buyers/matches/:lotId - matching engine
router.get('/buyers/matches/:lotId', (req, res) => {
  const lot = db.prepare('SELECT * FROM lots WHERE id = ?').get(req.params.lotId);
  if (!lot) return res.status(404).json({ error: 'Lot not found' });

  const buyers = db.prepare('SELECT * FROM buyers').all();
  const marketPrices = db.prepare('SELECT * FROM market_prices WHERE crop_id = ?').all(lot.crop_id);
  const bestMarketPrice = marketPrices.length ? Math.max(...marketPrices.map(p => p.price)) : lot.expected_price;
  const requirements = db.prepare('SELECT * FROM buyer_requirements WHERE crop_id = ?').all(lot.crop_id);

  const gradeRank = { A: 3, B: 2, C: 1 };

  const scored = buyers.map(buyer => {
    const req_ = requirements.find(r => r.buyer_id === buyer.id);
    const offeredPrice = req_ ? req_.max_price : Math.round(bestMarketPrice * 0.98);
    const priceScore = Math.max(0, Math.min(100, (offeredPrice / bestMarketPrice) * 100));

    const reqQty = req_ ? req_.quantity : lot.quantity;
    const qtyDiff = Math.abs(reqQty - lot.quantity) / Math.max(reqQty, lot.quantity);
    const quantityScore = Math.max(0, 100 - qtyDiff * 100);

    const reqGrade = req_ ? req_.grade : 'B';
    const gradeDiff = Math.abs((gradeRank[reqGrade] || 2) - (gradeRank[lot.quality_grade] || 2));
    const qualityScoreMatch = Math.max(0, 100 - gradeDiff * 30);

    // distance: simulate using buyer location vs lot location (simple heuristic)
    const distance = 15 + (buyer.id % 5) * 8;
    const distanceScore = Math.max(0, 100 - distance);

    const reliabilityScore = buyer.payment_reliability;

    const matchScore = Math.round(
      priceScore * 0.30 +
      quantityScore * 0.20 +
      qualityScoreMatch * 0.20 +
      distanceScore * 0.10 +
      reliabilityScore * 0.20
    );

    return {
      buyer_id: buyer.id,
      company_name: buyer.company_name,
      business_type: buyer.business_type,
      offered_price: offeredPrice,
      distance_km: distance,
      required_quantity: reqQty,
      grade: reqGrade,
      payment_reliability: buyer.payment_reliability,
      rating: buyer.rating,
      match_score: Math.max(0, Math.min(100, matchScore))
    };
  });

  scored.sort((a, b) => b.match_score - a.match_score);
  res.json(scored);
});

export default router;
