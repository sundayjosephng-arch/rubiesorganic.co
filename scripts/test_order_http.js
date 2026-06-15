const http = require('http');

const payload = JSON.stringify({
  productName: 'HTTP Test Tea',
  clientName: 'HTTPUser',
  clientEmail: 'http@example.com',
  sizeQuantity: '250g',
  logisticsInstructions: 'Ship fast'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/orders',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try { console.log('Body:', JSON.parse(data)); }
    catch (e) { console.log('Body (raw):', data); }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(payload);
req.end();
