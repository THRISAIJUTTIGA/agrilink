import { Router } from 'express';
import db from '../database/db.js';

const router = Router();

router.get('/offers', (req, res) => {
  const { farmer_id, buyer_id, lot_id, status } = req.query;
  let query = `SELECT o.*, l.lot_code, l.crop_id, c.name as crop_name, l.farmer_id, l.fpo_id,
      b.company_name as buyer_name
    FROM offers o
    JOIN lots l ON l.id = o.lot_id
    JOIN crops c ON c.id = l.crop_id
    JOIN buyers b ON b.id = o.buyer_id
    WHERE 1=1`;
  const params = [];
  if (farmer_id) { query += ' AND l.farmer_id = ?'; params.push(farmer_id); }
  if (buyer_id) { query += ' AND o.buyer_id = ?'; params.push(buyer_id); }
  if (lot_id) { query += ' AND o.lot_id = ?'; params.push(lot_id); }
  if (status) { query += ' AND o.status = ?'; params.push(status); }
  query += ' ORDER BY o.created_at DESC, o.id DESC';
  res.json(db.prepare(query).all(...params));
});

router.post('/offers', (req, res) => {
  const b = req.body;
  if (!b.lot_id || !b.buyer_id || !b.price || !b.quantity) {
    return res.status(400).json({ error: 'lot_id, buyer_id, price and quantity are required' });
  }
  const lot = db.prepare('SELECT * FROM lots WHERE id = ?').get(b.lot_id);
  if (!lot) return res.status(404).json({ error: 'Lot not found' });
  const now = new Date().toISOString().slice(0, 10);
  const info = db.prepare(`INSERT INTO offers (lot_id, buyer_id, price, quantity, payment_terms, pickup_date, conditions, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`).run(
      b.lot_id, b.buyer_id, Number(b.price), Number(b.quantity), b.payment_terms || '', b.pickup_date || now, b.conditions || '', now
    );
  db.prepare('INSERT INTO notifications (user_role, message, created_at, read) VALUES (?, ?, ?, 0)')
    .run('farmer', `New buyer offer received on ${lot.lot_code}`, now);
  res.status(201).json({ id: info.lastInsertRowid, message: 'Offer submitted' });
});

// PATCH /api/offers/:id  body: { status: 'accepted' | 'rejected' | 'countered', counter_price }
router.patch('/offers/:id', (req, res) => {
  const offer = db.prepare('SELECT * FROM offers WHERE id = ?').get(req.params.id);
  if (!offer) return res.status(404).json({ error: 'Offer not found' });
  const { status, counter_price } = req.body;
  const now = new Date().toISOString().slice(0, 10);

  if (status === 'countered') {
    db.prepare('UPDATE offers SET status = ?, price = ? WHERE id = ?').run('countered', Number(counter_price) || offer.price, offer.id);
    return res.json({ message: 'Counter offer sent' });
  }

  db.prepare('UPDATE offers SET status = ? WHERE id = ?').run(status, offer.id);

  if (status === 'accepted') {
    const lot = db.prepare('SELECT * FROM lots WHERE id = ?').get(offer.lot_id);
    const txnCode = `TXN-${new Date().getFullYear()}-${String(offer.id).padStart(4, '0')}`;
    const amount = offer.price * offer.quantity;
    const txnInfo = db.prepare(`INSERT INTO transactions (txn_code, offer_id, lot_id, buyer_id, farmer_id, amount, stage, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'offer_accepted', ?)`).run(txnCode, offer.id, offer.lot_id, offer.buyer_id, lot.farmer_id, amount, now);

    db.prepare('UPDATE lots SET status = ? WHERE id = ?').run('sold', offer.lot_id);
    db.prepare(`INSERT INTO payments (transaction_id, amount, status, date) VALUES (?, ?, 'pending', ?)`).run(txnInfo.lastInsertRowid, amount, now);

    // reject other pending offers on this lot
    db.prepare(`UPDATE offers SET status = 'rejected' WHERE lot_id = ? AND id != ? AND status = 'pending'`).run(offer.lot_id, offer.id);

    db.prepare('INSERT INTO notifications (user_role, message, created_at, read) VALUES (?, ?, ?, 0)')
      .run('buyer', `Your offer on ${lot.lot_code} was accepted. Transaction ${txnCode} created.`, now);

    return res.json({ message: 'Offer accepted, transaction created', transaction_id: txnInfo.lastInsertRowid, txn_code: txnCode });
  }

  res.json({ message: `Offer ${status}` });
});

export default router;
