import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, MapPin } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Card, StatCard, Badge, Loading, Button } from '../../components/ui';
import PriceTrendChart from '../../components/PriceTrendChart';

export default function FarmerDashboard() {
  const { session } = useAuth();
  const farmerId = session.profile.id;
  const [lots, setLots] = useState(null);
  const [offers, setOffers] = useState(null);
  const [payments, setPayments] = useState(null);
  const [prices, setPrices] = useState(null);
  const [crop, setCrop] = useState('Chilli');
  const [insights, setInsights] = useState(null);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    api.get(`/farmers/${farmerId}/lots`).then(setLots);
    api.get(`/offers?farmer_id=${farmerId}`).then(setOffers);
    api.get(`/payments?farmer_id=${farmerId}`).then(setPayments);
    api.get('/market-prices').then(setPrices);
  }, [farmerId]);

  useEffect(() => {
    api.get(`/insights?crop=${crop}`).then(setInsights);
  }, [crop]);

  useEffect(() => {
    if (lots && lots.length > 0) {
      api.get(`/buyers/matches/${lots[0].id}`).then(setMatches);
    }
  }, [lots]);

  if (!lots || !offers || !payments || !prices) return <Loading label="Loading your dashboard…" />;

  const activeLots = lots.filter(l => l.status === 'active').length;
  const bestPrice = prices.length ? Math.max(...prices.map(p => p.price)) : 0;
  const pendingOffers = offers.filter(o => o.status === 'pending').length;
  const pendingPayments = payments.filter(p => p.status !== 'paid').length;

  const marketSnapshot = ['Chilli', 'Paddy', 'Cotton'].map(c => {
    const best = prices.filter(p => p.crop_name === c).sort((a, b) => b.price - a.price)[0];
    return best;
  }).filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Farmer Dashboard</h1>
        <p className="text-soil-400 text-sm flex items-center gap-1 mt-1"><MapPin size={13} /> {session.profile.location}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Lots" value={activeLots} tone="field" />
        <StatCard label="Best Current Price" value={`₹${bestPrice}`} sub="across all markets" tone="harvest" />
        <StatCard label="Pending Offers" value={pendingOffers} tone="sky" />
        <StatCard label="Pending Payments" value={pendingPayments} tone="rust" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="font-display text-lg">Market Snapshot</p>
            <Link to="/farmer/markets" className="text-xs text-field-600 font-medium">View all markets →</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-soil-400 uppercase tracking-wide">
                <th className="pb-2 font-medium">Crop</th>
                <th className="pb-2 font-medium">Market</th>
                <th className="pb-2 font-medium">Price</th>
                <th className="pb-2 font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {marketSnapshot.map((p, i) => (
                <tr key={i} className="border-t border-soil-50">
                  <td className="py-2.5 font-medium">{p.crop_name}</td>
                  <td className="py-2.5 text-soil-400">{p.market_name}</td>
                  <td className="py-2.5 font-mono">₹{p.price}/{p.unit}</td>
                  <td className={`py-2.5 flex items-center gap-1 ${p.change_pct >= 0 ? 'text-field-600' : 'text-rust-500'}`}>
                    {p.change_pct >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {p.change_pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <p className="font-display text-lg mb-3">Recommended Buyers</p>
          <div className="space-y-3">
            {matches.slice(0, 3).map(m => (
              <div key={m.buyer_id} className="flex items-center justify-between border-b border-soil-50 pb-2 last:border-0">
                <div>
                  <p className="text-sm font-medium">{m.company_name}</p>
                  <p className="text-xs text-soil-400">₹{m.offered_price} · {m.distance_km} km</p>
                </div>
                <Badge tone="success">{m.match_score}% match</Badge>
              </div>
            ))}
            {matches.length === 0 && <p className="text-sm text-soil-400">Create a lot to see matched buyers.</p>}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="font-display text-lg">Price Trend</p>
            <select value={crop} onChange={(e) => setCrop(e.target.value)} className="text-sm border border-soil-100 rounded-card px-2 py-1">
              {['Chilli', 'Paddy', 'Cotton', 'Tomato', 'Turmeric'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          {insights && <PriceTrendChart data={insights.history_7d} unit={insights.unit} />}
        </Card>

        <Card>
          <p className="font-display text-lg mb-1">🌾 Recommended Sale Window</p>
          {insights && (
            <div className="mt-3 space-y-2 text-sm">
              <p className="text-soil-400">Current average</p>
              <p className="font-mono text-lg">₹{insights.current_price}/{insights.unit}</p>
              <p className="text-soil-400 mt-2">Expected price</p>
              <p className="font-mono">₹{insights.expected_range.low}–₹{insights.expected_range.high}/{insights.unit}</p>
              <div className="mt-3">
                <Badge tone={insights.recommendation.includes('WAIT') ? 'warning' : 'success'}>{insights.recommendation}</Badge>
              </div>
              <p className="text-xs text-soil-400 mt-2">Confidence: {insights.confidence}%</p>
              <p className="text-[11px] text-soil-400 mt-3 italic">Prototype/mock intelligence — not a guaranteed prediction.</p>
            </div>
          )}
        </Card>
      </div>

      <div className="flex justify-end">
        <Link to="/farmer/create-lot"><Button>+ Create New Lot</Button></Link>
      </div>
    </div>
  );
}
