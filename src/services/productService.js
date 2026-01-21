let cache = { data: null, ts: 0, url: '' };
const TTL_MS = 5 * 60 * 1000;

const isFresh = (url) => cache.data && cache.url === url && (Date.now() - cache.ts) < TTL_MS;

export const fetchProducts = async (url) => {
  if (isFresh(url)) {
    return { status: 'success', data: cache.data, error: null, cached: true };
  }
  try {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      return { status: 'error', data: null, error: new Error('HTTP ' + res.status) };
    }
    const json = await res.json();
    const productos = Array.isArray(json?.productos) ? json.productos : Array.isArray(json) ? json : [];
    cache = { data: productos, ts: Date.now(), url };
    return { status: 'success', data: productos, error: null, cached: false };
  } catch (e) {
    return { status: 'error', data: null, error: e };
  }
};

export const clearCache = () => { cache = { data: null, ts: 0, url: '' }; };

