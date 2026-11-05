// Small fetch wrapper: adds the JWT, parses JSON, and throws readable errors.
export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Expired or invalid token: clear the session and send the user to login
    if (res.status === 401 && token) {
      localStorage.clear();
      window.location.href = '/login';
    }
    const err = new Error(data.error || 'Request failed');
    err.details = data.details;
    throw err;
  }
  return data;
}
