import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Card, Loading, Badge } from '../../components/ui';

export default function Markets() {
  const [prices, setPrices] = useState(null);
  const [crops, setCrops] = useState([]);
  const [crop, setCrop] = useState('');
  const [district, setDistrict] = useState('');

  useEffect(() => { api.get('/crops').then(setCrops); }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (crop) params.set('crop', crop);
    if (district) params.set('district', district);
    api.get(`/market-prices?${params.toString()}`).then(setPrices);
  }, [crop, district]);

  if (!prices) return <Loading label="Loading market prices…" />;

  const best = prices.length ? Math.max(...prices.map(p => p.price)) : null;
  const districts = [...new Set(prices.map(p => p.district))];

  const typeLabel = { mandi: 'Mandi', processor: 'Processor', institutional: 'Institutional Buyer', digital: 'Digital Buyer' };
  const typeTone = { mandi: 'neutral', processor: 'info', institutional: 'success', digital: 'warning' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Market Intelligence</h1>
        <p className="text-soil-400 text-sm mt-1">Compare mandi, processor, institutional and digital buyer prices across nearby markets.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={crop} onChange={(e) => setCrop(e.target.value)} className="text-sm border border-soil-100 rounded-card px-3 py-2">
          <option value="">All crops</option>
          {crops.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select value={district} onChange={(e) => setDistrict(e.target.value)} className="text-sm border border-soil-100 rounded-card px-3 py-2">
          <option value="">All districts</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-soil-400 uppercase tracking-wide">
              <th className="pb-2 font-medium">Crop</th>
              <th className="pb-2 font-medium">Market</th>
              <th className="pb-2 font-medium">Type</th>
              <th className="pb-2 font-medium">Price</th>
              <th className="pb-2 font-medium">Distance</th>
            </tr>
          </thead>
          <tbody>
            {prices.map(p => (
              <tr key={p.id} className={`border-t border-soil-50 ${p.price === best ? 'bg-field-50' : ''}`}>
                <td className="py-2.5 font-medium">{p.crop_name}</td>
                <td className="py-2.5">{p.market_name}</td>
                <td className="py-2.5"><Badge tone={typeTone[p.market_type]}>{typeLabel[p.market_type]}</Badge></td>
                <td className="py-2.5 font-mono">
                  ₹{p.price}/{p.unit}
                  {p.price === best && <span className="ml-2 text-[10px] text-field-600 font-semibold uppercase">Best price</span>}
                </td>
                <td className="py-2.5 text-soil-400">{p.distance_km} km</td>
              </tr>
            ))}
            {prices.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-soil-400">No prices match this filter.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
      <p className="text-xs text-soil-400 italic">Prices shown are seeded demo values for prototype purposes, not live government or market data.</p>
    </div>
  );
}
