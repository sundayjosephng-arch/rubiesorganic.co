const url = process.env.API_URL || 'http://localhost:3000';
const payload = {
  productName: 'Test Tea',
  clientName: 'Test User',
  clientEmail: 'test@example.com',
  sizeQuantity: '100g',
  logisticsInstructions: 'No rush'
};

async function run() {
  try {
    const res = await fetch(`${url}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = await res.json().catch(() => null);
    console.log('Status:', res.status);
    console.log('Response:', body || '(no JSON)');
  } catch (err) {
    console.error('Request failed:', err.message);
    process.exitCode = 2;
  }
}

run();
