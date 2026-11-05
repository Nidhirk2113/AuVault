export const rupees = (paise) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const fmtDateTime = (d) =>
  new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

// One place that decides how a medicine is labelled and coloured
export function stockStatus(m) {
  const now = Date.now();
  const expiry = new Date(m.expiryDate).getTime();
  if (expiry <= now) return { label: 'Expired', cls: 'bg-red-100 text-red-700' };
  if (m.stock <= m.lowStockThreshold) return { label: 'Low stock', cls: 'bg-amber-100 text-amber-700' };
  if (expiry - now <= 30 * 24 * 60 * 60 * 1000) return { label: 'Expiring soon', cls: 'bg-orange-100 text-orange-700' };
  return { label: 'OK', cls: 'bg-teal-100 text-teal-700' };
}

export const errorText = (err) =>
  err.details?.length ? err.details.map((d) => `${d.path}: ${d.message}`).join(', ') : err.message;
