// Verifies every pact the broker selects for orders-api and publishes the results.
const { test } = require('node:test');
const { Verifier } = require('@pact-foundation/pact');
const { app, orders } = require('./server');
const { verifierOptions } = require('../../scripts/verifier');

test('orders-api honours its consumers\' pacts', async () => {
  const server = app().listen(0);
  try {
    await new Verifier(verifierOptions('orders-api', server.address().port, {
      'an order exists': () => { orders.set(1, { id: 1, status: 'open', total: 25 }); return Promise.resolve(); },
    })).verifyProvider();
  } finally {
    server.close();
  }
});
