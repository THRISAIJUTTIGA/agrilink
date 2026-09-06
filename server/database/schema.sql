-- AgriLink demo schema
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('farmer','buyer','fpo')),
  location TEXT,
  ref_id INTEGER
);

CREATE TABLE IF NOT EXISTS farmers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  name TEXT NOT NULL,
  location TEXT,
  fpo_id INTEGER
);

CREATE TABLE IF NOT EXISTS buyers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  company_name TEXT NOT NULL,
  business_type TEXT,
  verified INTEGER DEFAULT 1,
  years_active INTEGER,
  previous_transactions INTEGER,
  payment_reliability INTEGER,
  rating REAL,
  location TEXT
);

CREATE TABLE IF NOT EXISTS fpos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  name TEXT NOT NULL,
  location TEXT
);

CREATE TABLE IF NOT EXISTS crops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  unit TEXT DEFAULT 'kg'
);

CREATE TABLE IF NOT EXISTS markets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  district TEXT,
  type TEXT DEFAULT 'mandi'
);

CREATE TABLE IF NOT EXISTS market_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  crop_id INTEGER,
  market_id INTEGER,
  price REAL,
  change_pct REAL,
  distance_km REAL,
  date TEXT,
  source_type TEXT DEFAULT 'mandi'
);

CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  crop_id INTEGER,
  date TEXT,
  price REAL
);

CREATE TABLE IF NOT EXISTS lots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lot_code TEXT UNIQUE,
  farmer_id INTEGER,
  fpo_id INTEGER,
  crop_id INTEGER,
  variety TEXT,
  quantity REAL,
  unit TEXT,
  location TEXT,
  harvest_date TEXT,
  expected_price REAL,
  quality_grade TEXT,
  moisture REAL,
  damage_pct REAL,
  size TEXT,
  color TEXT,
  foreign_material REAL,
  quality_score INTEGER,
  description TEXT,
  image TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS buyer_requirements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  buyer_id INTEGER,
  crop_id INTEGER,
  quantity REAL,
  grade TEXT,
  max_price REAL,
  location TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS offers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lot_id INTEGER,
  buyer_id INTEGER,
  price REAL,
  quantity REAL,
  payment_terms TEXT,
  pickup_date TEXT,
  conditions TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  txn_code TEXT UNIQUE,
  offer_id INTEGER,
  lot_id INTEGER,
  buyer_id INTEGER,
  farmer_id INTEGER,
  amount REAL,
  stage TEXT DEFAULT 'offer_accepted',
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS transporters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  vehicle TEXT,
  capacity_tonnes REAL,
  base_cost REAL,
  rating REAL
);

CREATE TABLE IF NOT EXISTS transport_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER,
  transporter_id INTEGER,
  distance_km REAL,
  cost REAL,
  status TEXT DEFAULT 'scheduled',
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS storage_facilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  location TEXT,
  distance_km REAL,
  capacity_tonnes REAL,
  available_tonnes REAL,
  price_per_kg_month REAL,
  crop_suitability TEXT,
  rating REAL
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER,
  amount REAL,
  status TEXT DEFAULT 'pending',
  date TEXT
);

CREATE TABLE IF NOT EXISTS grievances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER,
  farmer_id INTEGER,
  issue_type TEXT,
  description TEXT,
  priority TEXT,
  stage TEXT DEFAULT 'submitted',
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_role TEXT,
  message TEXT,
  created_at TEXT,
  read INTEGER DEFAULT 0
);
