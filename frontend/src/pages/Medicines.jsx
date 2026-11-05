import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext.jsx';
import Modal from '../components/Modal.jsx';
import { errorText, fmtDate, rupees, stockStatus } from '../utils';

const emptyForm = { name: '', sku: '', batchNo: '', expiryDate: '', price: '', stock: '', lowStockThreshold: '10' };

export default function Medicines() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const [medicines, setMedicines] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () =>
    api('/medicines').then(setMedicines).catch((e) => setError(e.message)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(emptyForm); setEditingId(null); setFormError(''); setModal(true); };
  const openEdit = (m) => {
    setForm({
      name: m.name, sku: m.sku, batchNo: m.batchNo, expiryDate: m.expiryDate.slice(0, 10),
      price: String(m.pricePaise / 100), stock: String(m.stock), lowStockThreshold: String(m.lowStockThreshold),
    });
    setEditingId(m._id); setFormError(''); setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setFormError('');
    const body = {
      name: form.name, sku: form.sku, batchNo: form.batchNo, expiryDate: form.expiryDate,
      pricePaise: Math.round(parseFloat(form.price) * 100),
      stock: Number(form.stock), lowStockThreshold: Number(form.lowStockThreshold),
    };
    try {
      await api(editingId ? `/medicines/${editingId}` : '/medicines', { method: editingId ? 'PUT' : 'POST', body });
      setModal(false);
      await load();
    } catch (err) {
      setFormError(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (m) => {
    if (!window.confirm(`Delete ${m.name}? Past dispense records are kept.`)) return;
    try { await api(`/medicines/${m._id}`, { method: 'DELETE' }); await load(); }
    catch (err) { setError(err.message); }
  };

  const field = (key, label, props = {}) => (
    <div>
      <label className="label" htmlFor={key}>{label}</label>
      <input id={key} className="input" required value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })} {...props} />
    </div>
  );

  const shown = medicines.filter((m) =>
    `${m.name} ${m.sku} ${m.batchNo}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Medicines</h1>
          <p className="text-sm text-slate-500">{medicines.length} items in stock list</p>
        </div>
        <div className="flex gap-2">
          <input className="input w-56" placeholder="Search name, SKU, batch…" value={query}
            onChange={(e) => setQuery(e.target.value)} />
          {isAdmin && <button className="btn-primary" onClick={openNew}>Add medicine</button>}
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="th">Medicine</th><th className="th">SKU</th><th className="th">Batch</th>
              <th className="th">Expiry</th><th className="th">Price</th><th className="th">Stock</th>
              <th className="th">Status</th>{isAdmin && <th className="th text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && <tr><td className="td text-slate-400" colSpan={8}>Loading…</td></tr>}
            {!loading && shown.length === 0 && <tr><td className="td text-slate-400" colSpan={8}>No medicines found.</td></tr>}
            {shown.map((m) => {
              const s = stockStatus(m);
              return (
                <tr key={m._id} className="hover:bg-slate-50">
                  <td className="td font-medium">{m.name}</td>
                  <td className="td text-slate-500">{m.sku}</td>
                  <td className="td text-slate-500">{m.batchNo}</td>
                  <td className="td">{fmtDate(m.expiryDate)}</td>
                  <td className="td">{rupees(m.pricePaise)}</td>
                  <td className="td">{m.stock}</td>
                  <td className="td"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}>{s.label}</span></td>
                  {isAdmin && (
                    <td className="td space-x-2 text-right">
                      <button className="btn-secondary !px-3 !py-1" onClick={() => openEdit(m)}>Edit</button>
                      <button className="btn-danger !px-3 !py-1" onClick={() => remove(m)}>Delete</button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={editingId ? 'Edit medicine' : 'Add medicine'} onClose={() => setModal(false)}>
          <form onSubmit={save} className="space-y-4">
            {field('name', 'Name')}
            <div className="grid grid-cols-2 gap-3">
              {field('sku', 'SKU')}
              {field('batchNo', 'Batch no.')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {field('expiryDate', 'Expiry date', { type: 'date' })}
              {field('price', 'Price (₹)', { type: 'number', min: 0, step: '0.01' })}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {field('stock', 'Stock', { type: 'number', min: 0, step: 1 })}
              {field('lowStockThreshold', 'Low-stock alert at', { type: 'number', min: 0, step: 1 })}
            </div>
            {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
