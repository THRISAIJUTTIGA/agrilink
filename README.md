# AgriLink — Smart Farmer Market & Buyer Platform

A working prototype market-intelligence and transaction-enablement platform connecting Indian smallholder farmers and FPOs with verified buyers.

## Problem statement

Farmers, especially smallholders and FPOs, often lack transparent information about current and expected crop prices, nearby markets, processors, institutional buyers, quality requirements, logistics, storage, payment reliability, and buyer credentials — leaving them at a disadvantage when selling produce.

## Solution

AgriLink gives farmers a single place to:
- Compare live prices across mandis, processors, institutional and digital buyers
- Get a simulated sale-window recommendation ("wait" vs "sell now")
- List produce as a graded, quality-scored lot
- Get matched against verified buyer requirements with a transparent, weighted match score
- Negotiate, accept offers, and track the full transaction lifecycle (offer → transport → delivery → payment)
- Book transport and storage, and raise/track grievances

Buyers get a searchable marketplace of verified lots and can post requirements, make offers, and track orders and payments. FPOs can aggregate member farmers' produce into bulk lots and track collective performance.

**This is a hackathon/demo prototype.** All prices, buyers, payments, and predictions use seeded, fictional data — not live government or market feeds.

## Features

- Three roles: Farmer, Buyer, FPO, each with a tailored dashboard
- Market intelligence with filterable price comparison table (best price highlighted)
- 7-day and 30-day price trend charts (Recharts) with a simulated sale-window recommendation and confidence score
- Produce-lot creation with auto-generated Lot ID (e.g. `CHL-2026-001`) and a live quality score (0–100) from moisture, damage %, size, color, foreign material
- Buyer-matching engine: weighted score = price 30% + quantity match 20% + quality match 20% + distance 10% + buyer reliability 20%
- Digital offers with accept / reject / counter-offer, which automatically creates a transaction on acceptance
- 7-stage transaction progress tracker (Offer Accepted → Order Confirmed → Transport Assigned → Picked Up → Delivered → Payment Processing → Payment Received)
- Transport booking and storage-facility browsing
- Payment tracking (simulated — no real payment gateway)
- Grievance/dispute system with a 4-stage resolution timeline
- FPO aggregation dashboard (farmers → total quantity → bulk lot)
- Notifications dropdown, verified-buyer badges, fully connected workflows (nothing is an isolated dummy screen)

## Architecture

```
agrilink/
├── client/                  React + Vite frontend
│   └── src/
│       ├── api/             fetch wrapper
│       ├── components/      shared UI (Card, Badge, Button, layout, chart)
│       ├── context/         mocked auth/session context
│       ├── layouts/         role-based sidebar app shell
│       └── pages/           farmer/, buyer/, fpo/ route screens
├── server/                  Express + SQLite backend
│   ├── database/            schema.sql, db.js, agrilink.db (generated)
│   ├── routes/              markets, lots, buyers, offers, misc (transactions/transport/storage/payments/grievances/notifications/auth)
│   └── seed/                seed.js — demo data generator
└── package.json             root convenience scripts
```

## Tech stack

React · Vite · Tailwind CSS · React Router · Recharts · Lucide React · Node.js · Express · SQLite (`better-sqlite3`)

## Database schema

`users, farmers, buyers, fpos, crops, markets, market_prices, price_history, lots, buyer_requirements, offers, transactions, transporters, transport_bookings, storage_facilities, payments, grievances, notifications`

## API documentation (selected)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/market-prices?crop&district` | Compare prices across markets |
| GET | `/api/insights?crop` | Simulated sale-window recommendation |
| GET | `/api/lots?crop&grade&location&status` | Browse/filter lots |
| POST | `/api/lots` | Create a lot (auto lot code + quality score) |
| GET | `/api/buyers/matches/:lotId` | Ranked buyer matches for a lot |
| POST | `/api/offers` | Buyer submits an offer |
| PATCH | `/api/offers/:id` | Accept / reject / counter — accepting auto-creates a transaction |
| GET/PATCH | `/api/transactions` | View/advance the transaction stage |
| POST | `/api/transport/book` | Book a transporter |
| GET | `/api/storage` | Nearby storage facilities |
| GET/PATCH | `/api/payments` | Track/update payment status |
| POST | `/api/grievances` | Raise a dispute |
| POST | `/api/auth/login` | Mocked login by role |

Full route definitions are in `server/routes/`.

## Setup instructions

Requires Node.js 18+.

```bash
# from the agrilink/ root
npm install            # installs concurrently, then run the line below once
npm run install:all    # installs server + client dependencies
npm run seed           # (re)seeds the SQLite database with demo data
npm run dev            # starts API (http://localhost:4000) and client (http://localhost:5173) together
```

Or run them separately:

```bash
npm run server   # http://localhost:4000
npm run client   # http://localhost:5173
```

## Demo credentials

Authentication is mocked. On the login page, pick a role and tap the matching "Login as…" button (no real password check):

- **Login as Farmer** → Ramesh Naidu, Guntur
- **Login as Buyer** → ABC Foods Pvt Ltd
- **Login as FPO** → Guntur Chilli Growers FPO

## Suggested demo flow

1. Log in as **Farmer** → view the dashboard, market snapshot, price trend and recommended buyers.
2. **Create Lot** → fill in quality fields and watch the live quality score, submit → note the generated Lot ID.
3. Log out, **Login as Buyer** → open the lot in the Marketplace, **Make Offer**.
4. Log out, **Login as Farmer** → open **Offers**, **Accept** the offer → a transaction is created.
5. Open **Transactions** to see the progress tracker; go to **Logistics** to book transport (advances the stage).
6. Check **Payments**, and try **Grievances** to raise and track a dispute.
7. Log in as **FPO** to see aggregated farmers and the bulk lot.

## Limitations

- All market prices, buyer profiles, and payments are seeded demo data, not live feeds.
- Sale-window predictions are a simple simulated heuristic, not a trained forecasting model.
- Authentication, payments, and verification are mocked — no real gateways, KYC, or identity checks.
- Image upload fields are UI-only in this prototype (no file storage backend).
- SQLite is used for simplicity; a production deployment would need a managed database and proper auth.

## Future / production roadmap

- Government mandi (e-NAM) API integration for real-time prices
- Weather and satellite crop-health data feeds
- Real payment gateway integration
- Aadhaar/eKYC and GST/business verification
- GPS-based route optimization for logistics
- AI-based quality/defect detection from lot photos
- Multilingual voice assistant for low-literacy users
- Blockchain-anchored transaction records for auditability
