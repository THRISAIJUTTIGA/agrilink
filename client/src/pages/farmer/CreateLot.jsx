import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Badge } from '../../components/ui';

const CROPS = ['Chilli', 'Paddy', 'Cotton', 'Tomato', 'Turmeric'];

export default function CreateLot() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    crop: 'Chilli', variety: '', quantity: '', unit: 'tonnes', location: session.profile.location || '',
    harvest_date: new Date().toISOString().slice(0, 10), expected_price: '', quality_grade: 'A',
    moisture: '', damage_pct: '', size: 'Premium', color: 'Good', foreign_material: '', description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const previewScore = () => {
    let score = 100;
    score -= Math.max(0, (Number(form.moisture) || 0) - 10) * 2;
    score -= (Number(form.damage_pct) || 0) * 3;
    score -= (Number(form.foreign_material) || 0) * 4;
    if (form.size === 'Medium') score -= 5; else if (form.size === 'Small') score -= 10;
    if (form.color !== 'Good') score -= 5;
    return Math.max(40, Math.min(100, Math.round(score)));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/lots', { ...form, farmer_id: session.profile.id });
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-lg mx-auto mt-10">
        <Card>
          <p className="font-display text-xl text-field-600">Lot Created Successfully ✓</p>
          <div className="mt-4 space-y-1 text-sm">
            <p><span className="text-soil-400">Lot ID:</span> <span className="font-mono font-medium">{result.lot.lot_code}</span></p>
            <p><span className="text-soil-400">Status:</span> <Badge tone="success">Active</Badge></p>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={() => navigate('/farmer/dashboard')}>Go to Dashboard</Button>
            <Button variant="secondary" onClick={() => navigate('/farmer/offers')}>View Offers</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl">Create Produce Lot</h1>
        <p className="text-soil-400 text-sm mt-1">A lot ID will be generated automatically once submitted.</p>
      </div>

      <form onSubmit={submit} className="grid md:grid-cols-2 gap-6">
        <Card className="md:col-span-2">
          <p className="font-display text-lg mb-4">Lot details</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Crop">
              <select value={form.crop} onChange={set('crop')} className="input">
                {CROPS.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Variety">
              <input value={form.variety} onChange={set('variety')} className="input" placeholder="e.g. Guntur Sannam" />
            </Field>
            <Field label="Quantity">
              <input type="number" value={form.quantity} onChange={set('quantity')} className="input" required />
            </Field>
            <Field label="Unit">
              <select value={form.unit} onChange={set('unit')} className="input">
                <option>tonnes</option><option>kg</option><option>quintal</option>
              </select>
            </Field>
            <Field label="Location">
              <input value={form.location} onChange={set('location')} className="input" />
            </Field>
            <Field label="Harvest date">
              <input type="date" value={form.harvest_date} onChange={set('harvest_date')} className="input" />
            </Field>
            <Field label="Expected price (per unit)">
              <input type="number" value={form.expected_price} onChange={set('expected_price')} className="input" required />
            </Field>
            <Field label="Upload image">
              <input type="file" className="input" />
            </Field>
          </div>
          <Field label="Description" className="mt-4">
            <textarea value={form.description} onChange={set('description')} className="input" rows={3} />
          </Field>
        </Card>

        <Card className="md:col-span-2">
          <p className="font-display text-lg mb-4">Quality grading</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Grade">
              <select value={form.quality_grade} onChange={set('quality_grade')} className="input">
                <option>A</option><option>B</option><option>C</option>
              </select>
            </Field>
            <Field label="Moisture (%)">
              <input type="number" value={form.moisture} onChange={set('moisture')} className="input" />
            </Field>
            <Field label="Damage (%)">
              <input type="number" value={form.damage_pct} onChange={set('damage_pct')} className="input" />
            </Field>
            <Field label="Size">
              <select value={form.size} onChange={set('size')} className="input">
                <option>Premium</option><option>Medium</option><option>Small</option>
              </select>
            </Field>
            <Field label="Color">
              <select value={form.color} onChange={set('color')} className="input">
                <option>Good</option><option>Fair</option>
              </select>
            </Field>
            <Field label="Foreign material (%)">
              <input type="number" value={form.foreign_material} onChange={set('foreign_material')} className="input" />
            </Field>
          </div>
          <div className="mt-4 bg-field-50 rounded-card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-soil-400 tracking-wide">Quality Score (live preview)</p>
              <p className="font-display text-2xl text-field-600">{previewScore()}/100</p>
            </div>
            <Badge tone="success">GRADE {form.quality_grade}</Badge>
          </div>
        </Card>

        {error && <p className="text-sm text-rust-500 md:col-span-2">{error}</p>}
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create Lot'}</Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-medium text-soil-600 uppercase tracking-wide">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
