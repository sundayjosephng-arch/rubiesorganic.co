const Queue = require('bull');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { sendOrderNotifications } = require('./notifications');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const emailQueue = new Queue('emailQueue', REDIS_URL);

const simulate = (process.env.SIMULATE_EMAIL || 'false').toLowerCase() === 'true';

let transporter = null;
if (!simulate) {
  // Configure mailer (same as server)
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.COMPANY_EMAIL,
      pass: process.env.EMAIL_APP_PASSWORD
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100
  });

  transporter.verify((err) => {
    if (err) console.error('Worker mailer verification failed:', err.message || err);
    else console.log('Worker mailer ready');
  });
} else {
  console.log('Worker running in SIMULATION mode — emails will be written to rubies-backend/fake-emails');
}

// Process jobs with concurrency
emailQueue.process(5, async (job) => {
  const { productName, clientName, clientEmail, sizeQuantity, logisticsInstructions, receivedAt } = job.data;

  const jobId = job.id;

  const internalMailOptions = {
    from: `"Rubies Portal" <${process.env.COMPANY_EMAIL}>`,
    to: process.env.COMPANY_EMAIL,
    subject: `🚨 NEW PREMIUM ORDER: ${productName}`,
    html: `
      <div style="font-family: monospace; padding: 20px; background: #FAF8F5; border: 1px solid #1E2D24;">
        <h2 style="color: #1E2D24; font-family: serif; border-bottom: 1px solid #1E2D24; padding-bottom: 8px;">Order Manifest Received</h2>
        <p><strong>Authenticated User:</strong> ${clientName} (${clientEmail})</p>
        <p><strong>Product Ordered:</strong> ${productName}</p>
        <p><strong>Tier / Volume:</strong> ${sizeQuantity}</p>
        <p><strong>Logistics Instructions:</strong> ${logisticsInstructions || 'None provided'}</p>
        <hr style="border-top: 1px dashed #1E2D24;" />
        <p style="font-size: 11px; color: #76532B;">// job: ${jobId} | receivedAt: ${new Date(receivedAt).toISOString()}</p>
      </div>
    `
  };

  const customerHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 30px; background-color: #FAF8F5; color: #1E2D24; border: 1px solid rgba(30,45,36,0.1);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-family: Georgia, serif; font-weight: 300; font-size: 28px; margin: 0; color: #1E2D24;">Rubies Organic</h1>
        <span style="font-size: 10px; text-transform: uppercase; tracking: 0.2em; color: #76532B; font-family: monospace;">// Main Collection Manifest</span>
      </div>
      <div style="height: 1px; background-color: rgba(30,45,36,0.1); margin-bottom: 24px;"></div>
      <p style="font-size: 14px; line-height: 1.6;">Greetings <strong>${clientName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6;">Thank you for choosing uncompromised quality. We are writing to inform you that your request has been verified and your <strong>shipping is currently in process</strong>.</p>
      <div style="background-color: #F4F1EA; padding: 15px; border-left: 3px solid #425F4C; margin: 20px 0; font-size: 13px;">
        <p style="margin: 4px 0;"><strong>Allocated Item:</strong> ${productName}</p>
        <p style="margin: 4px 0;"><strong>Sizing / Quantity Specified:</strong> ${sizeQuantity}</p>
      </div>
      <p style="font-size: 14px; line-height: 1.6;">Our logistics division is prepping your custom batch to secure optimal purity and structural freshness during transit.</p>
      <div style="height: 1px; background-color: rgba(30,45,36,0.1); margin: 24px 0;"></div>
      <p style="font-size: 13px; line-height: 1.6; font-style: italic; color: #425F4C; text-align: center;">We profoundly appreciate your valued patronage and your commitment to natural wellness and lifestyle vitality.</p>
      <div style="text-align: center; margin-top: 30px; font-size: 11px; color: rgba(30,45,36,0.5);">&copy; 2026 Rubies Organic Essentials. All rights reserved.</div>
    </div>
  `;

  const fs = require('fs');
  const path = require('path');

  try {
    await sendOrderNotifications({
      productName,
      clientName,
      clientEmail,
      sizeQuantity,
      logisticsInstructions,
      receivedAt,
      orderId: jobId
    });
  } catch (err) {
    console.error(`Worker failed to send order notifications for job ${jobId}:`, err.message || err);
  }

  if (simulate) {
    const outDir = path.join(__dirname, 'fake-emails');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const internalPath = path.join(outDir, `internal-${jobId}.html`);
    const customerPath = path.join(outDir, `customer-${jobId}.html`);

    try {
      fs.writeFileSync(internalPath, internalMailOptions.html, 'utf8');
      fs.writeFileSync(customerPath, customerHtml, 'utf8');
      console.log(`Simulated emails written for job ${jobId}:`, internalPath, customerPath);
      return;
    } catch (err) {
      console.error(`Failed to write simulated emails for job ${jobId}:`, err.message || err);
      throw err;
    }
  }

  try {
    await transporter.sendMail(internalMailOptions);
  } catch (err) {
    console.error(`Worker failed to send internal mail for job ${jobId}:`, err.message || err);
    throw err; // allow Bull to retry according to attempts
  }

  try {
    await transporter.sendMail({ from: `"Rubies Organic" <${process.env.COMPANY_EMAIL}>`, to: clientEmail, subject: `Your Rubies Organic Order is In Process! ✨`, html: customerHtml });
    console.log(`Worker sent customer mail for job ${jobId} to ${clientEmail}`);
  } catch (err) {
    console.error(`Worker failed to send customer mail for job ${jobId}:`, err.message || err);
    throw err;
  }
});

console.log('Email worker started, waiting for jobs...');
