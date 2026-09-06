import { Router } from 'express';
import db from '../database/db.js';

const router = Router();

router.get('/buyers', (req, res) => {
  res.json(db.prepare('SELECT * FROM buyers').all());
});

router.get('/buyers/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM buyers WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Buyer not found' });
  res.json(row);
});

router.get('/buyers/:id/requirements', (req, res) => {
  const rows = db.prepare(`SELECT br.*, c.name as crop_name FROM buyer_requirements br
    JOIN crops c ON c.id = br.crop_id WHERE br.buyer_id = ? ORDER BY br.created_at DESC`).all(req.params.id);
  res.json(rows);
});

router.post('/buyer-requirements', (req, res) => {
  const b = req.body;
  const cropRow = db.prepare('SELECT * FROM crops WHERE name = ?').get(b.crop);
  if (!cropRow) return res.status(400).json({ error: 'Unknown crop' });
  const now = new Date().toISOString().slice(0, 10);
  const info = db.prepare(`INSERT INTO buyer_requirements (buyer_id, crop_id, quantity, grade, max_price, location, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(b.buyer_id, cropRow.id, Number(b.quantity), b.grade, Number(b.max_price), b.location, now);
  res.status(201).json({ id: info.lastInsertRowid });
});

export default router;
