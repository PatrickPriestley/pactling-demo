// orders-api: serves orders to web. Provider for web; consumer of payments-api.
const http = require('node:http');

const orders = new Map();

function app() {
  return http.createServer((req, res) => {
    const m = req.url.match(/^\/orders\/(\d+)$/);
    if (req.method === 'GET' && m) {
      const order = orders.get(Number(m[1]));
      res.writeHead(order ? 200 : 404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(order || { error: 'not found' }));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found' }));
  });
}

module.exports = { app, orders };
if (require.main === module) app().listen(Number(process.env.PORT || 3001));
