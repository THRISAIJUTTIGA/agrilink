import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Card, Loading, Badge } from '../../components/ui';
import PriceTrendChart from '../../components/PriceTrendChart';

export default function Insights() {
  const [crop, setCrop] = useState('Chilli');
  const [data, setData] = useState(null);

  useEffect(() => { setData(null); api.get(`/insights?crop=${crop}`).then(setData); }, [crop]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl">Price Trend & Sale-Window</h1>
          <p className="text-soil-400 text-sm mt-1">Simulated intelligence to help decide when to sell.</p>
        </div>
        <select value={crop} onChange={(e) => setCrop(e.target.value)} className="text-sm border border-soil-100 rounded-card px-3 py-2">
          {['Chilli', 'Paddy', 'Cotton', 'Tomato', 'Turmeric'].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {!data ? <Loading /> : (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <p className="text-xs uppercase text-soil-400 tracking-wide">Current Price</p>
              <p className="font-display text-2xl mt-1">₹{data.current_price}/{data.unit}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase text-soil-400 tracking-wide">7 Day Change</p>
              <p className={`font-display text-2xl mt-1 ${data.change_7d_pct >= 0 ? 'text-field-600' : 'text-rust-500'}`}>
                {data.change_7d_pct >= 0 ? '+' : ''}{data.change_7d_pct}%
              </p>
            </Card>
            <Card>
              <p className="text-xs uppercase text-soil-400 tracking-wide">Expected Range</p>
              <p className="font-display text-2xl mt-1">₹{data.expected_range.low}–{data.expected_range.high}</p>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <p className="font-display text-lg mb-3">7-Day Trend</p>
              <PriceTrendChart data={data.history_7d} unit={data.unit} />
            </Card>
            <Card>
              <p className="font-display text-lg mb-2">Recommendation</p>
              <Badge tone={data.recommendation.includes('WAIT') ? 'warning' : 'success'}>{data.recommendation}</Badge>
              <p className="text-sm text-soil-600 mt-3">{data.reason}</p>
              <p className="text-xs text-soil-400 mt-3">Confidence: {data.confidence}%</p>
              <p className="text-[11px] text-soil-400 mt-4 italic">{data.disclaimer}</p>
            </Card>
          </div>

          <Card>
            <p className="font-display text-lg mb-3">30-Day Trend</p>
            <PriceTrendChart data={data.history_30d} unit={data.unit} />
          </Card>
        </>
      )}
    </div>
  );
}
