const BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '') || '';
const TOKEN_KEY = 'aa_token';

export const tokenStore = {
  get: () => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set: (t: string | null) => {
    try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
  },
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T = any>(path: string, opts: RequestInit & { json?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string>) };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  let body = opts.body;
  if (opts.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.json);
  }
  let res: Response;
  try {
    res = await fetch(`${BASE}/api${path}`, { ...opts, headers, body });
  } catch {
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0);
  }
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) throw new ApiError(data?.error || `Request failed (${res.status})`, res.status);
  return data as T;
}

/** Opens an authenticated HTML document (certificate, receipt) in a new tab. */
export async function openDocument(path: string) {
  const win = window.open('', '_blank');
  const token = tokenStore.get();
  const res = await fetch(`${BASE}/api${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  const html = await res.text();
  if (!res.ok) {
    win?.close();
    let msg = 'Document not available.';
    try { msg = JSON.parse(html).error || msg; } catch { /* ignore */ }
    throw new ApiError(msg, res.status);
  }
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
  }
}

/** Fetches a staff-only uploaded file and opens it. */
export async function openFile(name: string) {
  const token = tokenStore.get();
  const res = await fetch(`${BASE}/api/admin/files/${encodeURIComponent(name)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new ApiError('File not found', res.status);
  const blob = await res.blob();
  window.open(URL.createObjectURL(blob), '_blank');
}

export const rand = (n: number) => `R${Number(n || 0).toLocaleString('en-ZA')}`;
export const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
export const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('en-ZA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
export const fmtPeriod = (p: string) => {
  const [y, m] = p.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
};
