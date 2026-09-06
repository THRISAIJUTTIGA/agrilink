import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button, Loading, EmptyState } from '../../components/ui';

const STATUS_TONE = { pending: 'warning', accepted: 'success', rejected: 'danger', countered: 'info' };

export default function Offers() {
  const { session } = useAuth();
  const [offers, setOffers] = useState(null);
  const [counterId, setCounterId] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [busy, setBusy] = useState(null);

  const load = () => api.get(`/offers?farmer_id=${session.profile.id}`).then(setOffers);
  useEffect(() => { load(); }, []);

  const act = async (id, status, extra = {}) => {
    setBusy(id);
    try {
      await api.patch(`/offers/${id}`, { status, ...extra });
      await load();
      setCounterId(null);
    } finally {
      setBusy(null);
    }
  };

  if (!offers) return <Loading label="Loading offers…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Digital Offers</h1>
        <p className="text-soil-400 text-sm mt-1">Review, accept, reject or counter buyer offers on your lots.</p>
      </div>

      {offers.length === 0 && <EmptyState title="No offers yet" message="Offers from buyers on your active lots will appear here." />}

      <div className="grid md:grid-cols-2 gap-4">
        {offers.map(o => (
          <Card key={o.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{o.buyer_name}</p>
                <p className="text-xs text-soil-400">{o.crop_name} · Lot {o.lot_code}</p>
              </div>
              <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
              <p><span className="text-soil-400">Quantity:</span> {o.quantity} tonnes</p>
              <p><span className="text-soil-400">Offer:</span> ₹{o.price}/kg</p>
              <p className="col-span-2"><span className="text-soil-400">Payment terms:</span> {o.payment_terms}</p>
            </div>
            {o.status === 'pending' && (
              <div className="flex gap-2 mt-4">
                <Button onClick={() => act(o.id, 'accepted')} disabled={busy === o.id}>Accept</Button>
                <Button variant="secondary" onClick={() => act(o.id, 'rejected')} disabled={busy === o.id}>Reject</Button>
                <Button variant="ghost" onClick={() => setCounterId(counterId === o.id ? null : o.id)}>Counter Offer</Button>
              </div>
            )}
            {counterId === o.id && (
              <div className="flex gap-2 mt-3">
                <input
                  type="number"
                  placeholder="Your price"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  className="input"
                />
                <Button onClick={() => act(o.id, 'countered', { counter_price: counterPrice })}>Send</Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
