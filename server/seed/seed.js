import db from '../database/db.js';

// Wipe existing data (idempotent seeding for demo)
const tables = ['notifications','grievances','payments','transport_bookings','transporters',
  'storage_facilities','transactions','offers','buyer_requirements','lots','price_history',
  'market_prices','markets','crops','fpos','buyers','farmers','users'];
tables.forEach(t => db.exec(`DELETE FROM ${t}`));

const crops = ['Chilli', 'Paddy', 'Cotton', 'Tomato', 'Turmeric'];
const cropUnits = { Chilli: 'kg', Paddy: 'kg', Cotton: 'qtl', Tomato: 'kg', Turmeric: 'kg' };
const cropIds = {};
const insCrop = db.prepare('INSERT INTO crops (name, unit) VALUES (?, ?)');
crops.forEach(c => { const r = insCrop.run(c, cropUnits[c]); cropIds[c] = r.lastInsertRowid; });

const markets = [
  { name: 'Guntur Mandi', district: 'Guntur', type: 'mandi' },
  { name: 'Vijayawada Market', district: 'Krishna', type: 'mandi' },
  { name: 'Tenali Market', district: 'Guntur', type: 'mandi' },
  { name: 'Bapatla Market', district: 'Guntur', type: 'mandi' },
  { name: 'Processor A', district: 'Krishna district', type: 'processor' },
  { name: 'Buyer B (Institutional)', district: 'Guntur', type: 'institutional' },
  { name: 'Buyer C (Digital)', district: 'Vijayawada', type: 'digital' },
];
const marketIds = {};
const insMarket = db.prepare('INSERT INTO markets (name, district, type) VALUES (?, ?, ?)');
markets.forEach(m => { const r = insMarket.run(m.name, m.district, m.type); marketIds[m.name] = r.lastInsertRowid; });

// base prices per crop (per unit)
const basePrices = { Chilli: 198, Paddy: 24, Cotton: 7150, Tomato: 32, Turmeric: 145 };

const insPrice = db.prepare(`INSERT INTO market_prices (crop_id, market_id, price, change_pct, distance_km, date, source_type) VALUES (?, ?, ?, ?, ?, ?, ?)`);
const today = new Date().toISOString().slice(0, 10);

const marketOffsets = {
  'Guntur Mandi': { mult: 0.91, dist: 22 },
  'Vijayawada Market': { mult: 0.93, dist: 48 },
  'Tenali Market': { mult: 0.90, dist: 15 },
  'Bapatla Market': { mult: 0.89, dist: 30 },
  'Processor A': { mult: 1.0, dist: 35 },
  'Buyer B (Institutional)': { mult: 1.02, dist: 40 },
  'Buyer C (Digital)': { mult: 1.035, dist: 50 },
};

crops.forEach(crop => {
  const base = basePrices[crop];
  Object.entries(marketOffsets).forEach(([mname, o]) => {
    const price = Math.round(base * o.mult * 100) / 100;
    const change = Math.round((Math.random() * 8 - 1) * 10) / 10;
    insPrice.run(cropIds[crop], marketIds[mname], price, change, o.dist, today, markets.find(m => m.name === mname).type);
  });
});

// 30 days price history per crop with slight upward trend + noise
const insHist = db.prepare('INSERT INTO price_history (crop_id, date, price) VALUES (?, ?, ?)');
crops.forEach(crop => {
  const base = basePrices[crop];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const trend = (29 - i) * (base * 0.0025);
    const noise = (Math.random() - 0.5) * base * 0.02;
    const price = Math.round((base * 0.9 + trend + noise) * 100) / 100;
    insHist.run(cropIds[crop], d.toISOString().slice(0, 10), price);
  }
});

// Users, farmers, fpos, buyers
const insUser = db.prepare('INSERT INTO users (name, mobile, role, location, ref_id) VALUES (?, ?, ?, ?, ?)');
const insFarmer = db.prepare('INSERT INTO farmers (user_id, name, location, fpo_id) VALUES (?, ?, ?, ?)');
const insFpo = db.prepare('INSERT INTO fpos (user_id, name, location) VALUES (?, ?, ?)');
const insBuyer = db.prepare('INSERT INTO buyers (user_id, company_name, business_type, verified, years_active, previous_transactions, payment_reliability, rating, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');

const fpoRow = insFpo.run(0, 'Guntur Chilli Growers FPO', 'Guntur');
const fpoId = fpoRow.lastInsertRowid;
const fpoUser = insUser.run('Guntur Chilli Growers FPO', '9000000003', 'fpo', 'Guntur', fpoId);
db.prepare('UPDATE fpos SET user_id = ? WHERE id = ?').run(fpoUser.lastInsertRowid, fpoId);

const farmerUser = insUser.run('Ramesh Naidu', '9000000001', 'farmer', 'Guntur, Andhra Pradesh', null);
const farmerRow = insFarmer.run(farmerUser.lastInsertRowid, 'Ramesh Naidu', 'Guntur, Andhra Pradesh', fpoId);
const farmerId = farmerRow.lastInsertRowid;
db.prepare('UPDATE users SET ref_id = ? WHERE id = ?').run(farmerId, farmerUser.lastInsertRowid);

// a few more farmers under the FPO for aggregation demo
const extraFarmers = [
  { name: 'Lakshmi Devi', location: 'Tenali', qty: 3 },
  { name: 'Subba Rao', location: 'Bapatla', qty: 5 },
  { name: 'Venkata Reddy', location: 'Guntur', qty: 2 },
];
const extraFarmerIds = [];
extraFarmers.forEach(f => {
  const u = insUser.run(f.name, '90000000' + (10 + extraFarmerIds.length), 'farmer', f.location, null);
  const fr = insFarmer.run(u.lastInsertRowid, f.name, f.location, fpoId);
  extraFarmerIds.push({ id: fr.lastInsertRowid, qty: f.qty });
});

const buyerUser1 = insUser.run('ABC Foods Pvt Ltd', '9000000002', 'buyer', 'Vijayawada', null);
const buyer1 = insBuyer.run(buyerUser1.lastInsertRowid, 'ABC Foods Pvt Ltd', 'Food Processor', 1, 6, 142, 96, 4.7, 'Vijayawada');
db.prepare('UPDATE users SET ref_id = ? WHERE id = ?').run(buyer1.lastInsertRowid, buyerUser1.lastInsertRowid);

const buyerUser2 = insUser.run('Krishna Agro Exports', '9000000004', 'buyer', 'Guntur', null);
const buyer2 = insBuyer.run(buyerUser2.lastInsertRowid, 'Krishna Agro Exports', 'Exporter', 1, 9, 210, 91, 4.5, 'Guntur');

const buyerUser3 = insUser.run('Digital Mandi B2B', '9000000005', 'buyer', 'Vijayawada', null);
const buyer3 = insBuyer.run(buyerUser3.lastInsertRowid, 'Digital Mandi B2B', 'Digital Buyer', 1, 3, 58, 88, 4.2, 'Vijayawada');

const buyerIds = [buyer1.lastInsertRowid, buyer2.lastInsertRowid, buyer3.lastInsertRowid];

// buyer requirements
const insReq = db.prepare('INSERT INTO buyer_requirements (buyer_id, crop_id, quantity, grade, max_price, location, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
insReq.run(buyer1.lastInsertRowid, cropIds['Chilli'], 5, 'A', 210, 'Guntur', today);
insReq.run(buyer2.lastInsertRowid, cropIds['Chilli'], 8, 'A', 208, 'Guntur', today);
insReq.run(buyer3.lastInsertRowid, cropIds['Cotton'], 50, 'B', 7300, 'Vijayawada', today);

// Lots
const insLot = db.prepare(`INSERT INTO lots (lot_code, farmer_id, fpo_id, crop_id, variety, quantity, unit, location, harvest_date, expected_price, quality_grade, moisture, damage_pct, size, color, foreign_material, quality_score, description, image, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

function qualityScore({ moisture, damage, size, color, foreignMaterial }) {
  let score = 100;
  score -= Math.max(0, moisture - 10) * 2;
  score -= damage * 3;
  score -= foreignMaterial * 4;
  if (size === 'Premium') score += 0; else if (size === 'Medium') score -= 5; else score -= 10;
  if (color === 'Good') score += 0; else score -= 5;
  return Math.max(40, Math.min(100, Math.round(score)));
}

const lot1qs = qualityScore({ moisture: 11.8, damage: 2.1, size: 'Premium', color: 'Good', foreignMaterial: 0.5 });
const lot1 = insLot.run('CHL-2026-001', farmerId, null, cropIds['Chilli'], 'Guntur Sannam', 6, 'tonnes', 'Guntur, Andhra Pradesh', today, 205, 'A', 11.8, 2.1, 'Premium', 'Good', 0.5, lot1qs, 'Freshly harvested Sannam chilli, sun-dried, sorted.', null, 'active', today);
const lot1Id = lot1.lastInsertRowid;

const lot2qs = qualityScore({ moisture: 22, damage: 4, size: 'Medium', color: 'Good', foreignMaterial: 1.5 });
insLot.run('PDY-2026-002', farmerId, null, cropIds['Paddy'], 'BPT 5204', 4, 'tonnes', 'Guntur, Andhra Pradesh', today, 24, 'B', 22, 4, 'Medium', 'Good', 1.5, lot2qs, 'Standard paddy, moisture within acceptable range.', null, 'active', today);

const lot3qs = qualityScore({ moisture: 8.5, damage: 3, size: 'Medium', color: 'Good', foreignMaterial: 1 });
insLot.run('COT-2026-003', farmerId, null, cropIds['Cotton'], 'Bunny BT', 2, 'tonnes', 'Guntur, Andhra Pradesh', today, 7250, 'B', 8.5, 3, 'Medium', 'Good', 1, lot3qs, 'Machine picked cotton, ginning quality.', null, 'active', today);

// FPO bulk lot from aggregated farmers
const bulkQty = extraFarmerIds.reduce((s, f) => s + f.qty, 0);
insLot.run('CHL-2026-004', null, fpoId, cropIds['Chilli'], 'Guntur Sannam (Bulk)', bulkQty, 'tonnes', 'Guntur, Andhra Pradesh', today, 202, 'A', 12.5, 2.8, 'Premium', 'Good', 0.8, 88, 'Aggregated lot from 3 FPO member farmers.', null, 'active', today);

// Offers on lot1
const insOffer = db.prepare(`INSERT INTO offers (lot_id, buyer_id, price, quantity, payment_terms, pickup_date, conditions, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
insOffer.run(lot1Id, buyer1.lastInsertRowid, 205, 5, '3 days after pickup', today, 'Moisture must remain under 12%', 'pending', today);
insOffer.run(lot1Id, buyer2.lastInsertRowid, 203, 6, '5 days after pickup', today, 'Bags to be provided by farmer', 'pending', today);

// Transporters
const insTransporter = db.prepare('INSERT INTO transporters (name, vehicle, capacity_tonnes, base_cost, rating) VALUES (?, ?, ?, ?, ?)');
insTransporter.run('Transporter A', 'Mini Truck', 5, 4500, 4.7);
insTransporter.run('Transporter B', 'Tempo', 3, 3200, 4.3);
insTransporter.run('Transporter C', 'Large Truck', 10, 7800, 4.6);

// Storage
const insStorage = db.prepare('INSERT INTO storage_facilities (name, location, distance_km, capacity_tonnes, available_tonnes, price_per_kg_month, crop_suitability, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
insStorage.run('Cold Storage A', 'Guntur', 18, 500, 120, 1.8, 'Chilli, Tomato', 4.5);
insStorage.run('Warehouse B', 'Tenali', 25, 800, 340, 0.9, 'Paddy, Cotton', 4.2);
insStorage.run('AgriStore C', 'Vijayawada', 48, 300, 60, 1.5, 'Turmeric, Chilli', 4.0);

// Notifications
const insNotif = db.prepare('INSERT INTO notifications (user_role, message, created_at, read) VALUES (?, ?, ?, ?)');
insNotif.run('farmer', 'New buyer offer received on CHL-2026-001', today, 0);
insNotif.run('farmer', 'Your lot matched with 3 buyers', today, 0);
insNotif.run('farmer', 'New market price available for Chilli', today, 0);
insNotif.run('buyer', 'New lot available matching your requirement', today, 0);
insNotif.run('fpo', 'Bulk lot CHL-2026-004 created successfully', today, 0);

console.log('Seed complete.');
console.log('Farmer ID:', farmerId, 'FPO ID:', fpoId, 'Buyer IDs:', buyerIds);
