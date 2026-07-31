const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:4000';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(path, options = {}) {
  const maxAttempts = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
          Accept: 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`요청 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts) {
        await sleep(400 * attempt);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error(
    lastError?.name === 'AbortError'
      ? '서버 응답 시간이 초과됐어요.'
      : '상품 정보를 불러오지 못했어요.',
  );
}

export function getProducts({ category = '전체', query = '' } = {}) {
  const params = new URLSearchParams();

  if (category && category !== '전체') {
    params.set('category', category);
  }

  if (query.trim()) {
    params.set('q', query.trim());
  }

  const suffix = params.toString() ? `?${params.toString()}` : '';
  return request(`/api/products${suffix}`);
}

export function getProduct(productId) {
  return request(`/api/products/${encodeURIComponent(productId)}`);
}

export function getProductOffers(productId) {
  return request(`/api/products/${encodeURIComponent(productId)}/offers`);
}
