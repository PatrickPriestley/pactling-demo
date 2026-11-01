// orders-api's client for payments-api.
async function authorise(baseUrl, orderId, amount) {
  const res = await fetch(`${baseUrl}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, amount }),
  });
  const body = await res.json();
  return { authorised: res.status === 201, status: body.status };
}

module.exports = { authorise };
