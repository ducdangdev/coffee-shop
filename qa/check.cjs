// Run with: node qa/check.cjs (requires .qa-tools/playwright and local MySQL).
// Creates an isolated schema; never writes to the application's existing schema.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
require('../backend/node_modules/dotenv').config({ path: path.join(root, 'backend/.env') });
const mysql = require('../backend/node_modules/mysql2/promise');
const bcrypt = require('../backend/node_modules/bcryptjs');
const { chromium } = require('../.qa-tools/node_modules/playwright');
const crypto = require('node:crypto');
const database = `coffee_shop_qa_${Date.now()}`;
const password = crypto.randomBytes(24).toString('hex');
const api = 'http://localhost:5001/api';
let connection, server, browser;
const results = [];
function ok(name) { results.push(name); console.log('PASS', name); }
async function request(route, method = 'GET', body, token) {
  const response = await fetch(api + route, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: response.status, body: await response.json() };
}
(async () => {
  fs.mkdirSync(path.join(__dirname, 'artifacts'), { recursive: true });
  connection = await mysql.createConnection({ host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, multipleStatements: true });
  let schema = fs.readFileSync(path.join(root, 'database/schema.sql'), 'utf8').replaceAll('coffee_shop', database);
  await connection.query(schema);
  await connection.query('INSERT INTO users (full_name,email,password,role) VALUES (?,?,?,?)', ['QA Admin', 'qa@example.test', await bcrypt.hash(password, 10), 'admin']);
  await connection.query("INSERT INTO categories (name,slug) VALUES ('Cà phê','ca-phe')");
  await connection.query("INSERT INTO products (category_id,name,slug,price,is_featured,image_url) VALUES (1,'Cà phê sữa QA','ca-phe-sua-qa',35000,1,'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600')");
  server = spawn(process.execPath, ['src/server.js'], { cwd: path.join(root, 'backend'), env: { ...process.env, PORT: '5001', DB_NAME: database, CLIENT_URL: 'http://127.0.0.1:5173', NODE_ENV: 'test', JWT_SECRET: crypto.randomBytes(48).toString('hex') }, windowsHide: true, stdio: 'pipe' });
  server.stderr.on('data', data => console.log('SERVER', String(data).trim()));
  for (let i = 0; i < 40; i++) { try { if ((await request('/ready')).status === 200) break; } catch {} await new Promise(r => setTimeout(r, 250)); }
  assert.equal((await request('/ready')).status, 200); ok('API and isolated MySQL readiness');
  assert.equal((await request('/orders')).status, 401);
  assert.equal((await request('/dashboard/stats')).status, 401);
  assert.equal((await request('/products', 'POST', {})).status, 401); ok('Anonymous admin requests denied');
  const login = await request('/auth/login', 'POST', { email: 'qa@example.test', password });
  assert.equal(login.status, 200); const token = login.body.token; ok('Admin login');
  const body = { customer_name: 'QA Customer', customer_phone: '0900000000', customer_address: 'QA address', items: [{ product_id: 1, quantity: 2 }] };
  for (const quantity of [-1, 0, 1.5, '2abc', 100, null]) assert.equal((await request('/orders', 'POST', { ...body, items: [{ product_id: 1, quantity }] })).status, 400);
  assert.equal((await request('/orders', 'POST', { ...body, customer_name: {} })).status, 400);
  assert.equal((await request('/orders', 'POST', { ...body, payment_method: 'momo' })).status, 400);
  assert.equal((await request('/orders', 'POST', { ...body, items: [...body.items, ...body.items] })).status, 400); ok('Order input and unsupported payments rejected');
  const order = await request('/orders', 'POST', { ...body, total_amount: 1, items: [{ product_id: 1, quantity: 2, price: 1 }] });
  assert.equal(order.status, 201); assert.equal(Number(order.body.total_amount), 70000); ok('Order total uses database price');
  await request('/orders', 'POST', { ...body, items: [{ product_id: 1, quantity: 1 }, { product_id: 999999, quantity: 1 }] });
  const [[count]] = await connection.query('SELECT COUNT(*) AS n FROM orders'); assert.equal(count.n, 1); ok('Failed order rolls back completely');
  assert.equal((await request(`/orders/${order.body.id}/status`, 'PUT', { status: 'completed' }, token)).status, 200);
  const stats = await request('/dashboard/stats', 'GET', undefined, token); assert.equal(Number(stats.body.total_revenue), 70000); ok('Status update and revenue totals');
  const cat = await request('/categories', 'POST', { name: 'QA Tea' }, token); assert.equal(cat.status, 201);
  const product = await request('/products', 'POST', { category_id: cat.body.id, name: 'QA Tea', price: 42000 }, token); assert.equal(product.status, 201);
  assert.equal((await request(`/products/${product.body.id}`, 'PUT', { price: -1 }, token)).status, 400);
  assert.equal((await request(`/products/${product.body.id}`, 'PUT', { price: 45000, is_available: false }, token)).status, 200);
  assert.equal((await request('/orders', 'POST', { ...body, items: [{ product_id: product.body.id, quantity: 1 }] })).status, 400);
  assert.equal((await request(`/products/${product.body.id}`, 'DELETE', undefined, token)).status, 200);
  assert.equal((await request(`/categories/${cat.body.id}`, 'DELETE', undefined, token)).status, 200); ok('Category/product CRUD and unavailable product rejection');
  const multipart = new FormData();
  multipart.set('name', 'QA Upload'); multipart.set('category_id', '1'); multipart.set('price', '10000');
  multipart.set('image', new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN1sAAAAASUVORK5CYII=', 'base64')], { type: 'image/png' }), 'qa.png');
  const uploaded = await fetch(api + '/products', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: multipart });
  assert.equal(uploaded.status, 201); const uploadedProduct = await uploaded.json();
  assert.equal((await fetch('http://localhost:5001' + uploadedProduct.image_url)).status, 200);
  const uploadFile = path.resolve(root, 'backend', '.' + uploadedProduct.image_url);
  assert.ok(uploadFile.startsWith(path.join(root, 'backend', 'uploads') + path.sep));
  fs.unlinkSync(uploadFile);
  assert.equal((await request(`/products/${uploadedProduct.id}`, 'DELETE', undefined, token)).status, 200); ok('Multipart image upload and serving');
  browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = []; page.on('pageerror', e => { errors.push(e.message); console.log('BROWSER ERROR', e.message); });
  await page.route('**/api/**', async route => {
    const original = new URL(route.request().url());
    if (!original.pathname.startsWith('/api/')) return route.continue();
    const response = await route.fetch({ url: api + original.pathname.replace(/^\/api/, '') + original.search });
    await route.fulfill({ response });
  });
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/menu', '/product/1', '/cart', '/checkout', '/about', '/contact', '/admin/login', '/not-found']) {
      await page.goto('http://127.0.0.1:5173' + route); await page.waitForFunction(() => document.body.innerText.length > 0); await page.waitForTimeout(450);
      assert.ok(await page.locator('body').innerText(), route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      assert.equal(overflow, false, `Horizontal overflow: ${width} ${route}`);
      if (width !== 320) await page.screenshot({ path: path.join(__dirname, 'artifacts', `${width}-${route.replaceAll('/', '_') || 'home'}.png`), fullPage: true });
    }
  } ok('Public routes render at 1440, 390 and 320px without horizontal overflow');
  await page.goto('http://127.0.0.1:5173/product/1');
  await page.getByRole('button', { name: 'Thêm vào giỏ' }).click();
  await page.goto('http://127.0.0.1:5173/cart');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, 'Filled cart overflow');
  await page.screenshot({ path: path.join(__dirname, 'artifacts', '320-cart-filled.png'), fullPage: true });
  await page.getByRole('button', { name: 'Tiến hành đặt hàng' }).click();
  await page.locator('[name=customer_name]').fill('Browser QA');
  await page.locator('[name=customer_phone]').fill('0900000000');
  await page.locator('[name=customer_address]').fill('QA browser address');
  await page.getByRole('button', { name: 'Xác nhận đặt hàng' }).click();
  await page.getByRole('heading', { name: 'Đặt hàng thành công!' }).waitFor(); ok('Browser add-to-cart, persisted cart, COD checkout');
  await page.goto('http://127.0.0.1:5173/admin/login');
  await page.locator('input[type=email]').fill('qa@example.test');
  await page.locator('input[type=password]').fill(password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await page.waitForURL('**/admin');
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/admin', '/admin/products', '/admin/categories', '/admin/orders', '/admin/reports']) {
      await page.goto('http://127.0.0.1:5173' + route); await page.waitForTimeout(600);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `Admin overflow ${width} ${route}`);
      if (width !== 320) await page.screenshot({ path: path.join(__dirname, 'artifacts', `${width}-${route.replaceAll('/', '_')}.png`), fullPage: true });
    }
  } ok('All admin screens desktop and mobile');
  await page.locator('input[type=date]').nth(0).fill('2020-01-01');
  await page.locator('input[type=date]').nth(1).fill('2020-01-02');
  await page.getByRole('button', { name: 'Lọc', exact: true }).click();
  await page.waitForTimeout(250);
  const unfiltered = page.waitForRequest(r => r.url().includes('/dashboard/report') && !r.url().includes('?'));
  await page.getByRole('button', { name: 'Xóa lọc' }).click(); await unfiltered; ok('Report clear filter requests unfiltered data');
  await page.route(url => url.pathname.startsWith('/api/products'), route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'QA outage' }) }));
  await page.goto('http://127.0.0.1:5173/menu');
  await page.getByRole('alert').waitFor(); ok('Menu displays API outage instead of empty search results');
  await page.evaluate(() => localStorage.setItem('coffee_shop_cart', '{"broken":true}'));
  await page.goto('http://127.0.0.1:5173/cart');
  await page.getByRole('heading', { name: 'Giỏ hàng đang trống' }).waitFor(); ok('Malformed stored cart recovers without crash');
  assert.deepEqual(errors, []); ok('No browser JavaScript exceptions');
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(async () => {
  if (browser) await browser.close();
  if (server) { server.kill(); await new Promise(r => setTimeout(r, 300)); }
  if (connection) {
    if (/^coffee_shop_qa_\d+$/.test(database)) await connection.query(`DROP DATABASE \`${database}\``);
    await connection.end();
  }
  fs.writeFileSync(path.join(__dirname, 'artifacts/results.json'), JSON.stringify({ passed: results, success: !process.exitCode }, null, 2));
});
