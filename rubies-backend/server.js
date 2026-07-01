const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();
const { sendOrderNotifications } = require('./notifications');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(cors({ origin: '*' })); // Allows front-end connections from any domain or local host
app.use(express.json());

const simulate = (process.env.SIMULATE_EMAIL || 'false').toLowerCase() === 'true';
console.log('Environment SIMULATE_EMAIL=', process.env.SIMULATE_EMAIL, '=> simulate=', simulate);

let transporter = null;
if (!simulate) {
  // Setup our email communication channel with verification
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.COMPANY_EMAIL,
      pass: process.env.EMAIL_APP_PASSWORD
    },
    pool: true,           // reuse connections for better throughput
    maxConnections: 5,
    maxMessages: 100
  });

  // Verify transporter on startup (fail-fast if credentials are invalid)
  transporter.verify((err, success) => {
    if (err) {
      console.error('Mailer verification failed:', err);
    } else {
      console.log('Mailer is configured and ready to send messages');
    }
  });
} else {
  console.log('Server running in SIMULATION mode; Gmail SMTP and Redis queue are bypassed.');
}

// Queue for background email jobs (Redis-backed). Configure REDIS_URL in .env if needed.
const Queue = require('bull');
const emailQueue = simulate ? null : new Queue('emailQueue', process.env.REDIS_URL || 'redis://127.0.0.1:6379');

// Primary Endpoint to process orders (now enqueues email jobs)
app.post('/api/orders', async (req, res) => {
  const { productName, clientName, clientEmail, sizeQuantity, logisticsInstructions } = req.body;
  console.log('Received order request:', { productName, clientName, clientEmail, sizeQuantity, logisticsInstructions });

  // Simple validation check
  if (!productName || !clientName || !clientEmail || !sizeQuantity) {
    return res.status(400).json({ success: false, message: 'Missing required configuration parameters.' });
  }

  const jobPayload = {
    productName,
    clientName,
    clientEmail,
    sizeQuantity,
    logisticsInstructions: logisticsInstructions || null,
    receivedAt: Date.now(),
    orderId: `order-${Date.now()}`
  };
  // If SIMULATE_EMAIL is enabled (module-level `simulate`), write simulated emails immediately and don't require Redis/worker.
  console.log('SIMULATE_EMAIL inside request:', simulate);
  if (simulate) {
    try {
      const fs = require('fs');
      const path = require('path');
      const outDir = path.join(__dirname, 'fake-emails');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

      const jobId = `order-${Date.now()}`;
      const internalHtml = `\n      <div style="font-family: monospace; padding: 20px; background: #FAF8F5; border: 1px solid #1E2D24;">\n        <h2 style="color: #1E2D24; font-family: serif; border-bottom: 1px solid #1E2D24; padding-bottom: 8px;">Order Manifest Recieved</h2>\n        <p><strong>Authenticated User:</strong> ${clientName} (${clientEmail})</p>\n        <p><strong>Product Ordered:</strong> ${productName}</p>\n        <p><strong>Tier / Volume:</strong> ${sizeQuantity}</p>\n        <p><strong>Logistics Instructions:</strong> ${logisticsInstructions || 'None provided'}</p>\n        <hr style="border-top: 1px dashed #1E2D24;" />\n        <p style="font-size: 11px; color: #76532B;">// Sent live via Rubies Organic Portal API | job: ${jobId}</p>\n      </div>\n    `;

      const customerHtml = `\n        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 30px; background-color: #FAF8F5; color: #1E2D24; border: 1px solid rgba(30,45,36,0.1);">\n          <div style="text-align: center; margin-bottom: 24px;">\n            <h1 style="font-family: Georgia, serif; font-weight: 300; font-size: 28px; margin: 0; color: #1E2D24;">Rubies Organic</h1>\n            <span style="font-size: 10px; text-transform: uppercase; tracking: 0.2em; color: #76532B; font-family: monospace;">// Main Collection Manifest</span>\n          </div>\n          <div style="height: 1px; background-color: rgba(30,45,36,0.1); margin-bottom: 24px;\"></div>\n          <p style="font-size: 14px; line-height: 1.6;">Greetings <strong>${clientName}</strong>,</p>\n          <p style="font-size: 14px; line-height: 1.6;">Thank you for choosing uncompromised quality. We are writing to inform you that your request has been verified and your <strong>shipping is currently in process</strong>.</p>\n          <div style="background-color: #F4F1EA; padding: 15px; border-left: 3px solid #425F4C; margin: 20px 0; font-size: 13px;">\n            <p style="margin: 4px 0;"><strong>Allocated Item:</strong> ${productName}</p>\n            <p style="margin: 4px 0;"><strong>Sizing / Quantity Specified:</strong> ${sizeQuantity}</p>\n          </div>\n          <p style="font-size: 14px; line-height: 1.6;">Our logistics division is prepping your custom batch to secure optimal purity and structural freshness during transit.</p>\n          <div style="height: 1px; background-color: rgba(30,45,36,0.1); margin: 24px 0;\"></div>\n          <p style="font-size: 13px; line-height: 1.6; font-style: italic; color: #425F4C; text-align: center;">We profoundly appreciate your valued patronage and your commitment to natural wellness and lifestyle vitality.</p>\n          <div style="text-align: center; margin-top: 30px; font-size: 11px; color: rgba(30,45,36,0.5);">&copy; 2026 Rubies Organic Essentials. All rights reserved.</div>\n        </div>\n      `;

      const internalPath = path.join(outDir, `internal-${jobId}.html`);
      const customerPath = path.join(outDir, `customer-${jobId}.html`);
      fs.writeFileSync(internalPath, internalHtml, 'utf8');
      fs.writeFileSync(customerPath, customerHtml, 'utf8');

      await sendOrderNotifications({
        ...jobPayload,
        orderId: jobId
      }, { dryRun: true });

      return res.status(202).json({ success: true, jobId, message: 'Simulated emails written.' });
    } catch (err) {
      console.error('Failed to write simulated emails:', err && err.stack ? err.stack : err);
      return res.status(500).json({ success: false, message: 'Failed to write simulated emails.' });
    }
  }

  try {
    const job = await emailQueue.add(jobPayload, { attempts: 3, backoff: 5000 });
    sendOrderNotifications(jobPayload).catch((err) => {
      console.error('Failed to send order notifications after queueing:', err && err.stack ? err.stack : err);
    });
    return res.status(202).json({ success: true, jobId: job.id, message: 'Order queued for notification.' });
  } catch (err) {
    console.error('Failed to enqueue email job:', err && err.stack ? err.stack : err);
    return res.status(500).json({ success: false, message: 'Failed to queue order notifications.' });
  }
});

app.listen(PORT, () => {
  console.log(` Rubies Support System running on port ${PORT}`);
});