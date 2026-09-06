import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Card, Loading, EmptyState, Badge } from '../../components/ui';

const STAGE_LABELS = {
  offer_accepted: 'Offer Accepted',
  order_confirmed: 'Order Confirmed',
  transport_assigned: 'Transport Assigned',
  picked_up: 'Picked Up',
  delivered: 'Delivered',
  payment_processing: 'Payment Processing',
  payment_received: 'Payment Received',
};

function ProgressTracker({ stages, currentIndex }) {
  return (
    <div className="flex items-center overflow-x-auto py-2">
      {stages.map((s, i) => (
        <div key={s} className="flex items-center flex-shrink-0">
          <div className="flex flex-col items-center gap-1 w-24">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
              i <= currentIndex ? 'bg-field-600 text-white' : 'bg-soil-100 text-soil-400'
            }`}>
              {i < currentIndex ? <Check size={14} /> : i + 1}
            </div>
            <p className={`text-[10px] text-center leading-tight ${i <= currentIndex ? 'text-soil-800' : 'text-soil-400'}`}>
              {STAGE_LABELS[s]}
            </p>
          </div>
          {i < stages.length - 1 && (
            <div className={`h-0.5 w-8 -mt-4 ${i < currentIndex ? 'bg-field-600' : 'bg-soil-100'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Transactions() {
  const { session } = useAuth();
  const [txns, setTxns] = useState(null);

  useEffect(() => { api.get(`/transactions?farmer_id=${session.profile.id}`).then(setTxns); }, []);

  if (!txns) return <Loading label="Loading transactions…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Transactions</h1>
        <p className="text-soil-400 text-sm mt-1">Follow each sale from accepted offer through to payment.</p>
      </div>

      {txns.length === 0 && <EmptyState title="No transactions yet" message="Accept a buyer offer to start a transaction." />}

      <div className="space-y-4">
        {txns.map(t => (
          <Card key={t.id}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-medium font-mono">{t.txn_code}</p>
                <p className="text-xs text-soil-400">{t.crop_name} · Lot {t.lot_code} · {t.buyer_name}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-lg">₹{t.amount.toLocaleString('en-IN')}</p>
                <Badge tone={t.stage === 'payment_received' ? 'success' : 'info'}>{STAGE_LABELS[t.stage]}</Badge>
              </div>
            </div>
            <div className="mt-4">
              <ProgressTracker stages={t.stages} currentIndex={t.stage_index} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
