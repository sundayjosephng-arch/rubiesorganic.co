const assert = require('assert');
const notifications = require('../rubies-backend/notifications');

(async () => {
  const result = await notifications.sendOrderNotifications({
    productName: 'Test Tea',
    clientName: 'Test User',
    clientEmail: 'test@example.com',
    sizeQuantity: '100g',
    logisticsInstructions: 'Leave at gate',
    orderId: 'test-order-1'
  }, { dryRun: true });

  assert.strictEqual(result.success, true);
  assert.ok(result.summary.includes('WhatsApp'));
  console.log('Notification helper test passed');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
