import { useEffect, useState } from 'react';
import { api } from '../api';
import { fmtDateTime } from '../utils';

const tone = { CREATE: 'bg-teal-100 text-teal-700', UPDATE: 'bg-sky-100 text-sky-700', DELETE: 'bg-red-100 text-red-700', DISPENSE: 'bg-violet-100 text-violet-700' };

export default function Audit() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { api('/reports/audit').then(setRows).catch((e) => setError(e.message)); }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Audit log</h1>
        <p className="text-sm text-slate-500">Who changed what, and when (admin only)</p>
      </div>
      {error && <p className="text-red-600">{error}</p>}
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr><th className="th">When</th><th className="th">User</th><th className="th">Action</th><th className="th">Entity</th><th className="th">Details</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!rows && <tr><td className="td text-slate-400" colSpan={5}>Loading…</td></tr>}
            {rows?.map((r) => (
              <tr key={r._id}>
                <td className="td whitespace-nowrap text-slate-500">{fmtDateTime(r.createdAt)}</td>
                <td className="td">{r.user?.email ?? 'deleted user'}</td>
                <td className="td"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone[r.action] || 'bg-slate-100'}`}>{r.action}</span></td>
                <td className="td">{r.entity}</td>
                <td className="td text-xs text-slate-500">{JSON.stringify(r.details)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
