import { useEffect, useState } from 'react';
import { Truck, Warehouse, Star } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Badge, Loading } from '../../components/ui';

export default function Logistics() {
  const { session } = useAuth();
  const [tab, setTab] = useState('transport');
  const [transporters, setTransporters] = useState(null);
  const [storage, setStorage] = useState(null);
  const [txns, setTxns] = useState([]);
  const [booked, setBooked] = useState({});

  useEffect(() => {
    api.get('/transport').then(setTransporters);
    api.get('/storage').then(setStorage);
    api.get(`/transactions?farmer_id=${session.profile.id}`).then(setTxns);
  }, []);

  const book = async (transporterId) => {
    const txn = txns.find(t => t.stage === 'offer_accepted' || t.stage === 'order_confirmed') || txns[0];
    const res = await api.post('/transport/book', {
      transaction_id: txn?.id || null,
      transporter_id: transporterId,
      distance_km: 42,
    });
    setBooked(b => ({ ...b, [transporterId]: res }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Logistics & Storage</h1>
        <p className="text-soil-400 text-sm mt-1">Book transport for pickup or reserve storage while you wait for a better price.</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('transport')} className={`px-4 py-2 rounded-card text-sm font-medium ${tab === 'transport' ? 'bg-field-600 text-white' : 'bg-white border border-soil-100'}`}>
          <Truck size={14} className="inline mr-1.5 -mt-0.5" />Transport
        </button>
        <button onClick={() => setTab('storage')} className={`px-4 py-2 rounded-card text-sm font-medium ${tab === 'storage' ? 'bg-field-600 text-white' : 'bg-white border border-soil-100'}`}>
          <Warehouse size={14} className="inline mr-1.5 -mt-0.5" />Storage
        </button>
      </div>

      {tab === 'transport' && (
        !transporters ? <Loading /> : (
          <div className="grid md:grid-cols-3 gap-4">
            {transporters.map(t => (
              <Card key={t.id}>
                <p className="font-medium">{t.name}</p>
                <div className="text-sm text-soil-500 mt-2 space-y-1">
                  <p>Distance: 42 km</p>
                  <p>Vehicle: {t.vehicle}</p>
                  <p>Capacity: {t.capacity_tonnes} tonnes</p>
                  <p>Estimated Cost: ₹{Math.round(t.base_cost + 42 * 15).toLocaleString('en-IN')}</p>
                  <p className="flex items-center gap-1"><Star size={13} className="text-harvest-500 fill-harvest-500" /> {t.rating}</p>
                </div>
                {booked[t.id] ? (
                  <div className="mt-3">
                    <Badge tone="success">Transport Confirmed ✓</Badge>
                    <p className="text-xs text-soil-400 mt-2">Pickup: Farm → Destination: Buyer Warehouse</p>
                    <p className="text-xs text-soil-400">Status: Scheduled</p>
                  </div>
                ) : (
                  <Button className="mt-3 w-full" onClick={() => book(t.id)}>Book Transport</Button>
                )}
              </Card>
            ))}
          </div>
        )
      )}

      {tab === 'storage' && (
        !storage ? <Loading /> : (
          <div className="grid md:grid-cols-3 gap-4">
            {storage.map(s => (
              <Card key={s.id}>
                <p className="font-medium">{s.name}</p>
                <div className="text-sm text-soil-500 mt-2 space-y-1">
                  <p>Available: {s.available_tonnes} tonnes</p>
                  <p>Cost: ₹{s.price_per_kg_month}/kg/month</p>
                  <p>Distance: {s.distance_km} km</p>
                  <p>Suitable for: {s.crop_suitability}</p>
                  <p className="flex items-center gap-1"><Star size={13} className="text-harvest-500 fill-harvest-500" /> {s.rating}</p>
                </div>
                <Button variant="secondary" className="mt-3 w-full">Reserve Space</Button>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}
