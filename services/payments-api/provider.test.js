// Verifies every pact the broker selects for payments-api and publishes the results.
const { test } = require('node:test');
const { Verifier } = require('@pact-foundation/pact');
const { app } = require('./server');
const { verifierOptions } = require('../../scripts/verifier');

test('payments-api honours its consumers\' pacts', async () => {
  const server = app().listen(0);
  try {
    await new Verifier(verifierOptions('payments-api', server.address().port, {})).verifyProvider();
  } finally {
    server.close();
  }
});
