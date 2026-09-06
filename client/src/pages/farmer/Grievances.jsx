import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Badge, Loading } from '../../components/ui';

const ISSUE_TYPES = ['Payment Delay', 'Quality Dispute', 'Quantity Dispute', 'Delivery Issue', 'Buyer Issue', 'Other'];
const STAGES = ['submitted', 'under_review', 'buyer_response', 'resolution'];
const STAGE_LABELS = { submitted: 'Complaint Submitted', under_review: 'Under Review', buyer_response: 'Buyer Response', resolution: 'Resolution' };

export default function Grievances() {
  const { session } = useAuth();
  const [list, setList] = useState(null);
  const [txns, setTxns] = useState([]);
  const [form, setForm] = useState({ transaction_id: '', issue_type: ISSUE_TYPES[0], description: '', priority: 'Medium' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get(`/grievances?farmer_id=${session.profile.id}`).then(setList);
  useEffect(() => {
    load();
    api.get(`/transactions?farmer_id=${session.profile.id}`).then(setTxns);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/grievances', { ...form, farmer_id: session.profile.id, transaction_id: form.transaction_id || null });
      setForm({ transaction_id: '', issue_type: ISSUE_TYPES[0], description: '', priority: 'Medium' });
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Grievances</h1>
        <p className="text-soil-400 text-sm mt-1">Raise a complaint about a transaction and track its resolution.</p>
      </div>

      <Card>
        <p className="font-display text-lg mb-4">Submit a grievance</p>
        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-medium text-soil-600 uppercase tracking-wide">Transaction</span>
            <select className="input mt-1" value={form.transaction_id} onChange={(e) => setForm(f => ({ ...f, transaction_id: e.target.value }))}>
              <option value="">General / not linked</option>
              {txns.map(t => <option key={t.id} value={t.id}>{t.txn_code} — {t.buyer_name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-soil-600 uppercase tracking-wide">Issue type</span>
            <select className="input mt-1" value={form.issue_type} onChange={(e) => setForm(f => ({ ...f, issue_type: e.target.value }))}>
              {ISSUE_TYPES.map(i => <option key={i}>{i}</option>)}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-soil-600 uppercase tracking-wide">Description</span>
            <textarea className="input mt-1" rows={3} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} required />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-soil-600 uppercase tracking-wide">Priority</span>
            <select className="input mt-1" value={form.priority} onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-soil-600 uppercase tracking-wide">Evidence / image</span>
            <input type="file" className="input mt-1" />
          </label>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Grievance'}</Button>
          </div>
        </form>
      </Card>

      {!list ? <Loading /> : (
        <div className="space-y-4">
          {list.map(g => {
            const idx = STAGES.indexOf(g.stage);
            return (
              <Card key={g.id}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-medium">{g.issue_type}</p>
                    <p className="text-xs text-soil-400">{g.txn_code || 'General complaint'} · {g.created_at}</p>
                  </div>
                  <Badge tone={g.priority === 'High' ? 'danger' : g.priority === 'Medium' ? 'warning' : 'neutral'}>{g.priority} priority</Badge>
                </div>
                <p className="text-sm text-soil-600 mt-2">{g.description}</p>
                <div className="flex items-center mt-4 overflow-x-auto">
                  {STAGES.map((s, i) => (
                    <div key={s} className="flex items-center flex-shrink-0">
                      <div className="flex flex-col items-center gap-1 w-24">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${i <= idx ? 'bg-field-600 text-white' : 'bg-soil-100 text-soil-400'}`}>
                          {i < idx ? <Check size={12} /> : i + 1}
                        </div>
                        <p className="text-[10px] text-center leading-tight text-soil-500">{STAGE_LABELS[s]}</p>
                      </div>
                      {i < STAGES.length - 1 && <div className={`h-0.5 w-6 -mt-4 ${i < idx ? 'bg-field-600' : 'bg-soil-100'}`} />}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
