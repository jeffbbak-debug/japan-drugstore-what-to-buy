import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { products } from './data/products.js';
import { isRakutenConfigured, searchRakutenOffers } from './rakuten.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('허용되지 않은 Origin입니다.'));
    },
  }),
);
app.use(express.json({ limit: '200kb' }));
app.use(morgan('dev'));

app.use((request, response, next) => {
  response.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  next();
});

app.get('/health', (request, response) => {
  response.json({
    ok: true,
    service: 'japan-drugstore-backend',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/products', (request, response) => {
  const category = String(request.query.category || '').trim();
  const query = String(request.query.q || '').trim().toLowerCase();

  const filtered = products.filter((product) => {
    const categoryMatched = !category || product.category === category;

    const searchableText = [
      product.brand,
      product.category,
      product.nameKo,
      product.nameJa,
      product.summary,
      ...product.tags,
      ...product.uses,
      ...product.stores.map((store) => store.name),
    ]
      .join(' ')
      .toLowerCase();

    const queryMatched = !query || searchableText.includes(query);

    return categoryMatched && queryMatched;
  });

  response.json({
    items: filtered,
    total: filtered.length,
  });
});

app.get('/api/products/:productId/offers', async (request, response, next) => {
  try {
    const product = products.find((item) => item.id === request.params.productId);
    if (!product) return response.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    const items = await searchRakutenOffers(product.nameJa, 5);
    response.json({ items, configured: isRakutenConfigured(), fetchedAt: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
});

app.get('/api/products/:productId', (request, response) => {
  const product = products.find((item) => item.id === request.params.productId);

  if (!product) {
    response.status(404).json({
      message: '상품을 찾을 수 없습니다.',
    });
    return;
  }

  response.json({ item: product });
});

app.use((request, response) => {
  response.status(404).json({
    message: '요청한 API를 찾을 수 없습니다.',
  });
});

app.use((error, request, response, next) => {
  console.error(error);

  response.status(error.message === '허용되지 않은 Origin입니다.' ? 403 : 500).json({
    message:
      error.message === '허용되지 않은 Origin입니다.'
        ? error.message
        : '서버에서 문제가 발생했습니다.',
  });
});

app.listen(port, () => {
  console.log(`Japan Drugstore API running at http://localhost:${port}`);
});
