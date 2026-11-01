// orders-api's expectations of payments-api.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const { authorise } = require('./payments');

const pact = new PactV3({ consumer: 'orders-api', provider: 'payments-api', dir: path.join(__dirname, '../../pacts'), logLevel: 'warn' });

test('a payment within the limit is authorised', async () => {
  pact
    .uponReceiving('a request to authorise a payment')
    .withRequest({ method: 'POST', path: '/payments', headers: { 'Content-Type': 'application/json' }, body: { orderId: 1, amount: 25 } })
    .willRespondWith({ status: 201, headers: { 'Content-Type': 'application/json' }, body: { id: MatchersV3.like('pay-1'), status: 'authorised' } });
  await pact.executeTest(async (mock) => {
    assert.deepEqual(await authorise(mock.url, 1, 25), { authorised: true, status: 'authorised' });
  });
});
