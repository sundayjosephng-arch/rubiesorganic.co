const https = require('https');
const querystring = require('querystring');

const DEFAULT_WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '+2348099450337';
const DEFAULT_SMS_NUMBER = process.env.COMPANY_SMS_NUMBER || process.env.COMPANY_PHONE || '+2348099450337';
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || null;
const SMS_API_URL = process.env.SMS_API_URL || null;
const SMS_API_KEY = process.env.SMS_API_KEY || null;
const SMS_API_SECRET = process.env.SMS_API_SECRET || null;

function buildOrderMessage(order) {
  const lines = [
    'New Rubies Organic order received.',
    `Order ID: ${order.orderId || 'N/A'}`,
    `Customer: ${order.clientName || 'N/A'}`,
    `Email: ${order.clientEmail || 'N/A'}`,
    `Product: ${order.productName || 'N/A'}`,
    `Quantity: ${order.sizeQuantity || 'N/A'}`,
    `Logistics: ${order.logisticsInstructions || 'None provided'}`
  ];
  return lines.join('\n');
}

function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const urlObj = new URL(url);
    const req = https.request({
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: `${urlObj.pathname}${urlObj.search}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data || '{}');
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function sendWhatsAppMessage(message, to = DEFAULT_WHATSAPP_NUMBER) {
  if (!WHATSAPP_API_URL) {
    return { success: true, provider: 'dry-run', message: 'WhatsApp provider not configured. Skipped.' };
  }

  const payload = {
    to,
    message
  };

  const response = await postJson(WHATSAPP_API_URL, payload);
  return { success: true, provider: 'whatsapp', response };
}

async function sendSmsMessage(message, to = DEFAULT_SMS_NUMBER) {
  if (!SMS_API_URL) {
    return { success: true, provider: 'dry-run', message: 'SMS provider not configured. Skipped.' };
  }

  const payload = {
    to,
    message,
    api_key: SMS_API_KEY,
    api_secret: SMS_API_SECRET
  };

  const response = await postJson(SMS_API_URL, payload);
  return { success: true, provider: 'sms', response };
}

async function sendOrderNotifications(order, options = {}) {
  const message = buildOrderMessage(order);
  const dryRun = Boolean(options.dryRun);

  if (dryRun) {
    return {
      success: true,
      summary: `WhatsApp -> ${DEFAULT_WHATSAPP_NUMBER}; SMS -> ${DEFAULT_SMS_NUMBER}`,
      message
    };
  }

  const [whatsappResult, smsResult] = await Promise.allSettled([
    sendWhatsAppMessage(message),
    sendSmsMessage(message)
  ]);

  return {
    success: true,
    summary: `WhatsApp -> ${DEFAULT_WHATSAPP_NUMBER}; SMS -> ${DEFAULT_SMS_NUMBER}`,
    whatsapp: whatsappResult.status === 'fulfilled' ? whatsappResult.value : { success: false, error: whatsappResult.reason.message },
    sms: smsResult.status === 'fulfilled' ? smsResult.value : { success: false, error: smsResult.reason.message }
  };
}

module.exports = {
  buildOrderMessage,
  sendOrderNotifications,
  sendWhatsAppMessage,
  sendSmsMessage
};
