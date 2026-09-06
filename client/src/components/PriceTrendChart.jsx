import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function PriceTrendChart({ data, unit = '' }) {
  const chartData = data.map(d => ({ date: d.date.slice(5), price: d.price }));
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#e8e4dc" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b6156' }} axisLine={{ stroke: '#e8e4dc' }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#6b6156' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: '1px solid #e8e4dc', fontSize: 12 }}
            formatter={(v) => [`₹${v}/${unit}`, 'Price']}
          />
          <Line type="monotone" dataKey="price" stroke="#1f4b3f" strokeWidth={2.5} dot={{ r: 3, fill: '#1f4b3f' }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
