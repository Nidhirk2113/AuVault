import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { api } from '../api';
import { fmtDate, rupees } from '../utils';

function Stat({ label, value, tone = 'text-slate-900' }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

function AlertList({ title, tone, items, render }) {
  return (
    <div className="card p-5">
      <h3 className={`mb-3 text-sm font-semibold ${tone}`}>{title} ({items.length})</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">Nothing to worry about</p>
      ) : (
        <ul className="space-y-2">
          {items.slice(0, 5).map((m) => (
            <li key={m._id} className="flex justify-between gap-2 text-sm">
              <span className="truncate">{m.name}</span>
              <span className="shrink-0 text-slate-500">{render(m)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api('/reports/stats'), api('/reports/alerts')])
      .then(([s, a]) => { setStats(s); setAlerts(a); })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!stats || !alerts) return <p className="text-slate-500">Loading…</p>;

  const daily = stats.salesByDay.map((d) => ({ date: d.date, revenue: d.totalPaise / 100 }));
  const needsAttention = alerts.lowStock.length + alerts.expired.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-500">Stock health and dispensing activity</p>
      </div>

      {needsAttention > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>
            {alerts.lowStock.length} item(s) low on stock and {alerts.expired.length} expired. Review them now.
          </span>
          <Link to="/medicines" className="font-medium underline">Open medicines</Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total revenue" value={rupees(stats.revenuePaise)} />
        <Stat label="Dispenses" value={stats.dispenseCount} />
        <Stat label="Low stock" value={alerts.lowStock.length} tone="text-amber-600" />
        <Stat label="Expired" value={alerts.expired.length} tone="text-red-600" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <AlertList title="Low stock" tone="text-amber-600" items={alerts.lowStock} render={(m) => `${m.stock} left`} />
        <AlertList title="Expiring within 30 days" tone="text-orange-600" items={alerts.expiringSoon} render={(m) => fmtDate(m.expiryDate)} />
        <AlertList title="Expired" tone="text-red-600" items={alerts.expired} render={(m) => fmtDate(m.expiryDate)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Revenue per day</h3>
          {daily.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-400">No dispenses yet. Record one to see the chart.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Top dispensed medicines (units)</h3>
          {stats.topMedicines.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-400">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.topMedicines}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={11} interval={0} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="units" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
