const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(cors({ origin: '*' })); // Allows front-end connections from any domain or local host
app.use(express.json());

// Setup our email communication channel
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.COMPANY_EMAIL,        // rubiesorganic@gmail.com
    pass: process.env.EMAIL_APP_PASSWORD   // Your 16-character Google App Password
  }
});

// Primary Endpoint to process orders
app.post('/api/orders', async (req, res) => {
  const { productName, clientName, clientEmail, sizeQuantity, logisticsInstructions } = req.body;

  // Simple validation check
  if (!productName || !clientName || !clientEmail || !sizeQuantity) {
    return res.status(400).json({ success: false, message: 'Missing required configuration parameters.' });
  }

  try {
    // 1. NOTIFICATION EMAIL: Sent directly to your company desk
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
          <p style="font-size: 11px; color: #76532B;">// Sent live via Rubies Organic Portal API</p>
        </div>
      `
    };

    // 2. AUTORESPONDER EMAIL: Sent instantly to the client who ordered
    const customerMailOptions = {
      from: `"Rubies Organic" <${process.env.COMPANY_EMAIL}>`,
      to: clientEmail,
      subject: `Your Rubies Organic Order is In Process! ✨`,
      html: `
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
          
          <p style="font-size: 13px; line-height: 1.6; font-style: italic; color: #425F4C; text-align: center;">
            We profoundly appreciate your valued patronage and your commitment to natural wellness and lifestyle vitality.
          </p>
          
          <div style="text-align: center; margin-top: 30px; font-size: 11px; color: rgba(30,45,36,0.5);">
            &copy; 2026 Rubies Organic Essentials. All rights reserved.
          </div>
        </div>
      `
    };

    // Execute parallel delivery streams
    await Promise.all([
      transporter.sendMail(internalMailOptions),
      transporter.sendMail(customerMailOptions)
    ]);

    res.status(200).json({ success: true, message: 'Order sent and customer auto-response successfully fired.' });

  } catch (error) {
    console.error('Email Dispatch Failure:', error);
    res.status(500).json({ success: false, message: 'Internal mail pipeline connection timeout.' });
  }
});

app.listen(PORT, () => {
  console.log(` Rubies Support System running on port ${PORT}`);
});