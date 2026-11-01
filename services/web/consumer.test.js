// web's expectations of orders-api.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const { fetchOrder } = require('./orders');

const pact = new PactV3({ consumer: 'web', provider: 'orders-api', dir: path.join(__dirname, '../../pacts'), logLevel: 'warn' });
// The breaking change: web starts expecting a currency that orders-api does not return.
const body = { id: MatchersV3.integer(1), status: MatchersV3.like('open'), total: MatchersV3.like(25) };
if (process.env.BREAK === '1') body.currency = MatchersV3.like('EUR');

test('web shows an order', async () => {
  pact
    .given('an order exists')
    .uponReceiving('a request for an order')
    .withRequest({ method: 'GET', path: '/orders/1' })
    .willRespondWith({ status: 200, headers: { 'Content-Type': 'application/json' }, body });
  await pact.executeTest(async (mock) => {
    const order = await fetchOrder(mock.url, 1);
    assert.equal(order.id, 1);
  });
});
