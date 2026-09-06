import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Card, StatCard, Loading, Badge } from '../../components/ui';

export default function FpoDashboard() {
  const { session } = useAuth();
  const fpoId = session.profile.id;
  const [summary, setSummary] = useState(null);
  const [lots, setLots] = useState(null);

  useEffect(() => {
    api.get(`/fpos/${fpoId}/summary`).then(setSummary);
    api.get(`/fpos/${fpoId}/lots`).then(setLots);
  }, []);

  if (!summary || !lots) return <Loading label="Loading FPO dashboard…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">FPO Dashboard</h1>
        <p className="text-soil-400 text-sm mt-1">{summary.fpo.name} · {summary.fpo.location}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Farmers" value={summary.farmer_count} tone="field" />
        <StatCard label="Total Aggregated Qty" value={`${summary.total_quantity} t`} tone="harvest" />
        <StatCard label="Active Lots" value={summary.active_lots} tone="sky" />
        <StatCard label="Avg Price" value={`₹${summary.average_price}`} tone="field" />
        <StatCard label="Pending Offers" value={summary.pending_offers} tone="warning" />
        <StatCard label="Total Transaction Value" value={`₹${summary.total_transaction_value.toLocaleString('en-IN')}`} tone="rust" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <p className="font-display text-lg mb-4">Associated Farmers</p>
          <div className="space-y-2 text-sm">
            {summary.farmers.map(f => (
              <div key={f.id} className="flex items-center justify-between border-b border-soil-50 pb-2 last:border-0">
                <p>{f.name}</p>
                <p className="text-soil-400">{f.location}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="font-display text-lg mb-4">Bulk Lots</p>
          <div className="space-y-2 text-sm">
            {lots.map(l => (
              <div key={l.id} className="flex items-center justify-between border-b border-soil-50 pb-2 last:border-0">
                <div>
                  <p className="font-mono text-xs text-soil-400">{l.lot_code}</p>
                  <p className="font-medium">{l.crop_name} — {l.quantity} {l.unit}</p>
                </div>
                <Badge tone={l.status === 'active' ? 'success' : 'neutral'}>{l.status}</Badge>
              </div>
            ))}
            {lots.length === 0 && <p className="text-soil-400">No bulk lots created yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
