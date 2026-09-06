import { Router } from 'express';
import db from '../database/db.js';

const router = Router();

const STAGES = ['offer_accepted', 'order_confirmed', 'transport_assigned', 'picked_up', 'delivered', 'payment_processing', 'payment_received'];

// ---------- TRANSACTIONS ----------
router.get('/transactions', (req, res) => {
  const { farmer_id, buyer_id } = req.query;
  let query = `SELECT t.*, l.lot_code, c.name as crop_name, b.company_name as buyer_name
    FROM transactions t
    JOIN lots l ON l.id = t.lot_id
    JOIN crops c ON c.id = l.crop_id
    JOIN buyers b ON b.id = t.buyer_id
    WHERE 1=1`;
  const params = [];
  if (farmer_id) { query += ' AND t.farmer_id = ?'; params.push(farmer_id); }
  if (buyer_id) { query += ' AND t.buyer_id = ?'; params.push(buyer_id); }
  query += ' ORDER BY t.created_at DESC, t.id DESC';
  const rows = db.prepare(query).all(...params).map(r => ({ ...r, stages: STAGES, stage_index: STAGES.indexOf(r.stage) }));
  res.json(rows);
});

router.get('/transactions/:id', (req, res) => {
  const row = db.prepare(`SELECT t.*, l.lot_code, c.name as crop_name, b.company_name as buyer_name
    FROM transactions t
    JOIN lots l ON l.id = t.lot_id
    JOIN crops c ON c.id = l.crop_id
    JOIN buyers b ON b.id = t.buyer_id
    WHERE t.id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Transaction not found' });
  res.json({ ...row, stages: STAGES, stage_index: STAGES.indexOf(row.stage) });
});

router.patch('/transactions/:id', (req, res) => {
  const { stage } = req.body;
  if (!STAGES.includes(stage)) return res.status(400).json({ error: 'Invalid stage' });
  const info = db.prepare('UPDATE transactions SET stage = ? WHERE id = ?').run(stage, req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Transaction not found' });
  if (stage === 'payment_received') {
    const txn = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
    db.prepare(`UPDATE payments SET status = 'paid', date = ? WHERE transaction_id = ?`).run(new Date().toISOString().slice(0, 10), txn.id);
  }
  res.json({ message: 'Transaction updated' });
});

// ---------- TRANSPORT ----------
router.get('/transport', (req, res) => {
  res.json(db.prepare('SELECT * FROM transporters').all());
});

router.post('/transport/book', (req, res) => {
  const { transaction_id, transporter_id, distance_km } = req.body;
  const transporter = db.prepare('SELECT * FROM transporters WHERE id = ?').get(transporter_id);
  if (!transporter) return res.status(404).json({ error: 'Transporter not found' });
  const cost = Math.round(transporter.base_cost + (distance_km || 0) * 15);
  const now = new Date().toISOString().slice(0, 10);
  const info = db.prepare(`INSERT INTO transport_bookings (transaction_id, transporter_id, distance_km, cost, status, created_at)
    VALUES (?, ?, ?, ?, 'scheduled', ?)`).run(transaction_id, transporter_id, distance_km || 0, cost, now);
  if (transaction_id) {
    db.prepare(`UPDATE transactions SET stage = 'transport_assigned' WHERE id = ? AND stage = 'offer_accepted' OR id = ? AND stage = 'order_confirmed'`).run(transaction_id, transaction_id);
    db.prepare(`UPDATE transactions SET stage = 'transport_assigned' WHERE id = ?`).run(transaction_id);
  }
  res.status(201).json({ id: info.lastInsertRowid, cost, message: 'Transport Confirmed' });
});

router.get('/transport/bookings', (req, res) => {
  const { transaction_id } = req.query;
  let query = `SELECT tb.*, t.name as transporter_name, t.vehicle FROM transport_bookings tb
    JOIN transporters t ON t.id = tb.transporter_id WHERE 1=1`;
  const params = [];
  if (transaction_id) { query += ' AND tb.transaction_id = ?'; params.push(transaction_id); }
  res.json(db.prepare(query).all(...params));
});

// ---------- STORAGE ----------
router.get('/storage', (req, res) => {
  res.json(db.prepare('SELECT * FROM storage_facilities').all());
});

// ---------- PAYMENTS ----------
router.get('/payments', (req, res) => {
  const { farmer_id, buyer_id } = req.query;
  let query = `SELECT p.*, t.txn_code, t.farmer_id, t.buyer_id, b.company_name as buyer_name
    FROM payments p JOIN transactions t ON t.id = p.transaction_id
    JOIN buyers b ON b.id = t.buyer_id WHERE 1=1`;
  const params = [];
  if (farmer_id) { query += ' AND t.farmer_id = ?'; params.push(farmer_id); }
  if (buyer_id) { query += ' AND t.buyer_id = ?'; params.push(buyer_id); }
  query += ' ORDER BY p.date DESC, p.id DESC';
  res.json(db.prepare(query).all(...params));
});

router.patch('/payments/:id', (req, res) => {
  const { status } = req.body;
  const info = db.prepare('UPDATE payments SET status = ?, date = ? WHERE id = ?').run(status, new Date().toISOString().slice(0, 10), req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Payment not found' });
  res.json({ message: 'Payment updated' });
});

// ---------- GRIEVANCES ----------
router.get('/grievances', (req, res) => {
  const { farmer_id } = req.query;
  let query = `SELECT g.*, t.txn_code FROM grievances g LEFT JOIN transactions t ON t.id = g.transaction_id WHERE 1=1`;
  const params = [];
  if (farmer_id) { query += ' AND g.farmer_id = ?'; params.push(farmer_id); }
  query += ' ORDER BY g.created_at DESC, g.id DESC';
  res.json(db.prepare(query).all(...params));
});

router.post('/grievances', (req, res) => {
  const b = req.body;
  const now = new Date().toISOString().slice(0, 10);
  const info = db.prepare(`INSERT INTO grievances (transaction_id, farmer_id, issue_type, description, priority, stage, created_at)
    VALUES (?, ?, ?, ?, ?, 'submitted', ?)`).run(b.transaction_id || null, b.farmer_id, b.issue_type, b.description, b.priority || 'Medium', now);
  res.status(201).json({ id: info.lastInsertRowid, message: 'Grievance submitted' });
});

// ---------- NOTIFICATIONS ----------
router.get('/notifications', (req, res) => {
  const { role } = req.query;
  let query = 'SELECT * FROM notifications WHERE 1=1';
  const params = [];
  if (role) { query += ' AND user_role = ?'; params.push(role); }
  query += ' ORDER BY id DESC LIMIT 20';
  res.json(db.prepare(query).all(...params));
});

// ---------- AUTH (mocked) ----------
router.post('/auth/login', (req, res) => {
  const { role } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE role = ? ORDER BY id ASC LIMIT 1').get(role);
  if (!user) return res.status(404).json({ error: 'No demo user for this role' });

  let profile = {};
  if (role === 'farmer') profile = db.prepare('SELECT * FROM farmers WHERE user_id = ?').get(user.id);
  if (role === 'buyer') profile = db.prepare('SELECT * FROM buyers WHERE user_id = ?').get(user.id);
  if (role === 'fpo') profile = db.prepare('SELECT * FROM fpos WHERE user_id = ?').get(user.id);

  res.json({ user, profile });
});

// ---------- FPO AGGREGATION ----------
router.get('/fpos/:id/farmers', (req, res) => {
  res.json(db.prepare('SELECT * FROM farmers WHERE fpo_id = ?').all(req.params.id));
});

router.get('/fpos/:id/summary', (req, res) => {
  const fpo = db.prepare('SELECT * FROM fpos WHERE id = ?').get(req.params.id);
  const farmers = db.prepare('SELECT * FROM farmers WHERE fpo_id = ?').all(req.params.id);
  const lots = db.prepare('SELECT * FROM lots WHERE fpo_id = ?').all(req.params.id);
  const activeLots = lots.filter(l => l.status === 'active');
  const avgPrice = lots.length ? Math.round(lots.reduce((s, l) => s + l.expected_price, 0) / lots.length) : 0;
  const offers = db.prepare(`SELECT o.* FROM offers o JOIN lots l ON l.id = o.lot_id WHERE l.fpo_id = ?`).all(req.params.id);
  const pendingOffers = offers.filter(o => o.status === 'pending').length;
  const transactions = db.prepare(`SELECT t.* FROM transactions t JOIN lots l ON l.id = t.lot_id WHERE l.fpo_id = ?`).all(req.params.id);
  const totalTxnValue = transactions.reduce((s, t) => s + t.amount, 0);
  res.json({
    fpo, farmer_count: farmers.length, farmers,
    total_quantity: lots.reduce((s, l) => s + l.quantity, 0),
    active_lots: activeLots.length, average_price: avgPrice,
    pending_offers: pendingOffers, total_transaction_value: totalTxnValue
  });
});

export default router;
