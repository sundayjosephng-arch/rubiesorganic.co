const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(cors({ origin: '*' })); // Allows front-end connections from any domain or local host
app.use(express.json());

// Setup our email communication channel with verification
const transporter = nodemailer.createTransport({
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

// Primary Endpoint to process orders
app.post('/api/orders', (req, res) => {
  const { productName, clientName, clientEmail, sizeQuantity, logisticsInstructions } = req.body;

  // Simple validation check
  if (!productName || !clientName || !clientEmail || !sizeQuantity) {
    return res.status(400).json({ success: false, message: 'Missing required configuration parameters.' });
  }

  // Generate a lightweight job id to track this request
  const jobId = `order-${Date.now()}`;

  // Immediately acknowledge the request to keep the API responsive
  res.status(202).json({ success: true, jobId, message: 'Order received. Notification will be sent shortly.' });

  // Prepare mail contents (same as before)
  const internalMailOptions = {
    from: `"Rubies Portal" <${process.env.COMPANY_EMAIL}>`,
    to: process.env.COMPANY_EMAIL,
    subject: `🚨 NEW PREMIUM ORDER: ${productName}`,
    html: `
      <div style="font-family: monospace; padding: 20px; background: #FAF8F5; border: 1px solid #1E2D24;">
        <h2 style="color: #1E2D24; font-family: serif; border-bottom: 1px solid #1E2D24; padding-bottom: 8px;">Order Manifest Recieved</h2>
        <p><strong>Authenticated User:</strong> ${clientName} (${clientEmail})</p>
        <p><strong>Product Ordered:</strong> ${productName}</p>
        <p><strong>Tier / Volume:</strong> ${sizeQuantity}</p>
        <p><strong>Logistics Instructions:</strong> ${logisticsInstructions || 'None provided'}</p>
        <hr style="border-top: 1px dashed #1E2D24;" />
        <p style="font-size: 11px; color: #76532B;">// Sent live via Rubies Organic Portal API | job: ${jobId}</p>
      </div>
    `
  };

  const customerMailOptions = {
    from: `"Rubies Organic" <${process.env.COMPANY_EMAIL}>`,
    to: clientEmail,
    subject: `Your Rubies Organic Order is In Process! ✨`,
    html: `...` // keep concise in background mail
  };

  // Send emails in the background without blocking the response
  (async function sendEmails() {
    try {
      await transporter.sendMail(internalMailOptions);
    } catch (err) {
      console.error(`Failed to send internal notification for ${jobId}:`, err);
    }

    try {
      // Expand the full HTML template for customer email when sending
      const fullCustomerHtml = `
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

      await transporter.sendMail({ ...customerMailOptions, html: fullCustomerHtml });
      console.log(`Customer notification sent for ${jobId} to ${clientEmail}`);
    } catch (err) {
      console.error(`Failed to send customer notification for ${jobId}:`, err);
    }
  })();
});

app.listen(PORT, () => {
  console.log(` Rubies Support System running on port ${PORT}`);
});