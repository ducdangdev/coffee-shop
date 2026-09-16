const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pool } = require('../src/config/db');
const { createOrder } = require('../src/controllers/order.controller');
const body = { customer_name: 'QA', customer_phone: '0900000000', customer_address: 'QA', items: [{ product_id: 1, quantity: 1 }] };

test('Connection acquisition failure reaches Express error handler', async () => {
  const original = pool.getConnection;
  const expected = new Error('DB unavailable');
  pool.getConnection = async () => { throw expected; };
  let actual;
  try { await createOrder({ body }, {}, error => { actual = error; }); assert.equal(actual, expected); }
  finally { pool.getConnection = original; }
});

test('Invalid quantity is rejected before acquiring a database connection', async () => {
  const original = pool.getConnection;
  let acquired = false;
  pool.getConnection = async () => { acquired = true; throw new Error('Unexpected connection'); };
  const res = { status(code) { this.code = code; return this; }, json(value) { this.body = value; } };
  try {
    await createOrder({ body: { ...body, items: [{ product_id: 1, quantity: -1 }] } }, res, error => { throw error; });
    assert.equal(res.code, 400); assert.equal(acquired, false);
  } finally { pool.getConnection = original; }
});

test('Rollback failure still forwards original error and releases connection once', async () => {
  const original = pool.getConnection;
  const expected = new Error('Query failed');
  let released = 0, actual;
  pool.getConnection = async () => ({ beginTransaction: async () => {}, query: async () => { throw expected; }, rollback: async () => { throw new Error('Rollback unavailable'); }, release: () => { released++; } });
  try {
    await createOrder({ body }, {}, error => { actual = error; });
    assert.equal(actual, expected); assert.equal(released, 1);
  } finally { pool.getConnection = original; }
});
