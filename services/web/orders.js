// web's client for orders-api. BREAK=1 makes web expect a field orders-api never sends,
// the change the demo's "breaking change" run uses to show can-i-deploy refusing.
async function fetchOrder(baseUrl, id) {
  const res = await fetch(`${baseUrl}/orders/${id}`);
  return res.json();
}

module.exports = { fetchOrder };
