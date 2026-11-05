import { useEffect, useState } from 'react';
import { api } from '../api';
import { errorText, fmtDate, rupees } from '../utils';

export default function Dispense() {
  const [medicines, setMedicines] = useState([]);
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]); // [{ id, quantity }]
  const [message, setMessage] = useState(null); // { type: 'ok' | 'error', text }
  const [submitting, setSubmitting] = useState(false);

  const load = () => api('/medicines').then(setMedicines).catch((e) => setMessage({ type: 'error', text: e.message }));
  useEffect(() => { load(); }, []);

  const byId = Object.fromEntries(medicines.map((m) => [m._id, m]));
  const isExpired = (m) => new Date(m.expiryDate) <= new Date();
  const available = medicines.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase()) || m.sku.toLowerCase().includes(query.toLowerCase()));

  const add = (m) => {
    setMessage(null);
    setCart((c) => {
      const line = c.find((l) => l.id === m._id);
      if (!line) return [...c, { id: m._id, quantity: 1 }];
      return c.map((l) => (l.id === m._id ? { ...l, quantity: Math.min(l.quantity + 1, m.stock) } : l));
    });
  };
  const setQty = (id, value) =>
    setCart((c) => c.map((l) => (l.id === id ? { ...l, quantity: Math.max(1, Math.min(Number(value) || 1, byId[id].stock)) } : l)));
  const remove = (id) => setCart((c) => c.filter((l) => l.id !== id));

  const total = cart.reduce((sum, l) => sum + byId[l.id].pricePaise * l.quantity, 0);

  const submit = async () => {
    setSubmitting(true); setMessage(null);
    try {
      const res = await api('/dispense', {
        method: 'POST',
        body: { items: cart.map((l) => ({ medicineId: l.id, quantity: l.quantity })) },
      });
      setCart([]);
      setMessage({ type: 'ok', text: `Dispensed successfully. Total ${rupees(res.totalPaise)}.` });
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err) });
    } finally {
      await load(); // refresh stock, even after a failure (someone else may have dispensed)
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Dispense medicines</h1>
        <p className="text-sm text-slate-500">Pick items, set quantities, and confirm. Stock updates automatically.</p>
      </div>

      {message && (
        <p className={`rounded-lg px-3 py-2 text-sm ${message.type === 'ok' ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'}`}>
          {message.text}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="card p-4 lg:col-span-3">
          <input className="input mb-3" placeholder="Search by name or SKU…" value={query}
            onChange={(e) => setQuery(e.target.value)} />
          <ul className="max-h-[28rem] divide-y divide-slate-100 overflow-y-auto">
            {available.map((m) => {
              const blocked = isExpired(m) || m.stock === 0;
              return (
                <li key={m._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-slate-500">
                      {rupees(m.pricePaise)} · {m.stock} in stock · exp {fmtDate(m.expiryDate)}
                    </p>
                  </div>
                  <button className="btn-secondary !px-3 !py-1" disabled={blocked} onClick={() => add(m)}>
                    {isExpired(m) ? 'Expired' : m.stock === 0 ? 'Out of stock' : 'Add'}
                  </button>
                </li>
              );
            })}
            {available.length === 0 && <li className="py-6 text-center text-sm text-slate-400">No matches</li>}
          </ul>
        </div>

        <div className="card p-4 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Current dispense</h2>
          {cart.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No items added yet.</p>
          ) : (
            <ul className="space-y-3">
              {cart.map((l) => {
                const m = byId[l.id];
                return (
                  <li key={l.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-slate-500">{rupees(m.pricePaise)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" min={1} max={m.stock} className="input !w-16 !px-2 !py-1"
                        value={l.quantity} onChange={(e) => setQty(l.id, e.target.value)} />
                      <button onClick={() => remove(l.id)} className="text-lg text-slate-400 hover:text-red-500" aria-label="Remove">×</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-sm text-slate-500">Total</span>
            <span className="text-xl font-semibold">{rupees(total)}</span>
          </div>
          <button className="btn-primary mt-4 w-full" disabled={cart.length === 0 || submitting} onClick={submit}>
            {submitting ? 'Processing…' : 'Confirm dispense'}
          </button>
        </div>
      </div>
    </div>
  );
}
