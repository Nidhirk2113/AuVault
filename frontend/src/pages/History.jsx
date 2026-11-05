import { useEffect, useState } from 'react';
import { api } from '../api';
import { fmtDateTime, rupees } from '../utils';

export default function History() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { api('/dispense').then(setRows).catch((e) => setError(e.message)); }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Dispense history</h1>
        <p className="text-sm text-slate-500">The 50 most recent dispenses</p>
      </div>
      {error && <p className="text-red-600">{error}</p>}
      {!rows && !error && <p className="text-slate-500">Loading…</p>}
      {rows && rows.length === 0 && <p className="card p-6 text-sm text-slate-400">Nothing dispensed yet.</p>}
      <div className="space-y-3">
        {rows?.map((d) => (
          <div key={d._id} className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{fmtDateTime(d.createdAt)}</span>
              <span className="font-semibold">{rupees(d.totalPaise)}</span>
            </div>
            <ul className="mt-2 text-sm text-slate-700">
              {d.items.map((i, idx) => (
                <li key={idx}>{i.quantity} × {i.name} <span className="text-slate-400">(batch {i.batchNo}, {rupees(i.unitPricePaise)} each)</span></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
