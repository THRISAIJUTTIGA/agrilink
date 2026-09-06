import { useEffect, useState } from 'react';
import { ShieldCheck, MapPin } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button, Loading, EmptyState } from '../../components/ui';

export default function BuyerLots() {
  const { session } = useAuth();
  const [lots, setLots] = useState(null);
  const [crops, setCrops] = useState([]);
  const [filters, setFilters] = useState({ crop: '', grade: '', location: '' });
  const [activeLot, setActiveLot] = useState(null);
  const [offerForm, setOfferForm] = useState({ price: '', quantity: '', payment_terms: '3 days after pickup', pickup_date: new Date().toISOString().slice(0, 10), conditions: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { api.get('/crops').then(setCrops); }, []);

  const load = () => {
    const params = new URLSearchParams({ status: 'active' });
    if (filters.crop) params.set('crop', filters.crop);
    if (filters.grade) params.set('grade', filters.grade);
    if (filters.location) params.set('location', filters.location);
    api.get(`/lots?${params.toString()}`).then(setLots);
  };
  useEffect(load, [filters]);

  const openOffer = (lot) => {
    setActiveLot(lot);
    setSubmitted(false);
    setOfferForm({ price: lot.expected_price, quantity: lot.quantity, payment_terms: '3 days after pickup', pickup_date: new Date().toISOString().slice(0, 10), conditions: '' });
  };

  const submitOffer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/offers', { ...offerForm, lot_id: activeLot.id, buyer_id: session.profile.id });
      setSubmitted(true);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  if (!lots) return <Loading label="Loading marketplace…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Marketplace</h1>
        <p className="text-soil-400 text-sm mt-1">Browse verified farmer and FPO lots available for purchase.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select className="input w-auto" value={filters.crop} onChange={(e) => setFilters(f => ({ ...f, crop: e.target.value }))}>
          <option value="">All crops</option>
          {crops.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select className="input w-auto" value={filters.grade} onChange={(e) => setFilters(f => ({ ...f, grade: e.target.value }))}>
          <option value="">All grades</option>
          <option>A</option><option>B</option><option>C</option>
        </select>
        <input className="input w-auto" placeholder="Location" value={filters.location} onChange={(e) => setFilters(f => ({ ...f, location: e.target.value }))} />
      </div>

      {lots.length === 0 && <EmptyState title="No lots match your filters" message="Try widening your search." />}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lots.map(lot => (
          <Card key={lot.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs text-soil-400">{lot.lot_code}</p>
                <p className="font-display text-lg">{lot.crop_name} {lot.variety && `— ${lot.variety}`}</p>
              </div>
              <Badge tone="success">Grade {lot.quality_grade}</Badge>
            </div>
            <div className="text-sm text-soil-500 mt-2 space-y-1">
              <p>{lot.quantity} {lot.unit} · Moisture {lot.moisture}%</p>
              <p className="flex items-center gap-1"><MapPin size={13} />{lot.location}</p>
              <p className="font-mono text-soil-800 font-medium">₹{lot.expected_price}/{lot.crop_unit}</p>
              <p className="text-xs text-soil-400">{lot.farmer_name || lot.fpo_name}</p>
              <p className="flex items-center gap-1 text-xs text-field-600"><ShieldCheck size={13} /> Verified Seller</p>
            </div>
            <Button className="w-full mt-3" onClick={() => openOffer(lot)}>Make Offer</Button>
          </Card>
        ))}
      </div>

      {activeLot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-4" onClick={() => setActiveLot(null)}>
          <div className="bg-white rounded-card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            {submitted ? (
              <div className="text-center py-6">
                <p className="font-display text-xl text-field-600">Offer Submitted ✓</p>
                <p className="text-sm text-soil-400 mt-2">The farmer will be notified and can accept, reject or counter.</p>
                <Button className="mt-4" onClick={() => setActiveLot(null)}>Close</Button>
              </div>
            ) : (
              <>
                <p className="font-display text-lg mb-4">Make Offer — {activeLot.lot_code}</p>
                <form onSubmit={submitOffer} className="space-y-3">
                  <label className="block">
                    <span className="text-xs font-medium text-soil-600 uppercase tracking-wide">Price / {activeLot.crop_unit}</span>
                    <input type="number" className="input mt-1" value={offerForm.price} onChange={(e) => setOfferForm(f => ({ ...f, price: e.target.value }))} required />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-soil-600 uppercase tracking-wide">Quantity</span>
                    <input type="number" className="input mt-1" value={offerForm.quantity} onChange={(e) => setOfferForm(f => ({ ...f, quantity: e.target.value }))} required />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-soil-600 uppercase tracking-wide">Payment terms</span>
                    <input className="input mt-1" value={offerForm.payment_terms} onChange={(e) => setOfferForm(f => ({ ...f, payment_terms: e.target.value }))} />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-soil-600 uppercase tracking-wide">Pickup date</span>
                    <input type="date" className="input mt-1" value={offerForm.pickup_date} onChange={(e) => setOfferForm(f => ({ ...f, pickup_date: e.target.value }))} />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-soil-600 uppercase tracking-wide">Additional conditions</span>
                    <textarea className="input mt-1" rows={2} value={offerForm.conditions} onChange={(e) => setOfferForm(f => ({ ...f, conditions: e.target.value }))} />
                  </label>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="secondary" onClick={() => setActiveLot(null)}>Cancel</Button>
                    <Button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Offer'}</Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
