// payments-api: authorises a payment for an order. Provider for orders-api.
const http = require('node:http');

function app() {
  return http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/payments') {
      let body = '';
      req.on('data', (c) => { body += c; });
      req.on('end', () => {
        const { orderId, amount } = JSON.parse(body || '{}');
        const authorised = amount > 0 && amount <= 1000;
        res.writeHead(authorised ? 201 : 402, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(authorised
          ? { id: `pay-${orderId}`, orderId, status: 'authorised' }
          : { orderId, status: 'declined', reason: 'amount out of range' }));
      });
      return;
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found' }));
  });
}

module.exports = { app };
if (require.main === module) app().listen(Number(process.env.PORT || 3002));
