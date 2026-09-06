import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Loading, EmptyState } from '../../components/ui';

const STATUS_TONE = { pending: 'warning', processing: 'info', paid: 'success', failed: 'danger' };

export default function Payments() {
  const { session } = useAuth();
  const [payments, setPayments] = useState(null);

  useEffect(() => { api.get(`/payments?farmer_id=${session.profile.id}`).then(setPayments); }, []);

  if (!payments) return <Loading label="Loading payments…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Payment Tracking</h1>
        <p className="text-soil-400 text-sm mt-1">Payments are simulated for this prototype — no real payment gateway is used.</p>
      </div>

      {payments.length === 0 && <EmptyState title="No payments yet" message="Payments appear once a transaction is created." />}

      <div className="space-y-3">
        {payments.map(p => (
          <Card key={p.id} className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-medium font-mono">{p.txn_code}</p>
              <p className="text-xs text-soil-400">{p.buyer_name} · {p.date}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-lg">₹{p.amount.toLocaleString('en-IN')}</p>
              <Badge tone={STATUS_TONE[p.status]}>{p.status === 'paid' ? 'PAID ✓' : p.status.toUpperCase()}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
