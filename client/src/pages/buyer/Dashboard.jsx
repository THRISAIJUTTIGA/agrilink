import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Card, StatCard, Badge, Loading, Button } from '../../components/ui';

export default function BuyerDashboard() {
  const { session } = useAuth();
  const buyerId = session.profile.id;
  const [reqs, setReqs] = useState(null);
  const [lots, setLots] = useState(null);
  const [offers, setOffers] = useState(null);
  const [txns, setTxns] = useState(null);
  const [form, setForm] = useState({ crop: 'Chilli', quantity: '', grade: 'A', max_price: '', location: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api.get(`/buyers/${buyerId}/requirements`).then(setReqs);
    api.get('/lots?status=active').then(setLots);
    api.get(`/offers?buyer_id=${buyerId}`).then(setOffers);
    api.get(`/transactions?buyer_id=${buyerId}`).then(setTxns);
  };
  useEffect(load, []);

  const submitReq = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/buyer-requirements', { ...form, buyer_id: buyerId });
      setForm({ crop: 'Chilli', quantity: '', grade: 'A', max_price: '', location: '' });
      load();
    } finally {
      setSubmitting(false);
    }
  };

  if (!reqs || !lots || !offers || !txns) return <Loading label="Loading your dashboard…" />;

  const pendingDeliveries = txns.filter(t => !['payment_received'].includes(t.stage)).length;
  const paymentObligations = txns.filter(t => t.stage !== 'payment_received').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Buyer Dashboard</h1>
        <p className="text-soil-400 text-sm mt-1">{session.profile.company_name} · {session.profile.business_type}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Requirements" value={reqs.length} tone="sky" />
        <StatCard label="Available Lots" value={lots.length} tone="field" />
        <StatCard label="Offers Sent" value={offers.length} tone="harvest" />
        <StatCard label="Pending Deliveries" value={pendingDeliveries} tone="rust" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <p className="font-display text-lg mb-4">Create Buyer Requirement</p>
          <form onSubmit={submitReq} className="grid grid-cols-2 gap-3">
            <select className="input col-span-2" value={form.crop} onChange={(e) => setForm(f => ({ ...f, crop: e.target.value }))}>
              {['Chilli', 'Paddy', 'Cotton', 'Tomato', 'Turmeric'].map(c => <option key={c}>{c}</option>)}
            </select>
            <input className="input" type="number" placeholder="Quantity (tonnes)" value={form.quantity} onChange={(e) => setForm(f => ({ ...f, quantity: e.target.value }))} required />
            <select className="input" value={form.grade} onChange={(e) => setForm(f => ({ ...f, grade: e.target.value }))}>
              <option>A</option><option>B</option><option>C</option>
            </select>
            <input className="input" type="number" placeholder="Maximum price" value={form.max_price} onChange={(e) => setForm(f => ({ ...f, max_price: e.target.value }))} required />
            <input className="input" placeholder="Location" value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} />
            <Button type="submit" className="col-span-2" disabled={submitting}>{submitting ? 'Saving…' : 'Save Requirement'}</Button>
          </form>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="font-display text-lg">Your Requirements</p>
            <Link to="/buyer/lots" className="text-xs text-field-600 font-medium">Browse marketplace →</Link>
          </div>
          <div className="space-y-3">
            {reqs.map(r => (
              <div key={r.id} className="flex items-center justify-between border-b border-soil-50 pb-2 last:border-0 text-sm">
                <div>
                  <p className="font-medium">{r.crop_name} — {r.quantity} tonnes</p>
                  <p className="text-xs text-soil-400">Grade {r.grade} · max ₹{r.max_price} · {r.location}</p>
                </div>
              </div>
            ))}
            {reqs.length === 0 && <p className="text-sm text-soil-400">No requirements yet.</p>}
          </div>
        </Card>
      </div>

      <Card>
        <p className="font-display text-lg mb-3">Payment Obligations</p>
        <p className="font-display text-2xl text-rust-500">₹{paymentObligations.toLocaleString('en-IN')}</p>
        <p className="text-xs text-soil-400 mt-1">Total amount pending across {pendingDeliveries} in-progress transactions.</p>
      </Card>
    </div>
  );
}
