import test from 'node:test';
import assert from 'node:assert/strict';
import { products } from './data/products.js';
import { isRakutenConfigured } from './rakuten.js';

test('curated products have required fields', () => {
  assert.ok(products.length >= 6);
  for (const product of products) {
    assert.ok(product.id);
    assert.ok(product.nameKo);
    assert.ok(product.nameJa);
    assert.ok(Array.isArray(product.stores));
    assert.ok(product.stores.length > 0);
  }
});

test('rakuten integration is optional without env', () => {
  const originalAppId = process.env.RAKUTEN_APPLICATION_ID;
  const originalKey = process.env.RAKUTEN_ACCESS_KEY;
  delete process.env.RAKUTEN_APPLICATION_ID;
  delete process.env.RAKUTEN_ACCESS_KEY;
  assert.equal(isRakutenConfigured(), false);
  if (originalAppId) process.env.RAKUTEN_APPLICATION_ID = originalAppId;
  if (originalKey) process.env.RAKUTEN_ACCESS_KEY = originalKey;
});
