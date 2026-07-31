const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function pickImage(item) {
  const candidates = [
    ...(item.mediumImageUrls || []),
    ...(item.smallImageUrls || []),
  ];
  const first = candidates.find(Boolean);
  if (!first) return null;
  return typeof first === 'string' ? first : first.imageUrl || null;
}

export function isRakutenConfigured() {
  return Boolean(process.env.RAKUTEN_APPLICATION_ID && process.env.RAKUTEN_ACCESS_KEY);
}

export async function searchRakutenOffers(keyword, hits = 5) {
  if (!isRakutenConfigured()) return [];

  const key = `${keyword}:${hits}`;
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const params = new URLSearchParams({
    applicationId: process.env.RAKUTEN_APPLICATION_ID,
    accessKey: process.env.RAKUTEN_ACCESS_KEY,
    keyword,
    hits: String(Math.min(Math.max(hits, 1), 10)),
    format: 'json',
    formatVersion: '2',
    elements: 'itemName,itemPrice,itemUrl,affiliateUrl,shopName,mediumImageUrls,smallImageUrls',
  });

  if (process.env.RAKUTEN_AFFILIATE_ID) {
    params.set('affiliateId', process.env.RAKUTEN_AFFILIATE_ID);
  }

  const url = `https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701?${params}`;
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`Rakuten API ${response.status}`);
      const data = await response.json();
      const items = Array.isArray(data.Items) ? data.Items : Array.isArray(data.items) ? data.items : [];
      const normalized = items.map((raw) => raw.Item || raw.item || raw).map((item) => ({
        name: item.itemName || '',
        priceYen: Number(item.itemPrice || 0) || null,
        imageUrl: pickImage(item),
        shopName: item.shopName || '라쿠텐 입점점',
        url: item.affiliateUrl || item.itemUrl || null,
        source: 'Rakuten Ichiba',
      })).filter((item) => item.name && item.url);

      cache.set(key, { value: normalized, expiresAt: Date.now() + CACHE_TTL_MS });
      return normalized;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await sleep(attempt * 500);
    } finally {
      clearTimeout(timer);
    }
  }

  console.error('Rakuten lookup failed:', lastError);
  return [];
}
